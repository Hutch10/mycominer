'use client';

import { UpcomingTask } from '../commandCenterTypes';

interface UpcomingTasksPanelProps {
  tasks: UpcomingTask[];
}

export function UpcomingTasksPanel({ tasks }: UpcomingTasksPanelProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">📅 Scheduled</span>;
      case 'ready':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">✓ Ready</span>;
      case 'in-progress':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">▶️ In Progress</span>;
      case 'blocked':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">🚫 Blocked</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">✓ Done</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">{status}</span>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-blue-500';
      default: return 'border-l-gray-300';
    }
  };

  const getTimeUntil = (scheduledStart: string) => {
    const now = new Date();
    const start = new Date(scheduledStart);
    const diffMs = start.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) return 'Overdue';
    if (diffDays > 0) return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    return 'Starting soon';
  };

  const upcomingTasks = tasks.filter((t) => t.status !== 'completed').slice(0, 10);
  const nextTask = upcomingTasks[0];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        📋 Upcoming Tasks
      </h2>

      {upcomingTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          ✓ No scheduled tasks
        </div>
      ) : (
        <>
          {/* Next Task Highlight */}
          {nextTask && nextTask.status === 'ready' && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">👉</span>
                <span className="font-bold text-green-800 dark:text-green-200">
                  NEXT TASK TO START:
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {nextTask.title}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                {nextTask.description}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  📍 {nextTask.facilityId}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  ⏱️ {nextTask.estimatedDurationHours}h
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  👷 {nextTask.resources.laborHours}h labor
                </span>
              </div>
            </div>
          )}

          {/* Task List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {upcomingTasks.map((task) => (
              <div
                key={task.taskId}
                className={`border-l-4 p-4 rounded-r-lg bg-gray-50 dark:bg-gray-700 ${getPriorityColor(task.priority)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {task.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {task.description}
                    </p>
                  </div>
                  {getStatusBadge(task.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Facility</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {task.facilityId}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Scheduled</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(task.scheduledStart).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(task.scheduledStart).toLocaleTimeString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Duration</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {task.estimatedDurationHours}h
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Time Until</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {getTimeUntil(task.scheduledStart)}
                    </div>
                  </div>
                </div>

                {task.dependencies && task.dependencies.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-2 mt-2">
                    <div className="text-xs text-yellow-800 dark:text-yellow-200">
                      ⚠️ Depends on {task.dependencies.length} other task(s)
                    </div>
                  </div>
                )}

                {task.status === 'blocked' && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 mt-2">
                    <div className="text-xs text-red-800 dark:text-red-200">
                      🚫 Task is blocked - check dependencies
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t dark:border-gray-600">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Priority: <span className="font-medium">{task.priority}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Labor: {task.resources.laborHours}h
                    {task.resources.equipment.length > 0 && ` | Equipment: ${task.resources.equipment.length} item(s)`}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {tasks.length > upcomingTasks.length && (
            <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
              Showing {upcomingTasks.length} of {tasks.length} total tasks
            </div>
          )}
        </>
      )}
    </div>
  );
}
