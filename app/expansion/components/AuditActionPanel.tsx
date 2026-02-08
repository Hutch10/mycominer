'use client';

import { AuditRecord } from '../engine/expansionTypes';
import { useState } from 'react';

interface AuditActionPanelProps {
  records: AuditRecord[];
  onStatusChange: (id: string, status: AuditRecord['status']) => void;
  onExport: () => void;
  onClearAll: () => void;
}

export function AuditActionPanel({ records, onStatusChange, onExport, onClearAll }: AuditActionPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pendingCount = records.filter((r) => r.status === 'pending').length;
  const acceptedCount = records.filter((r) => r.status === 'accepted').length;
  const rejectedCount = records.filter((r) => r.status === 'rejected').length;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Audit Controls & Status</h3>
        <div className="flex gap-2">
          <button
            onClick={onExport}
            className="px-3 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50"
          >
            Export JSON
          </button>
          <button
            onClick={onClearAll}
            className="px-3 py-1 text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-100 dark:hover:bg-red-900/50"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded">
          <p className="text-xs uppercase text-yellow-700 dark:text-yellow-300">Pending</p>
          <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{pendingCount}</p>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded">
          <p className="text-xs uppercase text-green-700 dark:text-green-300">Accepted</p>
          <p className="text-2xl font-bold text-green-800 dark:text-green-200">{acceptedCount}</p>
        </div>
        <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded">
          <p className="text-xs uppercase text-red-700 dark:text-red-300">Rejected</p>
          <p className="text-2xl font-bold text-red-800 dark:text-red-200">{rejectedCount}</p>
        </div>
      </div>

      <div className="space-y-2">
        {records.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No audit records yet.</p>
        ) : (
          records.map((record) => (
            <div
              key={record.id}
              onClick={() => setSelectedId(record.id)}
              className={`p-3 rounded border cursor-pointer transition-all ${
                selectedId === record.id
                  ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 hover:border-gray-200 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{record.summary}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{record.targetPath}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    record.status === 'pending'
                      ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200'
                      : record.status === 'accepted'
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200'
                  }`}
                >
                  {record.status}
                </span>
              </div>

              {selectedId === record.id && record.status === 'pending' && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(record.id, 'accepted');
                    }}
                    className="flex-1 px-3 py-2 text-xs font-medium bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(record.id, 'rejected');
                    }}
                    className="flex-1 px-3 py-2 text-xs font-medium bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
