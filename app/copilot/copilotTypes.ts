// Phase 36: Operator Copilot & Guided Playbooks types
// Deterministic guidance only; no auto-execution

export type CopilotScope = 'tenant' | 'federated';

export interface CopilotContext {
  tenantId: string;
  federatedTenantIds?: string[];
  facilityId?: string;
  roomId?: string;
  workflowId?: string;
  sopId?: string;
  deviationId?: string;
  complianceEventId?: string;
  telemetryStreamId?: string;
  forecastId?: string;
  sandboxScenarioId?: string;
  tags?: string[];
}

export interface CopilotQuery {
  text: string;
  scope: CopilotScope;
  context: CopilotContext;
}

export interface CopilotStepReference {
  stepId: string;
  sourceType: 'sop' | 'workflow' | 'playbook';
  sourceId: string;
  description: string;
  safetyNote?: string;
}

export interface CopilotPlaybookStep {
  id: string;
  title: string;
  references: CopilotStepReference[];
  safetyNote?: string;
}

export interface CopilotPlaybook {
  playbookId: string;
  title: string;
  category: 'incident' | 'environment' | 'equipment' | 'resource' | 'deviation' | 'maintenance';
  severity: 'info' | 'low' | 'medium' | 'high';
  tenantId: string;
  facilityIds?: string[];
  tags?: string[];
  steps: CopilotPlaybookStep[];
  summary: string;
}

export interface CopilotSuggestion {
  suggestionId: string;
  playbookId: string;
  title: string;
  steps: CopilotPlaybookStep[];
  scope: CopilotScope;
  tenantId: string;
  federated?: boolean;
  reason: string;
}

export interface CopilotSession {
  sessionId: string;
  startedAt: string;
  endedAt?: string;
  context: CopilotContext;
  scope: CopilotScope;
}

export type CopilotSessionLogCategory = 'session' | 'query' | 'suggestion' | 'access';

export interface CopilotSessionLogEntry {
  entryId: string;
  timestamp: string;
  category: CopilotSessionLogCategory;
  message: string;
  context?: Record<string, unknown>;
}
