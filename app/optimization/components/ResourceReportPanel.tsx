'use client';

import { ResourceOptimizationReport } from '@/app/optimization/optimizationTypes';

interface Props {
  report: ResourceOptimizationReport;
}

export function ResourceReportPanel({ report }: Props) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-amber-700">Resource Analysis</div>
          <h2 className="text-xl font-bold text-amber-900">Optimization report</h2>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-amber-900">${report.totalWasteCost}</div>
          <div className="text-xs text-amber-700">Waste cost</div>
        </div>
      </div>

      {report.substrateMaterials.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-semibold text-amber-900 mb-2">Substrate analysis</div>
          <div className="space-y-2">
            {report.substrateMaterials.map((sub) => (
              <div key={sub.material} className="rounded-lg bg-white p-3 text-sm text-amber-800">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{sub.material}</span>
                  <span className="text-amber-700">{sub.variance > 0 ? '+' : ''}{sub.variance.toFixed(1)} kg</span>
                </div>
                <div className="text-xs opacity-75 mt-1">Efficiency: {(sub.efficiency * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.equipmentUtilization.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-semibold text-amber-900 mb-2">Equipment utilization</div>
          <div className="space-y-2">
            {report.equipmentUtilization.map((eq) => (
              <div key={eq.equipmentId} className="rounded-lg bg-white p-3 text-sm text-amber-800">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{eq.name}</span>
                  <span className="text-amber-700">{eq.utilizationPercent}%</span>
                </div>
                <div className="w-full bg-amber-100 rounded h-2 mt-2">
                  <div className="bg-amber-600 h-2 rounded" style={{ width: `${eq.utilizationPercent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.bottlenecks.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-semibold text-amber-900 mb-2">Bottlenecks</div>
          <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
            {report.bottlenecks.map((bn, i) => (
              <li key={i}>{bn.resource} ({bn.severity})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
