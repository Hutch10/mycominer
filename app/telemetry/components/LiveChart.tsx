'use client';

import React from 'react';
import { SmoothedReading } from '../engine/telemetryTypes';

interface LiveChartProps {
  readings: SmoothedReading[];
  field: 'temperature' | 'humidity' | 'co2' | 'airflow' | 'light';
  maxPoints?: number;
}

const fieldConfig = {
  temperature: { label: 'Temperature', unit: '°C', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20' },
  humidity: { label: 'Humidity', unit: '%', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  co2: { label: 'CO₂', unit: 'PPM', color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
  airflow: { label: 'Airflow', unit: 'CFM', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20' },
  light: { label: 'Light', unit: 'Lux', color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
};

export function LiveChart({ readings, field, maxPoints = 60 }: LiveChartProps) {
  const config = fieldConfig[field];
  const data = readings.slice(-maxPoints);

  if (data.length === 0) {
    return (
      <div className={`${config.bgColor} rounded-lg p-4 text-center`}>
        <p className="text-sm text-gray-600 dark:text-gray-400">No data yet</p>
      </div>
    );
  }

  const fieldKey = `_${field}Smoothed` as keyof SmoothedReading;
  const values = data.map((r) => r[fieldKey] as number | undefined).filter((v): v is number => v !== undefined);
  
  if (values.length === 0) {
    return (
      <div className={`${config.bgColor} rounded-lg p-4 text-center`}>
        <p className="text-sm text-gray-600 dark:text-gray-400">No data for this field</p>
      </div>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const current = values[values.length - 1];

  const normalizeY = (v: number) => ((v - min) / range) * 80 + 10;

  const points = values.map((v, i) => `${(i / (values.length - 1)) * 100},${normalizeY(v)}`).join(' ');

  return (
    <div className={`${config.bgColor} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{config.label}</p>
        <p className={`text-lg font-bold ${config.color}`}>
          {current.toFixed(1)} {config.unit}
        </p>
      </div>

      <svg viewBox="0 0 100 100" className="w-full h-20" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={config.color}
          vectorEffect="non-scaling-stroke"
        />
        <line x1="0" y1={normalizeY(min)} x2="100" y2={normalizeY(min)} stroke="currentColor" strokeWidth="0.5" className="text-gray-300 dark:text-gray-600" opacity="0.5" />
      </svg>

      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
        <span>Min: {min.toFixed(1)}</span>
        <span>Max: {max.toFixed(1)}</span>
      </div>
    </div>
  );
}
