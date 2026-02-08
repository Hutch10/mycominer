/**
 * EnvironmentAgent
 * Derive target environmental ranges and adjustments for fruiting/colonization.
 */

import { AgentDefinition, AgentInput, AgentOutput } from './agentTypes';

const envProfiles: Record<string, { temp: string; humidity: string; fae: string; light: string }> = {
  oyster: { temp: '60-68°F (16-20°C)', humidity: '85-95%', fae: '6-8 exchanges/day', light: 'Indirect, 12h' },
  shiitake: { temp: '55-65°F (13-18°C)', humidity: '85-92%', fae: '4-6 exchanges/day', light: 'Low-moderate, 8-10h' },
  'lion\'s mane': { temp: '60-68°F (16-20°C)', humidity: '90-95%', fae: '6-8 exchanges/day', light: 'Low, 8-10h' },
  reishi: { temp: '70-78°F (21-25°C)', humidity: '85-90%', fae: '3-5 exchanges/day', light: 'Low, diffuse' },
};

function evaluate(input: AgentInput): AgentOutput {
  const species = (input.context?.species as string)?.toLowerCase?.() || 'oyster';
  const target = envProfiles[species] || envProfiles.oyster;
  const roomTemp = input.context?.roomTemp as number | undefined;
  const gap = roomTemp ? roomTemp - 68 : undefined;

  return {
    summary: `Recommended environment for ${species}: T=${target.temp}, RH=${target.humidity}, FAE=${target.fae}.`,
    steps: [
      'Resolve species env profile',
      'Compare against provided room temperature',
      'Highlight adjustments',
    ],
    recommendations: [
      `Temperature: ${target.temp}`,
      `Humidity: ${target.humidity}`,
      `FAE: ${target.fae}`,
      `Light: ${target.light}`,
      gap ? `Adjust by ${(Math.abs(gap)).toFixed(1)}°F to hit target` : 'No temperature adjustment provided',
    ],
    metrics: { gapF: gap ?? 0 },
    risks: ['Unverified sensor calibration can skew targets'],
    confidence: 'medium',
    nextActions: ['Calibrate hygrometer/thermometer', 'Set FAE schedule', 'Monitor surface conditions'],
  };
}

export const environmentAgent: AgentDefinition = {
  id: 'environment',
  name: 'Environment Agent',
  purpose: 'Provide target environmental parameters and practical adjustments.',
  inputSchema: ['goal:string', 'context.species?:string', 'context.roomTemp?:number'],
  outputSchema: ['recommendations:string[]', 'metrics', 'nextActions'],
  dependencies: ['knowledge-graph:environmental-parameters'],
  failureModes: [
    {
      id: 'missing-species',
      description: 'Species not provided',
      detection: 'context.species undefined',
      mitigation: 'Fallback to oyster profile',
    },
  ],
  fallbackBehavior: 'Use oyster baseline; suggest generic high-humidity fruiting targets.',
  run: evaluate,
};
