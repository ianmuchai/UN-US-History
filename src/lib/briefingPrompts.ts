export type BriefingPromptMode = 'summary' | 'compare' | 'timeline' | 'ambiguity' | 'evidence';

const promptTemplates: Record<BriefingPromptMode, (topic: string) => string> = {
  summary: (topic) =>
    `Summarize the US position on ${topic}. Include the current stance, recent shifts, key evidence, and risks to watch.`,
  compare: (topic) =>
    `Compare the US position on ${topic} across domestic policy, international commitments, and financing. Highlight tensions and likely user impacts.`,
  timeline: (topic) =>
    `Create a concise timeline of US policy shifts on ${topic}. Include dates, actors, stated rationale, and what changed over time.`,
  ambiguity: (topic) =>
    `Identify the main ambiguities in the US position on ${topic}. Include what is clear, what remains unresolved, and what evidence would reduce uncertainty.`,
  evidence: (topic) =>
    `Find the strongest evidence about the US position on ${topic}. Separate direct statements, policy signals, contradictions, and confidence level.`,
};

export function buildBriefingPrompt(mode: BriefingPromptMode, topic: string) {
  const cleanTopic = topic.trim();
  return promptTemplates[mode](cleanTopic);
}
