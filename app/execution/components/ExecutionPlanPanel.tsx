'use client';

import { ExecutionPlan } from '@/app/execution/executionTypes';

interface Props {
  plan: ExecutionPlan;
  onApprove?: () => void;
  onReject?: () => void;
}

export function ExecutionPlanPanel({ plan, onApprove, onReject }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">Execution Plan</div>
          <h2 className="text-xl font-bold text-slate-900">{plan.planId}</h2>
          <p className="text-sm text-slate-600">{plan.steps.length} steps • status: {plan.status}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReject}
            className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Request changes
          </button>
          <button
            onClick={onApprove}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Approve for execution
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-slate-700">
        <div>
          <div className="text-slate-500">Resource conflicts</div>
          <div className="font-semibold">{plan.resourceConflicts.length}</div>
        </div>
        <div>
          <div className="text-slate-500">Timing conflicts</div>
          <div className="font-semibold">{plan.timingConflicts.length}</div>
        </div>
        <div>
          <div className="text-slate-500">Manual overrides</div>
          <div className="font-semibold">{plan.manualOverrides.length}</div>
        </div>
      </div>

      {(plan.resourceConflicts.length > 0 || plan.timingConflicts.length > 0) && (
        <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
          <div className="font-semibold mb-1">Review required</div>
          <ul className="list-disc list-inside space-y-1">
            {plan.resourceConflicts.map(conflict => (
              <li key={conflict}>{conflict}</li>
            ))}
            {plan.timingConflicts.map(conflict => (
              <li key={conflict}>{conflict}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
