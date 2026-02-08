'use client';

export type RoomId = string;
export type DeviceId = string;
export type TelemetrySourceId = string;

export interface RoomConfig {
  id: RoomId;
  name: string;
  species: string;
  stage: string;
  devices: DeviceId[];
  telemetrySources: TelemetrySourceId[];
  targets: Partial<{
    temperature: [number, number];
    humidity: [number, number];
    co2: [number, number];
    airflow: [number, number];
    light: [number, number];
  }>;
}

export interface RoomState {
  config: RoomConfig;
  active: boolean;
  lastUpdated: number;
  currentReading?: Partial<{
    temperature: number;
    humidity: number;
    co2: number;
    airflow: number;
    light: number;
  }>;
  alerts?: string[];
}

export interface FacilityState {
  rooms: RoomState[];
  sharedResources?: {
    hvac?: string;
    lightingBus?: string;
    co2Scrubbers?: DeviceId[];
  };
}

export type SafetyDecision = 'allow' | 'warn' | 'block';

export interface SafetyEvaluation {
  decision: SafetyDecision;
  rationale: string[];
  alternatives?: string[];
}

export interface FacilityLogEntry {
  id: string;
  timestamp: number;
  roomId?: RoomId;
  deviceId?: DeviceId;
  category: 'telemetry' | 'action' | 'safety' | 'optimization' | 'system';
  message: string;
  context?: Record<string, any>;
}

export interface OptimizationProposal {
  id: string;
  title: string;
  rationale: string;
  actions: Array<{
    roomId?: RoomId;
    description: string;
    expectedImpact: string;
  }>;
  requiresApproval: boolean;
}
