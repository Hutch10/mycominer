/**
 * Phase 49: Operator Simulation Mode - Type Definitions
 * 
 * Deterministic, read-only simulation engine for workflows, incidents, SOPs,
 * timeline sequences, governance decisions, and cross-engine interactions.
 * 
 * CRITICAL CONSTRAINTS:
 * - No biological inference or prediction
 * - No real-world execution
 * - All simulations based on real metadata
 * - Tenant isolation strictly enforced
 * - All operations logged
 */

// ============================================================================
// SCENARIO TYPES
// ============================================================================

export type SimulationScenarioType =
  | 'sop-execution'          // Simulate SOP execution
  | 'workflow-rehearsal'     // Rehearse workflow
  | 'incident-replay'        // Replay incident from Timeline (Phase 38)
  | 'governance-replay'      // Replay governance decision (Phase 44-45)
  | 'health-drift-replay'    // Replay health drift (Phase 43)
  | 'analytics-replay'       // Replay analytics pattern (Phase 39)
  | 'training-simulation'    // Simulate training module (Phase 40)
  | 'fabric-traversal';      // Simulate fabric link traversal (Phase 46)

// ============================================================================
// SIMULATION SCOPE
// ============================================================================

export interface SimulationScope {
  tenantId: string;
  facilityId?: string;
  roomId?: string;
  simulationMode: 'sandbox' | 'rehearsal' | 'replay' | 'training';
  allowCrossEngine: boolean;
}

// ============================================================================
// SIMULATION STEP
// ============================================================================

export interface SimulationStep {
  stepId: string;
  stepNumber: number;
  stepType: 'action' | 'decision' | 'validation' | 'integration' | 'observation';
  title: string;
  description: string;
  
  // Source reference
  sourceEngine?: string;       // Which engine provided this step
  sourceEntityId?: string;     // Source entity (SOP, workflow, incident, etc.)
  sourceEntityType?: string;
  
  // Step details
  expectedOutcome?: string;
  actualOutcome?: string;      // Filled during execution
  
  // Cross-engine references
  references: SimulationReference[];
  
  // Timing
  estimatedDuration?: number;  // milliseconds
  actualDuration?: number;     // milliseconds (filled during execution)
  
  // Status
  status: 'pending' | 'active' | 'completed' | 'skipped' | 'failed';
  
  // Metadata
  metadata: {
    requires?: string[];       // Required previous steps
    optional?: boolean;
    canRollback?: boolean;
    tags?: string[];
    [key: string]: any;
  };
}

// ============================================================================
// SIMULATION REFERENCE
// ============================================================================

export interface SimulationReference {
  referenceId: string;
  referenceType: 'sop' | 'workflow' | 'incident' | 'decision' | 'pattern' | 'module' | 'document' | 'link';
  entityId: string;
  entityType: string;
  title: string;
  description?: string;
  sourceEngine: string;
  metadata: Record<string, any>;
}

// ============================================================================
// SIMULATION SCENARIO
// ============================================================================

export interface SimulationScenario {
  scenarioId: string;
  scenarioType: SimulationScenarioType;
  title: string;
  description: string;
  
  // Steps
  steps: SimulationStep[];
  totalSteps: number;
  
  // Source information
  sourceReferences: SimulationReference[];
  
  // Scope
  scope: SimulationScope;
  
  // Metadata
  metadata: {
    createdBy: string;
    createdAt: string;
    estimatedDuration: number;  // milliseconds
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
  };
}

// ============================================================================
// SIMULATION STATE
// ============================================================================

export interface SimulationState {
  stateId: string;
  scenario: SimulationScenario;
  
  // Current position
  currentStepIndex: number;
  currentStep: SimulationStep;
  
  // History
  completedSteps: SimulationStep[];
  pendingSteps: SimulationStep[];
  
  // Execution info
  startedAt?: string;
  currentTime?: string;
  pausedAt?: string;
  completedAt?: string;
  
  // Progress
  progress: {
    completedSteps: number;
    totalSteps: number;
    percentComplete: number;
    estimatedTimeRemaining: number;  // milliseconds
  };
  
  // Status
  status: 'initialized' | 'running' | 'paused' | 'completed' | 'failed';
  
  // Results
  outcomes: Array<{
    stepId: string;
    outcome: string;
    references: SimulationReference[];
  }>;
  
  // Errors
  errors: string[];
  warnings: string[];
}

// ============================================================================
// SIMULATION QUERY
// ============================================================================

export interface SimulationQuery {
  queryId: string;
  queryType: SimulationScenarioType;
  queryText: string;
  
  // Target entity (SOP, workflow, incident, etc.)
  targetEntityId?: string;
  targetEntityType?: string;
  
  // Scope
  scope: SimulationScope;
  
  // Options
  options?: {
    includeCrossEngineReferences?: boolean;
    includeTimingEstimates?: boolean;
    includeValidationSteps?: boolean;
    maxSteps?: number;
    startFromStep?: number;
  };
  
  performedBy: string;
  performedAt: string;
}

// ============================================================================
// SIMULATION RESULT
// ============================================================================

export interface SimulationResult {
  resultId: string;
  query: SimulationQuery;
  scenario: SimulationScenario;
  initialState: SimulationState;
  
  // Summary
  summary: {
    totalSteps: number;
    estimatedDuration: number;
    crossEngineReferences: number;
    sourceEngines: string[];
  };
  
  // Metadata
  metadata: {
    policyDecisions: string[];
    errors: string[];
    warnings: string[];
    generatedAt: string;
  };
  
  performedBy: string;
}

// ============================================================================
// SIMULATION LOG ENTRY
// ============================================================================

export interface SimulationLogEntry {
  entryId: string;
  entryType: 'query' | 'scenario-build' | 'timeline-step' | 'policy-decision' | 'error';
  timestamp: string;
  tenantId: string;
  facilityId?: string;
  
  // Query details
  query?: {
    queryId: string;
    queryType: SimulationScenarioType;
    queryText: string;
    scope: SimulationScope;
  };
  
  // Scenario details
  scenarioBuild?: {
    scenarioId: string;
    scenarioType: SimulationScenarioType;
    totalSteps: number;
    sourceEngines: string[];
  };
  
  // Timeline step details
  timelineStep?: {
    stateId: string;
    stepNumber: number;
    stepType: string;
    action: 'step-forward' | 'step-backward' | 'jump' | 'replay';
  };
  
  // Policy details
  policyDecision?: {
    decision: 'allow' | 'deny' | 'partial';
    reason: string;
  };
  
  // Error details
  error?: {
    message: string;
    stack?: string;
  };
  
  performedBy: string;
  executionTime?: number;
  success: boolean;
}

// ============================================================================
// SIMULATION STATISTICS
// ============================================================================

export interface SimulationStatistics {
  totalSimulations: number;
  simulationsByType: Record<SimulationScenarioType, number>;
  averageStepsPerSimulation: number;
  averageDuration: number;
  totalErrors: number;
  mostUsedScenarioType: SimulationScenarioType;
  simulationsLast24Hours: number;
  
  // By source engine
  simulationsBySourceEngine: Record<string, number>;
}

// ============================================================================
// SIMULATION POLICY CONTEXT
// ============================================================================

export interface SimulationPolicyContext {
  tenantId: string;
  facilityId?: string;
  roomId?: string;
  performedBy: string;
  userRoles: string[];
  userPermissions: string[];
  federationTenants?: string[];
}

// ============================================================================
// STEP EXECUTION RESULT
// ============================================================================

export interface StepExecutionResult {
  stepId: string;
  success: boolean;
  outcome: string;
  duration: number;
  references: SimulationReference[];
  errors: string[];
  warnings: string[];
}

// ============================================================================
// SCENARIO BUILD CONFIG
// ============================================================================

export interface ScenarioBuildConfig {
  includeValidationSteps: boolean;
  includeCrossEngineReferences: boolean;
  includeTimingEstimates: boolean;
  maxSteps: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}
