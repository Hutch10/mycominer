// Phase 19: Workflow Task Card Component
// Displays individual workflow task with dependencies and status

'use client';

import React from 'react';
import { WorkflowTask } from '@/app/workflow/workflowTypes';

interface WorkflowTaskCardProps {
  task: WorkflowTask;
  isDarkMode?: boolean;
  onSelect?: (taskId: string) => void;
}

export const WorkflowTaskCard: React.FC<WorkflowTaskCardProps> = ({
  task,
  isDarkMode = false,
  onSelect,
}) => {
  const priorityColors: Record<string, string> = {
    critical: isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-300',
    high: isDarkMode ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-300',
    normal: isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-300',
    low: isDarkMode ? 'bg-gray-800/20 border-gray-600' : 'bg-gray-50 border-gray-300',
  };

  const priorityBadgeColors: Record<string, string> = {
    critical: 'bg-red-600 text-white',
    high: 'bg-orange-600 text-white',
    normal: 'bg-blue-600 text-white',
    low: 'bg-gray-600 text-white',
  };

  return (
    <div
      onClick={() => onSelect?.(task.taskId)}
      className={`
        p-4 rounded border cursor-pointer transition-all
        ${priorityColors[task.priority]}
        ${isDarkMode ? 'hover:bg-opacity-70' : 'hover:shadow-md'}
      `}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {task.taskId}
          </h4>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {task.type}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded font-medium ${priorityBadgeColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      <div className={`text-xs space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {task.species && (
          <p>
            <strong>Species:</strong> {task.species}
          </p>
        )}
        {task.room && (
          <p>
            <strong>Room:</strong> {task.room}
          </p>
        )}
        <p>
          <strong>Duration:</strong> {task.durationHours}h
        </p>
        <p>
          <strong>Labor:</strong> {task.laborHours}h
        </p>
        {task.stage && (
          <p>
            <strong>Stage:</strong> {task.stage}
          </p>
        )}
        {task.equipment && task.equipment.length > 0 && (
          <p>
            <strong>Equipment:</strong> {task.equipment.join(', ')}
          </p>
        )}
      </div>

      {task.dependsOn && task.dependsOn.length > 0 && (
        <div className={`text-xs mt-3 p-2 rounded ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
          <strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Dependencies:</strong>
          <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            {task.dependsOn.join(', ')}
          </div>
        </div>
      )}

      <div className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <strong>Rationale:</strong> {task.rationale}
      </div>
    </div>
  );
};
