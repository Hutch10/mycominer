'use client';

import { ExecutionStepProposal } from '@/app/execution/executionTypes';

interface Props {
  step: ExecutionStepProposal;
}

export function ExecutionStepCard({ step }: Props) {
  const statusColor = {
    pending: 'bg-amber-100 text-amber-800',
    'awaiting-approval': 'bg-blue-100 text-blue-800',
    running: 'bg-indigo-100 text-indigo-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    'rolled-back': 'bg-slate-100 text-slate-800',
  }[step.status];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm uppercase tracking-wide text-slate-500">{step.sourceType}</div>
          <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
          <p className="text-sm text-slate-600 mt-1">{step.description}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>{step.status}</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-slate-700">
        <div>
          <div className="text-slate-500">Duration</div>
          <div className="font-semibold">{step.expectedDurationMinutes} min</div>
        </div>
        <div>
          <div className="text-slate-500">Requires Approval</div>
          <div className="font-semibold">{step.requiresApproval ? 'Yes' : 'No'}</div>
        </div>
        <div>
          <div className="text-slate-500">Dependencies</div>
          <div className="font-semibold">{step.dependencies?.length ?? 0}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {step.safetyChecks.map(check => (
          <span key={check} className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
            {check}
          </span>
        ))}
      </div>
    </div>
  );
}
