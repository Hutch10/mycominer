'use client';

import React, { useState } from 'react';
import { MultiFacilityLogEntry } from '../multiFacilityTypes';

interface MultiFacilityHistoryViewerProps {
  entries: MultiFacilityLogEntry[];
}

const categoryColors: Record<string, string> = {
  aggregation: 'bg-slate-100 text-slate-800',
  insight: 'bg-blue-100 text-blue-800',
  'shared-resource-plan': 'bg-amber-100 text-amber-800',
  'global-proposal': 'bg-indigo-100 text-indigo-800',
  audit: 'bg-purple-100 text-purple-800',
  approval: 'bg-emerald-100 text-emerald-800',
  rejection: 'bg-rose-100 text-rose-800',
  implementation: 'bg-cyan-100 text-cyan-800',
  rollback: 'bg-orange-100 text-orange-800',
  export: 'bg-gray-100 text-gray-800',
};

export const MultiFacilityHistoryViewer: React.FC<MultiFacilityHistoryViewerProps> = ({
  entries,
}) => {
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const filteredEntries = filterCategory
    ? entries.filter((e) => e.category === filterCategory)
    : entries;

  const categories = Array.from(new Set(entries.map((e) => e.category)));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Cross-Facility Event History</h3>
        <p className="text-sm text-gray-600">{filteredEntries.length} event(s)</p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategory(null)}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
            filterCategory === null
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({entries.length})
        </button>
        {categories.map((cat) => {
          const count = entries.filter((e) => e.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                filterCategory === cat
                  ? categoryColors[cat] || 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.replace('-', ' ')} ({count})
            </button>
          );
        })}
      </div>

      {/* History Entries */}
      {filteredEntries.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 text-sm">No events in history</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg bg-white">
          {filteredEntries
            .slice()
            .reverse()
            .map((entry) => {
              const isExpanded = expandedEntryId === entry.entryId;
              const categoryColor = categoryColors[entry.category] || 'bg-gray-100 text-gray-800';

              return (
                <div
                  key={entry.entryId}
                  className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors hover:bg-gray-50 ${
                    isExpanded ? 'bg-gray-50' : ''
                  }`}
                  onClick={() =>
                    setExpandedEntryId(isExpanded ? null : entry.entryId)
                  }
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${categoryColor}`}>
                          {entry.category.replace('-', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 font-semibold truncate">
                        {entry.message}
                      </p>
                      {entry.context.affectedFacilities && entry.context.affectedFacilities.length > 0 && (
                        <p className="text-xs text-gray-600 mt-1">
                          Facilities: {entry.context.affectedFacilities.join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="ml-2 text-lg">{isExpanded ? '▼' : '▶'}</span>
                  </div>

                  {isExpanded && entry.details && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-700 bg-gray-100 p-2 rounded">
                      <pre className="whitespace-pre-wrap break-words overflow-x-auto">
                        {JSON.stringify(entry.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};
