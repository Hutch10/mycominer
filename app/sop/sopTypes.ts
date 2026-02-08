// Phase 31: Autonomous SOP Generator types
// Deterministic, operator-friendly SOP data structures

export type SOPLifecycle = 'draft' | 'review' | 'approved' | 'published';

export interface SOPSafetyNote {
  noteId: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface SOPResourceRequirement {
  resourceId: string;
  name: string;
  type: 'room' | 'equipment' | 'material' | 'labor';
  quantity: number;
  unit: string;
  availabilityWindow?: string;
}

export interface SOPStep {
  stepId: string;
  title: string;
  description: string;
  durationMinutes?: number;
  dependencies?: string[];
  safetyNotes?: SOPSafetyNote[];
  resources?: SOPResourceRequirement[];
}

export interface SOPSection {
  sectionId: string;
  title: string;
  summary?: string;
  steps: SOPStep[];
}

export interface SOPVersion {
  versionId: string;
  createdAt: string;
  author: string;
  lifecycle: SOPLifecycle;
  changeSummary: SOPChangeSummary;
}

export interface SOPChangeSummary {
  summary: string;
  highlights: string[];
}

export interface SOPDocument {
  sopId: string;
  title: string;
  category: 'workflow' | 'equipment' | 'room' | 'safety' | 'cleaning' | 'scheduling';
  description?: string;
  sections: SOPSection[];
  resources: SOPResourceRequirement[];
  safety: SOPSafetyNote[];
  timingNotes?: string;
  version: SOPVersion;
  baselineWorkflowId?: string;
  relatedWorkflowIds?: string[];
}

export type SOPLogCategory = 'generation' | 'version' | 'approval' | 'publication' | 'rollback';

export interface SOPLogEntry {
  entryId: string;
  timestamp: string;
  category: SOPLogCategory;
  message: string;
  context?: {
    sopId?: string;
    versionId?: string;
  };
  details?: unknown;
}
