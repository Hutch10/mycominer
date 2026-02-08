'use client';

import { LoopStabilityReport } from '@/app/simulation/engine/simulationTypes';

export default function LoopStabilityPanel({ report }: { report: LoopStabilityReport }) {
  const stabilityColor = {
    stable: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    oscillating: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    unstable: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  }[report.stability];

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">Loop Stability</h4>
        <span className={`px-2 py-1 text-xs rounded font-medium ${stabilityColor}`}>
          {report.stability.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-xs">Avg Deviation</p>
          <p className="font-medium">{report.averageDeviation.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-xs">Max Deviation</p>
          <p className="font-medium">{report.maxDeviation.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-xs">Device Cycles</p>
          <p className="font-medium">{report.cycleCount}</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-xs">Energy Usage</p>
          <p className="font-medium">{report.energyUsageKwh} kWh</p>
        </div>
      </div>

      {report.oscillationFrequency && (
        <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
          <p className="text-yellow-800 dark:text-yellow-200 text-xs">
            <span className="font-medium">Oscillation Frequency:</span> {report.oscillationFrequency.toFixed(1)} cycles/hr
          </p>
        </div>
      )}

      {report.recommendations.length > 0 && (
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
          <p className="font-medium text-blue-800 dark:text-blue-200 text-xs mb-1">Recommendations:</p>
          <ul className="list-disc list-inside text-xs text-blue-700 dark:text-blue-300 space-y-0.5">
            {report.recommendations.slice(0, 2).map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3">
        Duration: {report.duration} minutes
      </p>
    </div>
  );
}
