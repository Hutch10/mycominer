/**
 * Phase 49: Operator Simulation Mode - Public API
 * 
 * Deterministic, read-only simulation engine for workflows, incidents, SOPs,
 * timeline sequences, governance decisions, and cross-engine interactions.
 */

// Type Exports
export type {
  SimulationScenarioType,
  SimulationScope,
  SimulationMode,
  SimulationStepType,
  SimulationStepStatus,
  SimulationStatus,
  SimulationReferenceType,
  SimulationLogEntryType,
  SimulationStep,
  SimulationReference,
  SimulationScenario,
  SimulationOutcome,
  SimulationProgress,
  SimulationState,
  SimulationQuery,
  SimulationResult,
  SimulationLogEntry,
  SimulationStatistics,
  SimulationPolicyContext,
  StepExecutionResult,
  ScenarioBuildConfig,
} from './simulationTypes';

// Class Exports
export { SimulationScenarioBuilder } from './simulationScenarioBuilder';
export { SimulationTimeline } from './simulationTimeline';
export { SimulationPolicyEngine } from './simulationPolicyEngine';
export { SimulationLog } from './simulationLog';
export { SimulationEngine } from './simulationEngine';
