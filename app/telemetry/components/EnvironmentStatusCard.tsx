'use client';

import { SmoothedReading } from '../engine/telemetryTypes';

export interface EnvironmentStatusTarget {
  field: 'temperature' | 'humidity' | 'co2' | 'airflow' | 'light';
  label: string;
  unit: string;
  min: number;
  max: number;
  current: number | null;
  icon: string;
}

interface EnvironmentStatusCardProps {
  latestReading: SmoothedReading | null;
  targets: EnvironmentStatusTarget[];
  hasAlerts: boolean;
}

function getStatus(current: number | null, min: number, max: number): 'good' | 'warning' | 'critical' {
  if (current === null) return 'warning';
  if (current < min || current > max) return 'critical';
  if (current < min + (max - min) * 0.15 || current > max - (max - min) * 0.15) return 'warning';
  return 'good';
}

export function EnvironmentStatusCard({ latestReading, targets, hasAlerts }: EnvironmentStatusCardProps) {
  const targetMap = Object.fromEntries(targets.map((t) => [t.field, t]));

  const getFieldValue = (field: string) => {
    if (!latestReading) return null;
    const key = `_${field}Smoothed` as keyof SmoothedReading;
    return latestReading[key] as number | null | undefined;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Environment Status</h2>
        {hasAlerts && <span className="inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse" title="Alerts active" />}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {targets.map((target) => {
          const current = getFieldValue(target.field) ?? targetMap[target.field]?.current;
          const status = getStatus(current, target.min, target.max);

          const statusConfig = {
            good: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200',
            warning: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200',
            critical: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200',
          };

          return (
            <div key={target.field} className={`rounded-lg p-3 ${statusConfig[status]}`}>
              <p className="text-xs font-semibold opacity-75 mb-1">{target.icon} {target.label}</p>
              <p className="text-2xl font-bold">
                {current !== null ? current.toFixed(current < 10 ? 1 : 0) : '—'}
                <span className="text-sm ml-1">{target.unit}</span>
              </p>
              <p className="text-xs opacity-75 mt-1">
                Range: {target.min}–{target.max}
              </p>
              {current !== null && (
                <p className="text-xs mt-1 font-medium">
                  {status === 'good' && '✓ Optimal'}
                  {status === 'warning' && '⚠ Near limit'}
                  {status === 'critical' && '✗ Out of range'}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!latestReading && (
        <div className="mt-4 text-center text-xs text-gray-600 dark:text-gray-400">
          Waiting for sensor data...
        </div>
      )}
    </div>
  );
}
