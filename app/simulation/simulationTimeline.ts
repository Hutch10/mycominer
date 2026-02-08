/**
 * Phase 49: Operator Simulation Mode - Timeline
 * 
 * Simulates step-by-step execution of scenarios.
 * Supports forward, backward, jump, and replay operations.
 * 
 * CRITICAL CONSTRAINTS:
 * - No real-world execution
 * - All operations in sandbox
 * - Deterministic state transitions
 * - No biological inference
 */

import type {
  SimulationScenario,
  SimulationState,
  SimulationStep,
  StepExecutionResult,
} from './simulationTypes';

// ============================================================================
// SIMULATION TIMELINE
// ============================================================================

export class SimulationTimeline {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  /**
   * Initialize simulation state from scenario
   */
  public initializeState(scenario: SimulationScenario): SimulationState {
    if (scenario.steps.length === 0) {
      throw new Error('Cannot initialize state: scenario has no steps');
    }

    return {
      stateId: this.generateStateId(),
      scenario,
      currentStepIndex: 0,
      currentStep: scenario.steps[0],
      completedSteps: [],
      pendingSteps: scenario.steps,
      startedAt: new Date().toISOString(),
      status: 'initialized',
      progress: {
        completedSteps: 0,
        totalSteps: scenario.totalSteps,
        percentComplete: 0,
        estimatedTimeRemaining: scenario.metadata.estimatedDuration,
      },
      outcomes: [],
      errors: [],
      warnings: [],
    };
  }

  // ==========================================================================
  // STEP OPERATIONS
  // ==========================================================================

  /**
   * Step forward
   */
  public stepForward(state: SimulationState): SimulationState {
    if (state.currentStepIndex >= state.scenario.steps.length - 1) {
      return {
        ...state,
        status: 'completed',
        completedAt: new Date().toISOString(),
      };
    }

    const currentStep = state.scenario.steps[state.currentStepIndex];
    
    // Execute current step
    const result = this.executeStep(currentStep);

    // Update step status
    const updatedCurrentStep = {
      ...currentStep,
      status: result.success ? 'completed' as const : 'failed' as const,
      actualOutcome: result.outcome,
      actualDuration: result.duration,
    };

    // Move to next step
    const nextIndex = state.currentStepIndex + 1;
    const nextStep = state.scenario.steps[nextIndex];

    const completedSteps = [...state.completedSteps, updatedCurrentStep];
    const pendingSteps = state.scenario.steps.slice(nextIndex + 1);

    // Update progress
    const percentComplete = Math.round((completedSteps.length / state.scenario.totalSteps) * 100);
    const avgDuration = completedSteps.reduce((sum, s) => sum + (s.actualDuration || 0), 0) / completedSteps.length;
    const remainingSteps = state.scenario.totalSteps - completedSteps.length;
    const estimatedTimeRemaining = Math.round(avgDuration * remainingSteps);

    return {
      ...state,
      currentStepIndex: nextIndex,
      currentStep: nextStep,
      completedSteps,
      pendingSteps,
      currentTime: new Date().toISOString(),
      status: 'running',
      progress: {
        completedSteps: completedSteps.length,
        totalSteps: state.scenario.totalSteps,
        percentComplete,
        estimatedTimeRemaining,
      },
      outcomes: [
        ...state.outcomes,
        {
          stepId: updatedCurrentStep.stepId,
          outcome: result.outcome,
          references: result.references,
        },
      ],
      errors: [...state.errors, ...result.errors],
      warnings: [...state.warnings, ...result.warnings],
    };
  }

  /**
   * Step backward
   */
  public stepBackward(state: SimulationState): SimulationState {
    if (state.currentStepIndex === 0) {
      return state;
    }

    const previousIndex = state.currentStepIndex - 1;
    const previousStep = state.scenario.steps[previousIndex];

    // Remove last completed step
    const completedSteps = state.completedSteps.slice(0, -1);
    const pendingSteps = [state.currentStep, ...state.pendingSteps];

    // Update progress
    const percentComplete = Math.round((completedSteps.length / state.scenario.totalSteps) * 100);

    return {
      ...state,
      currentStepIndex: previousIndex,
      currentStep: previousStep,
      completedSteps,
      pendingSteps,
      currentTime: new Date().toISOString(),
      status: 'running',
      progress: {
        ...state.progress,
        completedSteps: completedSteps.length,
        percentComplete,
      },
      outcomes: state.outcomes.slice(0, -1),
    };
  }

  /**
   * Jump to specific step
   */
  public jumpToStep(state: SimulationState, stepNumber: number): SimulationState {
    if (stepNumber < 1 || stepNumber > state.scenario.totalSteps) {
      throw new Error(`Invalid step number: ${stepNumber}`);
    }

    const targetIndex = stepNumber - 1;

    // If jumping forward, execute all intermediate steps
    if (targetIndex > state.currentStepIndex) {
      let currentState = state;
      while (currentState.currentStepIndex < targetIndex) {
        currentState = this.stepForward(currentState);
      }
      return currentState;
    }

    // If jumping backward, just update position
    if (targetIndex < state.currentStepIndex) {
      const completedSteps = state.scenario.steps.slice(0, targetIndex).map(step => ({
        ...step,
        status: 'completed' as const,
      }));
      const pendingSteps = state.scenario.steps.slice(targetIndex + 1);

      const percentComplete = Math.round((completedSteps.length / state.scenario.totalSteps) * 100);

      return {
        ...state,
        currentStepIndex: targetIndex,
        currentStep: state.scenario.steps[targetIndex],
        completedSteps,
        pendingSteps,
        currentTime: new Date().toISOString(),
        progress: {
          ...state.progress,
          completedSteps: completedSteps.length,
          percentComplete,
        },
      };
    }

    return state;
  }

  /**
   * Replay entire scenario
   */
  public async replayScenario(scenario: SimulationScenario): Promise<SimulationState> {
    let state = this.initializeState(scenario);
    
    state = {
      ...state,
      status: 'running',
    };

    // Execute all steps
    while (state.currentStepIndex < scenario.totalSteps - 1) {
      state = this.stepForward(state);
    }

    return {
      ...state,
      status: 'completed',
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * Pause simulation
   */
  public pauseSimulation(state: SimulationState): SimulationState {
    return {
      ...state,
      status: 'paused',
      pausedAt: new Date().toISOString(),
    };
  }

  /**
   * Resume simulation
   */
  public resumeSimulation(state: SimulationState): SimulationState {
    return {
      ...state,
      status: 'running',
      pausedAt: undefined,
      currentTime: new Date().toISOString(),
    };
  }

  // ==========================================================================
  // STEP EXECUTION (SANDBOX)
  // ==========================================================================

  /**
   * Execute step in sandbox (no real-world effects)
   */
  private executeStep(step: SimulationStep): StepExecutionResult {
    const startTime = Date.now();

    try {
      // Simulate step execution
      // In a real system, this would call appropriate engines based on sourceEngine
      // but in sandbox mode with NO real-world effects

      let outcome = '';
      
      switch (step.stepType) {
        case 'action':
          outcome = `Action completed: ${step.title}`;
          break;
        case 'decision':
          outcome = `Decision made: ${step.title}`;
          break;
        case 'validation':
          outcome = `Validation passed: ${step.title}`;
          break;
        case 'integration':
          outcome = `Integration executed: ${step.title}`;
          break;
        case 'observation':
          outcome = `Observation recorded: ${step.title}`;
          break;
        default:
          outcome = `Step executed: ${step.title}`;
      }

      const duration = Date.now() - startTime;

      return {
        stepId: step.stepId,
        success: true,
        outcome,
        duration,
        references: step.references,
        errors: [],
        warnings: [],
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        stepId: step.stepId,
        success: false,
        outcome: `Step failed: ${errorMessage}`,
        duration,
        references: step.references,
        errors: [errorMessage],
        warnings: [],
      };
    }
  }

  // ==========================================================================
  // STATE QUERIES
  // ==========================================================================

  /**
   * Get next step
   */
  public getNextStep(state: SimulationState): SimulationStep | null {
    if (state.currentStepIndex >= state.scenario.steps.length - 1) {
      return null;
    }
    return state.scenario.steps[state.currentStepIndex + 1];
  }

  /**
   * Get previous step
   */
  public getPreviousStep(state: SimulationState): SimulationStep | null {
    if (state.currentStepIndex === 0) {
      return null;
    }
    return state.scenario.steps[state.currentStepIndex - 1];
  }

  /**
   * Get step by number
   */
  public getStepByNumber(state: SimulationState, stepNumber: number): SimulationStep | null {
    if (stepNumber < 1 || stepNumber > state.scenario.totalSteps) {
      return null;
    }
    return state.scenario.steps[stepNumber - 1];
  }

  /**
   * Is simulation complete
   */
  public isComplete(state: SimulationState): boolean {
    return state.status === 'completed' || 
           state.currentStepIndex >= state.scenario.totalSteps - 1;
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private generateStateId(): string {
    return `state-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
