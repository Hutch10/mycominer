// Phase 30: Environmental & Operational "What If?" Sandbox types
// Deterministic, non-biological scenario modeling

import { ForecastingReport } from '../forecasting/forecastingTypes';

export type SandboxSeverity = 'low' | 'medium' | 'high';

export interface SandboxEnvironmentConfig {
  targetTempC?: number;
  targetHumidityPercent?: number;
  faeSchedulePerDay?: number; // air exchanges per day
  energyBias?: number; // deterministic modifier 0.5..1.5
}

export interface SandboxScheduleConfig {
  startOffsetDays?: number;
  batchStaggerMinutes?: number;
  shiftWindowHours?: number;
}

export interface SandboxResourceConfig {
  laborHoursDelta?: number;
  equipmentWindowDeltaHours?: number;
}

export interface SandboxRoomAssignment {
  fromRoomId: string;
  toRoomId: string;
}

export interface SandboxParameterSet {
  environment?: SandboxEnvironmentConfig;
  schedule?: SandboxScheduleConfig;
  resources?: SandboxResourceConfig;
  roomAssignments?: SandboxRoomAssignment[];
}

export interface SandboxScenario {
  scenarioId: string;
  name: string;
  description?: string;
  baselineId?: string;
  parameters: SandboxParameterSet;
  status: 'draft' | 'ready' | 'rejected';
  createdAt: string;
}

export interface SandboxResult {
  scenarioId: string;
  label: 'sandbox';
  forecast: ForecastingReport;
  energyEstimateKwh: number;
  laborHoursEstimate: number;
}

export interface SandboxComparisonDelta<T> {
  before: T;
  after: T;
  delta: number;
  trend: 'better' | 'worse' | 'mixed' | 'neutral';
}

export interface SandboxComparison {
  scenarioId: string;
  baselineId: string;
  capacityDelta: SandboxComparisonDelta<number>;
  throughputDelta: SandboxComparisonDelta<number>;
  yieldDelta: SandboxComparisonDelta<number>;
  energyDelta: SandboxComparisonDelta<number>;
  laborDelta: SandboxComparisonDelta<number>;
  roomUtilizationDelta: Array<{
    roomId: string;
    before: number;
    after: number;
    delta: number;
    trend: 'better' | 'worse' | 'mixed' | 'neutral';
  }>;
}

export interface SandboxInsight {
  insightId: string;
  scenarioId: string;
  severity: SandboxSeverity;
  summary: string;
  detail: string;
  rationale: string;
  whenUseful: string;
  risks: string;
}

export type SandboxLogCategory =
  | 'scenario'
  | 'run'
  | 'comparison'
  | 'insight'
  | 'approval'
  | 'rejection'
  | 'promotion';

export interface SandboxLogEntry {
  entryId: string;
  timestamp: string;
  category: SandboxLogCategory;
  message: string;
  context?: {
    scenarioId?: string;
    baselineId?: string;
  };
  details?: unknown;
}
