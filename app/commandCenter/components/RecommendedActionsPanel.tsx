'use client';

import { useState } from 'react';
import { RecommendedAction } from '../commandCenterTypes';

interface RecommendedActionsPanelProps {
  actions: RecommendedAction[];
  onApprove?: (actionId: string) => void;
  onReject?: (actionId: string, reason: string) => void;
}

export function RecommendedActionsPanel({
  actions,
  onApprove,
  onReject,
}: RecommendedActionsPanelProps) {
  const [filter, setFilter] = useState<'all' | 'urgent' | 'high' | 'medium' | 'low'>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [rejectingActionId, setRejectingActionId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded">🔥 URGENT</span>;
      case 'high':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded">⚠️ HIGH</span>;
      case 'medium':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">▶️ MEDIUM</span>;
      case 'low':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">ℹ️ LOW</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded">UNKNOWN</span>;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'strategy-engine': return '🎯';
      case 'workflow-engine': return '📋';
      case 'resource-engine': return '📦';
      case 'execution-engine': return '▶️';
      case 'optimization-engine': return '⚡';
      case 'multi-facility-engine': return '🏭';
      default: return '•';
    }
  };

  const getEffortBadge = (effort: string) => {
    switch (effort) {
      case 'low':
        return <span className="text-green-600">Low effort</span>;
      case 'medium':
        return <span className="text-yellow-600">Medium effort</span>;
      case 'high':
        return <span className="text-red-600">High effort</span>;
      default:
        return <span className="text-gray-600">Unknown</span>;
    }
  };

  const filteredActions = actions.filter((action) => {
    if (filter !== 'all' && action.priority !== filter) return false;
    if (!showCompleted && (action.status === 'approved' || action.status === 'rejected' || action.status === 'implemented')) return false;
    return true;
  });

  const urgentCount = actions.filter((a) => a.priority === 'urgent' && a.status === 'pending').length;
  const highCount = actions.filter((a) => a.priority === 'high' && a.status === 'pending').length;

  const handleReject = (actionId: string) => {
    if (rejectReason.trim() && onReject) {
      onReject(actionId, rejectReason);
      setRejectingActionId(null);
      setRejectReason('');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        📌 What Should I Do Next?
      </h2>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({actions.length})
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'urgent'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            Urgent ({urgentCount})
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'high'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            High ({highCount})
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="rounded"
          />
          Show completed
        </label>
      </div>

      {/* Actions List */}
      {filteredActions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          ✓ No pending actions. Everything looks good!
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {filteredActions.map((action) => (
            <div
              key={action.actionId}
              className={`border-2 rounded-lg p-4 ${
                action.priority === 'urgent'
                  ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                  : action.priority === 'high'
                  ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getPriorityBadge(action.priority)}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getSourceIcon(action.source)} {action.source.replace(/-engine|-center/g, '')}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(action.timestamp).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                {action.title}
              </h3>

              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {action.description}
              </p>

              {action.rationale && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3 mb-3">
                  <div className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Why this action?
                  </div>
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    {action.rationale}
                  </div>
                </div>
              )}

              {/* Impact & Effort */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {action.estimatedImpact && Object.keys(action.estimatedImpact).length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Expected Benefits:</div>
                    <ul className="text-sm space-y-1">
                      {action.estimatedImpact.yieldIncrease !== undefined && (
                        <li className="text-green-700 dark:text-green-300">
                          📈 +{action.estimatedImpact.yieldIncrease}% yield
                        </li>
                      )}
                      {action.estimatedImpact.energyReduction !== undefined && (
                        <li className="text-green-700 dark:text-green-300">
                          ⚡ -{action.estimatedImpact.energyReduction}% energy
                        </li>
                      )}
                      {action.estimatedImpact.costSaving !== undefined && (
                        <li className="text-green-700 dark:text-green-300">
                          💰 ${action.estimatedImpact.costSaving.toLocaleString()} saved
                        </li>
                      )}
                      {action.estimatedImpact.riskReduction !== undefined && (
                        <li className="text-green-700 dark:text-green-300">
                          🛡️ -{action.estimatedImpact.riskReduction}% risk
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Implementation:</div>
                  <div className="text-sm font-medium">
                    {getEffortBadge(action.implementationEffort)}
                  </div>
                  {action.affectedFacilities.length > 0 && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Affects {action.affectedFacilities.length} facility(ies)
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {action.requiresApproval ? '🔒 Requires approval' : 'Can be implemented directly'}
                </span>

                {action.status === 'pending' && (
                  <div className="flex gap-2">
                    {rejectingActionId === action.actionId ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Reason for rejection..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="px-2 py-1 text-sm border rounded"
                        />
                        <button
                          onClick={() => handleReject(action.actionId)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setRejectingActionId(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        {onApprove && (
                          <button
                            onClick={() => onApprove(action.actionId)}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                          >
                            ✓ Approve
                          </button>
                        )}
                        {onReject && (
                          <button
                            onClick={() => setRejectingActionId(action.actionId)}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
                          >
                            ✕ Reject
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}

                {action.status === 'approved' && (
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    ✓ Approved by {action.approvedBy}
                  </span>
                )}

                {action.status === 'rejected' && (
                  <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                    ✕ Rejected
                  </span>
                )}

                {action.status === 'implemented' && (
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    ✓ Implemented
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
