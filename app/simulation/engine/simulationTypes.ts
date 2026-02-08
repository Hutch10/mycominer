'use client';

// ========================================
// DIGITAL TWIN TYPES
// ========================================

export type SimulationMode = 'snapshot' | 'time-series' | 'stress-test' | 'optimization';

export interface DigitalRoom {
  id: string;
  name: string;
  species?: string;
  stage?: string;
  volume: number; // cubic meters
  devices: VirtualDevice[];
  substrate?: VirtualSubstrate;
  environmentalState: EnvironmentalState;
}

export interface VirtualDevice {
  id: string;
  type: 'heater' | 'humidifier' | 'fan' | 'scrubber' | 'light' | 'sensor';
  status: 'on' | 'off' | 'standby';
  powerWatts: number;
  effectRate: number; // effect per cycle (e.g., temp change per minute)
}

export interface VirtualSubstrate {
  type: string;
  massKg: number;
  moisturePercent: number;
  co2ProductionRate: number; // ppm per hour
  heatProductionRate: number; // watts
}

export interface EnvironmentalState {
  temperatureC: number;
  humidityPercent: number;
  co2Ppm: number;
  airflowCFM: number;
  lightLux: number;
  timestamp: number;
}

// ========================================
// ENVIRONMENTAL MODEL TYPES
// ========================================

export interface EnvironmentalDynamics {
  temperatureDrift: number; // C per hour
  humidityDrift: number; // % per hour
  co2Drift: number; // ppm per hour
  ambientTemp: number;
  ambientHumidity: number;
  ambientCO2: number;
}

export interface EnvironmentalCurve {
  roomId: string;
  startTime: number;
  endTime: number;
  dataPoints: EnvironmentalState[];
  stability: 'stable' | 'oscillating' | 'drifting';
  deviations: string[];
}

export interface DeviceEffect {
  deviceId: string;
  deviceType: VirtualDevice['type'];
  parameterAffected: keyof EnvironmentalState;
  magnitude: number;
  energyCost: number; // watts
}

// ========================================
// CONTAMINATION MODEL TYPES
// ========================================

export interface ContaminationRiskFactors {
  highHumidityZones: string[]; // room IDs
  poorAirflowZones: string[];
  sporeLoadEstimate: number; // relative 0-100
  stagnantAirVectors: string[];
  temperatureFluctuations: number; // degrees C variance
}

export interface ContaminationRiskMap {
  roomId: string;
  overallRisk: 'low' | 'medium' | 'high';
  score: number; // 0-100
  factors: ContaminationRiskFactors;
  recommendations: string[];
  rationale: string[];
}

// ========================================
// LOOP SIMULATION TYPES
// ========================================

export interface LoopSimulationConfig {
  roomId: string;
  duration: number; // minutes
  controlStrategy: 'pid' | 'bang-bang' | 'adaptive';
  targetEnvironment: EnvironmentalState;
  tolerances: {
    temperature: number;
    humidity: number;
    co2: number;
  };
}

export interface LoopStabilityReport {
  id: string;
  roomId: string;
  duration: number;
  stability: 'stable' | 'oscillating' | 'unstable';
  averageDeviation: number;
  maxDeviation: number;
  cycleCount: number; // number of device on/off cycles
  energyUsageKwh: number;
  recommendations: string[];
  oscillationFrequency?: number; // cycles per hour
}

// ========================================
// SIMULATION SCENARIO TYPES
// ========================================

export type ScenarioType = 'baseline' | 'what-if' | 'optimization' | 'contamination-scenario';

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  type: ScenarioType;
  mode: SimulationMode;
  rooms: DigitalRoom[];
  duration: number; // minutes
  parameters: Record<string, any>;
}

export interface SimulationReport {
  id: string;
  scenarioId: string;
  scenarioName: string;
  timestamp: number;
  duration: number;
  rooms: string[]; // room IDs
  environmentalCurves: EnvironmentalCurve[];
  contaminationRisks: ContaminationRiskMap[];
  loopStability: LoopStabilityReport[];
  energyUsageKwh: number;
  summary: string;
  warnings: string[];
  recommendations: string[];
}

// ========================================
// SIMULATION LOG TYPES
// ========================================

export interface SimulationLogEntry {
  id: string;
  timestamp: number;
  category: 'simulation' | 'twin-generation' | 'environmental' | 'contamination' | 'loop' | 'export';
  message: string;
  context?: Record<string, any>;
}

// ========================================
// DIGITAL TWIN SNAPSHOT TYPES
// ========================================

export interface DigitalTwinSnapshot {
  id: string;
  facilityId: string;
  facilityName: string;
  rooms: DigitalRoom[];
  timestamp: number;
  mode: SimulationMode;
  metadata: {
    totalRooms: number;
    totalDevices: number;
    species: string[];
    stages: string[];
  };
}
