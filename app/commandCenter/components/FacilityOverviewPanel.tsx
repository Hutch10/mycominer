'use client';

import { FacilityHealthSnapshot } from '../commandCenterTypes';
import Link from 'next/link';

interface FacilityOverviewPanelProps {
  facilities: FacilityHealthSnapshot[];
}

export function FacilityOverviewPanel({ facilities }: FacilityOverviewPanelProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">✓ Healthy</span>;
      case 'warning':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">⚠ Warning</span>;
      case 'critical':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">✕ Critical</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">Unknown</span>;
    }
  };

  const getLoadColor = (load: number) => {
    if (load > 85) return 'text-red-600';
    if (load > 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskColor = (risk: number) => {
    if (risk > 70) return 'text-red-600';
    if (risk > 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Facility Overview
      </h2>

      {facilities.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No facilities configured
        </p>
      ) : (
        <div className="space-y-4">
          {facilities.map((facility) => (
            <div
              key={facility.facilityId}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {facility.facilityName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {facility.facilityId}
                  </p>
                </div>
                {getStatusBadge(facility.status)}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Load</div>
                  <div className={`text-lg font-bold ${getLoadColor(facility.loadPercent)}`}>
                    {facility.loadPercent}%
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Risk</div>
                  <div className={`text-lg font-bold ${getRiskColor(facility.contaminationRisk)}`}>
                    {facility.contaminationRisk}/100
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Energy</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {facility.energyUsageKwh.toFixed(1)} kWh
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {facility.energyBudgetPercent}% of budget
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Pending Tasks</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {facility.pendingTasks}
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {facility.alerts.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3 mb-3">
                  <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Active Alerts:
                  </div>
                  <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                    {facility.alerts.map((alert, idx) => (
                      <li key={idx}>• {alert}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Links */}
              <div className="flex gap-2 flex-wrap">
                <Link
                  href={`/workflow?facility=${facility.facilityId}`}
                  className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                >
                  View Workflow
                </Link>
                <Link
                  href={`/resources?facility=${facility.facilityId}`}
                  className="text-xs px-3 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition-colors"
                >
                  Resources
                </Link>
                <Link
                  href={`/execution?facility=${facility.facilityId}`}
                  className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                >
                  Execution
                </Link>
              </div>

              <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Last updated: {new Date(facility.lastUpdate).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
