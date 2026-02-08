/**
 * Coach Recommendation List Component
 * Display and interact with coach recommendations
 */

'use client';

import React, { useState } from 'react';
import { CoachRecommendation } from '../utils/coachTypes';

interface CoachRecommendationListProps {
  recommendations: CoachRecommendation[];
  onSelectRecommendation?: (rec: CoachRecommendation) => void;
  onTakeAction?: (action: any) => void;
  emptyMessage?: string;
}

export const CoachRecommendationList: React.FC<CoachRecommendationListProps> = ({
  recommendations,
  onSelectRecommendation,
  onTakeAction,
  emptyMessage = 'No recommendations yet. Tell me more about your setup!',
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    recommendations.length > 0 ? recommendations[0].id : null
  );

  const getTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      species: '🍄',
      substrate: '🌾',
      environment: '🌡️',
      troubleshooting: '🔧',
      action: '📋',
      learning: '📚',
    };
    return icons[type] || '💡';
  };

  const getDifficultyColor = (difficulty: string): string => {
    const colors: Record<string, string> = {
      easy: 'text-green-600 dark:text-green-400',
      moderate: 'text-amber-600 dark:text-amber-400',
      challenging: 'text-red-600 dark:text-red-400',
    };
    return colors[difficulty] || 'text-slate-600';
  };

  const getDifficultyBg = (difficulty: string): string => {
    const colors: Record<string, string> = {
      easy: 'bg-green-50 dark:bg-green-900/20',
      moderate: 'bg-amber-50 dark:bg-amber-900/20',
      challenging: 'bg-red-50 dark:bg-red-900/20',
    };
    return colors[difficulty] || 'bg-slate-50';
  };

  if (recommendations.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <p className="text-slate-600 dark:text-slate-300">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec, idx) => (
        <div
          key={rec.id}
          className={`border rounded-lg overflow-hidden transition-all ${
            expandedId === rec.id
              ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
          }`}
        >
          {/* Header */}
          <button
            onClick={() => {
              setExpandedId(expandedId === rec.id ? null : rec.id);
              onSelectRecommendation?.(rec);
            }}
            className="w-full px-4 py-3 flex items-start justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl flex-shrink-0">{getTypeIcon(rec.type)}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {rec.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1">
                    {rec.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${getDifficultyColor(rec.estimatedDifficulty)} ${getDifficultyBg(rec.estimatedDifficulty)}`}
                    >
                      {rec.estimatedDifficulty.charAt(0).toUpperCase() +
                        rec.estimatedDifficulty.slice(1)}
                    </span>
                    {rec.estimatedTime && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ⏱️ {rec.estimatedTime}
                      </span>
                    )}
                    <div className="flex-1" />
                    <div className="flex items-center gap-1">
                      <div className="w-12 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            rec.confidenceScore > 0.8
                              ? 'bg-green-500'
                              : rec.confidenceScore > 0.6
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                          }`}
                          style={{ width: `${rec.confidenceScore * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ml-1">
                        {Math.round(rec.confidenceScore * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`transform transition-transform flex-shrink-0 ml-2 ${
                expandedId === rec.id ? 'rotate-180' : ''
              }`}
            >
              ▼
            </div>
          </button>

          {/* Expanded Content */}
          {expandedId === rec.id && (
            <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 space-y-4 bg-white dark:bg-slate-800">
              {/* Reasoning */}
              <div>
                <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Why this recommendation?
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {rec.reasoning}
                </p>
              </div>

              {/* Parameters */}
              {rec.parameters && Object.keys(rec.parameters).length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Key Details
                  </h4>
                  <div className="space-y-1 text-sm">
                    {Object.entries(rec.parameters).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between text-slate-700 dark:text-slate-300"
                      >
                        <span className="capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="font-medium">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {rec.actions && rec.actions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                    What you can do
                  </h4>
                  <div className="space-y-2">
                    {rec.actions.map(action => (
                      <button
                        key={action.id}
                        onClick={() => onTakeAction?.(action)}
                        className={`w-full text-left px-3 py-2 rounded border transition-colors ${
                          action.priority === 'high'
                            ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                            : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {action.actionType === 'navigate'
                              ? '→'
                              : action.actionType === 'read'
                                ? '📖'
                                : action.actionType === 'monitor'
                                  ? '👁️'
                                  : action.actionType === 'adjust'
                                    ? '🔧'
                                    : '✓'}
                          </span>
                          <div>
                            <p className="font-medium text-sm text-slate-900 dark:text-white">
                              {action.label}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Alternatives */}
              {rec.alternatives && rec.alternatives.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    💡 Also consider: {rec.alternatives.map(a => a.title).join(', ')}
                  </p>
                </div>
              )}

              {/* Related Pages */}
              {rec.relatedPages.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Learn more
                  </h4>
                  <div className="space-y-1">
                    {rec.relatedPages.map(page => (
                      <a
                        key={page.slug}
                        href={`/${page.slug}`}
                        className="block px-3 py-2 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-sm transition-colors"
                      >
                        📖 {page.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
