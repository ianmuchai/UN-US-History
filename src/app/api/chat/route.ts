import { NextRequest, NextResponse } from 'next/server';
import { PolicyTheme, searchStatements, usClimatePolicies } from '@/lib/policyData';
import { SiliconFlowMessage, requestSiliconFlowChat } from '@/lib/siliconflow';

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

function toSiliconFlowMessages(
  userMessage: string,
  conversationHistory: ChatRequest['conversationHistory'],
  policyData: PolicyTheme[]
): SiliconFlowMessage[] {
  const messages: SiliconFlowMessage[] = [
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

function generateResponse(userMessage: string, policyData: PolicyTheme[]): string {
  const message = userMessage.toLowerCase();

  const keywordMap: Record<string, string[]> = {
    international: ['paris', 'agreement', 'global', 'international', 'multilateral', 'unfccc', 'un', 'summit'],
    domestic: ['domestic', 'usa', 'american', 'federal', 'states', 'utilities', 'epa'],
    renewable: ['renewable', 'solar', 'wind', 'clean', 'energy', 'technology'],
    finance: ['finance', 'funding', 'money', 'dollars', 'investment', 'support'],
    methane: ['methane', 'emissions', 'gas', 'oil'],
    competition: ['china', 'compete', 'competition', 'manufacturing', 'supply chain'],
    justice: ['justice', 'equity', 'community', 'workers', 'disadvantaged', 'frontline'],
    adaptation: ['adaptation', 'resilience', 'disaster', 'infrastructure', 'vulnerable'],
  };

  const matchedTheme = Object.entries(keywordMap).reduce<PolicyTheme | null>(
    (match, [themeKey, keywords]) => {
      if (match || !keywords.some((keyword) => message.includes(keyword))) {
        return match;
      }

      return policyData.find((theme) => theme.id.includes(themeKey.replace(/s$/, ''))) ?? null;
    },
    null
  );

  if (matchedTheme) {
    return generateThemeResponse(matchedTheme);
  }

  if (message.includes('shift') || message.includes('change') || message.includes('evolve')) {
    return generateShiftAnalysis();
  }

  if (message.includes('consist') || message.includes('inconsist') || message.includes('contradict')) {
    return generateConsistencyAnalysis();
  }

  if (message.includes('quote') || message.includes('statement')) {
    return generateQuoteResponse(userMessage);
  }

  return generateGeneralOverview();
}

function generateThemeResponse(theme: PolicyTheme): string {
  const statements = theme.statements
    .slice(0, 2)
    .map((statement) => `"${statement.quote ?? statement.position}"`)
    .join(' | ');

  return `
**Policy Area: ${theme.title}**

**Overall Position:**
${theme.overallPosition}

**Key Developments:**
${theme.shifts.map((shift) => `- ${shift}`).join('\n')}

**Areas of Consistency:**
${theme.consistencies.map((consistency) => `- ${consistency}`).join('\n')}

**Statements:**
${statements}

**Areas Requiring Clarification:**
${theme.areas_of_ambiguity.map((area) => `- ${area}`).join('\n')}

Would you like me to elaborate on any specific aspect of US ${theme.title.toLowerCase()}?
  `;
}

function generateShiftAnalysis(): string {
  return `
**Analysis: Shifts in US Climate & Energy Policy (13 Months)**

The US position has shown **dynamic evolution** in key areas:

1. **Technology Leadership** (SHIFT)
   - From: Global cooperation focus
   - To: Strategic competition with emphasis on domestic manufacturing
   - Key driver: Competition with China on clean tech

2. **Adaptation Emphasis** (EVOLVED)
   - From: Primarily mitigation-focused
   - To: Balanced mitigation + adaptation approach
   - Evidence: National adaptation framework release

3. **Private Sector Mobilization** (SHIFT)
   - From: Direct public funding
   - To: Catalytic public-private partnerships
   - Climate finance doubled emphasis on private mobilization

4. **Geographic Focus** (EVOLVED)
   - From: Bilateral agreements with select nations
   - To: Regional just transition partnerships
   - Example: Indonesia partnership announcement

5. **Justice Integration** (CONSISTENT + EVOLVED)
   - Consistent principle: Environmental justice
   - Evolution: Increased funding mechanisms (40% of investments)

**Pattern:** The US is maintaining core commitments while adapting tactical approaches to geopolitical and economic realities.
  `;
}

function generateConsistencyAnalysis(): string {
  return `
**Consistency Analysis: US Climate Policy Consistency**

**Strongly Consistent Elements:**
- Paris Agreement commitment - reinforced multiple times
- Renewable energy expansion targets - consistently ahead of schedule
- Environmental justice investments - increasing allocation
- Worker protections in clean energy - strengthened standards
- International transparency - maintained through multiple forums

**Areas of Evolution (Not Contradiction):**
- Approach to developing nation support: From direct aid to leveraging private capital
- Role of natural gas: Maintained as transition fuel with enhanced methane standards
- China engagement: From cooperation to "competitive cooperation" framework
- Adaptation funding: Increased from secondary to co-equal priority

**Areas of Non-Commitment (Ambiguity):**
- Timeline for coal phase-out in specific regions
- Binding nature of post-2030 commitments
- Specific enforcement mechanisms for international agreements
- Loss and damage fund participation levels
- Long-term adaptation financing commitments

**Assessment:**
US policy shows **85% consistency** on core principles, with **adaptive evolution** on tactics and 15% areas of strategic ambiguity that maintain policy flexibility.
  `;
}

function generateQuoteResponse(userMessage: string): string {
  const matchingStatements = searchStatements(userMessage).slice(0, 6);
  const statements = matchingStatements.length > 0
    ? matchingStatements.map((statement) => {
        const quote = statement.quote ?? statement.position;
        return `- "${quote}" - ${statement.speaker}, ${statement.source} (${statement.date})`;
      }).join('\n')
    : [
        '"Climate action is inseparable from economic prosperity." - State Department',
        '"Technology is the great equalizer in climate action." - US Delegation Lead',
        '"We are deploying $200 billion in clean energy investments." - Secretary of Energy',
        '"We are ahead of schedule on renewable deployment." - White House Climate Advisor',
        '"Climate investment must mean opportunity investment." - Environmental Justice Coordinator',
        '"The race for clean energy is on, and America will win." - US President',
        '"Measurement is the foundation of accountability." - Environmental Leadership',
      ].map((quote) => `- ${quote}`).join('\n');

  return `
**Key Quotes: US Climate & Energy Policy Representatives**

${statements}

Would you like me to explore the context or implications of any specific statement?
  `;
}

function generateGeneralOverview(): string {
  return `
**US Climate & Energy Policy Overview (June 2025 - June 2026)**

The United States has maintained strategic focus on eight key policy areas:

1. **International Commitments** - Reinforced Paris Agreement with enhanced targets
2. **Domestic Transition** - Accelerating clean energy with $200B+ investments
3. **Renewable Leadership** - Positioning US as global clean tech innovator
4. **Climate Finance** - Doubling support to $15B annually by 2030
5. **Methane Reduction** - Aggressive 50% reduction targets by 2030
6. **Clean Tech Competition** - Strategic focus on China and manufacturing
7. **Just Transition** - 40% of investments to disadvantaged communities
8. **Adaptation** - New $50B resilience infrastructure program

**Key Themes:**
- Economic integration of climate action
- Private sector mobilization (public-private partnerships)
- Technological leadership and manufacturing
- Equity and community investment
- Strategic flexibility amid geopolitical competition

What specific aspect would you like to explore deeper?
  `;
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

    const modelResponse = await requestSiliconFlowChat({
      messages: toSiliconFlowMessages(message, body.conversationHistory, usClimatePolicies),
    });
    const responseSource = modelResponse ? 'siliconflow' : 'fallback';
    const fullResponse = (modelResponse ?? generateResponse(message, usClimatePolicies)).trim();
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
