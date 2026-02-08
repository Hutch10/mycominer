'use client';

// Phase 26: Research History Viewer
// Shows research log with filtering and export

import { useState } from 'react';
import { researchLog } from '../researchLog';
import type { ResearchLogCategory } from '../researchTypes';

export function ResearchHistoryViewer() {
  const [filter, setFilter] = useState<ResearchLogCategory | 'all'>('all');

  const entries = filter === 'all' ? researchLog.getRecent(50) : researchLog.list(filter);

  const categories: Array<ResearchLogCategory | 'all'> = [
    'all',
    'experiment-designed',
    'approved',
    'rejected',
    'started',
    'completed',
    'comparison-generated',
    'insight-generated',
    'report-generated',
    'export',
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'experiment-designed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      case 'started':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      case 'completed':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200';
      case 'comparison-generated':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200';
      case 'insight-generated':
        return 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200';
      case 'report-generated':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const handleExport = () => {
    const data = researchLog.export();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-log-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Research History
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Complete log of research activities
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Export Log
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              filter === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {cat === 'all' ? 'All' : cat.replace(/-/g, ' ')}
          </button>
        ))}
      </div>

      {/* Log entries */}
      <div className="space-y-2">
        {entries.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No log entries found
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.entryId}
              className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 text-xs rounded ${getCategoryColor(entry.category)}`}>
                      {entry.category}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-gray-900 dark:text-gray-100">{entry.message}</div>
                </div>
              </div>

              {entry.context.experimentId && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Experiment: {entry.context.experimentId}
                </div>
              )}

              {entry.context.facilityId && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Facility: {entry.context.facilityId}
                </div>
              )}

              {(() => {
                const details = entry.details as Record<string, unknown> | undefined;
                if (!details || Object.keys(details).length === 0) return null;
                return (
                  <details className="mt-2">
                    <summary className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                      View Details
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs overflow-auto">
                      {JSON.stringify(details, null, 2)}
                    </pre>
                  </details>
                );
              })()}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
