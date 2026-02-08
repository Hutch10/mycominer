'use client';

import { SimulationReport } from '@/app/simulation/engine/simulationTypes';
import EnvironmentalCurvePanel from '@/app/simulation/components/EnvironmentalCurvePanel';
import ContaminationRiskPanel from '@/app/simulation/components/ContaminationRiskPanel';
import LoopStabilityPanel from '@/app/simulation/components/LoopStabilityPanel';

export default function SimulationReportCard({ report }: { report: SimulationReport }) {
  return (
    <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 space-y-4">
      <div className="border-b pb-4">
        <h3 className="text-xl font-bold mb-2">{report.scenarioName}</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p>{report.summary}</p>
          <p className="text-xs">
            Completed: {new Date(report.timestamp).toLocaleString()} • Duration: {report.duration} min
          </p>
        </div>
      </div>

      {report.warnings.length > 0 && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
          <p className="font-semibold text-yellow-800 dark:text-yellow-200 text-sm mb-2">⚠️ Warnings</p>
          <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            {report.warnings.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {report.recommendations.length > 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
          <p className="font-semibold text-blue-800 dark:text-blue-200 text-sm mb-2">💡 Recommendations</p>
          <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
            {report.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {report.environmentalCurves.slice(0, 3).map((curve) => (
          <EnvironmentalCurvePanel key={curve.roomId} curve={curve} />
        ))}
        {report.contaminationRisks.slice(0, 3).map((risk) => (
          <ContaminationRiskPanel key={risk.roomId} risk={risk} />
        ))}
        {report.loopStability.slice(0, 3).map((loop) => (
          <LoopStabilityPanel key={loop.id} report={loop} />
        ))}
      </div>

      {report.energyUsageKwh > 0 && (
        <div className="pt-3 border-t text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            <span className="font-medium">Total Energy Usage:</span> {report.energyUsageKwh} kWh
          </p>
        </div>
      )}
    </div>
  );
}
