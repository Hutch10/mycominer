'use client';

import { ExecutionLogEntry } from '@/app/execution/executionTypes';

interface Props {
  entries: ExecutionLogEntry[];
}

export function ExecutionHistoryViewer({ entries }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">Execution History</div>
          <h2 className="text-xl font-bold text-slate-900">Log</h2>
          <p className="text-sm text-slate-600">{entries.length} entries</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {entries.map(entry => (
          <div key={entry.entryId} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
              <span>{entry.category}</span>
              <span className="text-slate-500">{entry.timestamp}</span>
            </div>
            <p className="text-sm text-slate-700 mt-1">{entry.message}</p>
            {entry.details != null && (
              <pre className="mt-2 rounded bg-white p-2 text-xs text-slate-700 border border-slate-100 overflow-x-auto">
                {JSON.stringify(entry.details, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
