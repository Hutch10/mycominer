import { ContentSeed, TagSuggestionReport } from './expansionTypes';

const KIND_TAGS: Record<string, string[]> = {
  species: ['species', 'profiles', 'cultivation'],
  substrate: ['substrates', 'materials', 'preparation'],
  troubleshooting: ['troubleshooting', 'diagnostics', 'symptoms'],
  guide: ['guides', 'how-to', 'practical'],
  'advanced-module': ['advanced', 'strategy', 'systems'],
};

const SAFETY_TAGS = ['safety', 'validated', 'no-hallucination'];

export function generateTagSuggestions(seed: ContentSeed, existingTags: string[] = []): TagSuggestionReport {
  const proposed = new Set<string>();
  KIND_TAGS[seed.kind].forEach((tag) => proposed.add(tag));
  proposed.add(seed.primaryTag);
  proposed.add(seed.audience);
  if (seed.species) proposed.add(seed.species);
  SAFETY_TAGS.forEach((tag) => proposed.add(tag));

  const normalizedExisting = existingTags.map((t) => t.toLowerCase());
  const unused = normalizedExisting.filter((tag) => !proposed.has(tag));
  const redundantPairs: string[][] = [];

  // Simple redundancy: singular/plural duplicates
  for (const tag of proposed) {
    const plural = `${tag}s`;
    if (proposed.has(plural) && plural !== tag) {
      redundantPairs.push([tag, plural]);
    }
  }

  const mergeCandidates = Array.from(redundantPairs);
  const splitCandidates: string[] = [];
  const validationIssues: string[] = [];

  if (seed.primaryTag.length < 3) {
    validationIssues.push('Primary tag is too short to be meaningful.');
  }

  return {
    proposed: Array.from(proposed),
    unused,
    redundantPairs,
    mergeCandidates,
    splitCandidates,
    validationIssues,
  };
}
