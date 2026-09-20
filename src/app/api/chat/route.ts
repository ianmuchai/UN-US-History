import { NextRequest, NextResponse } from 'next/server';
import { PolicyTheme, usClimatePolicies } from '@/lib/policyData';
import { getOpenRouterConfig, OpenRouterMessage, requestOpenRouterChat } from '@/lib/openrouter';

interface ChatRequest {
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

const MAX_MESSAGE_LENGTH = 1_000;
const MAX_HISTORY_MESSAGES = 8;
const MAX_CONTEXT_MESSAGE_LENGTH = 1_200;
const STREAM_CHUNK_SIZE = 40;
const STREAM_DELAY_MS = 8;

function isChatRequest(value: unknown): value is ChatRequest {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as { message?: unknown }).message === 'string'
  );
}


function clampContextContent(content: string): string {
  const trimmedContent = content.trim();
  return trimmedContent.length > MAX_CONTEXT_MESSAGE_LENGTH
    ? `${trimmedContent.slice(0, MAX_CONTEXT_MESSAGE_LENGTH)}...`
    : trimmedContent;
}

function buildPolicySystemPrompt(policyData: PolicyTheme[]): string {
  const policySummary = policyData
    .map((theme) => {
      const shifts = theme.shifts.slice(0, 2).join('; ');
      const ambiguity = theme.areas_of_ambiguity.slice(0, 2).join('; ');
      return [
        `Theme: ${theme.title}`,
        `Position: ${theme.overallPosition}`,
        `Recent shifts: ${shifts}`,
        `Ambiguity: ${ambiguity}`,
      ].join('\n');
    })
    .join('\n\n');

  return [
    'You are the US Climate & Energy Policy Agent for a public policy briefing website.',
    'Answer with concise, evidence-minded analysis based on the bundled policy briefing context below.',
    'Use clear markdown headings and bullets when helpful. If the question asks for facts outside the briefing, say what the briefing supports and what would need external verification.',
    '',
    policySummary,
  ].join('\n');
}

function toOpenRouterMessages(
  userMessage: string,
  conversationHistory: ChatRequest['conversationHistory'],
  policyData: PolicyTheme[]
): OpenRouterMessage[] {
  const messages: OpenRouterMessage[] = [
    {
      role: 'system',
      content: buildPolicySystemPrompt(policyData),
    },
  ];

  const validHistory = Array.isArray(conversationHistory)
    ? conversationHistory
        .filter((message): message is { role: 'user' | 'assistant'; content: string } =>
          (message.role === 'user' || message.role === 'assistant') &&
          typeof message.content === 'string' &&
          message.content.trim().length > 0
        )
        .slice(-MAX_HISTORY_MESSAGES)
    : [];

  for (const historyMessage of validHistory) {
    messages.push({
      role: historyMessage.role,
      content: clampContextContent(historyMessage.content),
    });
  }

  const lastHistoryMessage = validHistory.at(-1);
  if (lastHistoryMessage?.role !== 'user' || lastHistoryMessage.content.trim() !== userMessage) {
    messages.push({
      role: 'user',
      content: userMessage,
    });
  }

  return messages;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!isChatRequest(body)) {
      return NextResponse.json(
        { error: 'Request body must include a message string' },
        { status: 400 }
      );
    }

    const message = body.message.trim();

    if (!message) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer` },
        { status: 400 }
      );
    }

    const openRouterConfig = getOpenRouterConfig();
    const modelResponse = await requestOpenRouterChat({
      messages: toOpenRouterMessages(message, body.conversationHistory, usClimatePolicies),
      config: openRouterConfig,
    });
    const responseSource = modelResponse ? 'openrouter' : 'openrouter-error';
    const fullResponse = (
      modelResponse ??
      (
        openRouterConfig.apiKey
          ? 'The briefing bot is configured, but it did not return a usable response. Check the model account, access, or provider status.'
          : 'The briefing bot is not configured for this deployment. Add the required bot API key in the deployment environment variables and redeploy.'
      )
    ).trim();
    const msgId = `msg-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(JSON.stringify({
          type: 'init',
          id: msgId,
          role: 'assistant',
          timestamp,
          source: responseSource,
        }) + '\n'));

        let currentIndex = 0;

        const streamChunks = () => {
          if (currentIndex >= fullResponse.length) {
            controller.enqueue(encoder.encode(JSON.stringify({ type: 'end' }) + '\n'));
            controller.close();
            return;
          }

          const chunk = fullResponse.slice(currentIndex, currentIndex + STREAM_CHUNK_SIZE);
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'chunk',
            content: chunk,
          }) + '\n'));

          currentIndex += STREAM_CHUNK_SIZE;
          setTimeout(streamChunks, STREAM_DELAY_MS);
        };

        streamChunks();
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
