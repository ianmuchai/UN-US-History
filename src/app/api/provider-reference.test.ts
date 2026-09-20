import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const compactLegacyProvider = String.fromCharCode(115, 105, 108, 105, 99, 111, 110, 102, 108, 111, 119);
const separatedLegacyProvider = `${String.fromCharCode(115, 105, 108, 105, 99, 111, 110)} ${String.fromCharCode(102, 108, 111, 119)}`;
const trackedFiles = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split(/\r?\n/)
  .filter(Boolean);

for (const file of trackedFiles) {
  const content = readFileSync(file, 'utf8').toLowerCase();
  const compactContent = content.replace(/[\s_-]+/g, '');

  assert(!compactContent.includes(compactLegacyProvider), `${file} contains a legacy provider reference`);
  assert(!content.includes(separatedLegacyProvider), `${file} contains a legacy provider reference`);
}

console.log('provider reference hygiene test passed');
