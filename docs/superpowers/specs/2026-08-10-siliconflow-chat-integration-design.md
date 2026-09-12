# SiliconFlow Chat Integration Design

## Goal

Use SiliconFlow as the primary chat model for the website while keeping the existing bundled US climate and energy policy response generator as a fallback when SiliconFlow is unavailable or not configured.

## Architecture

The existing `POST /api/chat` route remains the only browser-facing chat endpoint. The client keeps its current NDJSON streaming parser, so no UI contract changes are required. The route first attempts a server-side SiliconFlow chat completion request using `SILICONFLOW_API_KEY`, `SILICONFLOW_BASE_URL`, `SILICONFLOW_MODEL`, and optional `SILICONFLOW_MODEL_2`; if configuration is missing or the upstream request fails, it returns a fallback answer from the current local policy generator.

## Components

- `src/lib/siliconflow.ts` owns SiliconFlow configuration, request construction, response parsing, and safe error behavior.
- `src/app/api/chat/route.ts` validates input, builds policy context, asks SiliconFlow first, and streams either the model answer or local fallback through the existing NDJSON format.
- `.env.example` documents required server-side environment variables without storing secrets.
- `vercel.json` documents the private environment variables expected during deployment.

## Data Flow

The browser sends `{ message, conversationHistory }` to `/api/chat`. The route trims and validates the message, adds a compact policy briefing context from the bundled dataset, and sends recent conversation turns to SiliconFlow. The response text is normalized into the existing assistant message stream. If SiliconFlow cannot produce a usable answer, the route uses the current deterministic local response.

## Error Handling

Secrets never appear in client code or public env variables. Missing env vars, non-2xx upstream responses, invalid JSON, and empty model content all trigger local fallback. The public API still returns validation errors for malformed user input.

## Optimization

The integration avoids new client dependencies and keeps all model calls server-side. The route limits user input, caps history sent upstream, uses `Cache-Control: no-store`, and keeps fallback generation local and fast. The model helper is isolated so future streaming or model-routing changes do not force UI rewrites.

## Testing

A focused TypeScript test script checks request construction, response parsing, missing-config fallback behavior, and route-level build/type safety. Final verification uses `npm run type-check` and `npm run build`.
