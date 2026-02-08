/**
 * Phase 49: Operator Simulation Mode - Main Engine
 * 
 * Orchestrates scenario building, timeline execution, and policy enforcement.
 * Deterministic, read-only simulation with no real-world effects.
 * 
 * CRITICAL CONSTRAINTS:
 * - No real-world execution
 * - All operations in sandbox
 * - No biological inference
 * - Tenant isolation strictly enforced
 * - All operations logged
 */

import type {
  SimulationQuery,
  SimulationResult,
  SimulationState,
  SimulationScenarioType,
  SimulationScope,
  ScenarioBuildConfig,
  SimulationStatistics,
} from './simulationTypes';

import { SimulationScenarioBuilder } from './simulationScenarioBuilder';
import { SimulationTimeline } from './simulationTimeline';
import { SimulationPolicyEngine, type SimulationPolicyDecision } from './simulationPolicyEngine';
import { SimulationLog } from './simulationLog';

// ============================================================================
// SIMULATION ENGINE
// ============================================================================

export class SimulationEngine {
  private tenantId: string;
  private scenarioBuilder: SimulationScenarioBuilder;
  private timeline: SimulationTimeline;
  private policyEngine: SimulationPolicyEngine;
  private log: SimulationLog;

  // Active simulations (in-memory)
  private activeSimulations: Map<string, SimulationState> = new Map();

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.scenarioBuilder = new SimulationScenarioBuilder(tenantId);
    this.timeline = new SimulationTimeline(tenantId);
    this.policyEngine = new SimulationPolicyEngine(tenantId);
    this.log = new SimulationLog(tenantId);
  }

  // ==========================================================================
  // MAIN SIMULATION EXECUTION
  // ==========================================================================

  /**
   * Create simulation (build scenario)
   */
  public async createSimulation(query: SimulationQuery): Promise<SimulationResult> {
    const startTime = Date.now();

    try {
      // Build policy context
      const policyContext = this.buildPolicyContext(query);

      // Authorize simulation
      const authDecision = this.policyEngine.authorizeSimulation(query, policyContext);
      
      if (authDecision.decision === 'deny') {
        throw new Error(`Simulation denied: ${authDecision.reason}`);
      }

      // Log query
      this.log.logQuery(query);

      // Build scenario
      const config = this.buildScenarioBuildConfig(query);
      const scenario = await this.scenarioBuilder.buildScenario(
        query.queryType,
        query.targetEntityId || '',
        query.targetEntityType || '',
        query.scope,
        config
      );

      // Log scenario build
      this.log.logScenarioBuild(scenario);

      // Initialize state
      const initialState = this.timeline.initializeState(scenario);

      // Store active simulation
      this.activeSimulations.set(initialState.stateId, initialState);

      const executionTime = Date.now() - startTime;

      // Get source engines
      const sourceEngines = Array.from(new Set(
        scenario.steps
          .map(s => s.sourceEngine)
          .filter((e): e is string => e !== undefined)
      ));

      const result: SimulationResult = {
        resultId: `result-${query.queryId}`,
        query,
        scenario,
        initialState,
        summary: {
          totalSteps: scenario.totalSteps,
          estimatedDuration: scenario.metadata.estimatedDuration,
          crossEngineReferences: scenario.sourceReferences.length,
          sourceEngines,
        },
        metadata: {
          policyDecisions: [authDecision.reason],
          errors: [],
          warnings: [],
          generatedAt: new Date().toISOString(),
        },
        performedBy: query.performedBy,
      };

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.log.logError(query.queryId, errorMessage);
      throw error;
    }
  }

  // ==========================================================================
  // TIMELINE OPERATIONS
  // ==========================================================================

  /**
   * Step forward in simulation
   */
  public stepForward(stateId: string): SimulationState {
    const state = this.getActiveSimulation(stateId);
    const newState = this.timeline.stepForward(state);
    
    this.activeSimulations.set(stateId, newState);
    this.log.logTimelineStep(stateId, newState.currentStepIndex, 'step-forward');
    
    return newState;
  }

  /**
   * Step backward in simulation
   */
  public stepBackward(stateId: string): SimulationState {
    const state = this.getActiveSimulation(stateId);
    const newState = this.timeline.stepBackward(state);
    
    this.activeSimulations.set(stateId, newState);
    this.log.logTimelineStep(stateId, newState.currentStepIndex, 'step-backward');
    
    return newState;
  }

  /**
   * Jump to specific step
   */
  public jumpToStep(stateId: string, stepNumber: number): SimulationState {
    const state = this.getActiveSimulation(stateId);
    const newState = this.timeline.jumpToStep(state, stepNumber);
    
    this.activeSimulations.set(stateId, newState);
    this.log.logTimelineStep(stateId, newState.currentStepIndex, 'jump');
    
    return newState;
  }

  /**
   * Replay entire scenario
   */
  public async replayScenario(stateId: string): Promise<SimulationState> {
    const state = this.getActiveSimulation(stateId);
    const newState = await this.timeline.replayScenario(state.scenario);
    
    this.activeSimulations.set(stateId, newState);
    this.log.logTimelineStep(stateId, newState.currentStepIndex, 'replay');
    
    return newState;
  }

  /**
   * Pause simulation
   */
  public pauseSimulation(stateId: string): SimulationState {
    const state = this.getActiveSimulation(stateId);
    const newState = this.timeline.pauseSimulation(state);
    
    this.activeSimulations.set(stateId, newState);
    
    return newState;
  }

  /**
   * Resume simulation
   */
  public resumeSimulation(stateId: string): SimulationState {
    const state = this.getActiveSimulation(stateId);
    const newState = this.timeline.resumeSimulation(state);
    
    this.activeSimulations.set(stateId, newState);
    
    return newState;
  }

  // ==========================================================================
  // SIMULATION STATE QUERIES
  // ==========================================================================

  /**
   * Get active simulation
   */
  public getActiveSimulation(stateId: string): SimulationState {
    const state = this.activeSimulations.get(stateId);
    if (!state) {
      throw new Error(`Simulation not found: ${stateId}`);
    }
    return state;
  }

  /**
   * Get all active simulations
   */
  public getAllActiveSimulations(): SimulationState[] {
    return Array.from(this.activeSimulations.values());
  }

  /**
   * Close simulation
   */
  public closeSimulation(stateId: string): void {
    this.activeSimulations.delete(stateId);
  }

  // ==========================================================================
  // QUERY BUILDERS
  // ==========================================================================

  /**
   * Build SOP execution query
   */
  public buildSOPExecutionQuery(
    sopId: string,
    facilityId: string | undefined,
    performedBy: string
  ): SimulationQuery {
    return {
      queryId: this.generateQueryId(),
      queryType: 'sop-execution',
      queryText: `Simulate SOP execution: ${sopId}`,
      targetEntityId: sopId,
      targetEntityType: 'sop',
      scope: {
        tenantId: this.tenantId,
        facilityId,
        simulationMode: 'sandbox',
        allowCrossEngine: true,
      },
      options: {
        includeCrossEngineReferences: true,
        includeTimingEstimates: true,
        includeValidationSteps: true,
        maxSteps: 50,
      },
      performedBy,
      performedAt: new Date().toISOString(),
    };
  }

  /**
   * Build workflow rehearsal query
   */
  public buildWorkflowRehearsalQuery(
    workflowId: string,
    facilityId: string | undefined,
    performedBy: string
  ): SimulationQuery {
    return {
      queryId: this.generateQueryId(),
      queryType: 'workflow-rehearsal',
      queryText: `Rehearse workflow: ${workflowId}`,
      targetEntityId: workflowId,
      targetEntityType: 'workflow',
      scope: {
        tenantId: this.tenantId,
        facilityId,
        simulationMode: 'rehearsal',
        allowCrossEngine: true,
      },
      options: {
        includeCrossEngineReferences: true,
        includeTimingEstimates: true,
        includeValidationSteps: false,
        maxSteps: 100,
      },
      performedBy,
      performedAt: new Date().toISOString(),
    };
  }

  /**
   * Build incident replay query
   */
  public buildIncidentReplayQuery(
    incidentId: string,
    performedBy: string
  ): SimulationQuery {
    return {
      queryId: this.generateQueryId(),
      queryType: 'incident-replay',
      queryText: `Replay incident: ${incidentId}`,
      targetEntityId: incidentId,
      targetEntityType: 'incident',
      scope: {
        tenantId: this.tenantId,
        simulationMode: 'replay',
        allowCrossEngine: true,
      },
      options: {
        includeCrossEngineReferences: true,
        includeTimingEstimates: false,
        includeValidationSteps: false,
        maxSteps: 50,
      },
      performedBy,
      performedAt: new Date().toISOString(),
    };
  }

  /**
   * Build governance replay query
   */
  public buildGovernanceReplayQuery(
    decisionId: string,
    performedBy: string
  ): SimulationQuery {
    return {
      queryId: this.generateQueryId(),
      queryType: 'governance-replay',
      queryText: `Replay governance decision: ${decisionId}`,
      targetEntityId: decisionId,
      targetEntityType: 'governance-decision',
      scope: {
        tenantId: this.tenantId,
        simulationMode: 'replay',
        allowCrossEngine: true,
      },
      options: {
        includeCrossEngineReferences: true,
        includeTimingEstimates: false,
        includeValidationSteps: false,
        maxSteps: 20,
      },
      performedBy,
      performedAt: new Date().toISOString(),
    };
  }

  // ==========================================================================
  // STATISTICS & LOGS
  // ==========================================================================

  /**
   * Get statistics
   */
  public getStatistics(): SimulationStatistics {
    return this.log.getStatistics();
  }

  /**
   * Get log
   */
  public getLog() {
    return this.log;
  }

  /**
   * Export log
   */
  public exportLog(filters?: any): string {
    return this.log.exportLog(filters);
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  /**
   * Build policy context from query
   */
  private buildPolicyContext(query: SimulationQuery) {
    // In production, fetch user roles/permissions from auth system
    return {
      tenantId: query.scope.tenantId,
      facilityId: query.scope.facilityId,
      roomId: query.scope.roomId,
      performedBy: query.performedBy,
      userRoles: ['operator', 'admin'],
      userPermissions: [
        'simulation.run',
        'simulation.sop-execution',
        'simulation.workflow-rehearsal',
        'simulation.incident-replay',
        'simulation.governance-replay',
        'simulation.health-drift-replay',
        'simulation.analytics-replay',
        'simulation.training-simulation',
        'simulation.fabric-traversal',
        'facility.simulate',
        'room.simulate',
      ],
    };
  }

  /**
   * Build scenario build config from query
   */
  private buildScenarioBuildConfig(query: SimulationQuery): ScenarioBuildConfig {
    return {
      includeValidationSteps: query.options?.includeValidationSteps || false,
      includeCrossEngineReferences: query.options?.includeCrossEngineReferences || false,
      includeTimingEstimates: query.options?.includeTimingEstimates || false,
      maxSteps: query.options?.maxSteps || 50,
      difficulty: 'intermediate',
    };
  }

  /**
   * Generate unique query ID
   */
  private generateQueryId(): string {
    return `sim-query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
