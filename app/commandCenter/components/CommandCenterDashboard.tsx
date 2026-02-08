'use client';

import { useState, useEffect } from 'react';
import { CommandCenterState } from '../commandCenterTypes';
import { SystemHealthPanel } from './SystemHealthPanel';
import { FacilityOverviewPanel } from './FacilityOverviewPanel';
import { AlertsPanel } from './AlertsPanel';
import { RecommendedActionsPanel } from './RecommendedActionsPanel';
import { UpcomingTasksPanel } from './UpcomingTasksPanel';
import { GlobalKPIPanel } from './GlobalKPIPanel';
import { CommandCenterHistoryViewer } from './CommandCenterHistoryViewer';
import { commandCenterAggregator } from '../commandCenterAggregator';

interface CommandCenterDashboardProps {
  initialState?: CommandCenterState;
}

export function CommandCenterDashboard({ initialState }: CommandCenterDashboardProps) {
  const [state, setState] = useState<CommandCenterState | null>(initialState || null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'facilities' | 'alerts' | 'actions' | 'tasks' | 'kpis' | 'history'
  >('overview');
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // In production, this would call commandCenterAggregator with real data
      // For now, we just keep the initial state
      console.log('Auto-refresh triggered');
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleAcknowledgeAlert = (alertId: string) => {
    if (!state) return;

    const alert = state.alerts.find((a) => a.alertId === alertId);
    if (alert) {
      const acknowledged = commandCenterAggregator.acknowledgeAlert(alert, 'operator-1');
      setState({
        ...state,
        alerts: state.alerts.map((a) => (a.alertId === alertId ? acknowledged : a)),
      });
    }
  };

  const handleApproveAction = (actionId: string) => {
    if (!state) return;

    const action = state.recommendedActions.find((a) => a.actionId === actionId);
    if (action) {
      const approved = commandCenterAggregator.approveAction(action, 'operator-1');
      setState({
        ...state,
        recommendedActions: state.recommendedActions.map((a) =>
          a.actionId === actionId ? approved : a
        ),
      });
    }
  };

  const handleRejectAction = (actionId: string, reason: string) => {
    if (!state) return;

    const action = state.recommendedActions.find((a) => a.actionId === actionId);
    if (action) {
      const rejected = commandCenterAggregator.rejectAction(action, 'operator-1', reason);
      setState({
        ...state,
        recommendedActions: state.recommendedActions.map((a) =>
          a.actionId === actionId ? rejected : a
        ),
      });
    }
  };

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Command Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            No data available. Please configure facility data sources.
          </p>
        </div>
      </div>
    );
  }

  // Update system health with alert counts
  const updatedSystemHealth = {
    ...state.systemHealth,
    activeAlerts: state.alerts.filter((a) => !a.acknowledged).length,
    criticalAlerts: state.alerts.filter((a) => a.severity === 'critical' && !a.acknowledged).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                🏭 Mushroom Farm Command Center
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date(state.generatedAt).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Auto-refresh (30s)
              </label>

              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium rounded-t ${
                activeTab === 'overview'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('facilities')}
              className={`px-4 py-2 text-sm font-medium rounded-t ${
                activeTab === 'facilities'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Facilities ({state.facilityHealth.length})
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-4 py-2 text-sm font-medium rounded-t ${
                activeTab === 'alerts'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Alerts ({updatedSystemHealth.activeAlerts})
              {updatedSystemHealth.criticalAlerts > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {updatedSystemHealth.criticalAlerts}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`px-4 py-2 text-sm font-medium rounded-t ${
                activeTab === 'actions'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Recommended Actions ({state.recommendedActions.filter((a) => a.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 text-sm font-medium rounded-t ${
                activeTab === 'tasks'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Upcoming Tasks ({state.upcomingTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('kpis')}
              className={`px-4 py-2 text-sm font-medium rounded-t ${
                activeTab === 'kpis'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              KPIs ({state.kpis.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-sm font-medium rounded-t ${
                activeTab === 'history'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              History
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <SystemHealthPanel systemHealth={updatedSystemHealth} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AlertsPanel
                alerts={state.alerts.slice(0, 5)}
                onAcknowledge={handleAcknowledgeAlert}
              />
              <RecommendedActionsPanel
                actions={state.recommendedActions.slice(0, 5)}
                onApprove={handleApproveAction}
                onReject={handleRejectAction}
              />
            </div>

            <UpcomingTasksPanel tasks={state.upcomingTasks} />
          </div>
        )}

        {activeTab === 'facilities' && <FacilityOverviewPanel facilities={state.facilityHealth} />}

        {activeTab === 'alerts' && (
          <AlertsPanel alerts={state.alerts} onAcknowledge={handleAcknowledgeAlert} />
        )}

        {activeTab === 'actions' && (
          <RecommendedActionsPanel
            actions={state.recommendedActions}
            onApprove={handleApproveAction}
            onReject={handleRejectAction}
          />
        )}

        {activeTab === 'tasks' && <UpcomingTasksPanel tasks={state.upcomingTasks} />}

        {activeTab === 'kpis' && <GlobalKPIPanel kpis={state.kpis} />}

        {activeTab === 'history' && <CommandCenterHistoryViewer />}
      </div>

      {/* Data Freshness Indicator */}
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 text-xs">
        <div className="font-semibold text-gray-900 dark:text-white mb-2">Data Sources:</div>
        <div className="space-y-1 text-gray-600 dark:text-gray-400">
          <div>Strategy: {state.aggregationSources.strategyProposals} proposals</div>
          <div>Workflow: {state.aggregationSources.workflowPlans} plans</div>
          <div>Resources: {state.aggregationSources.resourceAllocations} allocations</div>
          <div>Execution: {state.aggregationSources.executionPlans} plans</div>
          <div>Optimization: {state.aggregationSources.optimizationProposals} proposals</div>
          <div>Multi-Facility: {state.aggregationSources.multiFacilityInsights} insights</div>
        </div>
      </div>
    </div>
  );
}
