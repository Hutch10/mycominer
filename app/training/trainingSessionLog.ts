// Phase 40: Operator Training Mode & Scenario Walkthroughs
// trainingSessionLog.ts
// Deterministic logging for all training sessions and operations

import { TrainingSessionLogEntry, TrainingSessionLogEntryType, TrainingQuery, WalkthroughState } from './trainingTypes';

let trainingSessionLog: TrainingSessionLogEntry[] = [];

export function logTrainingEntry(entry: Omit<TrainingSessionLogEntry, 'logId'>): TrainingSessionLogEntry {
  const logEntry: TrainingSessionLogEntry = {
    logId: `tlog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...entry,
  };
  trainingSessionLog.push(logEntry);
  return logEntry;
}

export function logSessionStarted(sessionId: string, moduleId: string, tenantId: string, userId?: string): TrainingSessionLogEntry {
  return logTrainingEntry({
    timestamp: new Date().toISOString(),
    entryType: 'session-started',
    sessionId,
    moduleId,
    tenantId,
    userId,
    status: 'success',
    metadata: {
      startTime: new Date().toISOString(),
    },
  });
}

export function logStepViewed(sessionId: string, moduleId: string, stepId: string, tenantId: string, userId?: string): TrainingSessionLogEntry {
  return logTrainingEntry({
    timestamp: new Date().toISOString(),
    entryType: 'step-viewed',
    sessionId,
    moduleId,
    stepId,
    tenantId,
    userId,
    status: 'success',
  });
}

export function logStepCompleted(sessionId: string, moduleId: string, stepId: string, tenantId: string, userId?: string): TrainingSessionLogEntry {
  return logTrainingEntry({
    timestamp: new Date().toISOString(),
    entryType: 'step-completed',
    sessionId,
    moduleId,
    stepId,
    tenantId,
    userId,
    status: 'success',
  });
}

export function logSessionPaused(sessionId: string, moduleId: string, tenantId: string, userId?: string): TrainingSessionLogEntry {
  return logTrainingEntry({
    timestamp: new Date().toISOString(),
    entryType: 'session-paused',
    sessionId,
    moduleId,
    tenantId,
    userId,
    status: 'success',
  });
}

export function logSessionResumed(sessionId: string, moduleId: string, tenantId: string, userId?: string): TrainingSessionLogEntry {
  return logTrainingEntry({
    timestamp: new Date().toISOString(),
    entryType: 'session-resumed',
    sessionId,
    moduleId,
    tenantId,
    userId,
    status: 'success',
  });
}

export function logSessionCompleted(sessionId: string, moduleId: string, tenantId: string, userId?: string, completionPercentage?: number): TrainingSessionLogEntry {
  return logTrainingEntry({
    timestamp: new Date().toISOString(),
    entryType: 'session-completed',
    sessionId,
    moduleId,
    tenantId,
    userId,
    status: 'success',
    metadata: {
      completionPercentage,
      completedAt: new Date().toISOString(),
    },
  });
}

export function logQueryExecuted(query: TrainingQuery, modulesFound: number): TrainingSessionLogEntry {
  return logTrainingEntry({
    timestamp: new Date().toISOString(),
    entryType: 'query-executed',
    tenantId: query.tenantId,
    userId: query.userId,
    status: 'success',
    metadata: {
      queryId: query.queryId,
      modulesFound,
      scenarioSource: query.scenarioSource,
      difficulty: query.difficulty,
    },
  });
}

export function logModuleLoaded(moduleId: string, tenantId: string, userId?: string): TrainingSessionLogEntry {
  return logTrainingEntry({
    timestamp: new Date().toISOString(),
    entryType: 'module-loaded',
    moduleId,
    tenantId,
    userId,
    status: 'success',
  });
}

export function logReferenceAccessed(sessionId: string, moduleId: string, referenceType: string, referenceId: string, tenantId: string, userId?: string): TrainingSessionLogEntry {
  return logTrainingEntry({
    timestamp: new Date().toISOString(),
    entryType: 'reference-accessed',
    sessionId,
    moduleId,
    tenantId,
    userId,
    status: 'success',
    metadata: {
      referenceType,
      referenceId,
    },
  });
}

export function logExplainRequested(sessionId: string, moduleId: string, stepId: string, tenantId: string, userId?: string): TrainingSessionLogEntry {
  return logTrainingEntry({
    timestamp: new Date().toISOString(),
    entryType: 'explain-requested',
    sessionId,
    moduleId,
    stepId,
    tenantId,
    userId,
    status: 'success',
    metadata: {
      hookTarget: 'Phase 37 Narrative Engine',
    },
  });
}

export function logReplayRequested(sessionId: string, moduleId: string, incidentId: string, tenantId: string, userId?: string): TrainingSessionLogEntry {
  return logTrainingEntry({
    timestamp: new Date().toISOString(),
    entryType: 'replay-requested',
    sessionId,
    moduleId,
    tenantId,
    userId,
    status: 'success',
    metadata: {
      incidentId,
      hookTarget: 'Phase 38 Incident Replay',
    },
  });
}

export function logTrainingError(tenantId: string, entryType: TrainingSessionLogEntryType, errorMessage: string, sessionId?: string, moduleId?: string): TrainingSessionLogEntry {
  return logTrainingEntry({
    timestamp: new Date().toISOString(),
    entryType,
    sessionId,
    moduleId,
    tenantId,
    status: 'failed',
    errorMessage,
  });
}

export function getTrainingSessionLog(): TrainingSessionLogEntry[] {
  return [...trainingSessionLog];
}

export function getTrainingSessionLogByTenant(tenantId: string): TrainingSessionLogEntry[] {
  return trainingSessionLog.filter((entry) => entry.tenantId === tenantId);
}

export function getTrainingSessionLogBySession(sessionId: string): TrainingSessionLogEntry[] {
  return trainingSessionLog.filter((entry) => entry.sessionId === sessionId);
}

export function getTrainingSessionLogByType(entryType: TrainingSessionLogEntryType): TrainingSessionLogEntry[] {
  return trainingSessionLog.filter((entry) => entry.entryType === entryType);
}

export function clearTrainingSessionLog(): void {
  trainingSessionLog = [];
}

export function filterTrainingSessionLog(predicate: (entry: TrainingSessionLogEntry) => boolean): TrainingSessionLogEntry[] {
  return trainingSessionLog.filter(predicate);
}
