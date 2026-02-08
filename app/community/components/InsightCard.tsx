/**
 * InsightCard Component
 * Display insight with type, description, confidence, and actions
 */

'use client';

import React from 'react';
import type { Insight } from '../utils/communityTypes';

interface InsightCardProps {
  insight: Insight;
  onEdit?: (insight: Insight) => void;
  onDelete?: (insightId: string) => void;
  onShare?: (insightId: string) => void;
}

export function InsightCard({ insight, onEdit, onDelete, onShare }: InsightCardProps) {
  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      tip: '💡',
      observation: '👁️',
      'troubleshooting-pattern': '🔍',
      'species-behavior': '🍄',
    };
    return icons[type] || '📝';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      tip: 'bg-yellow-900 text-yellow-100',
      observation: 'bg-blue-900 text-blue-100',
      'troubleshooting-pattern': 'bg-red-900 text-red-100',
      'species-behavior': 'bg-green-900 text-green-100',
    };
    return colors[type] || 'bg-slate-700 text-slate-100';
  };

  const getConfidenceColor = (level: string) => {
    const colors: Record<string, string> = {
      low: 'text-slate-400',
      medium: 'text-yellow-400',
      high: 'text-green-400',
    };
    return colors[level] || 'text-slate-400';
  };

  const getConfidenceBars = (level: string) => {
    const bars: Record<string, number> = {
      low: 1,
      medium: 2,
      high: 3,
    };
    const count = bars[level] || 1;
    return '▰'.repeat(count) + '▱'.repeat(3 - count);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <span className={`text-2xl ${getTypeColor(insight.type)} px-3 py-1 rounded`}>
          {getTypeIcon(insight.type)}
        </span>
        <div className="flex-1">
          <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-1 ${getTypeColor(insight.type)}`}>
            {insight.type.replace('-', ' ').charAt(0).toUpperCase() + insight.type.replace('-', ' ').slice(1)}
          </div>
          <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
        </div>
      </div>

      {/* Confidence */}
      <div className="flex items-center gap-2 mb-3 text-sm">
        <span className="text-slate-400">Confidence:</span>
        <span className={`font-medium ${getConfidenceColor(insight.confidence)}`}>
          {getConfidenceBars(insight.confidence)} {insight.confidence}
        </span>
      </div>

      {/* Description */}
      <p className="text-slate-300 text-sm mb-3 line-clamp-3">
        {insight.description.replace(/[#*`]/g, '')}
      </p>

      {/* Related Content */}
      {(insight.relatedSpecies?.length || 0) > 0 && (
        <div className="mb-2">
          <p className="text-xs text-slate-400 font-medium mb-1">Species</p>
          <div className="flex flex-wrap gap-1">
            {insight.relatedSpecies?.map(species => (
              <span key={species} className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded capitalize">
                🍄 {species}
              </span>
            ))}
          </div>
        </div>
      )}

      {(insight.relatedIssues?.length || 0) > 0 && (
        <div className="mb-3">
          <p className="text-xs text-slate-400 font-medium mb-1">Related Issues</p>
          <div className="flex flex-wrap gap-1">
            {insight.relatedIssues?.map(issue => (
              <span key={issue} className="bg-red-900/30 text-red-300 text-xs px-2 py-1 rounded">
                ⚠️ {issue}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {insight.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {insight.tags.map(tag => (
            <span key={tag} className="bg-slate-700/50 text-slate-300 text-xs px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Source Indicator */}
      {insight.basedOnLogs?.length && (
        <p className="text-xs text-slate-500 mb-3">
          Based on {insight.basedOnLogs.length} grow log{insight.basedOnLogs.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-slate-700">
        <button
          onClick={() => onEdit?.(insight)}
          className="flex-1 text-sm px-3 py-1 rounded bg-blue-900 hover:bg-blue-800 text-blue-100 transition-colors"
        >
          Edit
        </button>
        {onShare && (
          <button
            onClick={() => onShare(insight.id)}
            className="flex-1 text-sm px-3 py-1 rounded bg-purple-900 hover:bg-purple-800 text-purple-100 transition-colors"
          >
            {insight.isPrivate ? 'Share' : 'Unshare'}
          </button>
        )}
        <button
          onClick={() => onDelete?.(insight.id)}
          className="flex-1 text-sm px-3 py-1 rounded bg-red-900 hover:bg-red-800 text-red-100 transition-colors"
        >
          Delete
        </button>
      </div>

      {/* Privacy Indicator */}
      <p className="text-xs text-slate-600 mt-2 text-right">
        {insight.isPrivate ? '🔒 Private' : '👁️ Community'}
      </p>
    </div>
  );
}
