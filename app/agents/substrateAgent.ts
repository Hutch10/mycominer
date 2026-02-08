/**
 * SubstrateAgent
 * Suggest substrate options and prep steps based on species and constraints.
 */

import { AgentDefinition, AgentInput, AgentOutput } from './agentTypes';

const speciesToSubstrate: Record<string, string[]> = {
  oyster: ['straw (pasteurized)', 'supplemented sawdust', 'coffee grounds (heat-treated)'],
  shiitake: ['hardwood sawdust + bran', 'logs (oak/beech)'],
  'lion\'s mane': ['hardwood sawdust + bran', 'masters mix (sawdust + soy hulls)'],
  reishi: ['hardwood sawdust', 'logs'],
};

function evaluate(input: AgentInput): AgentOutput {
  const speciesRaw = (input.context?.species as string) || 'oyster';
  const speciesKey = speciesRaw.toLowerCase();
  const options = speciesToSubstrate[speciesKey] || speciesToSubstrate.oyster;
  const constraints = (input.constraints || []).map(c => c.toLowerCase());
  const noPressureCooker = constraints.includes('no-pressure-cooker');

  const recommendations = options.filter(opt =>
    noPressureCooker ? !opt.includes('bran') : true
  );

  return {
    summary: `Identified ${recommendations.length} substrate options for ${speciesRaw}.`,
    recommendations,
    steps: [
      'Map species → substrate playbook',
      'Apply constraints (equipment, prep)',
      'Return feasible substrate list',
    ],
    risks: ['Moisture calibration remains user-dependent'],
    metrics: { optionCount: recommendations.length },
    confidence: 'medium',
    nextActions: ['Confirm hydration targets', 'Plan sterilization/pasteurization method'],
  };
}

export const substrateAgent: AgentDefinition = {
  id: 'substrate',
  name: 'Substrate Agent',
  purpose: 'Recommend feasible substrates and prep based on species and constraints.',
  inputSchema: ['goal:string', 'context.species?:string', 'constraints?:string[]'],
  outputSchema: ['recommendations:string[]', 'steps', 'nextActions'],
  dependencies: ['knowledge-graph:substrates', 'process-templates'],
  failureModes: [
    {
      id: 'missing-species',
      description: 'Species not provided',
      detection: 'context.species undefined',
      mitigation: 'Fallback to oyster defaults',
    },
  ],
  fallbackBehavior: 'Assume oyster with pasteurized straw and coffee grounds.',
  run: evaluate,
};
