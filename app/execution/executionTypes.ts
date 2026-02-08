// Phase 21: Execution & Monitoring Types
// Deterministic, safety-gated execution models that stay reversible and auditable

import { WorkflowPlan } from '@/app/workflow/workflowTypes';
import { StrategyPlan } from '@/app/strategy/engine/strategyTypes';
import { AllocationPlan } from '@/app/resource/resourceTypes';

// ============================================================================
// EXECUTION SOURCES & TELEMETRY BASELINES
// ============================================================================

export type ExecutionSource =
  | 'workflow-plan'
  | 'strategy-plan'
  | 'resource-allocation'
  | 'simulation-insight'
  | 'refinement-insight'
  | 'facility-orchestrator'
  | 'telemetry-engine';

export interface TelemetrySnapshot {
  timestamp: string;
  roomId?: string;
  facilityId?: string;
  temperatureC?: number;
  humidityPercent?: number;
  co2Ppm?: number;
  energyKwh?: number;
  contaminationRiskScore?: number; // 0-100
  equipmentLoadPercent?: number; // 0-100
  laborUtilizationPercent?: number; // 0-100
  environmentalAlerts?: string[];
  regressionsDetected?: string[];
}

// ============================================================================
// EXECUTION STEPS & PLANS
// ============================================================================

export type ExecutionStepStatus =
  | 'pending'
  | 'awaiting-approval'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'rolled-back';

export interface ExecutionResourceUse {
  name: string;
  category:
    | 'labor'
    | 'equipment'
    | 'energy'
    | 'substrate'
    | 'material'
    | 'container'
    | 'consumable';
  quantity: number;
  unit: string;
}

export interface ExecutionStepProposal {
  stepId: string;
  sourceType: ExecutionSource;
  sourceReferenceId?: string;
  title: string;
  description: string;
  expectedDurationMinutes: number;
  scheduledStart?: string;
  scheduledEnd?: string;
  dependencies?: string[]; // other stepIds
  resources: ExecutionResourceUse[];
  safetyChecks: string[]; // named checks to run at SafetyGate
  telemetryWatch?: {
    contaminationRiskMax?: number;
    equipmentLoadMax?: number;
    laborUtilizationMax?: number;
    environmentLimits?: {
      temperatureMax?: number;
      temperatureMin?: number;
      humidityMax?: number;
      humidityMin?: number;
      co2Max?: number;
    };
  };
  rollbackSteps?: string[];
  requiresApproval: boolean;
  approved?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  status: ExecutionStepStatus;
}

export interface ExecutionPlan {
  planId: string;
  createdAt: string;
  steps: ExecutionStepProposal[];
  dependencies: Record<string, string[]>; // stepId -> dependencies
  resourceConflicts: string[];
  timingConflicts: string[];
  approvalRequired: string[]; // roles or user IDs
  status: 'draft' | 'pending-approval' | 'approved' | 'rejected' | 'in-progress' | 'paused' | 'completed' | 'failed';
  version: number;
  manualOverrides: string[];
}

// ============================================================================
// SAFETY GATE & MONITORING
// ============================================================================

export type SafetyDecision = 'allow' | 'warn' | 'block';

export interface SafetyGateResult {
  gateId: string;
  stepId: string;
  decision: SafetyDecision;
  rationale: string[];
  recommendedAlternatives: string[];
  checks: {
    telemetryDeviation?: boolean;
    contaminationSpike?: boolean;
    equipmentOverload?: boolean;
    laborMismatch?: boolean;
    environmentalLimit?: boolean;
    regressionDetected?: boolean;
    emergencyStop?: boolean;
  };
}

export interface ExecutionStatusReport {
  reportId: string;
  planId: string;
  timestamp: string;
  stepStatuses: {
    stepId: string;
    status: ExecutionStepStatus;
    lastUpdated: string;
    notes?: string;
  }[];
  telemetryDeviations: {
    metric: string;
    currentValue: number;
    baseline?: number;
    deviation?: number;
    severity: 'info' | 'warning' | 'critical';
  }[];
  actionsTaken: string[];
  pausedReason?: string;
}

// ============================================================================
// ROLLBACK
// ============================================================================

export interface RollbackPlan {
  rollbackId: string;
  planId: string;
  triggeredBy: string;
  reason: string;
  steps: {
    rollbackStepId: string;
    targetStepId: string;
    action: string;
    expectedDurationMinutes: number;
  }[];
  status: 'draft' | 'pending-approval' | 'approved' | 'executing' | 'completed' | 'failed';
  createdAt: string;
}

// ============================================================================
// EXECUTION LOG
// ============================================================================

export type ExecutionLogCategory =
  | 'ingest'
  | 'planning'
  | 'safety-gate'
  | 'monitor'
  | 'execution'
  | 'rollback'
  | 'approval'
  | 'alert'
  | 'export';

export interface ExecutionLogEntry {
  entryId: string;
  timestamp: string;
  category: ExecutionLogCategory;
  message: string;
  context: {
    planId?: string;
    stepId?: string;
    sourceType?: ExecutionSource;
    sourceId?: string;
    userId?: string;
    gateId?: string;
    reportId?: string;
    rollbackId?: string;
  };
  details?: unknown;
}

// ============================================================================
// INGEST INPUT
// ============================================================================

export interface ExecutionIngestInput {
  workflowPlan?: WorkflowPlan;
  strategyPlan?: StrategyPlan;
  allocationPlan?: AllocationPlan;
  simulationInsights?: string[];
  refinementFindings?: string[];
  facilityOrchestratorNotes?: string[];
  telemetryBaselines?: TelemetrySnapshot[];
}
