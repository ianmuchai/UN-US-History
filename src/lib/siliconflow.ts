export type SiliconFlowMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type SiliconFlowConfig = {
  apiKey?: string;
  baseUrl: string;
  model: string;
  secondaryModel?: string;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'openai/gpt-4o-mini';
const DEFAULT_MAX_TOKENS = 900;
const DEFAULT_TEMPERATURE = 0.2;

function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '');
}

function readEnvValue(env: NodeJS.ProcessEnv, key: string): string | undefined {
  const value = env[key]?.trim();
  return value ? value : undefined;
}

export function getSiliconFlowConfig(env: NodeJS.ProcessEnv = process.env): SiliconFlowConfig {
  return {
    apiKey: readEnvValue(env, 'SILICONFLOW_API_KEY'),
    baseUrl: stripTrailingSlashes(readEnvValue(env, 'SILICONFLOW_BASE_URL') ?? DEFAULT_BASE_URL),
    model: readEnvValue(env, 'SILICONFLOW_MODEL') ?? DEFAULT_MODEL,
    secondaryModel: readEnvValue(env, 'SILICONFLOW_MODEL_2'),
  };
}

function parseCompletionContent(payload: ChatCompletionResponse): string | null {
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    return null;
  }

  const trimmedContent = content.trim();
  return trimmedContent ? trimmedContent : null;
}

async function requestModel(input: {
  messages: SiliconFlowMessage[];
  config: SiliconFlowConfig;
  fetcher: typeof fetch;
  model: string;
}): Promise<string | null> {
  const response = await input.fetcher(`${stripTrailingSlashes(input.config.baseUrl)}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.config.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/ianmuchai/UN-US-History',
      'X-OpenRouter-Title': 'US Climate & Energy Policy Agent',
    },
    body: JSON.stringify({
      model: input.model,
      messages: input.messages,
      temperature: DEFAULT_TEMPERATURE,
      max_tokens: DEFAULT_MAX_TOKENS,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as ChatCompletionResponse;
  return parseCompletionContent(payload);
}

export async function requestSiliconFlowChat(input: {
  messages: SiliconFlowMessage[];
  config?: SiliconFlowConfig;
  fetcher?: typeof fetch;
}): Promise<string | null> {
  const config = input.config ?? getSiliconFlowConfig();
  const fetcher = input.fetcher ?? fetch;

  if (!config.apiKey || !config.model || input.messages.length === 0) {
    return null;
  }

  const models = [config.model, config.secondaryModel].filter(
    (model): model is string => typeof model === 'string' && model.trim().length > 0
  );

  for (const model of models) {
    try {
      const content = await requestModel({
        messages: input.messages,
        config,
        fetcher,
        model,
      });

      if (content) {
        return content;
      }
    } catch {
      // Return null after trying available models so callers can use local fallback.
    }
  }

  return null;
}
