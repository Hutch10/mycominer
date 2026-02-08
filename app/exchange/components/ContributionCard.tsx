'use client';

import { RawContribution } from '../engine/exchangeTypes';

interface ContributionCardProps {
  contribution: RawContribution;
}

export function ContributionCard({ contribution }: ContributionCardProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{contribution.kind.toUpperCase()}</p>
        <span className="text-[11px] text-gray-500 dark:text-gray-400">{contribution.source}</span>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Species: {contribution.species ?? '—'} • Stage: {contribution.stage ?? '—'}</p>
      <pre className="text-[11px] bg-gray-50 dark:bg-gray-800 p-2 rounded mt-2 text-gray-700 dark:text-gray-300 overflow-x-auto">{JSON.stringify(contribution.payload, null, 2)}</pre>
    </div>
  );
}
