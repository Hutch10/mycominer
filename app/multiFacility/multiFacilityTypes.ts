// Phase 23: Multi-Facility Coordination Types
// Deterministic cross-facility aggregation, optimization, and resource coordination

// ============================================================================
// FACILITY PROFILE & SNAPSHOT
// ============================================================================

export interface FacilityProfile {
  facilityId: string;
  name: string;
  location: string;
  totalCapacityKg: number;
  energyBudgetKwh: number;
  laborHoursAvailable: number;
  rooms: {
    roomId: string;
    volumeM3: number;
    species?: string;
    capacity: number;
  }[];
  equipmentIds: string[];
  sharedResourcesWithFacilities?: string[];
}

export interface FacilityLoadSnapshot {
  facilityId: string;
  timestamp: string;
  currentLoadPercent: number;
  peakEnergyKwh: number;
  activeSpecies: string[];
  roomUtilization: {
    roomId: string;
    utilizationPercent: number;
    currentBatch?: string;
  }[];
  contention Level: 'low' | 'medium' | 'high';
}

export interface FacilityRiskSnapshot {
  facilityId: string;
  timestamp: string;
  contamination RiskScore: number; // 0-100
  equipmentFailureRisk: number; // 0-100
  laborShortageRisk: number; // 0-100
  energyBudgetRisk: number; // 0-100
  overallRisk: 'low' | 'medium' | 'high';
}

export interface FacilityResourceSnapshot {
  facilityId: string;
  timestamp: string;
  substrateMaterials: {
    material: string;
    availableKg: number;
    allocatedKg: number;
    criticalThresholdKg: number;
  }[];
  availableCapacity: number;
  equipmentAvailability: {
    equipmentId: string;
    isAvailable: boolean;
    hoursUntilFree: number;
  }[];
}

// ============================================================================
// MULTI-FACILITY INSIGHTS
// ============================================================================

export interface MultiFacilityInsight {
  insightId: string;
  createdAt: string;
  type: 'underutilized' | 'overloaded' | 'imbalance' | 'bottleneck' | 'opportunity';
  affectedFacilities: string[];
  description: string;
  rationale: string;
  severity: 'info' | 'warning' | 'critical';
  confidence: number; // 0-100
  recommendedAction?: string;
}

// ============================================================================
// SHARED RESOURCE COORDINATION
// ============================================================================

export interface SharedResourcePlan {
  planId: string;
  createdAt: string;
  resourceType: 'substrate' | 'equipment' | 'energy' | 'labor' | 'cold-storage' | 'sterilization-capacity';
  currentStatus: 'available' | 'constrained' | 'critical';
  facilities: {
    facilityId: string;
    currentAllocation: number;
    requestedAllocation: number;
    priority: 'critical' | 'high' | 'normal' | 'low';
  }[];
  proposedRebalancing: {
    fromFacilityId: string;
    toFacilityId: string;
    quantity: number;
    unit: string;
    rationale: string;
    implementationHours: number;
  }[];
  estimatedImpact: {
    facilityId: string;
    yieldIncrease?: number;
    costReduction?: number;
    energySaving?: number;
  }[];
  status: 'draft' | 'audited' | 'approved' | 'rejected' | 'implemented';
  approvedBy?: string;
  approvedAt?: string;
  version: number;
}

// ============================================================================
// GLOBAL OPTIMIZATION PROPOSAL
// ============================================================================

export type GlobalOptimizationCategory =
  | 'cross-facility-energy-optimization'
  | 'yield-balancing'
  | 'contamination-risk-mitigation'
  | 'schedule-coordination'
  | 'shared-resource-optimization'
  | 'labor-reallocation'
  | 'facility-specialization';

export interface GlobalOptimizationProposal {
  proposalId: string;
  category: GlobalOptimizationCategory;
  title: string;
  description: string;
  affectedFacilities: string[];
  rationale: string;
  expectedBenefit: {
    globalEnergyReduction?: number; // kWh
    globalYieldIncrease?: number; // kg
    globalCostSaving?: number; // dollars
    contaminationRiskReduction?: number; // 0-100 score
    laborReduction?: number; // hours
  };
  implementation: {
    steps: string[];
    affectedFacilities: {
      facilityId: string;
      localSteps: string[];
      estimatedHours: number;
    }[];
    totalImplementationHours: number;
    complexity: 'simple' | 'moderate' | 'complex';
  };
  risks: {
    facilityId: string;
    risk: string;
    mitigationStrategy: string;
  }[];
  rollbackCapability: {
    feasible: boolean;
    estimatedHours: number;
    steps: string[];
  };
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number; // 0-100
  status: 'draft' | 'audited' | 'approved' | 'rejected' | 'implemented' | 'rolled-back';
  approvedBy?: string;
  approvedAt?: string;
  implementedAt?: string;
}

// ============================================================================
// MULTI-FACILITY AUDIT
// ============================================================================

export type MultiFacilityAuditDecision = 'allow' | 'warn' | 'block';

export interface MultiFacilityAuditResult {
  auditId: string;
  proposalId: string;
  timestamp: string;
  decision: MultiFacilityAuditDecision;
  checks: {
    allFacilitiesWIthinBudget: boolean;
    noContaminationSpread: boolean;
    laborAvailabilityRespected: boolean;
    equipmentConstraintsRespected: boolean;
    regressionDetected: boolean;
    rollbackFeasible: boolean;
  };
  perFacilityRisks: {
    facilityId: string;
    riskScore: number;
    rationale: string[];
  }[];
  globalRisks: string[];
  recommendations: string[];
}

// ============================================================================
// MULTI-FACILITY LOG ENTRY
// ============================================================================

export type MultiFacilityLogCategory =
  | 'aggregation'
  | 'insight'
  | 'shared-resource-plan'
  | 'global-proposal'
  | 'audit'
  | 'approval'
  | 'rejection'
  | 'implementation'
  | 'rollback'
  | 'export';

export interface MultiFacilityLogEntry {
  entryId: string;
  timestamp: string;
  category: MultiFacilityLogCategory;
  message: string;
  context: {
    proposalId?: string;
    planId?: string;
    auditId?: string;
    affectedFacilities?: string[];
    userId?: string;
  };
  details?: Record<string, unknown>;
}

// ============================================================================
// INGEST & STATE
// ============================================================================

export interface MultiFacilityIngestInput {
  facilities: FacilityProfile[];
  facilityLoadSnapshots: FacilityLoadSnapshot[];
  facilityRiskSnapshots: FacilityRiskSnapshot[];
  facilityResourceSnapshots: FacilityResourceSnapshot[];
  executionHistories?: {
    facilityId: string;
    completedTasksCount: number;
    totalYieldKg: number;
    energyUsedKwh: number;
  }[];
  optimizationOutputs?: {
    facilityId: string;
    proposalCount: number;
    averageConfidence: number;
  }[];
  telemetrySummaries?: {
    facilityId: string;
    avgTemperature: number;
    avgHumidity: number;
    avgEnergyKwh: number;
  }[];
}

export interface MultiFacilityState {
  stateId: string;
  createdAt: string;
  facilities: FacilityProfile[];
  loadSnapshots: FacilityLoadSnapshot[];
  riskSnapshots: FacilityRiskSnapshot[];
  resourceSnapshots: FacilityResourceSnapshot[];
  globalInsights: MultiFacilityInsight[];
  sharedResourcePlans: SharedResourcePlan[];
  globalOptimizationProposals: GlobalOptimizationProposal[];
  auditResults: MultiFacilityAuditResult[];
  globalLoad: number; // aggregate percent
  globalRisk: 'low' | 'medium' | 'high';
  overallConfidence: number; // 0-100
}
