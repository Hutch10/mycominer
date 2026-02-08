'use client';

import { ExecutionStatusReport } from '@/app/execution/executionTypes';

interface Props {
  report: ExecutionStatusReport;
}

export function ExecutionMonitorPanel({ report }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">Execution Monitor</div>
          <h2 className="text-xl font-bold text-slate-900">Status report</h2>
          <p className="text-sm text-slate-600">{report.timestamp}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${report.pausedReason ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
          {report.pausedReason ? 'Paused' : 'Active'}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {report.stepStatuses.map(step => (
          <div key={step.stepId} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
              <span>{step.stepId}</span>
              <span className="text-slate-600">{step.status}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Updated: {step.lastUpdated}</div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="text-sm font-semibold text-slate-800">Actions</div>
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 mt-1">
          {report.actionsTaken.map(action => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
