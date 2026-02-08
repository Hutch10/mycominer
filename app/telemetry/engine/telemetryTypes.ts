/**
 * Telemetry Type Definitions
 * Real-time environmental data structures and interfaces
 */

export type SensorType = 'temperature' | 'humidity' | 'co2' | 'airflow' | 'light' | 'pressure';

export type AdapterType = 'bluetooth' | 'serial' | 'usb' | 'websocket' | 'mock';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface EnvironmentalReading {
  timestamp: number;
  temperature?: number; // Celsius
  humidity?: number; // Percent
  co2?: number; // PPM
  airflow?: number; // CFM or m³/h
  light?: number; // Lux
  pressure?: number; // Pa
}

export interface SensorConfig {
  id: string;
  name: string;
  type: AdapterType;
  enabled: boolean;
  readingIntervalMs: number;
  calibrationOffset?: Partial<EnvironmentalReading>;
  schema?: Record<string, any>;
}

export interface SensorReading extends EnvironmentalReading {
  sensorId: string;
  rawValue?: any;
}

export interface SmoothedReading extends EnvironmentalReading {
  _temperatureSmoothed?: number;
  _humiditySmoothed?: number;
  _co2Smoothed?: number;
  _airflowSmoothed?: number;
  _lightSmoothed?: number;
  sensorId?: string;
}

export interface AnomalyDetection {
  field: string;
  value: number;
  baseline: number;
  deviation: number; // Standard deviations
  isAnomaly: boolean;
  confidence: number; // 0-1
}

export interface EnvironmentalAlert {
  id: string;
  timestamp: number;
  sensorId: string;
  field: string;
  severity: AlertSeverity;
  message: string;
  cause: string;
  recommendedAction: string;
  relatedPageHref?: string;
  dismissable: boolean;
  dismissed: boolean;
}

export interface TelemetryContext {
  species?: string;
  stage?: string; // colonization, fruiting, harvesting
  environmentalTarget?: Partial<EnvironmentalReading>;
}

export interface TelemetryDataPoint {
  timestamp: number;
  reading: SmoothedReading;
  context?: TelemetryContext;
  alerts?: EnvironmentalAlert[];
  recommendation?: string;
}

export interface AlertRule {
  id: string;
  field: string;
  operator: 'lt' | 'gt' | 'eq' | 'ne' | 'between';
  threshold: number | [number, number];
  severity: AlertSeverity;
  messageTemplate: string;
  cause: string;
  actionTemplate: string;
  relatedPageHref?: string;
}

export interface TelemetrySession {
  id: string;
  startTime: number;
  endTime?: number;
  species?: string;
  stage?: string;
  sensorIds: string[];
  readingCount: number;
  alertCount: number;
}

export interface AdapterInterface {
  name: string;
  type: AdapterType;
  connect(config: SensorConfig): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  read(): Promise<EnvironmentalReading>;
  on(event: string, handler: (data: any) => void): void;
  off(event: string, handler: (data: any) => void): void;
}
