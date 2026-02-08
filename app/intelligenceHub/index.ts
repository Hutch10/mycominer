/**
 * Phase 48: Operator Intelligence Hub - Public API
 * 
 * Exports all types, classes, and utilities for the Intelligence Hub.
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  HubSourceEngine,
  HubQueryType,
  HubQueryScope,
  HubQueryFilters,
  HubQuery,
  HubReference,
  HubSection,
  HubLineageChain,
  HubLineageNode,
  HubImpactMap,
  HubImpactNode,
  HubResult,
  HubLogEntry,
  HubStatistics,
  HubPolicyContext,
  HubRoutingDecision,
  HubAssemblyConfig,
  EngineQueryParams,
} from './hubTypes';

// ============================================================================
// CLASSES
// ============================================================================

export { HubRouter } from './hubRouter';
export { HubAssembler } from './hubAssembler';
export { HubPolicyEngine } from './hubPolicyEngine';
export { HubEngine } from './hubEngine';
export { HubLog } from './hubLog';

// ============================================================================
// POLICY DECISION TYPE
// ============================================================================

export type { PolicyDecision } from './hubPolicyEngine';
