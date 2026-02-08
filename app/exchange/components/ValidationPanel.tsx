'use client';

import { ValidationResult } from '../engine/exchangeTypes';

interface ValidationPanelProps {
  result: ValidationResult | null;
}

export function ValidationPanel({ result }: ValidationPanelProps) {
  if (!result) return <p className="text-xs text-gray-500 dark:text-gray-400">Awaiting validation</p>;
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">Validation</p>
      <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">Status: {result.status.toUpperCase()} • Confidence: {(result.confidence * 100).toFixed(0)}%</p>
      {result.issues.length > 0 && (
        <ul className="mt-2 space-y-1 text-[11px] text-red-600 dark:text-red-300">
          {result.issues.map((i, idx) => (
            <li key={idx}>• {i}</li>
          ))}
        </ul>
      )}
      {result.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-blue-700 dark:text-blue-300">
          {result.tags.map((t) => (
            <span key={t} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
