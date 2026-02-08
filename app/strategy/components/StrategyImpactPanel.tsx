'use client';

import { StrategyImpactReport } from '@/app/strategy/engine/strategyTypes';

export default function StrategyImpactPanel({ report }: { report: StrategyImpactReport }) {
  const stabilityColors: Record<StrategyImpactReport['environmentalStability'], string> = {
    stable: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    oscillating: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    unstable: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  };

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold">Strategy Impact Report</h4>
        <span className={`px-2 py-1 text-xs rounded font-medium ${stabilityColors[report.environmentalStability]}`}>
          {report.environmentalStability}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-xs">Energy Usage</p>
          <p className="font-bold">{report.projectedEnergyUsage.toFixed(1)} kWh</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-xs">Contamination Risk</p>
          <p className="font-bold">{report.contaminationRiskScore}/100</p>
        </div>
        {report.projectedYield && (
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-xs">Projected Yield</p>
            <p className="font-bold">{report.projectedYield.toFixed(0)} units</p>
          </div>
        )}
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-xs">Duration</p>
          <p className="font-bold">{report.duration} min</p>
        </div>
      </div>

      {report.positiveOutcomes.length > 0 && (
        <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 rounded">
          <p className="font-medium text-green-800 dark:text-green-200 text-xs mb-1">✅ Positive Outcomes:</p>
          <ul className="list-disc list-inside text-xs text-green-700 dark:text-green-300 space-y-0.5">
            {report.positiveOutcomes.map((outcome, idx) => (
              <li key={idx}>{outcome}</li>
            ))}
          </ul>
        </div>
      )}

      {report.warnings.length > 0 && (
        <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
          <p className="font-medium text-yellow-800 dark:text-yellow-200 text-xs mb-1">⚠️ Warnings:</p>
          <ul className="list-disc list-inside text-xs text-yellow-700 dark:text-yellow-300 space-y-0.5">
            {report.warnings.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {report.sideEffects.length > 0 && (
        <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded">
          <p className="font-medium text-red-800 dark:text-red-200 text-xs mb-1">⚠️ Potential Side Effects:</p>
          <ul className="list-disc list-inside text-xs text-red-700 dark:text-red-300 space-y-0.5">
            {report.sideEffects.map((effect, idx) => (
              <li key={idx}>{effect}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-gray-500 italic mt-3">{report.summary}</p>
    </div>
  );
}
