/**
 * Coach Action Buttons Component
 * Quick action buttons for coach navigation and engagement
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { CoachMode } from '../utils/coachTypes';

interface CoachActionButtonsProps {
  mode?: CoachMode;
  preSelectedSpecies?: string;
  preSelectedSubstrate?: string;
  preSelectedIssue?: string;
  onAction?: (action: string) => void;
  showQuickStart?: boolean;
  showModes?: boolean;
  compact?: boolean;
}

export const CoachActionButtons: React.FC<CoachActionButtonsProps> = ({
  mode,
  preSelectedSpecies,
  preSelectedSubstrate,
  preSelectedIssue,
  onAction,
  showQuickStart = false,
  showModes = false,
  compact = false,
}) => {
  const modes: { slug: CoachMode; label: string; icon: string; description: string }[] = [
    {
      slug: 'species-advisor',
      label: 'Species Advisor',
      icon: '🍄',
      description: 'Find the perfect species for you',
    },
    {
      slug: 'substrate-advisor',
      label: 'Substrate Advisor',
      icon: '🌾',
      description: 'Get substrate recommendations',
    },
    {
      slug: 'environment-advisor',
      label: 'Environment Advisor',
      icon: '🌡️',
      description: 'Learn environmental requirements',
    },
    {
      slug: 'troubleshooting-advisor',
      label: 'Troubleshooting Advisor',
      icon: '🔧',
      description: 'Diagnose and fix growing issues',
    },
    {
      slug: 'grow-planner',
      label: 'Grow Planner',
      icon: '📋',
      description: 'Create a detailed grow plan',
    },
  ];

  const buildUrl = (slug: CoachMode): string => {
    const params = new URLSearchParams();
    if (preSelectedSpecies) params.append('species', preSelectedSpecies);
    if (preSelectedSubstrate) params.append('substrate', preSelectedSubstrate);
    if (preSelectedIssue) params.append('issue', preSelectedIssue);

    const query = params.toString();
    return `/coach/${slug}${query ? `?${query}` : ''}`;
  };

  if (compact) {
    // Compact mode for quick access
    return (
      <div className="flex flex-wrap gap-2">
        <Link
          href={buildUrl('species-advisor')}
          onClick={() => onAction?.('species-advisor')}
          className="inline-flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 text-sm font-medium transition-colors"
        >
          🍄 Species
        </Link>
        <Link
          href={buildUrl('substrate-advisor')}
          onClick={() => onAction?.('substrate-advisor')}
          className="inline-flex items-center gap-1 px-3 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 text-sm font-medium transition-colors"
        >
          🌾 Substrate
        </Link>
        <Link
          href={buildUrl('environment-advisor')}
          onClick={() => onAction?.('environment-advisor')}
          className="inline-flex items-center gap-1 px-3 py-2 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 text-sm font-medium transition-colors"
        >
          🌡️ Environment
        </Link>
        <Link
          href={buildUrl('troubleshooting-advisor')}
          onClick={() => onAction?.('troubleshooting-advisor')}
          className="inline-flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 text-sm font-medium transition-colors"
        >
          🔧 Help
        </Link>
        <Link
          href={buildUrl('grow-planner')}
          onClick={() => onAction?.('grow-planner')}
          className="inline-flex items-center gap-1 px-3 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 text-sm font-medium transition-colors"
        >
          📋 Plan
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Start Section */}
      {showQuickStart && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3">
            🚀 Quick Start
          </h3>
          <div className="space-y-2">
            <Link
              href="/coach/species-advisor"
              onClick={() => onAction?.('quick-start-species')}
              className="block p-3 bg-white dark:bg-slate-800 rounded border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow font-medium text-slate-900 dark:text-white"
            >
              I'm new and want to get started
            </Link>
            <Link
              href="/coach/grow-planner"
              onClick={() => onAction?.('quick-start-plan')}
              className="block p-3 bg-white dark:bg-slate-800 rounded border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow font-medium text-slate-900 dark:text-white"
            >
              I already know what I want to grow
            </Link>
            <Link
              href="/coach/troubleshooting-advisor"
              onClick={() => onAction?.('quick-start-help')}
              className="block p-3 bg-white dark:bg-slate-800 rounded border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow font-medium text-slate-900 dark:text-white"
            >
              Something's wrong with my grow
            </Link>
          </div>
        </div>
      )}

      {/* Coach Modes Grid */}
      {showModes && (
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">
            Choose Your Coach
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {modes.map(m => (
              <Link
                key={m.slug}
                href={buildUrl(m.slug)}
                onClick={() => onAction?.(m.slug)}
                className="group p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl group-hover:scale-110 transition-transform">
                    {m.icon}
                  </span>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {m.label}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {m.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Primary Action */}
      {mode && (
        <div className="flex gap-3">
          <Link
            href={buildUrl(mode)}
            onClick={() => onAction?.('continue-coaching')}
            className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors text-center"
          >
            Open {mode.replace(/-/g, ' ').toUpperCase()}
          </Link>
          <Link
            href="/coach"
            onClick={() => onAction?.('back-to-coach')}
            className="py-3 px-4 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            ← Back
          </Link>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <h4 className="font-medium text-slate-900 dark:text-white mb-2">
          💡 Tips
        </h4>
        <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
          <li>✓ The coach learns from your preferences over time</li>
          <li>✓ Your data is stored locally - never sent anywhere</li>
          <li>✓ Save plans and recommendations for later</li>
          <li>✓ Each mode specializes in different topics</li>
        </ul>
      </div>
    </div>
  );
};
