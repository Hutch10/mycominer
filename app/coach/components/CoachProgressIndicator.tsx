/**
 * Coach Progress Indicator Component
 * Visual indicator for grow plan progress and session milestones
 */

'use client';

import React from 'react';
import { GrowPlan } from '../utils/coachTypes';

interface CoachProgressIndicatorProps {
  plan?: GrowPlan;
  currentStage?: number;
  sessionsCompleted?: number;
  goalsAchieved?: number;
  totalGoals?: number;
}

export const CoachProgressIndicator: React.FC<CoachProgressIndicatorProps> = ({
  plan,
  currentStage,
  sessionsCompleted = 0,
  goalsAchieved = 0,
  totalGoals = 5,
}) => {
  const calculatePlanProgress = (plan: GrowPlan): number => {
    if (!plan.stages.length) return 0;

    const completedStages = plan.stages.filter(s => {
      const completedTasks = s.tasks.filter(t => t.completed).length;
      return completedTasks === s.tasks.length;
    }).length;

    return (completedStages / plan.stages.length) * 100;
  };

  const planProgress = plan ? calculatePlanProgress(plan) : 0;
  const goalProgress = totalGoals > 0 ? (goalsAchieved / totalGoals) * 100 : 0;

  const getStageColor = (index: number, currentStage?: number): string => {
    if (!currentStage) return 'bg-slate-300 dark:bg-slate-600';
    if (index < currentStage) return 'bg-green-500';
    if (index === currentStage) return 'bg-blue-500';
    return 'bg-slate-300 dark:bg-slate-600';
  };

  const stageNames = [
    'Preparation',
    'Inoculation',
    'Colonization',
    'Fruiting',
    'Harvest',
    'Cleanup',
  ];

  return (
    <div className="space-y-6 bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        📊 Progress Tracker
      </h3>

      {/* Plan Progress */}
      {plan && (
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-slate-900 dark:text-white">
                {plan.name}
              </h4>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                {Math.round(planProgress)}%
              </span>
            </div>
            <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 rounded-full"
                style={{ width: `${planProgress}%` }}
              />
            </div>
          </div>

          {/* Stage Timeline */}
          {plan.stages.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                Stage Progress
              </p>
              <div className="flex gap-2">
                {plan.stages.map((stage, idx) => (
                  <div
                    key={idx}
                    className="flex-1"
                    title={stageNames[idx] || stage.stage}
                  >
                    <div
                      className={`w-full h-2 rounded-full transition-all cursor-help ${getStageColor(idx, currentStage)}`}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1 truncate">
                      {(stageNames[idx] || stage.stage).split(' ')[0]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stage Details */}
          {currentStage !== undefined && currentStage < plan.stages.length && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                📍 Current Stage: {stageNames[currentStage] || plan.stages[currentStage]?.stage}
              </p>
              {plan.stages[currentStage] && (
                <div className="mt-2 space-y-1 text-xs text-blue-800 dark:text-blue-200">
                  <p>
                    Duration: <span className="font-medium">{plan.stages[currentStage].duration} days</span>
                  </p>
                  <p>
                    Tasks:{' '}
                    <span className="font-medium">
                      {plan.stages[currentStage].tasks.filter(t => t.completed).length}/
                      {plan.stages[currentStage].tasks.length} complete
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Goals Progress */}
      {totalGoals > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-slate-900 dark:text-white">
                Learning Goals
              </h4>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                {goalsAchieved}/{totalGoals}
              </span>
            </div>
            <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 rounded-full"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
          </div>

          {/* Goal Milestones */}
          <div className="space-y-1">
            {Array.from({ length: totalGoals }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300"
              >
                <span className="flex-shrink-0">
                  {idx < goalsAchieved ? '✓' : '○'}
                </span>
                <span>Goal {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session Activity */}
      {sessionsCompleted > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div>
            <h4 className="font-medium text-slate-900 dark:text-white text-sm mb-2">
              Session Activity
            </h4>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded">
              <div className="text-2xl">💬</div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {sessionsCompleted} Coaching Session{sessionsCompleted !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Keep coaching to unlock insights
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
          Quick Stats
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {plan ? plan.stages.length : '—'}
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">Total Stages</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {plan
                ? plan.stages.reduce((sum, s) => sum + s.tasks.length, 0)
                : '—'}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Total Tasks</p>
          </div>
        </div>
      </div>

      {/* Timeline Estimate */}
      {plan && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
            Timeline
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span>Started:</span>
              <span className="font-medium">
                {new Date(plan.startDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span>Est. Complete:</span>
              <span className="font-medium">
                {new Date(plan.estimatedCompletionDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span>Duration:</span>
              <span className="font-medium">
                {Math.ceil(
                  (new Date(plan.estimatedCompletionDate).getTime() -
                    new Date(plan.startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{' '}
                days
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
