// Phase 19: Workflow History Viewer Component
// Displays workflow log entries with filtering and export

'use client';

import React, { useState } from 'react';
import { WorkflowLogEntry, WorkflowLogCategory } from '@/app/workflow/workflowTypes';

interface WorkflowHistoryViewerProps {
  entries: WorkflowLogEntry[];
  isDarkMode?: boolean;
  onExport?: () => void;
}

const CATEGORIES: WorkflowLogCategory[] = [
  'workflow-generation',
  'schedule-proposal',
  'conflict-detection',
  'workflow-plan',
  'audit',
  'approval',
  'rejection',
  'execution',
  'rollback',
  'export',
];

export const WorkflowHistoryViewer: React.FC<WorkflowHistoryViewerProps> = ({
  entries,
  isDarkMode = false,
  onExport,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<WorkflowLogCategory | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const filteredEntries = selectedCategory
    ? entries.filter(e => e.category === selectedCategory)
    : entries;

  const categoryColors: Record<WorkflowLogCategory, string> = {
    'workflow-generation': isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50',
    'schedule-proposal': isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50',
    'conflict-detection': isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50',
    'workflow-plan': isDarkMode ? 'bg-green-900/20' : 'bg-green-50',
    'audit': isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-50',
    'approval': isDarkMode ? 'bg-emerald-900/20' : 'bg-emerald-50',
    'rejection': isDarkMode ? 'bg-red-900/20' : 'bg-red-50',
    'execution': isDarkMode ? 'bg-cyan-900/20' : 'bg-cyan-50',
    'rollback': isDarkMode ? 'bg-rose-900/20' : 'bg-rose-50',
    'export': isDarkMode ? 'bg-gray-900/20' : 'bg-gray-50',
  };

  const statusColors: Record<string, string> = {
    success: isDarkMode ? 'text-green-400' : 'text-green-600',
    warning: isDarkMode ? 'text-yellow-400' : 'text-yellow-600',
    failure: isDarkMode ? 'text-red-400' : 'text-red-600',
  };

  return (
    <div className={`rounded border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="p-4 border-b border-inherit">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Workflow History ({filteredEntries.length})
          </h3>
          {onExport && (
            <button
              onClick={onExport}
              className="px-3 py-1 rounded text-sm bg-blue-600 text-white hover:bg-blue-700"
            >
              Export
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded text-xs font-medium ${
              selectedCategory === null
                ? 'bg-gray-600 text-white'
                : isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded text-xs font-medium ${
                selectedCategory === cat
                  ? 'bg-gray-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat.split('-').pop()}
            </button>
          ))}
        </div>
      </div>

      <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
        {filteredEntries.length === 0 ? (
          <div className={`p-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No entries found
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.entryId}
              onClick={() => setExpandedEntry(expandedEntry === entry.entryId ? null : entry.entryId)}
              className={`p-4 cursor-pointer transition-colors ${
                categoryColors[entry.category]
              } hover:opacity-75`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-mono ${statusColors[entry.status]}`}>
                      [{entry.status.toUpperCase()}]
                    </span>
                    <span
                      className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      {entry.category}
                    </span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {entry.message}
                  </p>
                  <p
                    className={`text-xs opacity-60 mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
                <span className={`text-lg ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {expandedEntry === entry.entryId ? '▼' : '▶'}
                </span>
              </div>

              {expandedEntry === entry.entryId && (
                <div
                  className={`mt-3 p-3 rounded text-xs font-mono overflow-auto max-h-64 ${
                    isDarkMode ? 'bg-gray-900/50 text-gray-400' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {typeof entry.data === 'string' ? entry.data : JSON.stringify(entry.data, null, 2)}
                  </p>
                  {Object.keys(entry.context).length > 0 && (
                    <div className={`mt-2 pt-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                      <p className="font-semibold">Context:</p>
                      {Object.entries(entry.context).map(([key, value]) => (
                        <p key={key}>
                          {key}: {String(value)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
