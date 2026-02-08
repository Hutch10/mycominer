// Phase 22: Optimization Types
// Deterministic optimization proposals for energy, resources, and load balancing

import { ExecutionPlan } from '@/app/execution/executionTypes';
import { WorkflowPlan } from '@/app/workflow/workflowTypes';
import { AllocationPlan } from '@/app/resource/resourceTypes';
import { StrategyPlan } from '@/app/strategy/engine/strategyTypes';

// ============================================================================
// ENERGY MODEL TYPES
// ============================================================================

export interface DeviceEnergyProfile {
  deviceId: string;
  name: string;
  category: 'hvac' | 'lighting' | 'sterilization' | 'incubation' | 'monitoring' | 'pump' | 'fan';
  location: string;
  baselineWatts: number; // when idle
  peakWatts: number; // when active
  duty: number; // 0-1 typical duty cycle
  hoursPerDay: number;
  estimatedDailyKwh: number;
}

export interface EnergyForecast {
  forecastId: string;
  timestamp: string;
  days: number;
  hourlyPrediction: {
    hour: number;
    forecastKwh: number;
    baseline: number;
    peak: number;
    confidence: number; // 0-100
  }[];
  dailyTotals: {
    date: string;
    forecastKwh: number;
    variance: number;
  }[];
  peakHour: number;
  peakKwh: number;
  avgDailyKwh: number;
  weeklyProjectionKwh: number;
}

export interface EnergyInefficiency {
  inefficiencyId: string;
  type: 'over-cooling' | 'over-humidification' | 'hvac-cycling' | 'light-waste' | 'idle-draw' | 'inefficient-sterilization';
  deviceId: string;
  location: string;
  detectedAt: string;
  currentKwh: number;
  baselineKwh: number;
  wasteKwh: number;
  percentageWaste: number;
  durationDays?: number;
  severity: 'low' | 'medium' | 'high';
  confidence: number; // 0-100
}

export interface EnergyOptimizationReport {
  reportId: string;
  createdAt: string;
  period: string; // "last-7-days", "last-30-days"
  totalEnergyKwh: number;
  baselineKwh: number;
  inefficiencies: EnergyInefficiency[];
  totalWasteKwh: number;
  estimatedCostSavingsDollars: number;
  potentialKwhReduction: number;
  topOpportunities: string[];
  confidence: number; // 0-100
}

// ============================================================================
// RESOURCE OPTIMIZATION TYPES
// ============================================================================

export interface SubstrateConsumption {
  material: string;
  periodDays: number;
  consumedKg: number;
  forecastedKg: number;
  variance: number; // kg over/under
  efficiency: number; // yield per kg
  wasteIndicators: string[];
}

export interface EquipmentUtilization {
  equipmentId: string;
  name: string;
  category: string;
  utilizationPercent: number;
  hoursAvailable: number;
  hoursUsed: number;
  potentialCapacity: number;
  underutilizationReason?: string;
}

export interface ResourceOptimizationReport {
  reportId: string;
  createdAt: string;
  substrateMaterials: SubstrateConsumption[];
  equipmentUtilization: EquipmentUtilization[];
  detectedWaste: {
    category: string;
    quantity: number;
    unit: string;
    estimatedCost: number;
    reason: string;
  }[];
  totalWasteCost: number;
  bottlenecks: {
    resource: string;
    impact: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  confidence: number; // 0-100
}

// ============================================================================
// LOAD BALANCING TYPES
// ============================================================================

export interface RoomLoad {
  roomId: string;
  facilityId?: string;
  peakEnergyKwh: number;
  avgEnergyKwh: number;
  speciesCount: number;
  taskCount: number;
  contentionLevel: 'low' | 'medium' | 'high';
}

export interface LoadShift {
  shiftId: string;
  stepId?: string; // execution step
  taskId?: string; // workflow task
  fromRoom: string;
  toRoom: string;
  expectedEnergyReduction: number; // Kwh
  expectedLabor: number; // hours to move
  riskLevel: 'low' | 'medium' | 'high';
  rationale: string;
}

export interface LoadBalancingPlan {
  planId: string;
  createdAt: string;
  shifts: LoadShift[];
  peakReductionKwh: number;
  rebalancedRooms: {
    roomId: string;
    newPeakKwh: number;
    prevPeakKwh: number;
    reduction: number;
  }[];
  staggeredSchedules: {
    resource: string; // "hvac-cycles", "lighting", "sterilization"
    originalStartTime: string;
    newStartTime: string;
    reasonDescription: string;
  }[];
  totalImplementationHours: number;
  confidence: number; // 0-100
}

// ============================================================================
// OPTIMIZATION PROPOSAL
// ============================================================================

export type OptimizationCategory =
  | 'energy-efficiency'
  | 'substrate-optimization'
  | 'equipment-utilization'
  | 'load-balancing'
  | 'labor-alignment'
  | 'contamination-risk-reduction'
  | 'waste-reduction';

export interface OptimizationProposal {
  proposalId: string;
  category: OptimizationCategory;
  title: string;
  description: string;
  source: 'energy-analysis' | 'resource-analysis' | 'load-analysis' | 'pattern-detection';
  rationale: string;
  expectedBenefit: {
    kwhReduction?: number;
    costSavings?: number;
    yieldIncrease?: number;
    laborHours?: number;
    wasteReduction?: number;
  };
  implementation: {
    steps: string[];
    estimatedHours: number;
    complexity: 'simple' | 'moderate' | 'complex';
  };
  riskLevel: 'low' | 'medium' | 'high';
  conflictsWith?: string[];
  dependsOn?: string[];
  confidence: number; // 0-100
  status: 'draft' | 'audited' | 'approved' | 'rejected' | 'implemented' | 'rolled-back';
  approvedBy?: string;
  approvedAt?: string;
}

// ============================================================================
// OPTIMIZATION AUDIT
// ============================================================================

export type AuditDecision = 'allow' | 'warn' | 'block';

export interface OptimizationAuditResult {
  auditId: string;
  proposalId: string;
  timestamp: string;
  decision: AuditDecision;
  checks: {
    energyBudgetRespected: boolean;
    contaminationRiskAcceptable: boolean;
    environmentalLimitsRespected: boolean;
    equipmentConstraintsRespected: boolean;
    regressionDetected: boolean;
    rollbackFeasible: boolean;
  };
  rationale: string[];
  recommendations: string[];
  estimatedImpact: {
    energySaving: number;
    costImpact: number;
    yieldImpact: number;
    riskIncrease: number;
  };
}

// ============================================================================
// OPTIMIZATION LOG ENTRY
// ============================================================================

export type OptimizationLogCategory =
  | 'energy-analysis'
  | 'resource-analysis'
  | 'load-analysis'
  | 'proposal'
  | 'audit'
  | 'approval'
  | 'rejection'
  | 'implementation'
  | 'rollback'
  | 'export';

export interface OptimizationLogEntry {
  entryId: string;
  timestamp: string;
  category: OptimizationLogCategory;
  message: string;
  context: {
    proposalId?: string;
    reportId?: string;
    auditId?: string;
    userId?: string;
    facilityId?: string;
  };
  details?: Record<string, unknown>;
}

// ============================================================================
// INGEST INPUT
// ============================================================================

export interface OptimizationIngestInput {
  executionPlan?: ExecutionPlan;
  workflowPlan?: WorkflowPlan;
  allocationPlan?: AllocationPlan;
  strategyPlan?: StrategyPlan;
  simulationOutputs?: string[];
  facilityConfig?: {
    facilitiyId: string;
    rooms: { roomId: string; volumeM3: number; devices: string[] }[];
    energyBudgetKwh?: number;
  };
  telemetryData?: {
    period: string;
    roomId: string;
    avgEnergyKwh: number;
    peakEnergyKwh: number;
    avgTemperature: number;
    avgHumidity: number;
  }[];
}
