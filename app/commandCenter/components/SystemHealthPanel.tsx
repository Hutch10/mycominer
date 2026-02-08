'use client';

import { SystemHealthSnapshot } from '../commandCenterTypes';

interface SystemHealthPanelProps {
  systemHealth: SystemHealthSnapshot;
}

export function SystemHealthPanel({ systemHealth }: SystemHealthPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        System Status
      </h2>

      {/* Overall Status Badge */}
      <div className={`border-2 rounded-lg p-4 mb-6 ${getStatusColor(systemHealth.overallStatus)}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium opacity-75">Overall System Health</div>
            <div className="text-3xl font-bold mt-1">
              {getStatusIcon(systemHealth.overallStatus)} {systemHealth.overallStatus.toUpperCase()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-75">Confidence</div>
            <div className="text-2xl font-bold">{systemHealth.confidence}%</div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Facilities</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {systemHealth.totalFacilities}
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Healthy</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
            {systemHealth.healthyFacilities}
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">At Risk</div>
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
            {systemHealth.facilitiesAtRisk}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">System Uptime</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {systemHealth.systemUptime}
          </div>
        </div>
      </div>

      {/* Alerts Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border-2 border-red-200 dark:border-red-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">Critical Alerts</div>
          <div className="text-4xl font-bold text-red-600 dark:text-red-400 mt-1">
            {systemHealth.criticalAlerts}
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border-2 border-orange-200 dark:border-orange-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</div>
          <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mt-1">
            {systemHealth.activeAlerts}
          </div>
        </div>
      </div>

      {/* Global KPIs */}
      <div className="border-t pt-6 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Global Performance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Energy Usage</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {systemHealth.globalKPIs.totalEnergyUsageKwh.toLocaleString()} kWh
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {systemHealth.globalKPIs.energyBudgetUtilization}% of budget
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Average Load</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {systemHealth.globalKPIs.averageLoadPercent}%
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Contamination Risk</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {systemHealth.globalKPIs.averageContaminationRisk}/100
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Active Tasks</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {systemHealth.globalKPIs.executingTasks}
            </div>
          </div>
        </div>
      </div>

      {/* Proposals Summary */}
      <div className="border-t pt-6 mt-6 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending Proposals</div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {systemHealth.globalKPIs.pendingProposals}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Approved & Running</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
              {systemHealth.globalKPIs.approvedProposals}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
