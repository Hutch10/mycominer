// Phase 29: Deterministic Yield & Throughput Modeling types
// Operational, non-biological forecasting primitives

export type ForecastSeverity = 'low' | 'medium' | 'high';

export interface RoomCapacityProfile {
  roomId: string;
  name: string;
  capacityUnits: number; // e.g., rack slots or trays
  turnoverDays: number;
  historicalUtilization?: number; // 0..1
}

export interface EquipmentAvailabilityProfile {
  equipmentId: string;
  name: string;
  availableHoursPerDay: number;
  cycleTimeHours: number;
  historicalAvailability?: number; // 0..1 uptime factor
}

export interface SubstrateInventoryProfile {
  substrateType: string;
  volumeUnits: number; // deterministic volume units (kg or bags)
  batchSizeUnits: number; // units consumed per batch
  historicalCompletionRate: number; // 0..1, non-biological completion success
}

export interface LaborAvailabilityProfile {
  role: string;
  hoursAvailablePerDay: number;
  hoursPerBatch: number;
}

export interface WorkflowTimingProfile {
  workflowId: string;
  name: string;
  durationDays: number;
  roomSequence: string[];
  equipmentNeeded: string[];
  historicalDelayFactor?: number; // additive fraction to duration (e.g., 0.1 = +10%)
}

export interface CapacitySnapshot {
  facilityId: string;
  timestamp: string;
  horizonDays: number;
  roomUtilization: Array<{
    roomId: string;
    utilizationPercent: number;
    availableCapacityUnits: number;
    constrainedBy: 'capacity' | 'turnover' | 'labor' | 'substrate' | 'equipment' | 'none';
  }>;
  equipmentAvailability: Array<{
    equipmentId: string;
    availableHours: number;
    cyclesPossible: number;
  }>;
  substrate: {
    totalVolumeUnits: number;
    batchesPossible: number;
  };
  labor: {
    role: string;
    hoursAvailable: number;
    batchesPossible: number;
  }[];
}

export interface ThroughputEstimate {
  facilityId: string;
  horizonDays: number;
  workflowId: string;
  workflowName: string;
  batchesMin: number;
  batchesMax: number;
  governingConstraint: 'room' | 'equipment' | 'labor' | 'substrate' | 'time';
  cycleTimeDays: number;
  explain: string;
}

export interface YieldRangeEstimate {
  facilityId: string;
  workflowId: string;
  workflowName: string;
  volumeMin: number; // volume units, not biological growth
  volumeMax: number;
  batchesMin: number;
  batchesMax: number;
  explain: string;
}

export interface BottleneckAnalysis {
  facilityId: string;
  timestamp: string;
  bottlenecks: Array<{
    type: 'room' | 'equipment' | 'labor' | 'substrate';
    id: string;
    severity: ForecastSeverity;
    detail: string;
  }>;
}

export interface ForecastingInsight {
  insightId: string;
  facilityId: string;
  timestamp: string;
  severity: ForecastSeverity;
  category: 'capacity' | 'throughput' | 'yield' | 'bottleneck' | 'report';
  summary: string;
  details: string;
  relatedIds?: string[];
}

export interface ForecastingReport {
  reportId: string;
  facilityId: string;
  timestamp: string;
  capacity: CapacitySnapshot;
  throughput: ThroughputEstimate[];
  yieldRanges: YieldRangeEstimate[];
  bottlenecks: BottleneckAnalysis;
  insights: ForecastingInsight[];
}

export type ForecastingLogCategory =
  | 'capacity-snapshot'
  | 'throughput-estimate'
  | 'yield-range'
  | 'bottleneck'
  | 'report'
  | 'approval'
  | 'rejection';

export interface ForecastingLogEntry {
  entryId: string;
  timestamp: string;
  category: ForecastingLogCategory;
  message: string;
  context?: {
    facilityId?: string;
    reportId?: string;
    workflowId?: string;
  };
  details?: unknown;
}
