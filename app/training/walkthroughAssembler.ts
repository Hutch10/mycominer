// Phase 40: Operator Training Mode & Scenario Walkthroughs
// walkthroughAssembler.ts
// Assembles training walkthroughs from historical data and real references

import { TrainingModule, TrainingStep, WalkthroughState } from './trainingTypes';
import { logStepViewed, logStepCompleted } from './trainingSessionLog';

export function assembleWalkthrough(module: TrainingModule): TrainingModule {
  // Already assembled in scenario library, but this function can augment with dynamic data
  return module;
}

export function nextStep(state: WalkthroughState, module: TrainingModule, tenantId: string, userId?: string): WalkthroughState {
  if (state.currentStepIndex >= state.totalSteps - 1) {
    // Already at last step
    return state;
  }

  const newIndex = state.currentStepIndex + 1;
  const newState: WalkthroughState = {
    ...state,
    currentStepIndex: newIndex,
    stepHistory: [...state.stepHistory, newIndex],
    lastAccessedAt: new Date().toISOString(),
    progressPercentage: Math.round(((newIndex + 1) / state.totalSteps) * 100),
  };

  logStepViewed(state.sessionId, state.moduleId, module.steps[newIndex].stepId, tenantId, userId);

  return newState;
}

export function previousStep(state: WalkthroughState): WalkthroughState {
  if (state.currentStepIndex <= 0) {
    // Already at first step
    return state;
  }

  const newIndex = state.currentStepIndex - 1;
  const newState: WalkthroughState = {
    ...state,
    currentStepIndex: newIndex,
    stepHistory: [...state.stepHistory, newIndex],
    lastAccessedAt: new Date().toISOString(),
    progressPercentage: Math.round(((newIndex + 1) / state.totalSteps) * 100),
  };

  return newState;
}

export function jumpToStep(state: WalkthroughState, stepIndex: number, module: TrainingModule, tenantId: string, userId?: string): WalkthroughState {
  if (stepIndex < 0 || stepIndex >= state.totalSteps) {
    return state;
  }

  const newState: WalkthroughState = {
    ...state,
    currentStepIndex: stepIndex,
    stepHistory: [...state.stepHistory, stepIndex],
    lastAccessedAt: new Date().toISOString(),
    progressPercentage: Math.round(((stepIndex + 1) / state.totalSteps) * 100),
  };

  logStepViewed(state.sessionId, state.moduleId, module.steps[stepIndex].stepId, tenantId, userId);

  return newState;
}

export function markStepCompleted(state: WalkthroughState, stepIndex: number, module: TrainingModule, tenantId: string, userId?: string): WalkthroughState {
  if (state.completedSteps.includes(stepIndex)) {
    return state;
  }

  const newState: WalkthroughState = {
    ...state,
    completedSteps: [...state.completedSteps, stepIndex].sort((a, b) => a - b),
    lastAccessedAt: new Date().toISOString(),
    progressPercentage: Math.round(((state.completedSteps.length + 1) / state.totalSteps) * 100),
  };

  logStepCompleted(state.sessionId, state.moduleId, module.steps[stepIndex].stepId, tenantId, userId);

  return newState;
}

export function getCurrentStep(state: WalkthroughState, module: TrainingModule): TrainingStep | null {
  if (state.currentStepIndex < 0 || state.currentStepIndex >= module.steps.length) {
    return null;
  }
  return module.steps[state.currentStepIndex];
}

export function isWalkthroughComplete(state: WalkthroughState): boolean {
  return state.completedSteps.length === state.totalSteps;
}

export function getWalkthroughProgress(state: WalkthroughState): {
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
  progressPercentage: number;
  stepsRemaining: number;
} {
  return {
    currentStep: state.currentStepIndex + 1,
    totalSteps: state.totalSteps,
    completedSteps: state.completedSteps.length,
    progressPercentage: state.progressPercentage,
    stepsRemaining: state.totalSteps - state.completedSteps.length,
  };
}

export function getStepReferences(step: TrainingStep): {
  sopIds: string[];
  workflowIds: string[];
  incidentIds: string[];
  deviationIds: string[];
  capaIds: string[];
  eventIds: string[];
  kgNodeIds: string[];
  totalReferences: number;
} {
  const sopIds = step.references.sopIds || [];
  const workflowIds = step.references.workflowIds || [];
  const incidentIds = step.references.incidentIds || [];
  const deviationIds = step.references.deviationIds || [];
  const capaIds = step.references.capaIds || [];
  const eventIds = step.references.eventIds || [];
  const kgNodeIds = step.references.kgNodeIds || [];

  return {
    sopIds,
    workflowIds,
    incidentIds,
    deviationIds,
    capaIds,
    eventIds,
    kgNodeIds,
    totalReferences:
      sopIds.length +
      workflowIds.length +
      incidentIds.length +
      deviationIds.length +
      capaIds.length +
      eventIds.length +
      kgNodeIds.length,
  };
}

export function generateStepRationale(step: TrainingStep, module: TrainingModule): string {
  // Hook to Phase 37 Narrative Engine for step explanation
  if (step.rationale) {
    return step.rationale;
  }

  // Default rationale if not provided
  const rationaleMap: Record<string, string> = {
    'context-review': 'Understanding context ensures you have all necessary information before taking action.',
    'safety-check': 'Safety checks protect personnel and equipment from harm.',
    'action-required': 'This step requires your direct action to progress through the scenario.',
    'decision-point': 'Decision points test your understanding and judgment.',
    'verification': 'Verification ensures actions were completed correctly and safely.',
    'reference-lookup': 'Consulting references ensures compliance with approved procedures.',
    information: 'This step provides essential background information.',
  };

  return rationaleMap[step.type] || 'This step is part of the training sequence.';
}

export function validateStepCompletion(step: TrainingStep, userInput?: any): {
  isValid: boolean;
  feedback: string;
} {
  // Simple validation - in real implementation would check against completion criteria
  if (step.type === 'information' || step.type === 'context-review') {
    return {
      isValid: true,
      feedback: 'Information reviewed.',
    };
  }

  if (step.checklistItems && step.checklistItems.length > 0) {
    return {
      isValid: true,
      feedback: `Checklist reviewed: ${step.checklistItems.length} items`,
    };
  }

  return {
    isValid: true,
    feedback: 'Step acknowledged.',
  };
}

export function getNextStepPreview(state: WalkthroughState, module: TrainingModule): TrainingStep | null {
  if (state.currentStepIndex >= state.totalSteps - 1) {
    return null;
  }
  return module.steps[state.currentStepIndex + 1] || null;
}

export function getStepHints(step: TrainingStep, hintLevel: number = 1): string[] {
  if (!step.hints || step.hints.length === 0) {
    return [];
  }

  // Return hints up to hintLevel
  return step.hints.slice(0, hintLevel);
}
