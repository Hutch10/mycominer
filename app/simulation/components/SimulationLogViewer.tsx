'use client';

import { SimulationLogEntry } from '@/app/simulation/engine/simulationTypes';

export default function SimulationLogViewer({ logs }: { logs: SimulationLogEntry[] }) {
  const categoryColors: Record<SimulationLogEntry['category'], string> = {
    simulation: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    'twin-generation': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    environmental: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    contamination: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    loop: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    export: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  };

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-3">Simulation Log</h3>
      {logs.length === 0 ? (
        <p className="text-sm text-gray-500">No log entries yet.</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 text-xs rounded ${categoryColors[log.category]}`}>
                  {log.category}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{log.message}</p>
              {log.context && Object.keys(log.context).length > 0 && (
                <details className="mt-1">
                  <summary className="text-xs text-gray-500 cursor-pointer">Context</summary>
                  <pre className="text-xs text-gray-600 dark:text-gray-400 mt-1 overflow-x-auto">
                    {JSON.stringify(log.context, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
