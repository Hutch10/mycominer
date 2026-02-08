'use client';

import { EnergyOptimizationReport } from '@/app/optimization/optimizationTypes';

interface Props {
  report: EnergyOptimizationReport;
}

export function EnergyReportPanel({ report }: Props) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-emerald-700">Energy Analysis</div>
          <h2 className="text-xl font-bold text-emerald-900">Optimization report</h2>
          <p className="text-sm text-emerald-800">Period: {report.period}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-900">${report.estimatedCostSavingsDollars}</div>
          <div className="text-xs text-emerald-700">Potential savings</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-emerald-900">
        <div className="rounded-lg bg-white p-3">
          <div className="opacity-75">Total energy</div>
          <div className="font-semibold">{report.totalEnergyKwh} kWh</div>
        </div>
        <div className="rounded-lg bg-white p-3">
          <div className="opacity-75">Waste detected</div>
          <div className="font-semibold">{report.totalWasteKwh} kWh</div>
        </div>
        <div className="rounded-lg bg-white p-3">
          <div className="opacity-75">Confidence</div>
          <div className="font-semibold">{report.confidence}%</div>
        </div>
      </div>

      {report.inefficiencies.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-sm font-semibold text-emerald-900">Key inefficiencies</div>
          {report.inefficiencies.slice(0, 3).map((ineff) => (
            <div key={ineff.inefficiencyId} className="rounded-lg bg-white p-3 text-sm text-emerald-800">
              <div className="flex items-center justify-between">
                <span className="font-medium">{ineff.type}</span>
                <span className="text-emerald-700">{ineff.percentageWaste}% waste</span>
              </div>
              <div className="text-xs opacity-75 mt-1">{ineff.deviceId}</div>
            </div>
          ))}
        </div>
      )}

      {report.topOpportunities.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-semibold text-emerald-900 mb-2">Top opportunities</div>
          <ul className="list-disc list-inside space-y-1 text-sm text-emerald-800">
            {report.topOpportunities.slice(0, 3).map((opp, i) => (
              <li key={i}>{opp}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
