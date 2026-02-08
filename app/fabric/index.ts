/**
 * Phase 46: Multi-Tenant Data Fabric - Main Exports
 * 
 * Central export point for all fabric components, types, and utilities.
 */

// Core Engine
export { FabricEngine, createFabricEngine, initializeFabricWithSampleData } from './fabricEngine';

// Linker
export { FabricLinker, createFabricLinker, validateLinkRequest } from './fabricLinker';

// Resolver
export { FabricResolver, createFabricResolver } from './fabricResolver';

// Policy Engine
export { FabricPolicyEngine, createFabricPolicyEngine, allEvaluationsPassed } from './fabricPolicyEngine';

// Log
export { FabricLog, createFabricLog, formatLogEntry } from './fabricLog';

// Types
export type {
  FabricEntityType,
  FabricScope,
  FabricScopeContext,
  FabricNode,
  FabricEdge,
  FabricEdgeType,
  FabricQuery,
  FabricQueryType,
  FabricResult,
  FabricReference,
  FabricPolicy,
  FabricPolicyEvaluation,
  FabricLogEntry,
  FabricLinkRequest,
  FabricLinkResult,
  FabricStatistics,
  FabricDashboardState
} from './fabricTypes';
