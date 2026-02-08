'use client';

import { RollbackPlan } from '@/app/execution/executionTypes';

interface Props {
  rollbackPlan?: RollbackPlan;
}

export function RollbackPanel({ rollbackPlan }: Props) {
  if (!rollbackPlan) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-sm text-slate-600">
        Rollback plan will appear here if execution pauses or a step fails.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-rose-700">Rollback</div>
          <h2 className="text-xl font-bold text-rose-900">{rollbackPlan.rollbackId}</h2>
          <p className="text-sm text-rose-800">Triggered by {rollbackPlan.triggeredBy}</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-white text-rose-700 text-xs font-semibold border border-rose-200">
          {rollbackPlan.status}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {rollbackPlan.steps.map(step => (
          <div key={step.rollbackStepId} className="rounded-lg border border-rose-100 bg-white p-3">
            <div className="flex items-center justify-between text-sm font-semibold text-rose-900">
              <span>{step.targetStepId}</span>
              <span>{step.expectedDurationMinutes} min</span>
            </div>
            <p className="text-sm text-rose-800 mt-1">{step.action}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
