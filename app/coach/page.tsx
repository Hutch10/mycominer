/**
 * Coach Home Page
 * Main entry point for the AI-assisted cultivation coaching system
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CoachActionButtons } from './components/CoachActionButtons';
import { CoachProgressIndicator } from './components/CoachProgressIndicator';
import { initializeMemory, getMemorySummary, getActivePlans } from './utils/coachMemory';
import type { CoachMemory } from './utils/coachTypes';

export default function CoachPage() {
  const [memory, setMemory] = useState<CoachMemory | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [activePlans, setActivePlans] = useState<any[]>([]);

  useEffect(() => {
    const mem = initializeMemory();
    setMemory(mem);
    setSummary(getMemorySummary());
    setActivePlans(getActivePlans());
  }, []);

  if (!memory) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">🧑‍🌾 Your Cultivation Coach</h1>
          <p className="text-lg text-blue-100">
            Personalized guidance for every stage of mushroom cultivation
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Quick Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {summary.totalSessions}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Sessions
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {summary.activePlans}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Active Plans
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {summary.issuesResolved}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Issues Resolved
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {summary.pathsCompleted}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Paths Completed
              </p>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Welcome back, {memory.userProfile.skillLevel} cultivator! 🌱
          </h2>
          <p className="text-slate-700 dark:text-slate-300 mb-6">
            I'm your AI-powered cultivation coach, here to guide you through every step of the mushroom
            growing process. Whether you're just starting out or optimizing your technique, I adapt to
            your experience level, equipment, climate, and goals.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                📚 Learn
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Discover new species, substrates, and techniques personalized to your situation.
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                🗂️ Plan
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                Create detailed grow plans with daily tasks, milestones, and environmental guidance.
              </p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded border border-amber-200 dark:border-amber-800">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                🔧 Solve
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Diagnose problems and get actionable solutions when issues arise.
              </p>
            </div>
          </div>
        </div>

        {/* Active Plans */}
        {activePlans && activePlans.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              📋 Your Active Plans
            </h2>
            <div className="space-y-4">
              {activePlans.slice(0, 3).map(plan => (
                <div
                  key={plan.id}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Started {new Date(plan.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      plan.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}>
                      {plan.status}
                    </span>
                  </div>
                  <Link
                    href={`/coach/grow-planner?plan=${plan.id}`}
                    className="mt-3 inline-block text-blue-500 hover:text-blue-600 font-medium text-sm"
                  >
                    View Plan →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coach Modes */}
        <CoachActionButtons showModes showQuickStart />

        {/* Profile Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            ⚙️ Your Profile
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Skill Level
              </h3>
              <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                {memory.userProfile.skillLevel}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Climate
              </h3>
              <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                {memory.userProfile.climate}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Equipment
              </h3>
              <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                {memory.userProfile.equipment}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Space
              </h3>
              <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                {memory.userProfile.space}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Time Available
              </h3>
              <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                {memory.userProfile.timeAvailable.replace(/-/g, ' ')}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Experience
              </h3>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {memory.userProfile.experience} months
              </p>
            </div>
          </div>

          <Link
            href="/coach/species-advisor"
            className="mt-6 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
          >
            Update Profile →
          </Link>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            💬 Communication Preferences
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white">
                  Communication Style
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {memory.preferences.communicationStyle.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}
                </p>
              </div>
              <span className="text-2xl">
                {memory.preferences.communicationStyle === 'concise'
                  ? '📝'
                  : memory.preferences.communicationStyle === 'detailed'
                    ? '📖'
                    : '⚖️'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white">
                  Recommendations per Session
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {memory.preferences.recommendationCount} suggestions
                </p>
              </div>
              <span className="text-2xl">💡</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white">
                  Show Alternatives
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {memory.preferences.showAlternatives ? 'Yes' : 'No'}
                </p>
              </div>
              <span className="text-2xl">{memory.preferences.showAlternatives ? '✓' : '✗'}</span>
            </div>
          </div>
        </div>

        {/* How the Coach Works */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            🤔 How Does the Coach Work?
          </h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Tell Me About Yourself
                </h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm mt-1">
                  Share your skill level, climate, equipment, and goals. This helps me personalize all recommendations.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Get Personalized Guidance
                </h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm mt-1">
                  Each coach mode (Species, Substrate, Environment, etc.) provides tailored recommendations based on your profile.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Create Detailed Plans
                </h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm mt-1">
                  The Grow Planner generates stage-by-stage timelines with tasks, milestones, and environmental parameters.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
                  4
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Track Progress
                </h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm mt-1">
                  Monitor your grow plan, complete tasks, track milestones, and stay organized throughout cultivation.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
                  5
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Get Help When Needed
                </h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm mt-1">
                  The Troubleshooting Advisor helps diagnose problems and provides solutions when issues arise.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
            🔒 Your Privacy Matters
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            All coaching data is stored locally in your browser. We never send your information to external servers. 
            You have full control over your data and can export, import, or clear it anytime.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 py-8 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-slate-600 dark:text-slate-400 text-sm text-center">
            Ready to get started? Choose a coach mode above to begin your cultivation journey. 🍄✨
          </p>
        </div>
      </div>
    </div>
  );
}
