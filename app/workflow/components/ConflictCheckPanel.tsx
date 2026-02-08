// Phase 19: Conflict Check Panel Component
// Displays detected conflicts and recommendations

'use client';

import React from 'react';
import { ConflictCheckResult } from '@/app/workflow/workflowTypes';

interface ConflictCheckPanelProps {
  result: ConflictCheckResult;
  isDarkMode?: boolean;
}

export const ConflictCheckPanel: React.FC<ConflictCheckPanelProps> = ({
  result,
  isDarkMode = false,
}) => {
  const decisionColors: Record<string, string> = {
    allow: isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-300',
    warn: isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-300',
    block: isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-300',
  };

  const decisionBadgeColors: Record<string, string> = {
    allow: 'bg-green-600 text-white',
    warn: 'bg-yellow-600 text-white',
    block: 'bg-red-600 text-white',
  };

  const severityColors: Record<string, string> = {
    critical: isDarkMode ? 'text-red-400' : 'text-red-600',
    warning: isDarkMode ? 'text-yellow-400' : 'text-yellow-600',
    info: isDarkMode ? 'text-blue-400' : 'text-blue-600',
  };

  return (
    <div
      className={`
        p-4 rounded border
        ${decisionColors[result.decision]}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Conflict Check Results
        </h3>
        <span className={`px-3 py-1 rounded text-sm font-medium ${decisionBadgeColors[result.decision]}`}>
          {result.decision.toUpperCase()}
        </span>
      </div>

      <div className={`p-3 rounded mb-4 text-sm ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{result.rationale}</p>
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold mb-2 opacity-75">
          Conflicts Detected ({result.conflicts.length})
        </p>
        {result.conflicts.length === 0 ? (
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No conflicts detected
          </p>
        ) : (
          <div className="space-y-2">
            {result.conflicts.map((conflict) => (
              <div
                key={conflict.conflictId}
                className={`p-2 rounded border ${
                  conflict.severity === 'critical'
                    ? isDarkMode
                      ? 'bg-red-900/10 border-red-700'
                      : 'bg-red-50 border-red-200'
                    : conflict.severity === 'warning'
                    ? isDarkMode
                      ? 'bg-yellow-900/10 border-yellow-700'
                      : 'bg-yellow-50 border-yellow-200'
                    : isDarkMode
                    ? 'bg-blue-900/10 border-blue-700'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`text-xs font-semibold ${severityColors[conflict.severity]}`}>
                    {conflict.severity.toUpperCase()}
                  </span>
                  <div className="flex-1">
                    <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {conflict.type}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {conflict.description}
                    </p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-700'}`}>
                      <strong>Action:</strong> {conflict.recommendedAction}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {result.recommendations.length > 0 && (
        <div className={`p-3 rounded ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
          <p className="text-xs font-semibold mb-2">Recommendations</p>
          <ul className={`text-xs space-y-1 list-disc pl-4 ${isDarkMode ? 'text-blue-200' : 'text-blue-900'}`}>
            {result.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={`text-xs opacity-50 mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Checked: {new Date(result.timestamp).toLocaleString()} | Tasks: {result.checkedTasks.length}
      </div>
    </div>
  );
};
