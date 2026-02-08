/**
 * TroubleshootingAgent
 * Diagnose likely issues and propose checks based on symptoms and stage.
 */

import { AgentDefinition, AgentInput, AgentOutput } from './agentTypes';

const symptomMap: Record<string, { causes: string[]; checks: string[]; fixes: string[] }> = {
  'green mold': {
    causes: ['Trichoderma exposure', 'High grain moisture', 'Poor sterile technique'],
    checks: ['Inspect for green sporulation', 'Smell for earthy odor', 'Review inoculation sterility'],
    fixes: ['Cull affected units', 'Increase sterilization time', 'Improve SAB/flow hood practice'],
  },
  'slow colonization': {
    causes: ['Low spawn rate', 'Cold temps', 'Dry substrate', 'Bacterial load'],
    checks: ['Check substrate moisture squeeze test', 'Verify temp 70°F/21°C colonization', 'Look for wet spots'],
    fixes: ['Increase spawn ratio to 1:5', 'Adjust temp to 70°F', 'Remake overly wet bags'],
  },
  'no pins': {
    causes: ['Low light', 'Insufficient FAE', 'Surface too dry', 'CO2 high'],
    checks: ['Observe condensation pattern', 'Verify light cycle 12h', 'Check CO2 buildup'],
    fixes: ['Mist to maintain surface moisture', 'Increase FAE', 'Drop temps 2-3°F'],
  },
};

function evaluate(input: AgentInput): AgentOutput {
  const symptom = (input.context?.symptom as string)?.toLowerCase?.() || 'slow colonization';
  const record = symptomMap[symptom] || symptomMap['slow colonization'];

  return {
    summary: `Diagnosed likely causes for ${symptom}.`,
    steps: ['Match symptom to playbook', 'List causes', 'Surface checks and fixes'],
    recommendations: record.fixes,
    risks: ['Diagnosis depends on accurate symptom capture'],
    metrics: { causeCount: record.causes.length },
    data: {
      causes: record.causes,
      checks: record.checks,
    },
    confidence: 'medium',
    nextActions: ['Perform checks', 'Apply 1-2 fixes', 'Reassess in 24-48h'],
  };
}

export const troubleshootingAgent: AgentDefinition = {
  id: 'troubleshooting',
  name: 'Troubleshooting Agent',
  purpose: 'Provide differential diagnosis and corrective actions for common symptoms.',
  inputSchema: ['goal:string', 'context.symptom?:string'],
  outputSchema: ['recommendations', 'data.causes', 'data.checks'],
  dependencies: ['knowledge-graph:troubleshooting-patterns'],
  failureModes: [
    {
      id: 'unknown-symptom',
      description: 'Symptom not in playbook',
      detection: 'No matching key in symptom map',
      mitigation: 'Fallback to slow-colonization baseline guidance',
    },
  ],
  fallbackBehavior: 'Return slow-colonization guidance and prompt for more detail.',
  run: evaluate,
};
