import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const root = process.cwd();
const files = [
  'src/app/api/chat/route.ts',
  'src/components/ChatContainer.tsx',
  'src/components/ChatMessage.tsx',
  'src/lib/store.ts',
].map((file) => ({
  file,
  content: readFileSync(join(root, file), 'utf8'),
}));

for (const { file, content } of files) {
  assert(!/Local fallback/i.test(content), `${file} must not show Local fallback`);
  assert(!/siliconflow/i.test(content), `${file} must not reference SiliconFlow`);
  assert(!/source:\s*['"]fallback['"]/.test(content), `${file} must not emit fallback source`);
}

const page = readFileSync(join(root, 'src/app/page.tsx'), 'utf8');
assert(page.includes("export const dynamic = 'force-dynamic'"), 'home page must not be statically cached');
assert(page.includes('export const revalidate = 0'), 'home page must disable revalidation cache');

const route = files.find(({ file }) => file === 'src/app/api/chat/route.ts')?.content ?? '';
assert(route.includes('getOpenRouterConfig()'), 'chat route must read OpenRouter config');
assert(route.includes('config: openRouterConfig'), 'chat route must pass OpenRouter config to the provider');
assert(!route.includes('function generateResponse'), 'chat route must not include canned local responses');

console.log('chat route source test passed');