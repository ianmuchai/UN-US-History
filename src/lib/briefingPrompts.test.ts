import assert from 'node:assert/strict';
import { buildBriefingPrompt } from './briefingPrompts';

function testBuildsFocusedPromptForAnalysisMode() {
  const prompt = buildBriefingPrompt('ambiguity', 'Climate finance');

  assert.equal(
    prompt,
    'Identify the main ambiguities in the US position on Climate finance. Include what is clear, what remains unresolved, and what evidence would reduce uncertainty.'
  );
}

function testBuildsTopicSummaryPrompt() {
  const prompt = buildBriefingPrompt('summary', 'Paris Agreement');

  assert.equal(
    prompt,
    'Summarize the US position on Paris Agreement. Include the current stance, recent shifts, key evidence, and risks to watch.'
  );
}

function run() {
  testBuildsFocusedPromptForAnalysisMode();
  testBuildsTopicSummaryPrompt();
  console.log('briefing prompt tests passed');
}

run();
