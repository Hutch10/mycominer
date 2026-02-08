/**
 * CommunityActions Component
 * Quick action buttons for adding grow logs, notes, insights from context pages
 */

'use client';

import React from 'react';
import type { CommunityAction } from '../utils/communityTypes';

interface CommunityActionsProps {
  context: {
    species?: string;
    substrate?: string;
    pageSlug?: string;
    pageType?: 'species' | 'guide' | 'troubleshooting' | 'tool';
  };
  actions: CommunityAction[];
  onAction: (action: CommunityAction) => void;
  compact?: boolean;
}

export function CommunityActions({ context, actions, onAction, compact = false }: CommunityActionsProps) {
  const filteredActions = actions.filter(action => {
    // Filter actions based on context
    if (context.species && action.context.species && action.context.species !== context.species) {
      return false;
    }
    return true;
  });

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {filteredActions.map(action => (
          <button
            key={action.id}
            onClick={() => onAction(action)}
            title={action.description}
            className="px-3 py-1 text-sm bg-purple-900 hover:bg-purple-800 text-purple-100 rounded transition-colors flex items-center gap-1"
          >
            <span>{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-3">Community Actions</h3>
      <p className="text-slate-400 text-sm mb-4">
        Share your cultivation experience and learn from the community.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {filteredActions.map(action => (
          <button
            key={action.id}
            onClick={() => onAction(action)}
            className="text-left p-3 rounded bg-slate-700 hover:bg-slate-600 transition-colors group"
          >
            <div className="flex items-start gap-2">
              <span className="text-2xl">{action.icon}</span>
              <div>
                <p className="font-medium text-white group-hover:text-purple-200">{action.label}</p>
                <p className="text-xs text-slate-400">{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500 mt-4 text-center">
        All contributions are private by default. Choose to share when ready.
      </p>
    </div>
  );
}
