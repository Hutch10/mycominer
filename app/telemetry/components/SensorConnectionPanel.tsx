'use client';

import { useState } from 'react';
import { AdapterType, SensorConfig, SensorType } from '../engine/telemetryTypes';

interface SensorStatus {
  config: SensorConfig;
  isConnected: boolean;
  lastReadingTime: number | null;
  lastReadingValue: number | null;
}

interface SensorConnectionPanelProps {
  sensors: SensorStatus[];
  onConnect: (sensorId: string) => void;
  onDisconnect: (sensorId: string) => void;
  onAddSensor: (config: SensorConfig) => void;
}

const adapterTypeLabels: Record<AdapterType, string> = {
  bluetooth: 'Bluetooth',
  serial: 'Serial/USB',
  usb: 'USB',
  websocket: 'WebSocket',
  mock: 'Mock (Demo)',
};

const sensorTypeLabels: Record<string, string> = {
  temperature: '🌡️ Temperature',
  humidity: '💧 Humidity',
  co2: '💨 CO₂',
  airflow: '🌬️ Airflow',
  light: '💡 Light',
  pressure: '🔽 Pressure',
};

export function SensorConnectionPanel({ sensors, onConnect, onDisconnect, onAddSensor }: SensorConnectionPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    adapterType: 'mock' as AdapterType,
  });

  const handleAddSensor = () => {
    if (formData.name.trim()) {
      onAddSensor({
        id: `${formData.adapterType}-${Date.now()}`,
        name: formData.name,
        type: formData.adapterType,
        enabled: true,
        readingIntervalMs: 5000,
        calibrationOffset: {},
      });
      setFormData({ name: '', adapterType: 'mock' });
      setShowAddForm(false);
    }
  };

  const formatLastReading = (timestamp: number | null, value: number | null) => {
    if (!timestamp || value === null) return 'No data';
    const secondsAgo = Math.floor((Date.now() - timestamp) / 1000);
    if (secondsAgo < 60) return `${secondsAgo}s ago (${value.toFixed(1)})`;
    const minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60) return `${minutesAgo}m ago (${value.toFixed(1)})`;
    const hoursAgo = Math.floor(minutesAgo / 60);
    return `${hoursAgo}h ago (${value.toFixed(1)})`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Connected Sensors ({sensors.length})</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-2 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          {showAddForm ? 'Cancel' : '+ Add Sensor'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
          <input
            type="text"
            placeholder="Sensor name..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <select
            value={formData.adapterType}
            onChange={(e) => setFormData({ ...formData, adapterType: e.target.value as AdapterType })}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="mock">Mock (Demo)</option>
            <option value="bluetooth">Bluetooth</option>
            <option value="serial">Serial/USB</option>
            <option value="websocket">WebSocket</option>
          </select>
          <button
            onClick={handleAddSensor}
            className="w-full px-2 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Add Sensor
          </button>
        </div>
      )}

      <div className="space-y-2">
        {sensors.length === 0 ? (
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center py-4">No sensors connected. Add one to get started.</p>
        ) : (
          sensors.map((sensor) => (
            <div key={sensor.config.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{sensor.config.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {adapterTypeLabels[sensor.config.type]}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                  {formatLastReading(sensor.lastReadingTime, sensor.lastReadingValue)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {sensor.isConnected ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Connected" />
                    <button
                      onClick={() => onDisconnect(sensor.config.id)}
                      className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/60"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-gray-400 rounded-full" title="Disconnected" />
                    <button
                      onClick={() => onConnect(sensor.config.id)}
                      className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/60"
                    >
                      Connect
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
