// Phase 26: Research & Experimentation Types
// Deterministic research engine for experiments, comparisons, and insights

// ============================================================================
// EXPERIMENT VARIABLES & CONDITIONS
// ============================================================================

export type VariableType =
  | 'substrate-composition'
  | 'temperature'
  | 'humidity'
  | 'co2-level'
  | 'light-schedule'
  | 'inoculation-rate'
  | 'sterilization-method'
  | 'colonization-duration'
  | 'fruiting-trigger'
  | 'harvest-timing';

export interface ExperimentVariable {
  variableId: string;
  variableType: VariableType;
  name: string;
  description: string;
  controlValue: string | number;
  experimentalValue: string | number;
  unit?: string;
  rationale: string;
  expectedDelta?: string; // Non-predictive: "may increase/decrease/stay same"
  safetyRange?: {
    min: number;
    max: number;
  };
}

export interface ExperimentalCondition {
  conditionId: string;
  variableId: string;
  value: string | number;
  isControl: boolean;
  facilityId?: string;
  roomId?: string;
  batchId?: string;
}

// ============================================================================
// EXPERIMENT GROUPS
// ============================================================================

export interface ControlGroup {
  groupId: string;
  name: string;
  description: string;
  conditions: ExperimentalCondition[];
  facilityId: string;
  roomId?: string;
  species: string;
  substrateRecipe: string;
  expectedDurationDays: number;
  resourceRequirements: {
    substrateKg: number;
    laborHours: number;
    energyKwh: number;
    equipmentIds: string[];
  };
}

export interface ExperimentalGroup {
  groupId: string;
  name: string;
  description: string;
  conditions: ExperimentalCondition[];
  variablesChanged: string[]; // variableIds
  facilityId: string;
  roomId?: string;
  species: string;
  substrateRecipe: string;
  expectedDurationDays: number;
  resourceRequirements: {
    substrateKg: number;
    laborHours: number;
    energyKwh: number;
    equipmentIds: string[];
  };
}

// ============================================================================
// EXPERIMENT PROPOSAL
// ============================================================================

export type ExperimentStatus =
  | 'draft'
  | 'pending-approval'
  | 'approved'
  | 'rejected'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export interface ExperimentProposal {
  experimentId: string;
  createdAt: string;
  updatedAt: string;
  hypothesis: string;
  objective: string;
  species: string;
  facilityId: string;
  durationDays: number;
  controlGroup: ControlGroup;
  experimentalGroups: ExperimentalGroup[];
  variables: ExperimentVariable[];
  status: ExperimentStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  safetyChecks: {
    checkType: string;
    passed: boolean;
    details?: string;
  }[];
  rollbackFeasibility: {
    canRollback: boolean;
    rollbackSteps: string[];
    rollbackRisks: string[];
  };
  estimatedCost: {
    substrateCost: number;
    laborCost: number;
    energyCost: number;
    totalCost: number;
  };
  dataCollectionPlan: {
    metrics: string[];
    frequency: string;
    responsibleParty: string;
  };
}

// ============================================================================
// COMPARISON RESULTS
// ============================================================================

export type ComparisonMetric =
  | 'yield-kg'
  | 'contamination-rate'
  | 'colonization-days'
  | 'fruiting-days'
  | 'energy-kwh'
  | 'labor-hours'
  | 'substrate-efficiency'
  | 'cost-per-kg';

export interface ComparisonResult {
  comparisonId: string;
  experimentId: string;
  createdAt: string;
  controlGroupId: string;
  experimentalGroupId: string;
  metric: ComparisonMetric;
  controlValue: number;
  experimentalValue: number;
  delta: number; // absolute difference
  deltaPercent: number; // percentage change
  unit: string;
  direction: 'increase' | 'decrease' | 'no-change';
  significance: 'high' | 'medium' | 'low' | 'negligible';
  notes?: string;
  dataPoints: {
    controlDataPoints: number[];
    experimentalDataPoints: number[];
  };
  statistics: {
    controlMean: number;
    controlStdDev: number;
    experimentalMean: number;
    experimentalStdDev: number;
    sampleSize: number;
  };
}

// ============================================================================
// RESEARCH INSIGHTS
// ============================================================================

export type InsightType =
  | 'variable-impact'
  | 'cross-facility-pattern'
  | 'historical-trend'
  | 'anomaly-detection'
  | 'optimization-opportunity'
  | 'next-experiment';

export type InsightSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ResearchInsight {
  insightId: string;
  timestamp: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  summary: string;
  evidence: string[];
  whyThisMatters: string;
  suggestedNextSteps: string[];
}

// ============================================================================
// RESEARCH REPORT
// ============================================================================

export interface ResearchReport {
  reportId: string;
  generatedAt: string;
  coveringPeriod: {
    start: string;
    end: string;
  };
  experiments: string[];
  methodology: {
    experimentCount: number;
    totalComparisons: number;
    insightsGenerated: number;
    approach: string;
  };
  results: {
    significantFindings: Array<{
      metric: string;
      delta: string;
      direction: string;
      significance: string;
    }>;
    positiveChanges: number;
    negativeChanges: number;
    noChanges: number;
    averageDeltaPercent: number;
  };
  insights: {
    high: ResearchInsight[];
    medium: ResearchInsight[];
    low: ResearchInsight[];
  };
  conclusions: string[];
  recommendations: string[];
  nextExperiments: string[];
}

// ============================================================================
// RESEARCH LOG
// ============================================================================

export type ResearchLogCategory =
  | 'experiment-designed'
  | 'approved'
  | 'rejected'
  | 'started'
  | 'completed'
  | 'comparison-generated'
  | 'insight-generated'
  | 'report-generated'
  | 'export';

export interface ResearchLogEntry {
  entryId: string;
  timestamp: string;
  category: ResearchLogCategory;
  message: string;
  context: {
    experimentId?: string;
    comparisonId?: string;
    insightId?: string;
    reportId?: string;
    userId?: string;
    facilityId?: string;
  };
  details?: unknown;
}

// ============================================================================
// HISTORICAL DATA QUERY
// ============================================================================

export interface HistoricalDataQuery {
  species?: string;
  facilityIds?: string[];
  dateRange: {
    start: string;
    end: string;
  };
  substrates?: string[];
  metrics: ComparisonMetric[];
  minSampleSize?: number;
}

export interface HistoricalDataPoint {
  dataPointId: string;
  timestamp: string;
  facilityId: string;
  roomId?: string;
  batchId: string;
  species: string;
  substrate: string;
  metrics: {
    metric: ComparisonMetric;
    value: number;
    unit: string;
  }[];
  conditions: {
    temperature?: number;
    humidity?: number;
    co2?: number;
  };
}

// ============================================================================
// RESEARCH ENGINE INPUT
// ============================================================================

export interface ResearchEngineInput {
  // From existing engines
  commandCenterState?: unknown; // Phase 24
  optimizationProposals?: unknown[]; // Phase 22
  executionPlans?: unknown[]; // Phase 21
  resourceSnapshots?: unknown[]; // Phase 20
  workflowPlans?: unknown[]; // Phase 19
  strategyPlans?: unknown[]; // Phase 18
  multiFacilityState?: unknown; // Phase 23
  
  // Research-specific
  historicalData?: HistoricalDataPoint[];
  activeExperiments?: ExperimentProposal[];
}
