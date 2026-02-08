// Phase 37: Narrative Engine v2 types
// Deterministic, read-only explanations

export type NarrativeTarget =
  | 'forecast'
  | 'sandboxScenario'
  | 'sop'
  | 'complianceEvent'
  | 'deviation'
  | 'capa'
  | 'KGNeighborhood'
  | 'KGPath'
  | 'searchResultSet'
  | 'copilotSuggestion';

export interface NarrativeContext {
  tenantId: string;
  federatedTenantIds?: string[];
  target: NarrativeTarget;
  targetId?: string;
  facilityId?: string;
  scope: 'tenant' | 'federated';
  tags?: string[];
  relatedIds?: string[];
}

export interface NarrativeRequest {
  requestId: string;
  createdAt: string;
  context: NarrativeContext;
  prompt: string;
}

export interface NarrativeReference {
  id: string;
  type: string;
  tenantId: string;
  label: string;
  link?: string;
  federated?: boolean;
}

export interface NarrativeSection {
  title: string;
  body: string;
  safetyNote?: string;
  references?: NarrativeReference[];
}

export interface NarrativeExplanation {
  explanationId: string;
  scope: 'tenant' | 'federated';
  tenantId: string;
  federatedTenantIds?: string[];
  target: NarrativeTarget;
  sections: NarrativeSection[];
  references: NarrativeReference[];
  summary: string;
}

export type NarrativeLogCategory = 'request' | 'assembly' | 'output' | 'access';

export interface NarrativeLogEntry {
  entryId: string;
  timestamp: string;
  category: NarrativeLogCategory;
  message: string;
  context?: Record<string, unknown>;
}
