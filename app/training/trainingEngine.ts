// Phase 40: Operator Training Mode & Scenario Walkthroughs
// trainingEngine.ts
// Master orchestrator for training scenarios and walkthroughs
// Read-only, deterministic, tenant-scoped, audit-logged

import {
  TrainingQuery,
  TrainingResult,
  TrainingModule,
  WalkthroughState,
  TrainingEngine,
  TrainingScenario,
} from './trainingTypes';
import {
  initializeScenarioLibrary,
  getScenarioLibrary,
  getScenariosByTenant,
  getScenariosBySource,
  getScenariosByDifficulty,
  searchScenarios,
  buildModuleFromScenario,
  registerModule,
  getModuleById,
  getModuleLibrary,
} from './trainingScenarioLibrary';
import { assembleWalkthrough, nextStep, previousStep, jumpToStep, markStepCompleted } from './walkthroughAssembler';
import {
  logSessionStarted,
  logQueryExecuted,
  logModuleLoaded,
  getTrainingSessionLog,
  clearTrainingSessionLog,
} from './trainingSessionLog';

let activeSessions: Map<string, WalkthroughState> = new Map();

export function initTrainingEngine(tenantId: string): TrainingEngine {
  // Initialize scenario library
  initializeScenarioLibrary(tenantId);

  // Build modules from scenarios
  const scenarios = getScenariosByTenant(tenantId);
  for (const scenario of scenarios) {
    const module = buildModuleFromScenario(scenario);
    registerModule(module);
  }

  return {
    queryTrainingModules,
    getTrainingModule,
    startTrainingSession,
    updateWalkthroughState,
    getTrainingSessionLog,
    clearTrainingSessionLog,
  };
}

export function queryTrainingModules(query: TrainingQuery): TrainingResult {
  const startTime = Date.now();

  // Filter scenarios by query
  let scenarios: TrainingScenario[] = getScenarioLibrary();

  // Filter by tenant
  scenarios = scenarios.filter((s) => s.tenantId === query.tenantId);

  // Filter by facility if specified
  if (query.facilityId) {
    scenarios = scenarios.filter((s) => !s.facilityId || s.facilityId === query.facilityId);
  }

  // Filter by source if specified
  if (query.scenarioSource) {
    scenarios = scenarios.filter((s) => s.source === query.scenarioSource);
  }

  // Filter by difficulty if specified
  if (query.difficulty) {
    scenarios = scenarios.filter((s) => s.difficulty === query.difficulty);
  }

  // Filter by tags if specified
  if (query.tags && query.tags.length > 0) {
    scenarios = scenarios.filter((s) => query.tags!.some((tag) => s.tags.includes(tag)));
  }

  // Search by text if specified
  if (query.searchText) {
    scenarios = searchScenarios(query.searchText).filter((s) =>
      scenarios.some((existing) => existing.scenarioId === s.scenarioId)
    );
  }

  // Get corresponding modules
  const modules: TrainingModule[] = [];
  for (const scenario of scenarios) {
    const moduleId = `module-${scenario.scenarioId}`;
    const module = getModuleById(moduleId);
    if (module) {
      modules.push(module);
    }
  }

  const executionTimeMs = Date.now() - startTime;

  const result: TrainingResult = {
    resultId: `result-${query.queryId}`,
    query,
    modules,
    matchedScenarios: scenarios,
    executionTimeMs,
    createdAt: new Date().toISOString(),
  };

  logQueryExecuted(query, modules.length);

  return result;
}

export function getTrainingModule(moduleId: string, tenantId: string): TrainingModule | null {
  const module = getModuleById(moduleId);

  if (!module) {
    return null;
  }

  // Validate tenant access
  if (module.scenario.tenantId !== tenantId) {
    return null;
  }

  logModuleLoaded(moduleId, tenantId);

  return assembleWalkthrough(module);
}

export function startTrainingSession(moduleId: string, tenantId: string, userId?: string): WalkthroughState {
  const module = getTrainingModule(moduleId, tenantId);

  if (!module) {
    throw new Error(`Module ${moduleId} not found or access denied`);
  }

  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const state: WalkthroughState = {
    sessionId,
    moduleId,
    currentStepIndex: 0,
    totalSteps: module.totalSteps,
    stepHistory: [0],
    startedAt: new Date().toISOString(),
    lastAccessedAt: new Date().toISOString(),
    completedSteps: [],
    progressPercentage: 0,
    tenantId,
    userId,
  };

  activeSessions.set(sessionId, state);
  logSessionStarted(sessionId, moduleId, tenantId, userId);

  return state;
}

export function updateWalkthroughState(state: WalkthroughState): WalkthroughState {
  activeSessions.set(state.sessionId, state);
  return state;
}

export function getActiveSession(sessionId: string): WalkthroughState | null {
  return activeSessions.get(sessionId) || null;
}

export function getAllActiveSessions(): WalkthroughState[] {
  return Array.from(activeSessions.values());
}

export function endTrainingSession(sessionId: string): void {
  activeSessions.delete(sessionId);
}

export function getTrainingEngineStats(): {
  totalScenarios: number;
  totalModules: number;
  activeSessions: number;
  scenariosByDifficulty: Record<string, number>;
  scenariosBySource: Record<string, number>;
} {
  const scenarios = getScenarioLibrary();
  const modules = getModuleLibrary();

  const scenariosByDifficulty: Record<string, number> = {};
  const scenariosBySource: Record<string, number> = {};

  for (const scenario of scenarios) {
    scenariosByDifficulty[scenario.difficulty] = (scenariosByDifficulty[scenario.difficulty] || 0) + 1;
    scenariosBySource[scenario.source] = (scenariosBySource[scenario.source] || 0) + 1;
  }

  return {
    totalScenarios: scenarios.length,
    totalModules: modules.length,
    activeSessions: activeSessions.size,
    scenariosByDifficulty,
    scenariosBySource,
  };
}

// Re-export walkthrough navigation functions
export { nextStep, previousStep, jumpToStep, markStepCompleted } from './walkthroughAssembler';
