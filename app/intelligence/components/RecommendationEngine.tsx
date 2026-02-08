'use client';

import { useState, useEffect } from 'react';
import { getRelatedByTags, getRelatedByCluster, getRecommendedNextSteps, type Recommendation, type PageData } from '../utils';

interface RecommendationEngineProps {
  currentPage?: PageData;
  currentTags?: string[];
  currentCategory?: string;
  mode?: 'tags' | 'cluster' | 'next-steps' | 'all';
  limit?: number;
}

export default function RecommendationEngine({
  currentPage,
  currentTags = [],
  currentCategory = '',
  mode = 'all',
  limit = 5
}: RecommendationEngineProps) {
  const [recommendations, setRecommendations] = useState<{
    byTags: Recommendation[];
    byCluster: Recommendation[];
    nextSteps: Recommendation[];
  }>({
    byTags: [],
    byCluster: [],
    nextSteps: []
  });

  useEffect(() => {
    if (mode === 'tags' || mode === 'all') {
      const tagRecs = getRelatedByTags(currentTags, limit, currentPage?.path);
      setRecommendations(prev => ({ ...prev, byTags: tagRecs }));
    }

    if (mode === 'cluster' || mode === 'all') {
      const clusterRecs = getRelatedByCluster(currentTags, limit, currentPage?.path);
      setRecommendations(prev => ({ ...prev, byCluster: clusterRecs }));
    }

    if (mode === 'next-steps' || mode === 'all') {
      const nextRecs = getRecommendedNextSteps(currentCategory, currentTags, Math.min(limit, 3));
      setRecommendations(prev => ({ ...prev, nextSteps: nextRecs }));
    }
  }, [currentTags, currentCategory, mode, limit, currentPage?.path]);

  const renderRecommendations = (recs: Recommendation[], title: string, icon: string) => {
    if (recs.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </h3>
        <div className="space-y-3">
          {recs.map((rec, idx) => (
            <a
              key={idx}
              href={rec.page.path}
              className="block p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {rec.page.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {rec.page.category}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 italic">
                    {rec.reason}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                  <span>{Math.round(rec.score * 100)}%</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {rec.page.tags.slice(0, 4).map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {(mode === 'next-steps' || mode === 'all') && renderRecommendations(
        recommendations.nextSteps,
        'Recommended Next Steps',
        '🎯'
      )}
      
      {(mode === 'tags' || mode === 'all') && renderRecommendations(
        recommendations.byTags,
        'Related by Tags',
        '🏷️'
      )}
      
      {(mode === 'cluster' || mode === 'all') && renderRecommendations(
        recommendations.byCluster,
        'Related by Knowledge Cluster',
        '🕸️'
      )}
    </div>
  );
}
