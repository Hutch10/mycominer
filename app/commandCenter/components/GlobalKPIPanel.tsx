'use client';

import { KPI } from '../commandCenterTypes';

interface GlobalKPIPanelProps {
  kpis: KPI[];
}

export function GlobalKPIPanel({ kpis }: GlobalKPIPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✓';
      case 'warning':
        return '⚠';
      case 'critical':
        return '✕';
      default:
        return '?';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '—';
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const categorizedKPIs = {
    energy: kpis.filter((k) => k.category === 'energy'),
    contamination: kpis.filter((k) => k.category === 'contamination'),
    efficiency: kpis.filter((k) => k.category === 'efficiency'),
    yield: kpis.filter((k) => k.category === 'yield'),
    labor: kpis.filter((k) => k.category === 'labor'),
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        📊 Key Performance Indicators
      </h2>

      {kpis.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No KPIs available
        </div>
      ) : (
        <div className="space-y-6">
          {/* Energy KPIs */}
          {categorizedKPIs.energy.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                ⚡ Energy & Resources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categorizedKPIs.energy.map((kpi) => (
                  <div key={kpi.kpiId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{kpi.name}</h4>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Target: {kpi.target !== undefined ? `${kpi.target}${kpi.unit}` : 'Not set'}
                        </div>
                      </div>
                      <span className={`text-2xl ${getStatusColor(kpi.status)}`}>
                        {getStatusIcon(kpi.status)}
                      </span>
                    </div>

                    <div className="flex items-end gap-2 mb-2">
                      <div className={`text-3xl font-bold ${getStatusColor(kpi.status)}`}>
                        {kpi.currentValue}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {kpi.unit}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {kpi.target !== undefined && (
                      <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
                        <div
                          className={`absolute top-0 left-0 h-full rounded-full ${getProgressBarColor(kpi.status)}`}
                          style={{ width: `${Math.min((kpi.currentValue / kpi.target) * 100, 100)}%` }}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <div className="text-gray-500 dark:text-gray-400">
                        {getTrendIcon(kpi.trend)} {kpi.trend}
                        {kpi.trendPercent !== 0 && ` (${kpi.trendPercent > 0 ? '+' : ''}${kpi.trendPercent}%)`}
                      </div>
                      <div className="text-gray-400 dark:text-gray-500">
                        {new Date(kpi.lastUpdate).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Thresholds */}
                    {kpi.threshold && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="text-yellow-600">⚠ {kpi.threshold.warning}</span>
                        {' | '}
                        <span className="text-red-600">✕ {kpi.threshold.critical}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contamination KPIs */}
          {categorizedKPIs.contamination.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                🦠 Contamination & Safety
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categorizedKPIs.contamination.map((kpi) => (
                  <div key={kpi.kpiId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{kpi.name}</h4>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Target: {kpi.target !== undefined ? `${kpi.target}${kpi.unit}` : 'Not set'}
                        </div>
                      </div>
                      <span className={`text-2xl ${getStatusColor(kpi.status)}`}>
                        {getStatusIcon(kpi.status)}
                      </span>
                    </div>

                    <div className="flex items-end gap-2 mb-2">
                      <div className={`text-3xl font-bold ${getStatusColor(kpi.status)}`}>
                        {kpi.currentValue}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {kpi.unit}
                      </div>
                    </div>

                    <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
                      <div
                        className={`absolute top-0 left-0 h-full rounded-full ${getProgressBarColor(kpi.status)}`}
                        style={{ width: `${Math.min(kpi.currentValue, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="text-gray-500 dark:text-gray-400">
                        {getTrendIcon(kpi.trend)} {kpi.trend}
                      </div>
                      <div className="text-gray-400 dark:text-gray-500">
                        {new Date(kpi.lastUpdate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Efficiency KPIs */}
          {categorizedKPIs.efficiency.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                📈 Efficiency & Utilization
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categorizedKPIs.efficiency.map((kpi) => (
                  <div key={kpi.kpiId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{kpi.name}</h4>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Target: {kpi.target !== undefined ? `${kpi.target}${kpi.unit}` : 'Not set'}
                        </div>
                      </div>
                      <span className={`text-2xl ${getStatusColor(kpi.status)}`}>
                        {getStatusIcon(kpi.status)}
                      </span>
                    </div>

                    <div className="flex items-end gap-2 mb-2">
                      <div className={`text-3xl font-bold ${getStatusColor(kpi.status)}`}>
                        {kpi.currentValue}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {kpi.unit}
                      </div>
                    </div>

                    <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
                      <div
                        className={`absolute top-0 left-0 h-full rounded-full ${getProgressBarColor(kpi.status)}`}
                        style={{ width: `${Math.min(kpi.currentValue, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="text-gray-500 dark:text-gray-400">
                        {getTrendIcon(kpi.trend)} {kpi.trend}
                      </div>
                      <div className="text-gray-400 dark:text-gray-500">
                        {new Date(kpi.lastUpdate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
