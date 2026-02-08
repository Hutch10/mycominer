/**
 * Agent type contracts for the multi-agent workflow layer (Phase 6)
 */

export type AgentId =
  | 'species'
  | 'substrate'
  | 'environment'
  | 'troubleshooting'
  | 'workflow'
  | 'recommendation'
  | 'community';

export interface AgentInput {
  goal: string;
  context?: Record<string, any>;
  constraints?: string[];
  signals?: Record<string, any>;
}

export interface AgentOutput {
  summary: string;
  steps?: string[];
  recommendations?: string[];
  risks?: string[];
  metrics?: Record<string, number | string>;
  links?: string[];
  data?: Record<string, any>;
  confidence?: 'low' | 'medium' | 'high';
  nextActions?: string[];
}

export interface AgentFailureMode {
  id: string;
  description: string;
  detection: string;
  mitigation: string;
}

export interface AgentDefinition {
  id: AgentId;
  name: string;
  purpose: string;
  inputSchema: string[];
  outputSchema: string[];
  dependencies: string[];
  failureModes: AgentFailureMode[];
  fallbackBehavior: string;
  run: (input: AgentInput) => AgentOutput;
}

export interface WorkflowStep {
  id: string;
  description: string;
  agentId: AgentId;
  inputProjection?: (input: AgentInput) => AgentInput;
}

export interface WorkflowDefinition {
  id: string;
  title: string;
  description: string;
  steps: WorkflowStep[];
  expectedOutput: string[];
}

export interface WorkflowRunInput {
  workflowId: string;
  goal: string;
  context?: Record<string, any>;
  constraints?: string[];
}

export interface AgentRunResult {
  stepId: string;
  agentId: AgentId;
  output: AgentOutput;
}

export interface WorkflowRunResult {
  workflowId: string;
  goal: string;
  context?: Record<string, any>;
  constraints?: string[];
  results: AgentRunResult[];
  aggregated: AgentOutput;
  startedAt: string;
  finishedAt: string;
}
