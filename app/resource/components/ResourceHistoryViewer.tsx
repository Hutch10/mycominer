// Phase 20: Resource History Viewer Component
// Displays resource operation logs with filtering

'use client';

import { useState } from 'react';
import { ResourceLogEntry } from '@/app/resource/resourceTypes';

interface ResourceHistoryViewerProps {
  logs: ResourceLogEntry[];
}

export function ResourceHistoryViewer({ logs }: ResourceHistoryViewerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const categories: Array<ResourceLogEntry['category'] | 'all'> = [
    'all',
    'requirement-generation',
    'allocation-creation',
    'forecast-generation',
    'audit',
    'approval',
    'rejection',
    'replenishment-proposal',
    'inventory-update',
    'execution',
    'rollback',
    'export',
  ];

  const filteredLogs = selectedCategory === 'all'
    ? logs
    : logs.filter(log => log.category === selectedCategory);

  const categoryColors: Record<ResourceLogEntry['category'], string> = {
    'requirement-generation': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'allocation-creation': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'forecast-generation': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    'allocation-plan': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    audit: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    approval: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    rejection: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    'replenishment-proposal': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    'inventory-update': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    execution: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    rollback: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    forecast: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    consumption: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    return: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    export: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Resource Operation History
        </h2>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredLogs.length} entries
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {category === 'all' ? 'All' : category.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Log Entries */}
      <div className="space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No log entries found
          </div>
        ) : (
          filteredLogs.map(entry => (
            <div
              key={entry.entryId}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              {/* Entry Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        categoryColors[entry.category]
                      }`}
                    >
                      {entry.category}
                    </span>

                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-sm text-gray-900 dark:text-white">
                    {entry.message}
                  </div>
                </div>

                {entry.context && (
                  <button
                    onClick={() =>
                      setExpandedEntry(expandedEntry === entry.entryId ? null : entry.entryId)
                    }
                    className="ml-4 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {expandedEntry === entry.entryId ? 'Hide Details' : 'Show Details'}
                  </button>
                )}
              </div>

              {/* Context (Expandable) */}
              {expandedEntry === entry.entryId && entry.context && (
                <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-900 rounded">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                    Context Details
                  </div>
                  <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                    {JSON.stringify(entry.context, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
