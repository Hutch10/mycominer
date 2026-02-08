'use client';

import { EnvironmentalAlert } from '../engine/telemetryTypes';

interface AlertPanelProps {
  alerts: EnvironmentalAlert[];
  onDismiss: (id: string) => void;
}

const severityConfig = {
  info: { bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-300 dark:border-blue-700', text: 'text-blue-800 dark:text-blue-200' },
  warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', border: 'border-yellow-300 dark:border-yellow-700', text: 'text-yellow-800 dark:text-yellow-200' },
  critical: { bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-300 dark:border-red-700', text: 'text-red-800 dark:text-red-200' },
};

export function AlertPanel({ alerts, onDismiss }: AlertPanelProps) {
  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg p-4 text-center">
        <p className="text-sm font-medium text-green-800 dark:text-green-200">✓ All systems normal</p>
      </div>
    );
  }

  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return (
    <div className="space-y-2">
      {sortedAlerts.map((alert) => {
        const config = severityConfig[alert.severity];
        return (
          <div key={alert.id} className={`${config.bg} border ${config.border} rounded-lg p-3`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className={`text-sm font-semibold ${config.text}`}>{alert.message}</p>
                <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">{alert.cause}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">→ {alert.recommendedAction}</p>
                {alert.relatedPageHref && (
                  <a href={alert.relatedPageHref} className="text-xs text-blue-600 dark:text-blue-300 hover:underline mt-1">
                    Learn more
                  </a>
                )}
              </div>
              {alert.dismissable && (
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="px-2 py-1 text-xs font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
