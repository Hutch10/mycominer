'use client';

// ========================================
// STRATEGY PROPOSAL TYPES
// ========================================

export type OptimizationType = 'energy' | 'yield' | 'contamination-mitigation' | 'scheduling' | 'resource-allocation' | 'multi-facility-coordination';

export type ProposalSource = 'telemetry-analysis' | 'simulation-insight' | 'facility-pattern' | 'cloud-pattern' | 'global-insight' | 'refinement-derived';

export interface StrategyProposal {
  id: string;
  type: OptimizationType;
  title: string;
  description: string;
  source: ProposalSource;
  rationale: string;
  expectedBenefit: string;
  affectedSystems: string[];
  confidenceScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  implementationSteps: string[];
  estimatedCost?: string; // e.g., "minimal", "$500", "2 hours labor"
  status: 'draft' | 'audited' | 'simulated' | 'approved' | 'rejected' | 'implemented' | 'rolled-back';
  sourceInsights?: string[]; // reference IDs from other phases
}

// ========================================
// STRATEGY PLAN TYPES
// ========================================

export interface StrategyPlan {
  id: string;
  name: string;
  description: string;
  proposals: StrategyProposal[];
  priorityOrder: string[]; // proposal IDs in priority order
  impactSummary: {
    estimatedEnergyReduction?: number; // percent
    estimatedYieldIncrease?: number; // percent
    contaminationRiskReduction?: number; // percent
    resourcesRequired?: string[];
  };
  tradeoffs: string[]; // documented tradeoffs
  overallConfidence: number; // 0-100
  approvalsRequired: string[]; // role names
  status: 'draft' | 'ready' | 'approved' | 'rejected' | 'in-progress' | 'completed';
  approvalNotes?: string;
}

// ========================================
// AUDIT TYPES
// ========================================

export type AuditDecision = 'allow' | 'warn' | 'block';

export interface StrategyAudit {
  id: string;
  proposalId: string;
  decision: AuditDecision;
  rationale: string[];
  constraintViolations: string[];
  environmentalChecks: {
    speciesLimitCompliant: boolean;
    contaminationRiskAcceptable: boolean;
    energyBudgetRespected: boolean;
    schedulingConflicts: string[];
  };
  recommendations: string[];
  regressionDetected: boolean;
  rollbackPlan?: string;
}

// ========================================
// SIMULATION TYPES
// ========================================

export interface StrategySimulationConfig {
  proposalId: string;
  duration: number; // minutes
  includeAllAffectedRooms: boolean;
  baseline: 'current' | 'proposed';
}

export interface StrategyImpactReport {
  id: string;
  proposalId: string;
  duration: number;
  projectedEnergyUsage: number; // kWh
  projectedYield?: number; // arbitrary units
  contaminationRiskScore: number; // 0-100
  environmentalStability: 'stable' | 'oscillating' | 'unstable';
  findings: string[];
  warnings: string[];
  positiveOutcomes: string[];
  sideEffects: string[];
  summary: string;
}

// ========================================
// APPROVAL TYPES
// ========================================

export interface StrategyApproval {
  id: string;
  entityId: string; // proposal or plan ID
  entityType: 'proposal' | 'plan';
  approver: string;
  decision: 'approved' | 'rejected';
  notes: string;
  timestamp: number;
  conditions?: string[];
}

// ========================================
// LOG TYPES
// ========================================

export interface StrategyLogEntry {
  id: string;
  timestamp: number;
  category: 'proposal' | 'audit' | 'simulation' | 'approval' | 'plan' | 'implementation' | 'rollback';
  message: string;
  context?: Record<string, any>;
}

// ========================================
// STRATEGY ENGINE INPUT TYPES
// ========================================

export interface TelemetrySummary {
  roomId: string;
  avgTemperature: number;
  avgHumidity: number;
  avgCO2: number;
  energyUsageWh: number;
  deviationCount: number;
  instabilityEvents: string[];
}

export interface FacilityData {
  facilityId: string;
  roomConfigurations: {
    roomId: string;
    volume: number;
    species?: string;
    stage?: string;
    devices: { type: string; status: string }[];
  }[];
  energyBudget?: number; // kWh
  harvestTargets?: Record<string, number>;
}

export interface CloudPattern {
  pattern: string;
  frequency: string;
  relatedFacilities: string[];
  successRate: number;
  applicability: number; // 0-100 for this facility
}

export interface GlobalInsight {
  id: string;
  type: string;
  title: string;
  applicability: number; // 0-100
  source: string;
}
