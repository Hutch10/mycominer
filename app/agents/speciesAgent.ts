/**
 * SpeciesAgent
 * Suggest species options based on climate, difficulty, and goals.
 */

import { AgentDefinition, AgentInput, AgentOutput } from './agentTypes';

const climateToSpecies: Record<string, string[]> = {
  cool: ['oyster (blue)', 'enoki', "lion's mane"],
  temperate: ['oyster', 'shiitake', 'chestnut'],
  warm: ['pink oyster', 'yellow oyster', 'reishi'],
};

function evaluate(input: AgentInput): AgentOutput {
  const climate = (input.context?.climate as string)?.toLowerCase?.() || 'temperate';
  const experience = (input.context?.experience as string)?.toLowerCase?.() || 'beginner';
  const goal = input.goal.toLowerCase();

  const candidates = climateToSpecies[climate] || climateToSpecies.temperate;
  const filtered = experience === 'beginner'
    ? candidates.filter(s => !s.includes('shiitake'))
    : candidates;

  const recommendations = filtered.length > 0 ? filtered : candidates;

  return {
    summary: `Matched ${recommendations.length} species for ${climate} climate and ${experience} experience.`,
    recommendations,
    steps: [
      'Mapped climate → candidate species',
      'Filtered by experience level',
      'Returned prioritized list',
    ],
    risks: ['Availability of spawn may vary by region'],
    metrics: { candidateCount: recommendations.length, climate },
    confidence: 'medium',
    nextActions: ['Select 1-2 species to start', 'Check substrate compatibility'],
  };
}

export const speciesAgent: AgentDefinition = {
  id: 'species',
  name: 'Species Agent',
  purpose: 'Recommend species aligned to climate, experience, and goals.',
  inputSchema: ['goal:string', 'context.climate?:string', 'context.experience?:string'],
  outputSchema: ['recommendations:string[]', 'metrics', 'nextActions'],
  dependencies: ['knowledge-graph:species', 'climate-hints'],
  failureModes: [
    {
      id: 'insufficient-context',
      description: 'Climate or experience not provided',
      detection: 'Missing context keys',
      mitigation: 'Fallback to temperate + beginner assumptions',
    },
  ],
  fallbackBehavior: 'Use temperate + beginner defaults with oyster-first ordering.',
  run: evaluate,
};
