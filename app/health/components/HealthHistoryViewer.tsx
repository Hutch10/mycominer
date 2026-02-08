/**
 * Phase 43: System Health - Health History Viewer
 * Component for viewing historical health scan results and trends
 */

'use client';

import React, { useState } from 'react';
import { HealthLogEntry, HealthCategory, HealthSeverity } from '../healthTypes';

interface HealthHistoryViewerProps {
  logEntries: HealthLogEntry[];
  onSelectEntry: (entry: HealthLogEntry) => void;
}

export function HealthHistoryViewer({
  logEntries,
  onSelectEntry
}: HealthHistoryViewerProps) {
  const [filterType, setFilterType] = useState<HealthLogEntry['entryType'] | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<HealthSeverity | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEntries = logEntries.filter(entry => {
    if (filterType !== 'all' && entry.entryType !== filterType) return false;
    if (filterSeverity !== 'all' && entry.severity !== filterSeverity) return false;
    if (searchTerm && !entry.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getEntryTypeIcon = (entryType: HealthLogEntry['entryType']): string => {
    switch (entryType) {
      case 'query':
        return '🔍';
      case 'drift-finding':
        return '📊';
      case 'integrity-finding':
        return '🔗';
      case 'policy-evaluation':
        return '✅';
      default:
        return '📝';
    }
  };

  const getSeverityBadge = (severity?: HealthSeverity) => {
    if (!severity) return null;
    
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
      info: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[severity]}`}>
        {severity}
      </span>
    );
  };

  // Calculate statistics
  const stats = {
    total: logEntries.length,
    queries: logEntries.filter(e => e.entryType === 'query').length,
    driftFindings: logEntries.filter(e => e.entryType === 'drift-finding').length,
    integrityFindings: logEntries.filter(e => e.entryType === 'integrity-finding').length,
    policyEvaluations: logEntries.filter(e => e.entryType === 'policy-evaluation').length,
    critical: logEntries.filter(e => e.severity === 'critical').length
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-4">Health History</h3>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <div className="bg-gray-50 rounded p-2 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-600">Total Entries</div>
          </div>
          <div className="bg-blue-50 rounded p-2 text-center">
            <div className="text-2xl font-bold text-blue-900">{stats.queries}</div>
            <div className="text-xs text-blue-700">Queries</div>
          </div>
          <div className="bg-yellow-50 rounded p-2 text-center">
            <div className="text-2xl font-bold text-yellow-900">{stats.driftFindings}</div>
            <div className="text-xs text-yellow-700">Drift</div>
          </div>
          <div className="bg-purple-50 rounded p-2 text-center">
            <div className="text-2xl font-bold text-purple-900">{stats.integrityFindings}</div>
            <div className="text-xs text-purple-700">Integrity</div>
          </div>
          <div className="bg-red-50 rounded p-2 text-center">
            <div className="text-2xl font-bold text-red-900">{stats.critical}</div>
            <div className="text-xs text-red-700">Critical</div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Entry Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="query">Queries</option>
              <option value="drift-finding">Drift Findings</option>
              <option value="integrity-finding">Integrity Findings</option>
              <option value="policy-evaluation">Policy Evaluations</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Severity</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Info</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search descriptions..."
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No entries found matching your filters
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => onSelectEntry(entry)}
              className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center space-x-2 flex-1">
                  <span className="text-lg">{getEntryTypeIcon(entry.entryType)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {entry.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="ml-2">
                  {getSeverityBadge(entry.severity)}
                </div>
              </div>

              {entry.category && (
                <div className="ml-7">
                  <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                    {entry.category.replace(/-/g, ' ')}
                  </span>
                </div>
              )}

              {entry.context && Object.keys(entry.context).length > 0 && (
                <div className="ml-7 mt-1 text-xs text-gray-600">
                  {Object.entries(entry.context)
                    .slice(0, 2)
                    .map(([key, value]) => (
                      <span key={key} className="mr-3">
                        {key}: {String(value)}
                      </span>
                    ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {filteredEntries.length > 0 && (
        <div className="border-t border-gray-200 p-3 bg-gray-50 text-xs text-gray-600 text-center">
          Showing {filteredEntries.length} of {logEntries.length} entries
        </div>
      )}
    </div>
  );
}
