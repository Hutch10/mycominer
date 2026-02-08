/**
 * Telemetry Engine
 * Core data processing, validation, anomaly detection, and alert generation
 */

import {
  EnvironmentalReading,
  SmoothedReading,
  AnomalyDetection,
  EnvironmentalAlert,
  AlertRule,
  TelemetryDataPoint,
  SensorReading,
  SensorConfig,
  AlertSeverity,
} from './telemetryTypes';
import { createAdapter } from './sensorAdapters';

const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'co2-high',
    field: 'co2',
    operator: 'gt',
    threshold: 2000,
    severity: 'warning',
    messageTemplate: 'CO₂ is elevated at {value} PPM',
    cause: 'Insufficient fresh air exchange',
    actionTemplate: 'Increase FAE by opening vents or running fans',
    relatedPageHref: '/foundations/environmental-parameters',
  },
  {
    id: 'co2-critical',
    field: 'co2',
    operator: 'gt',
    threshold: 3000,
    severity: 'critical',
    messageTemplate: 'CO₂ is critically high at {value} PPM',
    cause: 'Severe ventilation issue',
    actionTemplate: 'Immediately increase fresh air exchange',
    relatedPageHref: '/troubleshooting/fuzzy-feet',
  },
  {
    id: 'humidity-low',
    field: 'humidity',
    operator: 'lt',
    threshold: 70,
    severity: 'warning',
    messageTemplate: 'Humidity is low at {value}%',
    cause: 'Evaporation or insufficient misting',
    actionTemplate: 'Mist substrate or increase humidity control',
    relatedPageHref: '/troubleshooting/drying-caps',
  },
  {
    id: 'humidity-critical-low',
    field: 'humidity',
    operator: 'lt',
    threshold: 60,
    severity: 'critical',
    messageTemplate: 'Humidity is critically low at {value}%',
    cause: 'Substrate drying out quickly',
    actionTemplate: 'Immediately increase surface moisture and humidity',
    relatedPageHref: '/troubleshooting/drying-caps',
  },
  {
    id: 'temperature-high',
    field: 'temperature',
    operator: 'gt',
    threshold: 28,
    severity: 'warning',
    messageTemplate: 'Temperature is high at {value}°C',
    cause: 'Ambient heat or insufficient cooling',
    actionTemplate: 'Improve ventilation or reduce ambient temperature',
    relatedPageHref: '/foundations/environmental-parameters',
  },
  {
    id: 'temperature-low',
    field: 'temperature',
    operator: 'lt',
    threshold: 12,
    severity: 'warning',
    messageTemplate: 'Temperature is low at {value}°C',
    cause: 'Cold ambient or insufficient heating',
    actionTemplate: 'Increase ambient temperature or add heat source',
    relatedPageHref: '/foundations/environmental-parameters',
  },
  {
    id: 'airflow-low',
    field: 'airflow',
    operator: 'lt',
    threshold: 10,
    severity: 'warning',
    messageTemplate: 'Airflow is insufficient at {value} CFM',
    cause: 'Weak ventilation or blocked vents',
    actionTemplate: 'Check for blockages and increase fan speed',
    relatedPageHref: '/troubleshooting/fuzzy-feet',
  },
];

export class TelemetryEngine {
  private sensors: Map<string, SensorConfig> = new Map();
  private adapterInstances: Map<string, any> = new Map();
  private readings: SensorReading[] = [];
  private smoothedReadings: SmoothedReading[] = [];
  private alerts: EnvironmentalAlert[] = [];
  private alertRules: AlertRule[] = [...DEFAULT_ALERT_RULES];
  private listeners: Map<string, Set<Function>> = new Map();
  private smoothingWindowSize = 10;
  private alertIdCounter = 0;

  async addSensor(config: SensorConfig): Promise<void> {
    this.sensors.set(config.id, config);
  }

  async connectSensor(sensorId: string): Promise<void> {
    const config = this.sensors.get(sensorId);
    if (!config) throw new Error(`Sensor ${sensorId} not found`);

    const adapter = createAdapter(config.type);
    this.adapterInstances.set(sensorId, adapter);

    await adapter.connect(config);

    adapter.on('reading', (reading: EnvironmentalReading) => {
      this.handleReading(sensorId, reading);
    });
  }

  async disconnectSensor(sensorId: string): Promise<void> {
    const adapter = this.adapterInstances.get(sensorId);
    if (adapter) {
      await adapter.disconnect();
      this.adapterInstances.delete(sensorId);
    }
  }

  private handleReading(sensorId: string, reading: EnvironmentalReading): void {
    const sensorReading: SensorReading = {
      ...reading,
      sensorId,
    };

    this.readings.push(sensorReading);
    // Keep only last 1000 readings
    if (this.readings.length > 1000) {
      this.readings.shift();
    }

    // Smooth the data
    const smoothed = this.smoothReading(sensorReading);
    smoothed.sensorId = sensorId;
    this.smoothedReadings.push(smoothed);
    if (this.smoothedReadings.length > 1000) {
      this.smoothedReadings.shift();
    }

    // Check alert rules
    const newAlerts = this.checkAlertRules(smoothed, sensorId);
    this.alerts.push(...newAlerts);
    if (this.alerts.length > 500) {
      this.alerts.shift();
    }

    // Emit data point event
    const dataPoint: TelemetryDataPoint = {
      timestamp: reading.timestamp,
      reading: smoothed,
      alerts: newAlerts,
    };

    this.emit('datapoint', dataPoint);

    if (newAlerts.length > 0) {
      this.emit('alerts', newAlerts);
    }
  }

  private smoothReading(reading: SensorReading): SmoothedReading {
    const recentReadings = this.readings.slice(-this.smoothingWindowSize);

    const smooth = (field: keyof EnvironmentalReading) => {
      const values = recentReadings
        .map((r) => r[field])
        .filter((v): v is number => typeof v === 'number');
      if (values.length === 0) return undefined;
      return values.reduce((a, b) => a + b) / values.length;
    };

    const temp = smooth('temperature');
    const humid = smooth('humidity');
    const co2Val = smooth('co2');
    const airVal = smooth('airflow');
    const lightVal = smooth('light');

    return {
      timestamp: reading.timestamp,
      temperature: temp,
      humidity: humid,
      co2: co2Val,
      airflow: airVal,
      light: lightVal,
      pressure: smooth('pressure'),
      _temperatureSmoothed: temp,
      _humiditySmoothed: humid,
      _co2Smoothed: co2Val,
      _airflowSmoothed: airVal,
      _lightSmoothed: lightVal,
    };
  }

  private checkAlertRules(reading: SmoothedReading, sensorId: string): EnvironmentalAlert[] {
    const newAlerts: EnvironmentalAlert[] = [];

    for (const rule of this.alertRules) {
      const value = reading[rule.field as keyof SmoothedReading] as number | undefined;
      if (value === undefined) continue;

      let triggered = false;

      if (rule.operator === 'gt') {
        triggered = value > (rule.threshold as number);
      } else if (rule.operator === 'lt') {
        triggered = value < (rule.threshold as number);
      } else if (rule.operator === 'between' && Array.isArray(rule.threshold)) {
        const [min, max] = rule.threshold;
        triggered = value < min || value > max;
      }

      if (triggered) {
        const existingAlert = this.alerts.find(
          (a) => a.sensorId === sensorId && a.field === rule.field && !a.dismissed
        );

        // Only create new alert if one doesn't exist
        if (!existingAlert) {
          const alert: EnvironmentalAlert = {
            id: `alert-${++this.alertIdCounter}`,
            timestamp: reading.timestamp,
            sensorId,
            field: rule.field,
            severity: rule.severity,
            message: rule.messageTemplate.replace('{value}', value.toFixed(1)),
            cause: rule.cause,
            recommendedAction: rule.actionTemplate,
            relatedPageHref: rule.relatedPageHref,
            dismissable: rule.severity !== 'critical',
            dismissed: false,
          };
          newAlerts.push(alert);
        }
      }
    }

    return newAlerts;
  }

  dismissAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.dismissed = true;
      this.emit('alert-dismissed', alert);
    }
  }

  getRecentReadings(count: number = 100): TelemetryDataPoint[] {
    return this.smoothedReadings.slice(-count).map((reading) => ({
      timestamp: reading.timestamp,
      reading,
      alerts: this.alerts.filter(
        (a) => a.timestamp >= reading.timestamp - 5000 && a.timestamp <= reading.timestamp
      ),
    }));
  }

  getActiveAlerts(): EnvironmentalAlert[] {
    return this.alerts.filter((a) => !a.dismissed);
  }

  getAlertHistory(limit: number = 100): EnvironmentalAlert[] {
    return this.alerts.slice(-limit);
  }

  on(event: string, handler: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: (data: any) => void): void {
    this.listeners.get(event)?.delete(handler);
  }

  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach((handler) => handler(data));
  }

  getSensorStatus(): Array<{ config: SensorConfig; isConnected: boolean }> {
    const status: Array<{ config: SensorConfig; isConnected: boolean }> = [];

    for (const [id, config] of this.sensors) {
      const adapter = this.adapterInstances.get(id);

      status.push({
        config,
        isConnected: adapter?.isConnected?.() ?? false,
      });
    }

    return status;
  }
}

export const telemetryEngine = new TelemetryEngine();
