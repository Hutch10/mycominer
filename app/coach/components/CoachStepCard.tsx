/**
 * Coach Step Card Component
 * Individual step display with completion tracking and details
 */

'use client';

import React, { useState } from 'react';
import { GrowStage, StageTask } from '../utils/coachTypes';

interface CoachStepCardProps {
  stage: GrowStage;
  stageIndex: number;
  isActive?: boolean;
  isCompleted?: boolean;
  onTaskComplete?: (taskId: string) => void;
  onStageComplete?: () => void;
}

export const CoachStepCard: React.FC<CoachStepCardProps> = ({
  stage,
  stageIndex,
  isActive = false,
  isCompleted = false,
  onTaskComplete,
  onStageComplete,
}) => {
  const [expanded, setExpanded] = useState(isActive);
  const completedTasks = stage.tasks.filter(t => t.completed).length;
  const completionPercent = (completedTasks / stage.tasks.length) * 100;

  const stageIcons: Record<string, string> = {
    preparation: '🔨',
    inoculation: '💉',
    colonization: '🦠',
    fruiting: '🍄',
    harvest: '✂️',
    cleanup: '🧹',
  };

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all ${
        isCompleted
          ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
          : isActive
            ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
      }`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">{stageIcons[stage.stage] || '📋'}</div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-900 dark:text-white capitalize">
              {stageIndex + 1}. {stage.stage.replace(/-/g, ' ')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {stage.duration} days • {completedTasks}/{stage.tasks.length} tasks
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <div
            className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}
          >
            ▼
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 space-y-4">
          {/* Parameters */}
          <div className="bg-white dark:bg-slate-900 rounded p-3 text-sm">
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">
              Environmental Parameters
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-600 dark:text-slate-400">Temperature:</span>
                <p className="text-slate-900 dark:text-white font-medium">
                  {stage.parameters.temperature.min}–{stage.parameters.temperature.max}°C
                </p>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">Humidity:</span>
                <p className="text-slate-900 dark:text-white font-medium">
                  {stage.parameters.humidity.min}–{stage.parameters.humidity.max}%
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-600 dark:text-slate-400">FAE:</span>
                <p className="text-slate-900 dark:text-white font-medium">
                  {stage.parameters.fae.frequency}
                </p>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-2">
            <h4 className="font-medium text-slate-900 dark:text-white text-sm">Tasks</h4>
            {stage.tasks.map(task => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/30 rounded border border-slate-200 dark:border-slate-600"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onTaskComplete?.(task.id)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      task.completed
                        ? 'text-slate-500 dark:text-slate-400 line-through'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {task.description}
                  </p>
                  {task.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-500 italic mt-1">
                      📝 {task.notes}
                    </p>
                  )}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  Day {task.dueDay}
                </span>
              </div>
            ))}
          </div>

          {/* Milestones */}
          {stage.milestones.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                Milestones to Watch
              </h4>
              <ul className="space-y-1">
                {stage.milestones.map((milestone, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="text-lg">⭐</span>
                    {milestone}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Common Issues */}
          {stage.commonIssues.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                Watch Out For
              </h4>
              <ul className="space-y-1">
                {stage.commonIssues.map((issue, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                    <span className="text-lg">⚠️</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Complete Stage Button */}
          {completedTasks === stage.tasks.length && !isCompleted && (
            <button
              onClick={onStageComplete}
              className="w-full px-3 py-2 bg-green-500 text-white rounded font-medium text-sm hover:bg-green-600 transition-colors"
            >
              ✓ Mark Stage Complete
            </button>
          )}
        </div>
      )}
    </div>
  );
};
