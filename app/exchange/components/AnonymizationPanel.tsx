'use client';

import { AnonymizedContribution } from '../engine/exchangeTypes';

interface AnonymizationPanelProps {
  anonymized: AnonymizedContribution | null;
}

export function AnonymizationPanel({ anonymized }: AnonymizationPanelProps) {
  if (!anonymized) return <p className="text-xs text-gray-500 dark:text-gray-400">Awaiting anonymization</p>;
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">Anonymization</p>
      <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">Time bucket: {anonymized.timeBucket ?? 'unknown'}</p>
      <pre className="text-[11px] bg-gray-50 dark:bg-gray-800 p-2 rounded mt-2 text-gray-700 dark:text-gray-300 overflow-x-auto">{JSON.stringify(anonymized.summary, null, 2)}</pre>
    </div>
  );
}
