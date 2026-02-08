'use client';

import { useState } from 'react';
import { Alert } from '../commandCenterTypes';

interface AlertsPanelProps {
  alerts: Alert[];
  onAcknowledge?: (alertId: string) => void;
}

export function AlertsPanel({ alerts, onAcknowledge }: AlertsPanelProps) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded">🔴 CRITICAL</span>;
      case 'warning':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">⚠️ WARNING</span>;
      case 'info':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">ℹ️ INFO</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded">UNKNOWN</span>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'energy': return '⚡';
      case 'contamination': return '🦠';
      case 'equipment': return '🔧';
      case 'labor': return '👷';
      case 'resource': return '📦';
      case 'schedule': return '📅';
      case 'execution': return '▶️';
      case 'system': return '⚙️';
      default: return '•';
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter !== 'all' && alert.severity !== filter) return false;
    if (!showAcknowledged && alert.acknowledged) return false;
    return true;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'critical' && !a.acknowledged).length;
  const warningCount = alerts.filter((a) => a.severity === 'warning' && !a.acknowledged).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Active Alerts
      </h2>

      {/* Summary & Filters */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'critical'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            Critical ({criticalCount})
          </button>
          <button
            onClick={() => setFilter('warning')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'warning'
                ? 'bg-yellow-600 text-white'
                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            }`}
          >
            Warning ({warningCount})
          </button>
          <button
            onClick={() => setFilter('info')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'info'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            Info
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={showAcknowledged}
            onChange={(e) => setShowAcknowledged(e.target.checked)}
            className="rounded"
          />
          Show acknowledged
        </label>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {filter === 'all' ? '✓ No active alerts' : `No ${filter} alerts`}
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.alertId}
              className={`border-l-4 p-4 rounded-r-lg ${
                alert.severity === 'critical'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : alert.severity === 'warning'
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              } ${alert.acknowledged ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getSeverityBadge(alert.severity)}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getCategoryIcon(alert.category)} {alert.category}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {alert.title}
              </h3>

              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                {alert.description}
              </p>

              {alert.facilityId && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  📍 Facility: {alert.facilityId}
                </div>
              )}

              {alert.suggestedAction && (
                <div className="bg-white dark:bg-gray-700 rounded p-2 mb-2">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    💡 Suggested Action:
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {alert.suggestedAction}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Source: {alert.source}
                </span>

                {!alert.acknowledged && alert.actionRequired && onAcknowledge && (
                  <button
                    onClick={() => onAcknowledge(alert.alertId)}
                    className="px-3 py-1 bg-gray-800 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                  >
                    Acknowledge
                  </button>
                )}

                {alert.acknowledged && (
                  <span className="text-xs text-green-600 dark:text-green-400">
                    ✓ Acknowledged by {alert.acknowledgedBy} at{' '}
                    {alert.acknowledgedAt && new Date(alert.acknowledgedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
