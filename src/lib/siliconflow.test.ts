import assert from 'node:assert/strict';
import { getSiliconFlowConfig, requestSiliconFlowChat } from './siliconflow';

type TestFetcher = typeof fetch;

async function testMissingApiKeyReturnsNull() {
  const content = await requestSiliconFlowChat({
    messages: [{ role: 'user', content: 'Hello' }],
    config: {
      apiKey: '',
      baseUrl: 'https://api.siliconflow.com/v1',
      model: 'openai/gpt-oss-120b',
    },
    fetcher: async () => {
      throw new Error('fetch should not be called without an API key');
    },
  });

  assert.equal(content, null);
}

async function testParsesOpenAiCompatibleResponse() {
  const content = await requestSiliconFlowChat({
    messages: [{ role: 'user', content: 'Hello' }],
    config: {
      apiKey: 'test-key',
      baseUrl: 'https://api.siliconflow.com/v1',
      model: 'openai/gpt-oss-120b',
    },
    fetcher: (async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'Model answer' } }],
        }),
        { status: 200 }
      )) as TestFetcher,
  });

  assert.equal(content, 'Model answer');
}

async function testSendsExpectedRequestBody() {
  let requestUrl = '';
  let authorization = '';
  let requestBody: unknown = null;

  await requestSiliconFlowChat({
    messages: [{ role: 'user', content: 'Hello' }],
    config: {
      apiKey: 'test-key',
      baseUrl: 'https://api.siliconflow.com/v1/',
      model: 'openai/gpt-oss-120b',
    },
    fetcher: (async (input, init) => {
      requestUrl = String(input);
      authorization = String(init?.headers && (init.headers as Record<string, string>).Authorization);
      requestBody = JSON.parse(String(init?.body));

      return new Response(
        JSON.stringify({
          choices: [{ message: { content: 'Ok' } }],
        }),
        { status: 200 }
      );
    }) as TestFetcher,
  });

  assert.equal(requestUrl, 'https://api.siliconflow.com/v1/chat/completions');
  assert.equal(authorization, 'Bearer test-key');
  assert.deepEqual(requestBody, {
    model: 'openai/gpt-oss-120b',
    messages: [{ role: 'user', content: 'Hello' }],
    temperature: 0.2,
    max_tokens: 900,
  });
}

async function testUsesProvidedEnvConfig() {
  const config = getSiliconFlowConfig({
    SILICONFLOW_API_KEY: 'key',
    SILICONFLOW_BASE_URL: 'https://example.test/v1/',
    SILICONFLOW_MODEL: 'primary-model',
    SILICONFLOW_MODEL_2: 'secondary-model',
  } as unknown as NodeJS.ProcessEnv);

  assert.deepEqual(config, {
    apiKey: 'key',
    baseUrl: 'https://example.test/v1',
    model: 'primary-model',
    secondaryModel: 'secondary-model',
  });
}

async function run() {
  await testMissingApiKeyReturnsNull();
  await testParsesOpenAiCompatibleResponse();
  await testSendsExpectedRequestBody();
  await testUsesProvidedEnvConfig();
  console.log('siliconflow helper tests passed');
}

void run();
