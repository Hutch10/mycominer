'use client';

import { ContaminationRiskMap } from '@/app/simulation/engine/simulationTypes';

export default function ContaminationRiskPanel({ risk }: { risk: ContaminationRiskMap }) {
  const riskColor = {
    low: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    medium: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    high: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  }[risk.overallRisk];

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">Contamination Risk</h4>
        <span className={`px-2 py-1 text-xs rounded font-medium ${riskColor}`}>
          {risk.overallRisk.toUpperCase()} ({risk.score}/100)
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Risk Factors:</p>
          <ul className="list-disc list-inside text-xs space-y-0.5">
            {risk.factors.highHumidityZones.length > 0 && (
              <li>High humidity zones: {risk.factors.highHumidityZones.length}</li>
            )}
            {risk.factors.poorAirflowZones.length > 0 && (
              <li>Poor airflow zones: {risk.factors.poorAirflowZones.length}</li>
            )}
            <li>Spore load estimate: {risk.factors.sporeLoadEstimate}/100</li>
            {risk.factors.temperatureFluctuations > 3 && (
              <li>Temperature variance: {risk.factors.temperatureFluctuations.toFixed(1)}°C</li>
            )}
          </ul>
        </div>

        {risk.recommendations.length > 0 && (
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <p className="font-medium text-blue-800 dark:text-blue-200 text-xs mb-1">Recommendations:</p>
            <ul className="list-disc list-inside text-xs text-blue-700 dark:text-blue-300 space-y-0.5">
              {risk.recommendations.slice(0, 2).map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-3 italic">
        Model-based projection • Not a real-world guarantee
      </p>
    </div>
  );
}
