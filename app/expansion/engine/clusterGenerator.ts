import { ClusterGeneratorReport, ClusterProposal } from './expansionTypes';

function createProposal(name: string, members: string[], rationale: string): ClusterProposal {
  return {
    name,
    rationale,
    members,
    crossLinks: members.map((m) => `${name} → ${m}`),
  };
}

export function generateClusterReport(tags: string[]): ClusterGeneratorReport {
  const proposals: ClusterProposal[] = [];
  const lowerTags = tags.map((t) => t.toLowerCase());

  const ecological = lowerTags.filter((t) => t.includes('ecology') || t.includes('environment'));
  if (ecological.length >= 2) {
    proposals.push(createProposal('Ecology & Environment', ecological, 'Group ecological control levers.'));
  }

  const process = lowerTags.filter((t) => t.includes('technique') || t.includes('process'));
  if (process.length >= 2) {
    proposals.push(createProposal('Process Control', process, 'Cluster clean/sterile technique with execution steps.'));
  }

  const strategy = lowerTags.filter((t) => t.includes('strategy') || t.includes('advanced'));
  if (strategy.length >= 1) {
    proposals.push(createProposal('Advanced Strategy', strategy, 'Track advanced or systems-level modules.'));
  }

  const imbalanceWarnings: string[] = [];
  if (ecological.length > process.length + 3) {
    imbalanceWarnings.push('Ecology-heavy tagging; consider adding process tags for balance.');
  }
  if (process.length > ecological.length + 3) {
    imbalanceWarnings.push('Process-heavy tagging; add ecological context tags.');
  }

  const crossLinkSuggestions = proposals.flatMap((proposal) => proposal.crossLinks);
  const visualization = {
    nodes: proposals.map((p) => p.name),
    edges: proposals.flatMap((p) => p.members.map((m) => ({ from: p.name, to: m, weight: 1 }))),
  };

  return {
    proposals,
    imbalanceWarnings,
    crossLinkSuggestions,
    visualization,
  };
}
