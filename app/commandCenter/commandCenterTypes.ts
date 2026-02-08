// Phase 24: Command Center Types
// Unified system overview - aggregates all phase outputs into operator-friendly snapshots

// ============================================================================
// SYSTEM HEALTH
// ============================================================================

export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface SystemHealthSnapshot {
  snapshotId: string;
  timestamp: string;
  overallStatus: HealthStatus;
  systemUptime: string;
  activeAlerts: number;
  criticalAlerts: number;
  totalFacilities: number;
  healthyFacilities: number;
  facilitiesAtRisk: number;
  globalKPIs: {
    totalEnergyUsageKwh: number;
    energyBudgetUtilization: number; // percentage
    totalYieldKg: number;
    averageContaminationRisk: number; // 0-100
    averageLoadPercent: number;
    pendingProposals: number;
    approvedProposals: number;
    executingTasks: number;
  };
  confidence: number; // 0-100
}

export interface FacilityHealthSnapshot {
  facilityId: string;
  facilityName: string;
  status: HealthStatus;
  loadPercent: number;
  contaminationRisk: number;
  energyUsageKwh: number;
  energyBudgetPercent: number;
  activeSpecies: string[];
  activeBatches: number;
  pendingTasks: number;
  alerts: string[];
  lastUpdate: string;
}

// ============================================================================
// ALERTS
// ============================================================================

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertCategory =
  | 'energy'
  | 'contamination'
  | 'equipment'
  | 'labor'
  | 'resource'
  | 'schedule'
  | 'execution'
  | 'system';

export interface Alert {
  alertId: string;
  timestamp: string;
  severity: AlertSeverity;
  category: AlertCategory;
  facilityId?: string;
  title: string;
  description: string;
  source: string; // which phase/engine generated this
  actionRequired: boolean;
  suggestedAction?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

// ============================================================================
// KPIS
// ============================================================================

export interface KPI {
  kpiId: string;
  name: string;
  category: 'energy' | 'yield' | 'contamination' | 'labor' | 'efficiency';
  currentValue: number;
  unit: string;
  target?: number;
  threshold?: {
    warning: number;
    critical: number;
  };
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  status: HealthStatus;
  lastUpdate: string;
}

// ============================================================================
// RECOMMENDED ACTIONS
// ============================================================================

export type ActionPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ActionSource =
  | 'strategy-engine'
  | 'workflow-engine'
  | 'resource-engine'
  | 'execution-engine'
  | 'optimization-engine'
  | 'multi-facility-engine'
  | 'command-center';

export interface RecommendedAction {
  actionId: string;
  timestamp: string;
  priority: ActionPriority;
  source: ActionSource;
  sourceProposalId?: string;
  title: string;
  description: string;
  rationale: string;
  affectedFacilities: string[];
  estimatedImpact: {
    yieldIncrease?: number;
    costSaving?: number;
    energyReduction?: number;
    riskReduction?: number;
  };
  implementationEffort: 'low' | 'medium' | 'high';
  requiresApproval: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  approvedBy?: string;
  approvedAt?: string;
}

// ============================================================================
// UPCOMING TASKS
// ============================================================================

export interface UpcomingTask {
  taskId: string;
  facilityId: string;
  title: string;
  description: string;
  scheduledStart: string;
  estimatedDurationHours: number;
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'ready' | 'in-progress' | 'blocked' | 'completed';
  dependencies: string[];
  resources: {
    laborHours: number;
    equipment: string[];
  };
  source: string; // workflow plan ID or execution plan ID
}

// ============================================================================
// COMMAND CENTER STATE
// ============================================================================

export interface CommandCenterState {
  stateId: string;
  generatedAt: string;
  systemHealth: SystemHealthSnapshot;
  facilityHealth: FacilityHealthSnapshot[];
  alerts: Alert[];
  kpis: KPI[];
  recommendedActions: RecommendedAction[];
  upcomingTasks: UpcomingTask[];
  aggregationSources: {
    strategyProposals: number;
    workflowPlans: number;
    resourceAllocations: number;
    executionPlans: number;
    optimizationProposals: number;
    multiFacilityInsights: number;
  };
  dataFreshness: {
    strategy: string;
    workflow: string;
    resources: string;
    execution: string;
    optimization: string;
    multiFacility: string;
  };
}

// ============================================================================
// COMMAND CENTER LOG
// ============================================================================

export type CommandCenterLogCategory =
  | 'aggregation'
  | 'alert-generated'
  | 'alert-acknowledged'
  | 'action-recommended'
  | 'action-approved'
  | 'action-rejected'
  | 'health-change'
  | 'kpi-threshold'
  | 'export';

export interface CommandCenterLogEntry {
  entryId: string;
  timestamp: string;
  category: CommandCenterLogCategory;
  message: string;
  context: {
    alertId?: string;
    actionId?: string;
    facilityId?: string;
    userId?: string;
  };
  details?: Record<string, unknown>;
}

// ============================================================================
// AGGREGATION INPUT
// ============================================================================

export interface CommandCenterIngestInput {
  // Phase 18: Strategy
  strategyProposals?: {
    proposalId: string;
    category: string;
    affectedFacilities: string[];
    confidence: number;
    status: string;
  }[];

  // Phase 19: Workflow
  workflowPlans?: {
    planId: string;
    facilityId: string;
    status: string;
    scheduledTasks: {
      taskId: string;
      title: string;
      scheduledStartTime: string;
      estimatedDurationMinutes: number;
      priority: string;
      status: string;
      dependencies: string[];
    }[];
  }[];

  // Phase 20: Resources
  resourceSnapshots?: {
    facilityId: string;
    timestamp: string;
    substrateLevels: { material: string; availableKg: number; criticalThresholdKg: number }[];
    equipmentStatus: { equipmentId: string; status: string }[];
  }[];

  // Phase 21: Execution
  executionStatus?: {
    facilityId: string;
    activeTasks: number;
    completedToday: number;
    failedToday: number;
    blockedTasks: number;
  }[];

  // Phase 22: Optimization
  optimizationProposals?: {
    proposalId: string;
    category: string;
    affectedFacilities: string[];
    expectedBenefit: {
      globalEnergyReduction?: number;
      globalYieldIncrease?: number;
      globalCostSaving?: number;
    };
    confidence: number;
    status: string;
  }[];

  // Phase 23: Multi-Facility
  multiFacilityState?: {
    facilities: { facilityId: string; name: string; energyBudgetKwh: number }[];
    loadSnapshots: { facilityId: string; currentLoadPercent: number }[];
    riskSnapshots: {
      facilityId: string;
      contaminationRiskScore: number;
      overallRisk: string;
    }[];
    globalInsights: { type: string; severity: string; affectedFacilities: string[] }[];
  };

  // Telemetry (from facility orchestrator)
  telemetry?: {
    facilityId: string;
    timestamp: string;
    energyKwh: number;
    temperature: number;
    humidity: number;
  }[];
}
