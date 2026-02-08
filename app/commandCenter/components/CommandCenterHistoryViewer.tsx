'use client';

import { useState } from 'react';
import { commandCenterLog } from '../commandCenterLog';

export function CommandCenterHistoryViewer() {
  const [filter, setFilter] = useState<string>('all');
  const [count, setCount] = useState(20);

  const logs =
    filter === 'all' ? commandCenterLog.getRecent(count) : commandCenterLog.list(filter as any);

  const getCategoryBadge = (category: string) => {
    const badges: Record<string, { color: string; icon: string }> = {
      aggregation: { color: 'bg-blue-100 text-blue-800', icon: '🔄' },
      'alert-generated': { color: 'bg-red-100 text-red-800', icon: '🚨' },
      'alert-acknowledged': { color: 'bg-green-100 text-green-800', icon: '✓' },
      'action-recommended': { color: 'bg-purple-100 text-purple-800', icon: '💡' },
      'action-approved': { color: 'bg-green-100 text-green-800', icon: '✓' },
      'action-rejected': { color: 'bg-red-100 text-red-800', icon: '✕' },
      'health-change': { color: 'bg-yellow-100 text-yellow-800', icon: '📊' },
      'kpi-threshold': { color: 'bg-orange-100 text-orange-800', icon: '⚠️' },
      export: { color: 'bg-gray-100 text-gray-800', icon: '📤' },
    };

    const badge = badges[category] || { color: 'bg-gray-100 text-gray-800', icon: '•' };

    return (
      <span className={`px-2 py-1 text-xs rounded ${badge.color}`}>
        {badge.icon} {category}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        📜 Activity History
      </h2>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('aggregation')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'aggregation'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            Aggregation
          </button>
          <button
            onClick={() => setFilter('alert-generated')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'alert-generated'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            Alerts
          </button>
          <button
            onClick={() => setFilter('action-approved')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'action-approved'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            Actions
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Show:</label>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700 dark:border-gray-600"
          >
            <option value={10}>10 entries</option>
            <option value={20}>20 entries</option>
            <option value={50}>50 entries</option>
            <option value={100}>100 entries</option>
          </select>
        </div>
      </div>

      {/* Logs List */}
      {logs.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No activity logs yet
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.entryId}
              className="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-r p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                {getCategoryBadge(log.category)}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>

              <p className="text-sm text-gray-900 dark:text-white font-medium mb-1">
                {log.message}
              </p>

              {log.context && Object.keys(log.context).length > 0 && (
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {log.context.alertId && <div>Alert: {log.context.alertId}</div>}
                  {log.context.actionId && <div>Action: {log.context.actionId}</div>}
                  {log.context.facilityId && <div>Facility: {log.context.facilityId}</div>}
                  {log.context.userId && <div>User: {log.context.userId}</div>}
                </div>
              )}

              {log.details && Object.keys(log.details).length > 0 && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                    View details
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Export Button */}
      <div className="mt-6 pt-6 border-t dark:border-gray-700 flex justify-end">
        <button
          onClick={() => {
            const data = JSON.stringify(commandCenterLog.export(), null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `command-center-history-${Date.now()}.json`;
            a.click();
          }}
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 transition-colors"
        >
          📤 Export History
        </button>
      </div>
    </div>
  );
}
