// Phase 19: Workflow Types
// Deterministic scheduling and workflow planning with full auditability

// ============================================================================
// SPECIES & TIMELINE DEFINITIONS
// ============================================================================

export type SpeciesName = 'oyster' | 'shiitake' | 'lions-mane' | 'king-oyster' | 'enoki' | 'pioppino' | 'reishi' | 'cordyceps' | 'turkey-tail' | 'chestnut' | 'maitake' | 'chaga';

export interface LifecycleStage {
  name: string;
  durationDays: number;
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
  co2Min: number;
  co2Max: number;
  lightRequired: boolean;
  autoHarvestDays?: number; // optional auto-harvest trigger
}

export interface SpeciesTimeline {
  species: SpeciesName;
  stages: LifecycleStage[];
  totalCycleDays: number;
  harvestWindowDays: number;
  cleanupDays: number;
}

// ============================================================================
// SUBSTRATE & PREPARATION
// ============================================================================

export interface SubstratePrepCycle {
  cycleId: string;
  substrateType: string;
  materialQuantityKg: number;
  prepSteps: string[];
  prepDurationHours: number;
  sterilizationDurationHours: number;
  coolingDurationHours: number;
  yieldPerKg: number;
  cost: number;
}

// ============================================================================
// LABOR & EQUIPMENT AVAILABILITY
// ============================================================================

export interface LaborWindow {
  windowId: string;
  date: string; // YYYY-MM-DD
  shift: 'morning' | 'afternoon' | 'evening';
  availableHours: number;
  staffCount: number;
  taskPriorities: string[]; // ordered list of task types to prioritize
}

export interface EquipmentAvailability {
  equipmentId: string;
  name: string;
  type: string; // 'autoclave', 'incubator', 'fridge', 'shelf', 'misting-system'
  capacity: number;
  availableFrom: string; // YYYY-MM-DD HH:mm
  availableUntil: string; // YYYY-MM-DD HH:mm
  cycleTimeHours: number;
  maintenanceRequiredDays?: number;
}

// ============================================================================
// WORKFLOW TASK DEFINITION
// ============================================================================

export type WorkflowTaskType = 
  | 'substrate-prep' 
  | 'inoculation' 
  | 'incubation-transition' 
  | 'fruiting-transition' 
  | 'misting'
  | 'co2-adjustment'
  | 'harvest'
  | 'cleaning'
  | 'equipment-maintenance'
  | 'labor-intensive-monitoring'
  | 'species-reset';

export interface WorkflowTask {
  taskId: string;
  type: WorkflowTaskType;
  species?: SpeciesName;
  room?: string; // 'room-1', 'room-2', etc.
  facility?: string; // facility-id
  stage?: string;
  durationHours: number;
  dependsOn?: string[]; // taskIds
  laborHours: number;
  equipment?: string[]; // equipment IDs
  rationale: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
}

// ============================================================================
// HARVEST WINDOW
// ============================================================================

export interface HarvestWindow {
  windowId: string;
  room: string;
  species: SpeciesName;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  estimatedYieldKg: number;
  laborHoursRequired: number;
}

// ============================================================================
// SCHEDULE PROPOSAL
// ============================================================================

export interface ScheduledTask {
  taskId: string;
  type: WorkflowTaskType;
  scheduledStart: string; // YYYY-MM-DD HH:mm
  scheduledEnd: string;
  room?: string;
  facility?: string;
  species?: SpeciesName;
  assignedLabor: number; // hours
  assignedEquipment?: string[];
  sequenceOrder: number;
}

export interface ScheduleProposal {
  proposalId: string;
  createdAt: string; // ISO timestamp
  scheduledTasks: ScheduledTask[];
  startDate: string; // YYYY-MM-DD
  endDate: string;
  totalDays: number;
  estimatedYieldKg: number;
  totalLaborHours: number;
  equipmentUtilization: Record<string, number>; // equipment-id -> utilization %
  rationale: string;
  confidence: number; // 0-100
  riskFactors: string[];
}

// ============================================================================
// WORKFLOW CONFLICT
// ============================================================================

export type ConflictType = 
  | 'overlapping-tasks'
  | 'species-incompatibility'
  | 'substrate-bottleneck'
  | 'harvest-clustering'
  | 'labor-overload'
  | 'equipment-over-allocation'
  | 'contamination-risk'
  | 'dependency-violation';

export interface WorkflowConflict {
  conflictId: string;
  type: ConflictType;
  affectedTaskIds: string[];
  severity: 'critical' | 'warning' | 'info';
  description: string;
  recommendedAction: string;
}

export interface ConflictCheckResult {
  resultId: string;
  timestamp: string;
  checkedTasks: string[];
  conflicts: WorkflowConflict[];
  decision: 'allow' | 'warn' | 'block';
  rationale: string;
  recommendations: string[];
}

// ============================================================================
// WORKFLOW PLAN
// ============================================================================

export interface WorkflowPlan {
  planId: string;
  createdAt: string;
  scheduleProposal: ScheduleProposal;
  groupedWorkflows: {
    workflowName: string;
    tasks: string[]; // taskIds
    startDate: string;
    endDate: string;
    estimatedYield: number;
    laborCost: number;
  }[];
  priorityLevels: Record<string, number>; // taskId -> priority level
  tradeoffs: {
    laborVsYield: string;
    contaminationRisk: string;
    equipmentUtilization: string;
  };
  overallConfidence: number; // 0-100
  estimatedBenefit: string;
  status: 'draft' | 'pending-approval' | 'approved' | 'rejected' | 'active' | 'completed';
  rejectionReason?: string;
  approvalBy?: string; // user ID
  approvedAt?: string;
}

// ============================================================================
// WORKFLOW AUDIT
// ============================================================================

export type AuditDecision = 'allow' | 'warn' | 'block';

export interface WorkflowAuditResult {
  auditId: string;
  timestamp: string;
  planId: string;
  decision: AuditDecision;
  timelineValidation: {
    isValid: boolean;
    issues: string[];
  };
  substrateValidation: {
    isValid: boolean;
    issues: string[];
  };
  facilityConstraintsValidation: {
    isValid: boolean;
    issues: string[];
  };
  laborValidation: {
    isValid: boolean;
    issues: string[];
  };
  regressionDetection: {
    detected: boolean;
    affectedMetrics: string[];
  };
  rationale: string;
  recommendations: string[];
  rollbackSteps?: string[];
}

// ============================================================================
// WORKFLOW LOG ENTRY
// ============================================================================

export type WorkflowLogCategory = 
  | 'workflow-generation'
  | 'schedule-proposal'
  | 'conflict-detection'
  | 'workflow-plan'
  | 'audit'
  | 'approval'
  | 'rejection'
  | 'execution'
  | 'rollback'
  | 'export';

export interface WorkflowLogEntry {
  entryId: string;
  timestamp: string; // ISO timestamp
  category: WorkflowLogCategory;
  source: string; // engine name
  dataType: 'proposal' | 'schedule' | 'conflict' | 'audit' | 'approval' | 'plan' | 'timeline';
  data: unknown; // flexible payload
  context: {
    planId?: string;
    proposalId?: string;
    userId?: string;
    facilityId?: string;
    requestId?: string;
    auditId?: string;
    resultId?: string;
  };
  status: 'success' | 'failure' | 'warning';
  message: string;
}

// ============================================================================
// WORKFLOW APPROVAL
// ============================================================================

export interface WorkflowApproval {
  approvalId: string;
  planId: string;
  reviewedAt: string;
  reviewedBy: string; // user ID
  decision: 'approved' | 'rejected' | 'pending-revision';
  comments: string;
  approvalRationale: string;
  conditionalApprovals?: string[]; // conditions to meet before execution
}

// ============================================================================
// INTEGRATED WORKFLOW REQUEST (aggregates Phase 13-18 data)
// ============================================================================

export interface WorkflowRequest {
  requestId: string;
  timestamp: string;
  source: 'strategy-engine' | 'user-submitted' | 'cloud-sync';
  strategyPlanId?: string; // from Phase 18
  facilityIds: string[]; // from Phase 13
  speciesSelection: SpeciesName[];
  harvestTargets: {
    species: SpeciesName;
    targetYieldKg: number;
  }[];
  constraintSet: {
    laborHoursAvailable: number;
    equipmentAvailable: string[];
    substrateLimitKg: number;
    maxRoomTemperature: number;
    minRoomTemperature: number;
  };
  timeWindowDays: number;
  prioritizeYield: boolean;
  prioritizeContaminationMitigation: boolean;
  prioritizeLabor: boolean;
}

// ============================================================================
// WORKFLOW STATE (Aggregated Output)
// ============================================================================

export interface WorkflowState {
  stateId: string;
  createdAt: string;
  request: WorkflowRequest;
  generatedTasks: WorkflowTask[];
  conflictCheckResult: ConflictCheckResult;
  scheduleProposal: ScheduleProposal;
  workflowPlan: WorkflowPlan;
  auditResult: WorkflowAuditResult;
  approval?: WorkflowApproval;
  executionStatus: 'not-started' | 'in-progress' | 'completed' | 'paused' | 'failed';
  rollbackEnabled: boolean;
}
