// Phase 19: Gantt Chart Panel Component (Optional)
// Visual timeline representation of scheduled tasks

'use client';

import React from 'react';
import { ScheduleProposal } from '@/app/workflow/workflowTypes';

interface GanttChartPanelProps {
  proposal: ScheduleProposal;
  isDarkMode?: boolean;
}

export const GanttChartPanel: React.FC<GanttChartPanelProps> = ({
  proposal,
  isDarkMode = false,
}) => {
  if (proposal.scheduledTasks.length === 0) {
    return (
      <div
        className={`p-4 rounded border ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          No tasks to display in Gantt chart
        </p>
      </div>
    );
  }

  // Parse dates and calculate positions
  const startDate = new Date(proposal.startDate);
  const endDate = new Date(proposal.endDate);
  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);

  // Group tasks by room
  const tasksByRoom = new Map<string, typeof proposal.scheduledTasks>();
  for (const task of proposal.scheduledTasks) {
    const room = task.room || 'unassigned';
    if (!tasksByRoom.has(room)) {
      tasksByRoom.set(room, []);
    }
    tasksByRoom.get(room)!.push(task);
  }

  const taskTypeColors: Record<string, string> = {
    'substrate-prep': 'bg-blue-600',
    'inoculation': 'bg-purple-600',
    'incubation-transition': 'bg-indigo-600',
    'fruiting-transition': 'bg-green-600',
    'misting': 'bg-cyan-600',
    'co2-adjustment': 'bg-teal-600',
    'harvest': 'bg-yellow-600',
    'cleaning': 'bg-red-600',
    'equipment-maintenance': 'bg-gray-600',
    'labor-intensive-monitoring': 'bg-orange-600',
    'species-reset': 'bg-pink-600',
  };

  return (
    <div
      className={`p-4 rounded border overflow-x-auto ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
        Gantt Timeline ({proposal.scheduledTasks.length} tasks)
      </h3>

      <div className="space-y-2">
        {Array.from(tasksByRoom).map(([room, tasks]) => (
          <div key={room} className="mb-4">
            <p className={`text-xs font-semibold mb-2 opacity-75 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {room}
            </p>
            <div
              className={`relative h-24 rounded border ${
                isDarkMode ? 'bg-gray-700/20 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}
            >
              {/* Timeline background (days) */}
              <div className="absolute inset-0 flex">
                {Array.from({ length: Math.ceil(totalDays) }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 border-r text-xs text-center opacity-20 pt-1 ${
                      isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'
                    }`}
                  >
                    {i % 7 === 0 ? `D${i}` : ''}
                  </div>
                ))}
              </div>

              {/* Task bars */}
              <div className="absolute inset-0 p-1">
                {tasks.map((task) => {
                  const taskStart = new Date(task.scheduledStart);
                  const taskEnd = new Date(task.scheduledEnd);
                  const offsetDays = (taskStart.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
                  const durationDays = (taskEnd.getTime() - taskStart.getTime()) / (1000 * 3600 * 24);
                  const leftPercent = (offsetDays / totalDays) * 100;
                  const widthPercent = (durationDays / totalDays) * 100;

                  return (
                    <div
                      key={task.taskId}
                      title={`${task.type}: ${taskStart.toLocaleDateString()} - ${taskEnd.toLocaleDateString()}`}
                      className={`absolute h-6 rounded text-white text-xs flex items-center justify-center font-semibold truncate ${
                        taskTypeColors[task.type] || 'bg-gray-600'
                      }`}
                      style={{
                        left: `${leftPercent}%`,
                        width: `${Math.max(widthPercent, 5)}%`,
                        top: `${(tasks.indexOf(task) % 3) * 20 + 8}px`,
                        zIndex: 10,
                      }}
                    >
                      {task.type.split('-').pop()?.substring(0, 3).toUpperCase()}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
        {Object.entries(taskTypeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${color}`} />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              {type.split('-').pop()}
            </span>
          </div>
        ))}
      </div>

      <div className={`text-xs opacity-50 mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Timeframe: {startDate.toLocaleDateString()} → {endDate.toLocaleDateString()} ({totalDays.toFixed(0)} days)
      </div>
    </div>
  );
};
