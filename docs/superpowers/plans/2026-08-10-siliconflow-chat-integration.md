# SiliconFlow Chat Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make SiliconFlow the primary website chat model while preserving the bundled policy-data generator as fallback.

**Architecture:** Keep the existing `/api/chat` endpoint and NDJSON stream contract. Add a server-only SiliconFlow helper used by the route before falling back to local generation.

**Tech Stack:** Next.js 14 App Router, TypeScript, React 18, built-in `fetch`, existing Zustand chat UI, `npx tsx` for focused TypeScript tests.

## Global Constraints

- Do not commit or hard-code `SILICONFLOW_API_KEY`.
- Keep SiliconFlow calls server-side only.
- Preserve the existing frontend request and NDJSON response shape.
- Keep local policy-data answers as fallback for missing config, upstream errors, invalid responses, or empty responses.
- Avoid adding runtime client dependencies.

---

### Task 1: SiliconFlow Helper

**Files:**
- Create: `src/lib/siliconflow.ts`
- Create: `src/lib/siliconflow.test.ts`

**Interfaces:**
- Produces: `type SiliconFlowMessage = { role: 'system' | 'user' | 'assistant'; content: string }`
- Produces: `type SiliconFlowConfig = { apiKey?: string; baseUrl: string; model: string; secondaryModel?: string }`
- Produces: `getSiliconFlowConfig(env?: NodeJS.ProcessEnv): SiliconFlowConfig`
- Produces: `requestSiliconFlowChat(input: { messages: SiliconFlowMessage[]; config?: SiliconFlowConfig; fetcher?: typeof fetch }): Promise<string | null>`

- [ ] **Step 1: Write the failing helper tests**

```ts
import assert from 'node:assert/strict';
import { getSiliconFlowConfig, requestSiliconFlowChat } from './siliconflow';

async function testMissingApiKeyReturnsNull() {
  const content = await requestSiliconFlowChat({
    messages: [{ role: 'user', content: 'Hello' }],
    config: { apiKey: '', baseUrl: 'https://api.siliconflow.com/v1', model: 'openai/gpt-oss-120b' },
    fetcher: async () => {
      throw new Error('fetch should not be called without an API key');
    },
  });
  assert.equal(content, null);
}

async function testParsesOpenAiCompatibleResponse() {
  const content = await requestSiliconFlowChat({
    messages: [{ role: 'user', content: 'Hello' }],
    config: { apiKey: 'test-key', baseUrl: 'https://api.siliconflow.com/v1', model: 'openai/gpt-oss-120b' },
    fetcher: async () => new Response(JSON.stringify({
      choices: [{ message: { content: 'Model answer' } }],
    }), { status: 200 }),
  });
  assert.equal(content, 'Model answer');
}

async function testUsesProvidedEnvConfig() {
  const config = getSiliconFlowConfig({
    SILICONFLOW_API_KEY: 'key',
    SILICONFLOW_BASE_URL: 'https://example.test/v1/',
    SILICONFLOW_MODEL: 'primary-model',
    SILICONFLOW_MODEL_2: 'secondary-model',
  } as NodeJS.ProcessEnv);
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
  await testUsesProvidedEnvConfig();
  console.log('siliconflow helper tests passed');
}

void run();
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx tsx src/lib/siliconflow.test.ts`

Expected: FAIL because `src/lib/siliconflow.ts` does not exist yet.

- [ ] **Step 3: Implement minimal helper**

Create `src/lib/siliconflow.ts` with config loading, URL normalization, OpenAI-compatible request body creation, and response text parsing.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx tsx src/lib/siliconflow.test.ts`

Expected: PASS and print `siliconflow helper tests passed`.

### Task 2: Route Integration And Env Docs

**Files:**
- Modify: `src/app/api/chat/route.ts`
- Create: `.env.example`
- Modify: `vercel.json`

**Interfaces:**
- Consumes: `requestSiliconFlowChat(...)` from `src/lib/siliconflow.ts`
- Preserves: Current browser-facing `/api/chat` request and NDJSON stream response.

- [ ] **Step 1: Add route behavior test coverage where practical**

Use the helper tests from Task 1 as the automated coverage boundary. Route behavior is verified through type-check and build because the project has no route test harness.

- [ ] **Step 2: Integrate SiliconFlow in `/api/chat`**

Import the helper. Build a compact system prompt from `usClimatePolicies`, include the last eight conversation messages, call `requestSiliconFlowChat`, and use `generateResponse(...)` only when the helper returns `null`.

- [ ] **Step 3: Document server env vars**

Create `.env.example` with `SILICONFLOW_API_KEY=`, `SILICONFLOW_BASE_URL=https://api.siliconflow.com/v1`, `SILICONFLOW_MODEL=openai/gpt-oss-120b`, and `SILICONFLOW_MODEL_2=google/gemma-4-31B-it`.

- [ ] **Step 4: Update deployment env metadata**

Replace the public `NEXT_PUBLIC_API_URL` env entry in `vercel.json` with private SiliconFlow variable descriptions.

- [ ] **Step 5: Verify**

Run: `npx tsx src/lib/siliconflow.test.ts`

Run: `npm run type-check`

Run: `npm run build`

Expected: all commands exit with status 0.

## Self-Review

- Spec coverage: Task 1 covers isolated SiliconFlow behavior; Task 2 covers route integration, env docs, fallback, and verification.
- Placeholder scan: no placeholder implementation instructions remain.
- Type consistency: helper function and type names match between tasks.
