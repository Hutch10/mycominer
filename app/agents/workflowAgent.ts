/**
 * WorkflowAgent
 * Break down goals into deterministic sub-tasks with ordering.
 */

import { AgentDefinition, AgentInput, AgentOutput } from './agentTypes';

function evaluate(input: AgentInput): AgentOutput {
  const goal = input.goal.toLowerCase();
  const steps: string[] = [];

  if (goal.includes('grow') || goal.includes('cultivate')) {
    steps.push('Select species', 'Select substrate', 'Plan colonization', 'Plan fruiting', 'Plan harvest');
  } else if (goal.includes('diagnose')) {
    steps.push('Capture symptoms', 'Map to patterns', 'List checks', 'Propose fixes', 'Schedule follow-up');
  } else {
    steps.push('Clarify goal', 'Identify constraints', 'Propose 3 sub-actions');
  }

  return {
    summary: `WorkflowAgent produced ${steps.length} ordered tasks for goal: ${input.goal}`,
    steps,
    nextActions: steps.slice(0, 3),
    confidence: 'medium',
    metrics: { stepCount: steps.length },
  };
}

export const workflowAgent: AgentDefinition = {
  id: 'workflow',
  name: 'Workflow Agent',
  purpose: 'Decompose goals into ordered, inspectable tasks.',
  inputSchema: ['goal:string', 'context?:record', 'constraints?:string[]'],
  outputSchema: ['steps:string[]', 'nextActions:string[]'],
  dependencies: ['knowledge-graph:tasks', 'process-templates'],
  failureModes: [
    {
      id: 'ambiguous-goal',
      description: 'Goal not actionable',
      detection: 'No domain keywords found',
      mitigation: 'Return clarification steps first',
    },
  ],
  fallbackBehavior: 'Return generic clarify/identify/propose sequence.',
  run: evaluate,
};
