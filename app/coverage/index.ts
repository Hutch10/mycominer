/**
 * Phase 48: Global Coverage Sweep & Missing Systems Detector
 * 
 * PUBLIC API EXPORTS
 */

// Export types
export type {
  PhaseNumber,
  PhaseRecord,
  EngineRecord,
  UIComponentRecord,
  IntegrationRecord,
  CoverageGapCategory,
  CoverageGapSeverity,
  CoverageGap,
  CoverageReference,
  CoverageQueryType,
  CoverageScope,
  CoverageScopeContext,
  CoverageQuery,
  CoverageFilters,
  CoverageOptions,
  CoverageResult,
  CoverageSummary,
  IntegrationMatrix,
  CoverageLogType,
  CoverageLogEntry,
  CoverageLogDetails,
  CoverageStatistics,
  ArchitecturalRequirement,
  ArchitecturalLayer,
  CompletenessScore,
  CoverageExport
} from './coverageTypes';

// Export classes
export { PhaseInventory } from './phaseInventory';
export { GapDetector } from './gapDetector';
export { CoverageLog } from './coverageLog';
export { CoverageEngine } from './coverageEngine';
