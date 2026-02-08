'use client';

import { OptimizationProposal } from '../engine/facilityTypes';

interface OptimizationPanelProps {
  proposals: OptimizationProposal[];
}

export function OptimizationPanel({ proposals }: OptimizationPanelProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900">
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Optimization Proposals</p>
      {proposals.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">No proposals yet</p>
      ) : (
        <div className="space-y-2">
          {proposals.map((p) => (
            <div key={p.id} className="border border-gray-100 dark:border-gray-800 rounded p-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.title}</p>
              <p className="text-[11px] text-gray-600 dark:text-gray-400">{p.rationale}</p>
              <ul className="mt-1 space-y-1 text-[11px] text-gray-700 dark:text-gray-300">
                {p.actions.map((a, i) => (
                  <li key={i}>• {a.roomId ? `[${a.roomId}] ` : ''}{a.description} — {a.expectedImpact}</li>
                ))}
              </ul>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Approval: {p.requiresApproval ? 'Required' : 'Optional'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
