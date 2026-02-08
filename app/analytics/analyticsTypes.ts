// Phase 39: Global Analytics & Incident Pattern Library
// analyticsTypes.ts
// Deterministic types for analytics: clustering, patterns, trends, all read-only
// No predictions, no biological inference

import { TimelineEvent } from '../timeline/timelineTypes';

export type AnalyticsTarget =
  | 'incidents'
  | 'deviations'
  | 'capa'
  | 'environmental-exceptions'
  | 'sop-changes'
  | 'resource-shortages'
  | 'facility-rhythms'
  | 'cross-tenant-federation';

export interface AnalyticsScope {
  tenantId: string;
  facilityId?: string;
  roomId?: string;
  timeRange?: {
    startTime: string; // ISO 8601
    endTime: string; // ISO 8601
  };
  severity?: string[];
  eventTypes?: string[];
}

export interface AnalyticsQuery {
  queryId: string;
  timestamp: string; // ISO 8601
  tenantId: string;
  target: AnalyticsTarget;
  scope: AnalyticsScope;
  description: string;
  includePatterns: boolean;
  includeTrends: boolean;
  clusteringStrategy?: 'event-sequence' | 'severity-transition' | 'sop-reference' | 'capa-pattern' | 'telemetry-anomaly' | 'facility-context';
}

export interface IncidentCluster {
  clusterId: string;
  archetype: string; // e.g., "Environmental Spike → Deviation → CAPA → Stabilization"
  incidentIds: string[]; // references to incident thread IDs
  eventSamples: TimelineEvent[];
  characteristicSequence: string[]; // e.g., ['environmentalException', 'deviation', 'CAPAAction', 'complianceEvent']
  severityTransitionPattern: string[]; // e.g., ['high', 'high', 'medium', 'info']
  commonSOPReferences: string[];
  commonCAPAThemes: string[];
  commonTelemetryAnomalies: string[];
  frequencyInDataset: number; // count of incidents matching this cluster
  clusterSize: number; // number of unique incidents
  tenantId: string;
  facilityId?: string;
  createdAt: string; // ISO 8601
}

export interface PatternSignature {
  patternId: string;
  name: string; // e.g., "Environmental spike → deviation → CAPA → stabilization"
  description: string;
  characteristicSequence: string[]; // ordered event types
  representativeIncidents: string[]; // references to incident IDs
  clusterCount: number; // how many clusters match this pattern
  incidentsUnderPattern: number; // total incidents grouped under this pattern
  commonSOPReferences: string[];
  commonDeviationTypes: string[];
  commonCAPAActions: string[];
  telemetrySignatures: string[]; // e.g., ['temp-spike', 'humidity-drift']
  severityProfile: Record<string, number>; // e.g., { high: 0.4, medium: 0.5, info: 0.1 }
  tenantId: string;
  facilityIds: string[];
  observationStartTime: string; // ISO 8601
  observationEndTime: string; // ISO 8601
  confidence: number; // 0-1, based on cluster size and consistency
}

export interface TrendDataPoint {
  timestamp: string; // ISO 8601
  value: number;
  label?: string;
}

export interface TrendSummary {
  trendId: string;
  name: string;
  description: string;
  metric: string; // e.g., "incident-frequency", "capa-recurrence", "sop-change-density"
  scope: AnalyticsScope;
  dataPoints: TrendDataPoint[];
  aggregationLevel: 'daily' | 'weekly' | 'monthly' | 'facility' | 'tenant';
  tenantId: string;
  facilityIds: string[];
  insights: string[]; // human-readable observations
  linkedClusters: string[]; // cluster IDs that contributed to this trend
  linkedPatterns: string[]; // pattern IDs relevant to this trend
  createdAt: string; // ISO 8601
}

export interface AnalyticsResult {
  resultId: string;
  query: AnalyticsQuery;
  clusters: IncidentCluster[];
  patterns: PatternSignature[];
  trends: TrendSummary[];
  referenceIndex: {
    incidentIds: string[];
    deviationIds: string[];
    capaIds: string[];
    sopIds: string[];
    facilityIds: string[];
  };
  executionTimeMs: number;
  createdAt: string; // ISO 8601
}

export type AnalyticsLogEntryType =
  | 'query-initiated'
  | 'clustering-complete'
  | 'pattern-library-queried'
  | 'trend-analysis-complete'
  | 'result-generated'
  | 'export-requested'
  | 'access-denied'
  | 'error';

export interface AnalyticsLogEntry {
  logId: string;
  timestamp: string; // ISO 8601
  entryType: AnalyticsLogEntryType;
  tenantId: string;
  userId?: string;
  query?: AnalyticsQuery;
  resultId?: string;
  clustersGenerated?: number;
  patternsFound?: number;
  trendsComputed?: number;
  status: 'success' | 'partial' | 'failed';
  errorMessage?: string;
  executionTimeMs?: number;
  scopeFiltering: {
    tenantsInScope: string[];
    facilitiesInScope: string[];
  };
}

export interface AnalyticsEngine {
  getAnalyticsClusters(query: AnalyticsQuery): IncidentCluster[];
  getPatternLibrary(scope: AnalyticsScope, target: AnalyticsTarget): PatternSignature[];
  analyzeTrends(query: AnalyticsQuery): TrendSummary[];
  queryAnalytics(query: AnalyticsQuery): AnalyticsResult;
  getAnalyticsLog(): AnalyticsLogEntry[];
  clearAnalyticsLog(): void;
}
