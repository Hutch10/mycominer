// Phase 20: Resource Usage Chart Component
// Visualizes resource consumption over time

'use client';

import { ResourceForecast } from '@/app/resource/resourceTypes';

interface ResourceUsageChartProps {
  forecasts: ResourceForecast[];
}

export function ResourceUsageChart({ forecasts }: ResourceUsageChartProps) {
  if (forecasts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No forecast data available
      </div>
    );
  }

  // Get max days across all forecasts
  const maxDays = Math.max(
    ...forecasts.map(f => f.projectedUsage.length),
    30
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Resource Usage Projections
      </h2>

      {forecasts.map((forecast, idx) => {
        const maxQuantity = Math.max(
          forecast.currentQuantity,
          ...forecast.projectedUsage.map(u => u.remainingQuantity)
        );

        return (
          <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            {/* Resource Header */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {forecast.resourceName}
                </h3>

                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Confidence: {forecast.confidence}%
                </span>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Current: {forecast.currentQuantity} •{' '}
                {forecast.depletionDate
                  ? `Depletes: ${forecast.depletionDate}`
                  : 'Sufficient inventory'}
              </div>
            </div>

            {/* Chart */}
            <div className="space-y-3">
              {/* Y-axis labels and bars */}
              <div className="flex items-end gap-1" style={{ height: '200px' }}>
                {Array.from({ length: maxDays }).map((_, dayIndex) => {
                  const usage = forecast.projectedUsage[dayIndex];
                  
                  if (!usage) {
                    return (
                      <div
                        key={dayIndex}
                        className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t opacity-20"
                        style={{ height: '2px' }}
                      />
                    );
                  }

                  const heightPercent = maxQuantity > 0
                    ? (usage.remainingQuantity / maxQuantity) * 100
                    : 0;

                  const isLowStock = usage.remainingQuantity < (forecast.currentQuantity * 0.2);
                  const isDepletedSoon = forecast.depletionDate &&
                    dayIndex >= forecast.projectedUsage.length - 7;

                  return (
                    <div
                      key={dayIndex}
                      className={`flex-1 rounded-t transition-all hover:opacity-80 ${
                        usage.remainingQuantity === 0
                          ? 'bg-red-500 dark:bg-red-600'
                          : isLowStock || isDepletedSoon
                          ? 'bg-yellow-500 dark:bg-yellow-600'
                          : 'bg-green-500 dark:bg-green-600'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                      title={`Day ${dayIndex + 1}: ${usage.remainingQuantity.toFixed(1)} remaining (used ${usage.quantity.toFixed(1)})`}
                    />
                  );
                })}
              </div>

              {/* X-axis (day markers) */}
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Day 0</span>
                <span>Day {Math.floor(maxDays / 2)}</span>
                <span>Day {maxDays}</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span className="text-gray-600 dark:text-gray-400">Sufficient</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded" />
                <span className="text-gray-600 dark:text-gray-400">Low Stock</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span className="text-gray-600 dark:text-gray-400">Depleted</span>
              </div>
            </div>

            {/* Recommendations */}
            {forecast.recommendations.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded">
                <div className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">
                  💡 Recommendations
                </div>
                <div className="space-y-1">
                  {forecast.recommendations.map((rec, i) => (
                    <div key={i} className="text-sm text-blue-800 dark:text-blue-400">
                      • {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assumptions */}
            {forecast.assumptions.length > 0 && (
              <details className="mt-3">
                <summary className="text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer">
                  View Assumptions
                </summary>
                <div className="mt-2 space-y-1">
                  {forecast.assumptions.map((assumption, i) => (
                    <div key={i} className="text-xs text-gray-600 dark:text-gray-400">
                      • {assumption}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        );
      })}
    </div>
  );
}
