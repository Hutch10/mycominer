'use client';

import { OptimizationLogEntry } from '@/app/optimization/optimizationTypes';

interface Props {
  entries: OptimizationLogEntry[];
}

export function OptimizationHistoryViewer({ entries }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">Optimization History</div>
          <h2 className="text-xl font-bold text-slate-900">Log</h2>
          <p className="text-sm text-slate-600">{entries.length} entries</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {entries.slice(0, 10).map((entry) => {
          const categoryColor =
            entry.category === 'energy-analysis'
              ? 'bg-emerald-50 text-emerald-700'
              : entry.category === 'resource-analysis'
              ? 'bg-amber-50 text-amber-700'
              : entry.category === 'load-analysis'
              ? 'bg-indigo-50 text-indigo-700'
              : entry.category === 'proposal'
              ? 'bg-blue-50 text-blue-700'
              : entry.category === 'audit'
              ? 'bg-slate-100 text-slate-700'
              : 'bg-slate-50 text-slate-600';

          return (
            <div key={entry.entryId} className={`rounded-lg ${categoryColor} p-3`}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{entry.category}</span>
                <span className="text-xs opacity-75">{new Date(entry.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-sm mt-1">{entry.message}</p>
              {entry.details && (
                <pre className="mt-2 rounded bg-white bg-opacity-50 p-2 text-xs font-mono overflow-x-auto">
                  {JSON.stringify(entry.details, null, 1)}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
