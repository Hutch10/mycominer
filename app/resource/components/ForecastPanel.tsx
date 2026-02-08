// Phase 20: Forecast Panel Component
// Displays resource forecasts with depletion predictions

'use client';

import { ForecastReport, ResourceForecast } from '@/app/resource/resourceTypes';

interface ForecastPanelProps {
  report: ForecastReport | null;
}

export function ForecastPanel({ report }: ForecastPanelProps) {
  if (!report) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No forecast report generated yet
      </div>
    );
  }

  const getDaysUntilDepletion = (depletionDate: string | null): number | null => {
    if (!depletionDate) return null;
    return Math.ceil(
      (new Date(depletionDate).getTime() - Date.now()) / (24 * 3600000)
    );
  };

  const getUrgencyColor = (days: number | null): string => {
    if (days === null) return 'text-green-600 dark:text-green-400';
    if (days < 3) return 'text-red-600 dark:text-red-400';
    if (days < 7) return 'text-orange-600 dark:text-orange-400';
    if (days < 14) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Resource Forecast Report
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Report ID: {report.reportId}
          {report.workflowPlanId && ` • Workflow: ${report.workflowPlanId}`}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Forecasts</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {report.forecasts.length}
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Critical Shortages</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {report.criticalShortages.length}
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Energy Utilization</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {report.energyBudgetProjection.utilizationPercent.toFixed(0)}%
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Confidence</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {report.overallConfidence}%
          </div>
        </div>
      </div>

      {/* Critical Shortages */}
      {report.criticalShortages.length > 0 && (
        <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-950">
          <h3 className="text-lg font-medium text-red-900 dark:text-red-300 mb-3">
            🚨 Critical Shortages
          </h3>

          <div className="space-y-1">
            {report.criticalShortages.map((shortage, idx) => (
              <div key={idx} className="text-sm text-red-800 dark:text-red-400">
                • {shortage}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Energy Budget */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
          Energy Budget Projection
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total Budget</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {report.energyBudgetProjection.totalBudgetKwh} kWh
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Projected Usage</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {report.energyBudgetProjection.projectedUsageKwh.toFixed(1)} kWh
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Remaining</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {report.energyBudgetProjection.remainingKwh.toFixed(1)} kWh
            </span>
          </div>

          {/* Energy usage bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${
                report.energyBudgetProjection.utilizationPercent > 90
                  ? 'bg-red-500'
                  : report.energyBudgetProjection.utilizationPercent > 75
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{
                width: `${Math.min(100, report.energyBudgetProjection.utilizationPercent)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Equipment Maintenance Windows */}
      {report.equipmentMaintenanceWindows.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Equipment Maintenance Windows
          </h3>

          <div className="space-y-2">
            {report.equipmentMaintenanceWindows.map((window, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded"
              >
                <span className="text-sm text-gray-900 dark:text-white">
                  {window.equipmentId}
                </span>
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Next: {window.nextMaintenanceDate}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {window.hoursUntilMaintenance}h remaining
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forecasts */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
          Resource Depletion Forecasts
        </h3>

        <div className="space-y-3">
          {report.forecasts.map((forecast, idx) => {
            const daysUntilDepletion = getDaysUntilDepletion(forecast.depletionDate);
            const urgencyColor = getUrgencyColor(daysUntilDepletion);

            return (
              <div
                key={idx}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {forecast.resourceName}
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Current: {forecast.currentQuantity} •{' '}
                      Confidence: {forecast.confidence}%
                    </div>

                    {forecast.depletionDate && (
                      <div className={`text-sm font-medium mt-1 ${urgencyColor}`}>
                        Depletes in {daysUntilDepletion} days ({forecast.depletionDate})
                      </div>
                    )}

                    {!forecast.depletionDate && (
                      <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Sufficient for forecast period
                      </div>
                    )}

                    {forecast.recommendations.length > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        💡 {forecast.recommendations[0]}
                      </div>
                    )}
                  </div>
                </div>

                {/* Usage projection mini-chart */}
                {forecast.projectedUsage.length > 0 && (
                  <div className="mt-3 flex items-end gap-1 h-12">
                    {forecast.projectedUsage.slice(0, 30).map((usage, i) => {
                      const heightPercent = forecast.currentQuantity > 0
                        ? (usage.remainingQuantity / forecast.currentQuantity) * 100
                        : 0;

                      return (
                        <div
                          key={i}
                          className="flex-1 bg-blue-500 dark:bg-blue-600 rounded-t"
                          style={{ height: `${heightPercent}%` }}
                          title={`Day ${i + 1}: ${usage.remainingQuantity.toFixed(1)} remaining`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
