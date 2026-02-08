/**
 * Phase 48: Global Coverage Sweep & Missing Systems Detector
 * 
 * TYPE SYSTEM
 * 
 * This module defines the complete type system for the coverage audit engine,
 * which performs deterministic, read-only audits of all completed phases (32-47)
 * to identify missing subsystems, incomplete architectural layers, unimplemented
 * cross-engine integrations, or structural gaps.
 * 
 * CRITICAL CONSTRAINTS:
 * - Read-only operations only
 * - No biological inference or predictions
 * - All findings derived from real completed phases
 * - No synthetic features or speculative capabilities
 * - All operations logged for audit trail
 */

// ============================================================================
// PHASE & ENGINE RECORDS
// ============================================================================

export type PhaseNumber = 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48;

export interface PhaseRecord {
  phaseNumber: PhaseNumber;
  phaseName: string;
  description: string;
  completedDate: string;
  engines: EngineRecord[];
  uiComponents: UIComponentRecord[];
  hasLog: boolean;
  hasPolicies: boolean;
  hasLineage: boolean;
  hasFabricLinks: boolean;
  hasDocumentation: boolean;
  integrations: IntegrationRecord[];
  totalFiles: number;
  totalLines: number;
  status: 'complete' | 'partial' | 'incomplete';
}

export interface EngineRecord {
  engineName: string;
  engineType: string;
  phase: PhaseNumber;
  mainFile: string;
  hasTypes: boolean;
  hasLog: boolean;
  hasUI: boolean;
  hasPolicies: boolean;
  hasTests: boolean;
  entityTypes: string[];
  capabilities: string[];
}

export interface UIComponentRecord {
  componentName: string;
  componentType: 'dashboard' | 'panel' | 'viewer' | 'modal' | 'widget';
  phase: PhaseNumber;
  filePath: string;
  hasInteractivity: boolean;
  integratesWithEngines: string[];
}

export interface IntegrationRecord {
  sourcePhase: PhaseNumber;
  targetPhase: PhaseNumber;
  integrationType: 'read' | 'reference' | 'query' | 'link';
  description: string;
  implemented: boolean;
  missingComponents?: string[];
}

// ============================================================================
// COVERAGE GAP TYPES
// ============================================================================

export type CoverageGapCategory =
  | 'missing-engine'
  | 'missing-ui-layer'
  | 'missing-integration'
  | 'missing-policy'
  | 'missing-documentation'
  | 'missing-lineage'
  | 'missing-health-checks'
  | 'missing-fabric-links'
  | 'missing-governance-coverage';

export type CoverageGapSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface CoverageGap {
  id: string;
  category: CoverageGapCategory;
  severity: CoverageGapSeverity;
  title: string;
  description: string;
  affectedPhases: PhaseNumber[];
  affectedEngines: string[];
  detectedAt: string;
  scope: CoverageScopeContext;
  recommendations: string[];
  references: CoverageReference[];
  metadata: {
    expectedComponent: string;
    actualComponent: string | null;
    impactAnalysis: string;
    estimatedEffort: 'low' | 'medium' | 'high';
  };
}

export interface CoverageReference {
  referenceType: 'phase' | 'engine' | 'file' | 'integration' | 'policy' | 'fabric-link';
  referenceId: string;
  referenceName: string;
  phase?: PhaseNumber;
  description: string;
}

// ============================================================================
// COVERAGE QUERY TYPES
// ============================================================================

export type CoverageQueryType =
  | 'list-all-gaps'
  | 'list-gaps-by-category'
  | 'list-gaps-by-phase'
  | 'list-gaps-by-severity'
  | 'list-missing-integrations'
  | 'list-phase-completeness'
  | 'list-engine-coverage';

export type CoverageScope = 'global' | 'tenant' | 'facility' | 'phase';

export interface CoverageScopeContext {
  scope: CoverageScope;
  tenantId?: string;
  facilityId?: string;
  phaseNumber?: PhaseNumber;
}

export interface CoverageQuery {
  queryType: CoverageQueryType;
  scope: CoverageScopeContext;
  filters: CoverageFilters;
  options?: CoverageOptions;
}

export interface CoverageFilters {
  category?: CoverageGapCategory;
  severity?: CoverageGapSeverity;
  phase?: PhaseNumber;
  engine?: string;
  includeReferences?: boolean;
  includeMetadata?: boolean;
  includeRecommendations?: boolean;
}

export interface CoverageOptions {
  format?: 'json' | 'markdown' | 'summary';
  includePhaseInventory?: boolean;
  includeIntegrationMatrix?: boolean;
  sortBy?: 'severity' | 'phase' | 'category';
  limit?: number;
}

// ============================================================================
// COVERAGE RESULT TYPES
// ============================================================================

export interface CoverageResult {
  title: string;
  description: string;
  summary: CoverageSummary;
  gaps: CoverageGap[];
  phaseInventory?: PhaseRecord[];
  integrationMatrix?: IntegrationMatrix;
  metadata: {
    queryType: CoverageQueryType;
    scope: CoverageScopeContext;
    executedAt: string;
    executedBy: string;
    totalGapsDetected: number;
    gapsByCategory: Record<CoverageGapCategory, number>;
    gapsBySeverity: Record<CoverageGapSeverity, number>;
    phasesAnalyzed: PhaseNumber[];
    enginesAnalyzed: string[];
  };
  executionTimeMs: number;
}

export interface CoverageSummary {
  totalPhases: number;
  completedPhases: number;
  partialPhases: number;
  incompletePhases: number;
  totalEngines: number;
  totalUIComponents: number;
  totalIntegrations: number;
  totalGaps: number;
  criticalGaps: number;
  highGaps: number;
  mediumGaps: number;
  lowGaps: number;
  infoGaps: number;
  overallCompleteness: number; // 0-100%
}

export interface IntegrationMatrix {
  phases: PhaseNumber[];
  integrations: IntegrationRecord[];
  missingIntegrations: {
    sourcePhase: PhaseNumber;
    targetPhase: PhaseNumber;
    expectedIntegration: string;
    reason: string;
  }[];
}

// ============================================================================
// COVERAGE LOG TYPES
// ============================================================================

export type CoverageLogType =
  | 'coverage-query'
  | 'phase-inventory'
  | 'gap-detection'
  | 'integration-analysis'
  | 'completeness-check'
  | 'error';

export interface CoverageLogEntry {
  id: string;
  type: CoverageLogType;
  timestamp: string;
  performer: string;
  scope: CoverageScopeContext;
  details: CoverageLogDetails;
  success: boolean;
  errorMessage?: string;
}

export type CoverageLogDetails =
  | CoverageQueryLogDetails
  | PhaseInventoryLogDetails
  | GapDetectionLogDetails
  | IntegrationAnalysisLogDetails
  | CompletenessCheckLogDetails
  | ErrorLogDetails;

export interface CoverageQueryLogDetails {
  queryType: CoverageQueryType;
  filters: CoverageFilters;
  gapsDetected: number;
  executionTimeMs: number;
}

export interface PhaseInventoryLogDetails {
  phasesInventoried: PhaseNumber[];
  enginesFound: number;
  uiComponentsFound: number;
  integrationsFound: number;
}

export interface GapDetectionLogDetails {
  gapsDetected: number;
  gapsByCategory: Record<CoverageGapCategory, number>;
  gapsBySeverity: Record<CoverageGapSeverity, number>;
}

export interface IntegrationAnalysisLogDetails {
  integrationsAnalyzed: number;
  missingIntegrations: number;
  brokenIntegrations: number;
}

export interface CompletenessCheckLogDetails {
  phasesChecked: PhaseNumber[];
  completenessScores: Record<PhaseNumber, number>;
  averageCompleteness: number;
}

export interface ErrorLogDetails {
  errorMessage: string;
  errorStack?: string;
  context: Record<string, any>;
}

// ============================================================================
// COVERAGE STATISTICS
// ============================================================================

export interface CoverageStatistics {
  totalQueriesExecuted: number;
  totalGapsDetected: number;
  gapsByCategory: Record<CoverageGapCategory, number>;
  gapsBySeverity: Record<CoverageGapSeverity, number>;
  gapsByPhase: Record<PhaseNumber, number>;
  mostCommonGapCategory: CoverageGapCategory;
  mostAffectedPhase: PhaseNumber;
  averageExecutionTimeMs: number;
  phaseCompletenessScores: Record<PhaseNumber, number>;
  overallSystemCompleteness: number;
  queriesLast24h: number;
  criticalGapsUnresolved: number;
}

// ============================================================================
// ARCHITECTURAL REQUIREMENTS
// ============================================================================

export interface ArchitecturalRequirement {
  requirementId: string;
  requirementName: string;
  category: 'engine' | 'ui' | 'integration' | 'policy' | 'documentation' | 'lineage' | 'health' | 'fabric' | 'governance';
  description: string;
  applicablePhases: PhaseNumber[] | 'all';
  mandatory: boolean;
  checkFunction: (phase: PhaseRecord) => boolean;
}

export interface ArchitecturalLayer {
  layerId: string;
  layerName: string;
  description: string;
  requirements: ArchitecturalRequirement[];
  expectedComponents: string[];
}

// ============================================================================
// COMPLETENESS SCORING
// ============================================================================

export interface CompletenessScore {
  phase: PhaseNumber;
  score: number; // 0-100
  breakdown: {
    engineComplete: boolean;
    uiComplete: boolean;
    integrationComplete: boolean;
    policyComplete: boolean;
    documentationComplete: boolean;
    lineageComplete: boolean;
    healthComplete: boolean;
    fabricComplete: boolean;
    governanceComplete: boolean;
  };
  missingComponents: string[];
  recommendations: string[];
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface CoverageExport {
  exportedAt: string;
  exportedBy: string;
  scope: CoverageScopeContext;
  summary: CoverageSummary;
  gaps: CoverageGap[];
  phaseInventory: PhaseRecord[];
  integrationMatrix: IntegrationMatrix;
  statistics: CoverageStatistics;
  format: 'json' | 'markdown';
}
