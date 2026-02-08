'use client';

import { useEffect, useState, useCallback } from 'react';
import { telemetryEngine } from '../engine/telemetryEngine';
import { SmoothedReading, EnvironmentalAlert, SensorConfig } from '../engine/telemetryTypes';
import { LiveChart } from './LiveChart';
import { AlertPanel } from './AlertPanel';
import { SensorConnectionPanel } from './SensorConnectionPanel';
import { EnvironmentStatusCard, type EnvironmentStatusTarget } from './EnvironmentStatusCard';
import { ContextPanels } from './ContextPanels';

interface SensorStatus {
  config: SensorConfig;
  isConnected: boolean;
  lastReadingTime: number | null;
  lastReadingValue: number | null;
}

export function TelemetryDashboard() {
  const [species, setSpecies] = useState('oyster');
  const [stage, setStage] = useState('fruiting');
  const [readings, setReadings] = useState<SmoothedReading[]>([]);
  const [alerts, setAlerts] = useState<EnvironmentalAlert[]>([]);
  const [sensors, setSensors] = useState<SensorStatus[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Environmental targets by species and stage
  const targetsBySpeciesStage: Record<string, Record<string, any>> = {
    oyster: {
      'colonization': {
        temperature: { min: 15, max: 25 },
        humidity: { min: 85, max: 95 },
        co2: { min: 0, max: 1200 },
        airflow: { min: 0, max: 100 },
        light: { min: 0, max: 0 },
      },
      'fruiting': {
        temperature: { min: 12, max: 24 },
        humidity: { min: 80, max: 95 },
        co2: { min: 800, max: 1200 },
        airflow: { min: 50, max: 200 },
        light: { min: 100, max: 1000 },
      },
    },
    shiitake: {
      'colonization': {
        temperature: { min: 18, max: 24 },
        humidity: { min: 70, max: 85 },
        co2: { min: 0, max: 1000 },
        airflow: { min: 0, max: 50 },
        light: { min: 0, max: 0 },
      },
      'fruiting': {
        temperature: { min: 10, max: 20 },
        humidity: { min: 75, max: 90 },
        co2: { min: 600, max: 1200 },
        airflow: { min: 50, max: 150 },
        light: { min: 200, max: 500 },
      },
    },
  };

  const getTargets = useCallback((): EnvironmentStatusTarget[] => {
    const speciesTargets = targetsBySpeciesStage[species];
    if (!speciesTargets) {
      return [
        { field: 'temperature' as const, label: 'Temperature', unit: '°C', min: 15, max: 24, current: readings[readings.length - 1]?._temperatureSmoothed ?? null, icon: '🌡️' },
        { field: 'humidity' as const, label: 'Humidity', unit: '%', min: 80, max: 95, current: readings[readings.length - 1]?._humiditySmoothed ?? null, icon: '💧' },
        { field: 'co2' as const, label: 'CO₂', unit: 'ppm', min: 800, max: 1200, current: readings[readings.length - 1]?._co2Smoothed ?? null, icon: '💨' },
        { field: 'airflow' as const, label: 'Airflow', unit: 'CFM', min: 50, max: 150, current: readings[readings.length - 1]?._airflowSmoothed ?? null, icon: '🌬️' },
      ];
    }

    const stageTargets = speciesTargets[stage] || speciesTargets['fruiting'];
    return [
      { field: 'temperature' as const, label: 'Temperature', unit: '°C', min: stageTargets.temperature.min, max: stageTargets.temperature.max, current: readings[readings.length - 1]?._temperatureSmoothed ?? null, icon: '🌡️' },
      { field: 'humidity' as const, label: 'Humidity', unit: '%', min: stageTargets.humidity.min, max: stageTargets.humidity.max, current: readings[readings.length - 1]?._humiditySmoothed ?? null, icon: '💧' },
      { field: 'co2' as const, label: 'CO₂', unit: 'ppm', min: stageTargets.co2.min, max: stageTargets.co2.max, current: readings[readings.length - 1]?._co2Smoothed ?? null, icon: '💨' },
      { field: 'airflow' as const, label: 'Airflow', unit: 'CFM', min: stageTargets.airflow.min, max: stageTargets.airflow.max, current: readings[readings.length - 1]?._airflowSmoothed ?? null, icon: '🌬️' },
    ];
  }, [species, stage, readings]);

  useEffect(() => {
    // Initialize with mock sensor if no sensors connected
    if (!isInitialized && sensors.length === 0) {
      const mockConfig: SensorConfig = {
        id: 'mock-sensor-1',
        name: 'Demo Sensor (Mock)',
        type: 'mock',
        enabled: true,
        readingIntervalMs: 5000,
        calibrationOffset: {},
      };
      telemetryEngine.addSensor(mockConfig);
      telemetryEngine.connectSensor(mockConfig.id);
      setIsInitialized(true);
    }
  }, [isInitialized, sensors.length]);

  useEffect(() => {
    // Update readings
    const handleDatapoint = (datapoint: any) => {
      setReadings((prev) => [...prev.slice(-59), datapoint.reading]);
    };

    // Update alerts
    const handleAlerts = (newAlerts: EnvironmentalAlert[]) => {
      setAlerts(newAlerts);
    };

    // Update sensors
    const updateSensors = () => {
      const sensorStatuses = telemetryEngine.getSensorStatus();
      const recentReadings = telemetryEngine.getRecentReadings();
      const lastById: Record<string, any> = {};

      for (const datapoint of recentReadings) {
        const sensorId = datapoint.reading.sensorId || 'unknown';
        lastById[sensorId] = datapoint.reading;
      }

      setSensors(
        sensorStatuses.map((status) => ({
          config: status.config,
          isConnected: status.isConnected,
          lastReadingTime: lastById[status.config.id]?.timestamp ?? null,
          lastReadingValue: lastById[status.config.id]?.temperature ?? null,
        }))
      );
    };

    telemetryEngine.on('datapoint', handleDatapoint);
    telemetryEngine.on('alerts', handleAlerts);

    // Update sensors every second
    const sensorInterval = setInterval(updateSensors, 1000);
    updateSensors();

    // Initial state
    setAlerts(telemetryEngine.getActiveAlerts());

    return () => {
      telemetryEngine.off('datapoint', handleDatapoint);
      telemetryEngine.off('alerts', handleAlerts);
      clearInterval(sensorInterval);
    };
  }, []);

  const handleDismissAlert = (alertId: string) => {
    telemetryEngine.dismissAlert(alertId);
    setAlerts(telemetryEngine.getActiveAlerts());
  };

  const handleConnectSensor = (sensorId: string) => {
    telemetryEngine.connectSensor(sensorId);
    setSensors([...sensors]);
  };

  const handleDisconnectSensor = (sensorId: string) => {
    telemetryEngine.disconnectSensor(sensorId);
    setSensors([...sensors]);
  };

  const handleAddSensor = (config: SensorConfig) => {
    telemetryEngine.addSensor(config);
    if (config.type === 'mock') {
      telemetryEngine.connectSensor(config.id);
    }
    setSensors([...sensors]);
  };

  const targets = getTargets();
  const latestReading = readings[readings.length - 1] || null;

  return (
    <div className="space-y-4">
      {/* Context Selectors */}
      <ContextPanels
        species={species}
        stage={stage}
        onSpeciesChange={setSpecies}
        onStageChange={setStage}
      />

      {/* Environment Status */}
      <EnvironmentStatusCard
        latestReading={latestReading}
        targets={targets}
        hasAlerts={alerts.length > 0}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Temperature (°C)</h3>
          <LiveChart readings={readings} field="temperature" maxPoints={60} />
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Humidity (%)</h3>
          <LiveChart readings={readings} field="humidity" maxPoints={60} />
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">CO₂ (ppm)</h3>
          <LiveChart readings={readings} field="co2" maxPoints={60} />
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Airflow (CFM)</h3>
          <LiveChart readings={readings} field="airflow" maxPoints={60} />
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Alerts</h3>
        <AlertPanel alerts={alerts} onDismiss={handleDismissAlert} />
      </div>

      {/* Sensor Panel */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <SensorConnectionPanel
          sensors={sensors}
          onConnect={handleConnectSensor}
          onDisconnect={handleDisconnectSensor}
          onAddSensor={handleAddSensor}
        />
      </div>
    </div>
  );
}
