'use client';

import { ExchangeLogEntry } from '../engine/exchangeTypes';

interface ExchangeLogViewerProps {
  logs: ExchangeLogEntry[];
}

export function ExchangeLogViewer({ logs }: ExchangeLogViewerProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900">
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Exchange Log</p>
      {logs.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">No log entries</p>
      ) : (
        <div className="space-y-1 max-h-64 overflow-y-auto text-[11px] text-gray-700 dark:text-gray-300">
          {logs.map((l) => (
            <div key={l.id} className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1">
              <span>{new Date(l.timestamp).toLocaleTimeString()} • {l.category} • {l.message}</span>
              <span>{l.context?.id ?? ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
