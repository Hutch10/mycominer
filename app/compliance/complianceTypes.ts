// Phase 32: Compliance & Audit Engine types
// Deterministic, immutable compliance structures

export type ComplianceCategory =
  | 'sop'
  | 'workflow'
  | 'resource'
  | 'execution'
  | 'environment'
  | 'equipment'
  | 'sandbox'
  | 'forecasting'
  | 'command-center'
  | 'review';

export interface ComplianceEvent {
  eventId: string;
  timestamp: string;
  facilityId: string;
  category: ComplianceCategory;
  severity: 'info' | 'minor' | 'major' | 'critical';
  summary: string;
  details?: string;
  relatedIds?: string[];
  actor?: string;
}

export interface DeviationRecord {
  deviationId: string;
  timestamp: string;
  facilityId: string;
  source: ComplianceCategory;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  expected?: string;
  observed?: string;
  rootCause?: string;
  correctiveAction?: CorrectiveAction;
  preventiveAction?: PreventiveAction;
  relatedIds?: string[];
}

export interface CorrectiveAction {
  actionId: string;
  description: string;
  owner: string;
  dueDate?: string;
  status: 'open' | 'in-progress' | 'done';
}

export interface PreventiveAction {
  actionId: string;
  description: string;
  owner: string;
  dueDate?: string;
  status: 'open' | 'in-progress' | 'done';
}

export interface ComplianceReport {
  reportId: string;
  period: 'daily' | 'weekly' | 'custom';
  facilityId: string;
  from: string;
  to: string;
  events: ComplianceEvent[];
  deviations: DeviationRecord[];
  capa: Array<{ deviationId: string; corrective?: CorrectiveAction; preventive?: PreventiveAction }>;
  scorecard: Array<{ category: ComplianceCategory; count: number; critical: number }>;
  narrative?: string;
}

export interface ComplianceReview {
  reviewId: string;
  reportId: string;
  status: 'draft' | 'in-review' | 'approved' | 'archived';
  reviewerComments: string[];
  approvals: Array<{ reviewer: string; timestamp: string; decision: 'approved' | 'rejected'; reason?: string }>;
}

export type ComplianceLogCategory =
  | 'event'
  | 'deviation'
  | 'capa'
  | 'report'
  | 'review'
  | 'approval'
  | 'rejection'
  | 'export';

export interface ComplianceLogEntry {
  entryId: string;
  timestamp: string;
  category: ComplianceLogCategory;
  message: string;
  context?: {
    eventId?: string;
    deviationId?: string;
    reportId?: string;
    reviewId?: string;
  };
  details?: unknown;
}
