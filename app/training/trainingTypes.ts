// Phase 40: Operator Training Mode & Scenario Walkthroughs
// trainingTypes.ts
// Deterministic types for operator training: scenarios, modules, walkthroughs, sessions
// No predictions, no biological simulation, read-only

export type TrainingScenarioSource =
  | 'incident-thread'
  | 'sop-walkthrough'
  | 'deviation-capa'
  | 'sandbox-scenario'
  | 'workflow-execution'
  | 'environmental-exception'
  | 'compliance-summary'
  | 'forecast-interpretation';

export type TrainingDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface TrainingScenario {
  scenarioId: string;
  name: string;
  description: string;
  source: TrainingScenarioSource;
  difficulty: TrainingDifficulty;
  estimatedDurationMinutes: number;
  learningObjectives: string[];
  prerequisites: string[];
  tags: string[];
  tenantId: string;
  facilityId?: string;
  sourceIncidentId?: string; // Reference to incident thread if incident-based
  sourceSOPId?: string; // Reference to SOP if SOP-based
  sourceSandboxId?: string; // Reference to sandbox scenario
  sourceWorkflowId?: string; // Reference to workflow
  createdAt: string; // ISO 8601
}

export type TrainingStepType =
  | 'information'
  | 'action-required'
  | 'decision-point'
  | 'safety-check'
  | 'verification'
  | 'context-review'
  | 'reference-lookup';

export interface TrainingStep {
  stepId: string;
  stepNumber: number;
  type: TrainingStepType;
  title: string;
  description: string;
  content: string; // Full step content
  safetyNotes?: string[];
  references: {
    sopIds?: string[];
    workflowIds?: string[];
    incidentIds?: string[];
    deviationIds?: string[];
    capaIds?: string[];
    eventIds?: string[];
    kgNodeIds?: string[];
  };
  expectedOutcome?: string;
  hints?: string[];
  checklistItems?: string[];
  rationale?: string; // Explanation via Narrative V2 hook
}

export interface TrainingModule {
  moduleId: string;
  scenario: TrainingScenario;
  steps: TrainingStep[];
  totalSteps: number;
  metadata: {
    author?: string;
    version: string;
    lastUpdated: string; // ISO 8601
    approvalStatus: 'draft' | 'approved' | 'archived';
    reviewedBy?: string;
  };
  summary: string;
  completionCriteria?: string[];
}

export interface WalkthroughState {
  sessionId: string;
  moduleId: string;
  currentStepIndex: number;
  totalSteps: number;
  stepHistory: number[]; // Indices of steps visited
  startedAt: string; // ISO 8601
  lastAccessedAt: string; // ISO 8601
  completedSteps: number[];
  progressPercentage: number;
  tenantId: string;
  userId?: string;
}

export interface TrainingQuery {
  queryId: string;
  timestamp: string; // ISO 8601
  tenantId: string;
  userId?: string;
  scenarioSource?: TrainingScenarioSource;
  difficulty?: TrainingDifficulty;
  tags?: string[];
  searchText?: string;
  facilityId?: string;
}

export interface TrainingResult {
  resultId: string;
  query: TrainingQuery;
  modules: TrainingModule[];
  matchedScenarios: TrainingScenario[];
  executionTimeMs: number;
  createdAt: string; // ISO 8601
}

export type TrainingSessionLogEntryType =
  | 'session-started'
  | 'step-viewed'
  | 'step-completed'
  | 'session-paused'
  | 'session-resumed'
  | 'session-completed'
  | 'query-executed'
  | 'module-loaded'
  | 'reference-accessed'
  | 'explain-requested'
  | 'replay-requested'
  | 'error';

export interface TrainingSessionLogEntry {
  logId: string;
  timestamp: string; // ISO 8601
  entryType: TrainingSessionLogEntryType;
  sessionId?: string;
  moduleId?: string;
  stepId?: string;
  tenantId: string;
  userId?: string;
  facilityId?: string;
  status: 'success' | 'partial' | 'failed';
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface TrainingEngine {
  queryTrainingModules(query: TrainingQuery): TrainingResult;
  getTrainingModule(moduleId: string, tenantId: string): TrainingModule | null;
  startTrainingSession(moduleId: string, tenantId: string, userId?: string): WalkthroughState;
  updateWalkthroughState(state: WalkthroughState): WalkthroughState;
  getTrainingSessionLog(): TrainingSessionLogEntry[];
  clearTrainingSessionLog(): void;
}
