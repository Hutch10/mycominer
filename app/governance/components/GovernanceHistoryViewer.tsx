/**
 * Phase 44: System Governance - Governance History Viewer Component
 * 
 * View historical governance log entries with filtering and trend analysis.
 */

'use client';

import React from 'react';
import { GovernanceLogEntry, GovernanceAction } from '../governanceTypes';

interface GovernanceHistoryViewerProps {
  entries: GovernanceLogEntry[];
  onFilterBySubject?: (subjectId: string) => void;
  onFilterByAction?: (action: GovernanceAction) => void;
}

export function GovernanceHistoryViewer({
  entries,
  onFilterBySubject,
  onFilterByAction
}: GovernanceHistoryViewerProps) {
  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = entries.length;
    const allowed = entries.filter(e => e.allowed).length;
    const denied = entries.filter(e => !e.allowed).length;

    // Get unique subjects and actions
    const subjects = new Set(entries.map(e => e.subjectId));
    const actions = new Set(entries.map(e => e.action));

    // Top denied actions
    const deniedByAction: Record<string, number> = {};
    for (const entry of entries.filter(e => !e.allowed)) {
      const action = entry.action as string;
      if (action) {
        deniedByAction[action] = (deniedByAction[action] || 0) + 1;
      }
    }
    const topDenied = Object.entries(deniedByAction)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // Recent trend (last 7 entries)
    const recent = entries.slice(-7);
    const recentAllowed = recent.filter(e => e.allowed).length;
    const recentDenied = recent.filter(e => !e.allowed).length;

    return {
      total,
      allowed,
      denied,
      allowRate: total > 0 ? (allowed / total) * 100 : 0,
      subjects: subjects.size,
      actions: actions.size,
      topDenied,
      recentAllowed,
      recentDenied
    };
  }, [entries]);

  // Group entries by day
  const entriesByDay = React.useMemo(() => {
    const grouped: Record<string, GovernanceLogEntry[]> = {};
    for (const entry of entries) {
      const day = entry.timestamp.split('T')[0];
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push(entry);
    }
    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
  }, [entries]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Governance History</h3>
        <div className="text-sm text-gray-600">
          {entries.length} total entries
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-5 gap-4">
        <div className="border border-gray-200 rounded bg-white p-4">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold mt-1">{stats.total}</div>
        </div>
        <div className="border border-green-200 rounded bg-green-50 p-4">
          <div className="text-sm text-green-700">Allowed</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.allowed}</div>
        </div>
        <div className="border border-red-200 rounded bg-red-50 p-4">
          <div className="text-sm text-red-700">Denied</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats.denied}</div>
        </div>
        <div className="border border-blue-200 rounded bg-blue-50 p-4">
          <div className="text-sm text-blue-700">Subjects</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.subjects}</div>
        </div>
        <div className="border border-purple-200 rounded bg-purple-50 p-4">
          <div className="text-sm text-purple-700">Actions</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{stats.actions}</div>
        </div>
      </div>

      {/* Allow Rate */}
      <div className="border border-gray-200 rounded bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Allow Rate</span>
          <span className="text-sm text-gray-600">{stats.allowRate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${stats.allowRate}%` }}
          ></div>
        </div>
      </div>

      {/* Top Denied Actions */}
      {stats.topDenied.length > 0 && (
        <div className="border border-gray-200 rounded bg-white p-4">
          <h4 className="font-medium text-sm mb-3">Top Denied Actions</h4>
          <div className="space-y-2">
            {stats.topDenied.map(([action, count]) => (
              <div key={action} className="flex items-center justify-between">
                <button
                  onClick={() => onFilterByAction && onFilterByAction(action as GovernanceAction)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {action}
                </button>
                <span className="text-sm font-medium text-red-600">{count} denials</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Trend */}
      <div className="border border-gray-200 rounded bg-white p-4">
        <h4 className="font-medium text-sm mb-3">Recent Trend (Last 7 Entries)</h4>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm">{stats.recentAllowed} allowed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-sm">{stats.recentDenied} denied</span>
          </div>
        </div>
      </div>

      {/* History by Day */}
      <div className="border border-gray-200 rounded bg-white max-h-96 overflow-y-auto">
        {entriesByDay.map(([day, dayEntries]) => (
          <div key={day} className="border-b border-gray-100 last:border-b-0">
            <div className="bg-gray-50 px-4 py-2 font-medium text-sm flex items-center justify-between sticky top-0">
              <span>{new Date(day).toLocaleDateString()}</span>
              <span className="text-gray-600">
                {dayEntries.length} entries
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {dayEntries.slice().reverse().map(entry => (
                <div key={entry.id} className="px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${entry.allowed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <button
                          onClick={() => onFilterBySubject && onFilterBySubject(entry.subjectId)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          {entry.subjectId}
                        </button>
                        <span className="text-xs text-gray-500">→</span>
                        <button
                          onClick={() => onFilterByAction && entry.action && onFilterByAction(entry.action)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          {entry.action || 'N/A'}
                        </button>
                        <span className="text-xs text-gray-500">on</span>
                        <span className="text-sm text-gray-700">{entry.resourceName}</span>
                      </div>
                      {entry.rationale && (
                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {entry.rationale}
                        </div>
                      )}
                      {entry.matchedRoles && entry.matchedRoles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.matchedRoles.map(roleId => (
                            <span key={roleId} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              {roleId}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
