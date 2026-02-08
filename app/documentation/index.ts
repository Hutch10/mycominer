/**
 * Phase 47: Autonomous Documentation Engine - Public API
 * 
 * Exports all classes, utilities, and types.
 */

// Type Definitions
export type {
  DocumentationCategory,
  DocumentationEngineType,
  DocumentationAssetType,
  DocumentationTemplateType,
  DocumentationScope,
  DocumentationScopeContext,
  DocumentationTemplate,
  TemplateSection,
  DocumentationQuery,
  DocumentationQueryType,
  DocumentationQueryFilters,
  DocumentationQueryOptions,
  DocumentationResult,
  DocumentationBundle,
  DocumentationSection,
  MetadataSource,
  DocumentationReference,
  ReferenceType,
  TableOfContentsEntry,
  DocumentationMetadata,
  DocumentationPolicy,
  DocumentationPolicyConditions,
  DocumentationPolicyEvaluation,
  DocumentationLogEntry,
  DocumentationLogEntryType,
  DocumentationStatistics,
  DocumentationDashboardState
} from './documentationTypes';

// Template Library
export {
  DocumentationTemplateLibrary,
  createDocumentationTemplateLibrary
} from './documentationTemplateLibrary';

// Assembler
export {
  DocumentationAssembler,
  createDocumentationAssembler,
  extractMetadataFromEngines
} from './documentationAssembler';

// Policy Engine
export {
  DocumentationPolicyEngine,
  createDocumentationPolicyEngine,
  allEvaluationsPassed
} from './documentationPolicyEngine';

// Log
export {
  DocumentationLog,
  createDocumentationLog,
  formatLogEntry
} from './documentationLog';

// Main Engine
export {
  DocumentationEngine,
  createDocumentationEngine,
  initializeDocumentationEngineWithSampleData
} from './documentationEngine';
