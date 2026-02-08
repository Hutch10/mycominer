'use client';

import { GlobalInsight } from '../engine/exchangeTypes';

interface GlobalInsightFeedProps {
  insights: GlobalInsight[];
}

export function GlobalInsightFeed({ insights }: GlobalInsightFeedProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900">
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Global Insight Feed</p>
      {insights.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">No insights yet</p>
      ) : (
        <div className="space-y-2">
          {insights.map((insight) => (
            <div key={insight.id} className="border border-gray-100 dark:border-gray-800 rounded p-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{insight.title}</p>
              <p className="text-[11px] text-gray-600 dark:text-gray-400">Confidence: {(insight.confidence * 100).toFixed(0)}%</p>
              <p className="text-[11px] text-gray-700 dark:text-gray-300 mt-1">{insight.summary}</p>
              {insight.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-blue-700 dark:text-blue-300">
                  {insight.tags.map((t) => (
                    <span key={t} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded">{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
