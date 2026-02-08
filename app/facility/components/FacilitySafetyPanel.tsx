'use client';

import { SafetyEvaluation } from '../engine/facilityTypes';

interface FacilitySafetyPanelProps {
  safety: SafetyEvaluation;
}

export function FacilitySafetyPanel({ safety }: FacilitySafetyPanelProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">Facility Safety</p>
      <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">Decision: {safety.decision.toUpperCase()}</p>
      <ul className="mt-2 space-y-1 text-[11px] text-gray-600 dark:text-gray-400">
        {safety.rationale.map((r, i) => (
          <li key={i}>• {r}</li>
        ))}
      </ul>
      {safety.alternatives && safety.alternatives.length > 0 && (
        <div className="mt-2">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Alternatives</p>
          <ul className="space-y-1 text-[11px] text-gray-600 dark:text-gray-400">
            {safety.alternatives.map((a, i) => (
              <li key={i}>→ {a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
