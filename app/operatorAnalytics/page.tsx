/**
 * OPERATOR PERFORMANCE & WORKFLOW ANALYTICS CENTER
 * Phase 54: Deterministic, Read-Only Analytics
 * 
 * Analyzes operator performance, task throughput, SLA adherence,
 * workload distribution, and cross-engine efficiency.
 * 
 * NO GENERATIVE AI - ALL METRICS COMPUTED FROM REAL DATA
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  OperatorAnalyticsEngine,
  OperatorMetricQuery,
  OperatorMetricResult,
  OperatorAnalyticsPolicyContext,
  OperatorPerformanceSnapshot,
  OperatorWorkloadProfile,
  AnyOperatorMetric,
  TaskDataInput,
  AlertDataInput,
} from './index';

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function OperatorAnalyticsPage() {
  const [engine] = useState(() => new OperatorAnalyticsEngine());
  const [activeView, setActiveView] = useState<'overview' | 'throughput' | 'sla' | 'workload' | 'cross-engine' | 'operators'>('overview');
  const [result, setResult] = useState<OperatorMetricResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'day' | 'week' | 'month'>('week');

  // Mock context (in production, get from auth)
  const context: OperatorAnalyticsPolicyContext = {
    userId: 'user-001',
    userTenantId: 'tenant-001',
    userFederationId: 'fed-001',
    permissions: ['view-all-operators', 'view-cross-engine-metrics', 'view-workload-metrics'],
  };

  // Load sample data on mount
  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = () => {
    // Generate sample tasks
    const tasks: TaskDataInput[] = [];
    const now = Date.now();
    
    for (let i = 0; i < 100; i++) {
      const createdAt = new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
      const resolved = Math.random() > 0.3;
      
      tasks.push({
        taskId: `task-${i}`,
        category: ['alert-remediation', 'audit-remediation', 'integrity-drift-remediation'][Math.floor(Math.random() * 3)] as any,
        severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)] as any,
        status: resolved ? 'resolved' : 'in-progress' as any,
        createdAt,
        acknowledgedAt: new Date(new Date(createdAt).getTime() + Math.random() * 2 * 60 * 60 * 1000).toISOString(),
        resolvedAt: resolved ? new Date(new Date(createdAt).getTime() + Math.random() * 48 * 60 * 60 * 1000).toISOString() : undefined,
        assignedTo: `operator-${Math.floor(Math.random() * 5) + 1}`,
        resolvedBy: resolved ? `operator-${Math.floor(Math.random() * 5) + 1}` : undefined,
        scope: {
          tenantId: 'tenant-001',
          facilityId: 'facility-001',
        },
      });
    }

    engine.ingestTaskData(tasks);
  };

  const executeQuery = async (categories: OperatorMetricQuery['categories']) => {
    setLoading(true);
    
    const timeRange = getTimeRange(selectedTimeRange);
    
    const query: OperatorMetricQuery = {
      queryId: `query-${Date.now()}`,
      description: `Analytics query for ${(categories || []).join(', ')}`,
      scope: {
        tenantId: 'tenant-001',
        facilityId: 'facility-001',
      },
      categories,
      timeRange,
      triggeredBy: context.userId,
      triggeredAt: new Date().toISOString(),
    };

    const result = await engine.executeQuery(query, context);
    setResult(result);
    setLoading(false);
  };

  const getTimeRange = (range: 'day' | 'week' | 'month') => {
    const end = new Date();
    const start = new Date();
    
    switch (range) {
      case 'day':
        start.setDate(start.getDate() - 1);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Operator Performance Analytics
          </h1>
          <p className="text-slate-300">
            Deterministic analytics for operator performance, SLA adherence, and workflow efficiency
          </p>
        </div>

        {/* Navigation */}
        <AnalyticsNavigation
          activeView={activeView}
          onViewChange={setActiveView}
          onTimeRangeChange={setSelectedTimeRange}
          selectedTimeRange={selectedTimeRange}
        />

        {/* Main Content */}
        <div className="mt-8 space-y-6">
          {activeView === 'overview' && (
            <OverviewPanel
              engine={engine}
              onExecuteQuery={executeQuery}
              loading={loading}
            />
          )}

          {activeView === 'throughput' && (
            <ThroughputPanel
              result={result}
              onRefresh={() => executeQuery(['task-throughput'])}
              loading={loading}
            />
          )}

          {activeView === 'sla' && (
            <SLAPanel
              result={result}
              onRefresh={() => executeQuery(['sla-adherence'])}
              loading={loading}
            />
          )}

          {activeView === 'workload' && (
            <WorkloadPanel
              result={result}
              onRefresh={() => executeQuery(['workload-distribution'])}
              loading={loading}
            />
          )}

          {activeView === 'cross-engine' && (
            <CrossEnginePanel
              result={result}
              onRefresh={() => executeQuery(['cross-engine-efficiency'])}
              loading={loading}
            />
          )}

          {activeView === 'operators' && (
            <OperatorsPanel
              result={result}
              onRefresh={() => executeQuery(['task-throughput', 'sla-adherence', 'alert-response-time'])}
              loading={loading}
            />
          )}
        </div>

        {/* Cross-Engine Navigation */}
        <CrossEngineHooks />
      </div>
    </div>
  );
}

// ============================================================================
// NAVIGATION COMPONENT
// ============================================================================

function AnalyticsNavigation({
  activeView,
  onViewChange,
  onTimeRangeChange,
  selectedTimeRange,
}: {
  activeView: string;
  onViewChange: (view: any) => void;
  onTimeRangeChange: (range: 'day' | 'week' | 'month') => void;
  selectedTimeRange: string;
}) {
  const views = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'throughput', label: 'Throughput', icon: '📈' },
    { id: 'sla', label: 'SLA Adherence', icon: '🎯' },
    { id: 'workload', label: 'Workload', icon: '⚖️' },
    { id: 'cross-engine', label: 'Cross-Engine', icon: '🔗' },
    { id: 'operators', label: 'Operators', icon: '👥' },
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {views.map(view => (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeView === view.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <span className="mr-2">{view.icon}</span>
              {view.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {['day', 'week', 'month'].map(range => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range as any)}
              className={`px-3 py-1 rounded text-sm ${
                selectedTimeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// OVERVIEW PANEL
// ============================================================================

function OverviewPanel({
  engine,
  onExecuteQuery,
  loading,
}: {
  engine: OperatorAnalyticsEngine;
  onExecuteQuery: (categories: any[]) => void;
  loading: boolean;
}) {
  const stats = engine.getStatistics();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Queries"
        value={stats.totalQueries}
        icon="🔍"
          trend={stats.trends.metricsChange}
      />
      <MetricCard
        title="Total Metrics"
        value={stats.totalMetrics}
        icon="📊"
        trend={stats.trends.metricsChange}
      />
      <MetricCard
        title="Snapshots"
        value={stats.totalSnapshots}
        icon="📸"
        trend={stats.trends.snapshotsChange}
      />
      <MetricCard
        title="Workload Profiles"
        value={stats.totalWorkloadProfiles}
        icon="⚖️"
        trend={0}
      />

      <div className="col-span-full bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => onExecuteQuery(['task-throughput'])}
            disabled={loading}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-all"
          >
            📈 Throughput
          </button>
          <button
            onClick={() => onExecuteQuery(['sla-adherence'])}
            disabled={loading}
            className="px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-all"
          >
            🎯 SLA
          </button>
          <button
            onClick={() => onExecuteQuery(['workload-distribution'])}
            disabled={loading}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-all"
          >
            ⚖️ Workload
          </button>
          <button
            onClick={() => onExecuteQuery(['cross-engine-efficiency'])}
            disabled={loading}
            className="px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-all"
          >
            🔗 Cross-Engine
          </button>
          <button
            onClick={() => onExecuteQuery(['task-throughput', 'sla-adherence', 'alert-response-time'])}
            disabled={loading}
            className="px-4 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-all"
          >
            🔥 Full Report
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// THROUGHPUT PANEL
// ============================================================================

function ThroughputPanel({
  result,
  onRefresh,
  loading,
}: {
  result: OperatorMetricResult | null;
  onRefresh: () => void;
  loading: boolean;
}) {
  const metric = result?.metrics.find(m => m.category === 'task-throughput');

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Task Throughput</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg"
        >
          {loading ? 'Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {metric && 'breakdown' in metric && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-400">{metric.value}</div>
            <div className="text-slate-400 mt-2">Tasks Completed</div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <BreakdownCard title="By Category" data={metric.breakdown.byCategory} />
            <BreakdownCard title="By Severity" data={metric.breakdown.bySeverity} />
            <BreakdownCard title="By Status" data={metric.breakdown.byStatus} />
          </div>
        </div>
      )}

      {!metric && !loading && (
        <div className="text-center text-slate-400 py-12">
          Click Refresh to load throughput data
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SLA PANEL
// ============================================================================

function SLAPanel({
  result,
  onRefresh,
  loading,
}: {
  result: OperatorMetricResult | null;
  onRefresh: () => void;
  loading: boolean;
}) {
  const metric = result?.metrics.find(m => m.category === 'sla-adherence');

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">SLA Adherence</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg"
        >
          {loading ? 'Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {metric && 'breakdown' in metric && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-green-400">
              {metric.value.toFixed(1)}%
            </div>
            <div className="text-slate-400 mt-2">SLA Adherence Rate</div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">By Severity</h4>
              {Object.entries(metric.breakdown.bySeverity).map(([sev, data]: [string, any]) => (
                <div key={sev} className="flex justify-between items-center py-2 border-b border-slate-600 last:border-0">
                  <span className="text-slate-300 capitalize">{sev}</span>
                  <span className="text-white font-semibold">{data.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Total Tasks</span>
                  <span className="text-white font-semibold">{metric.breakdown.totalTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Within SLA</span>
                  <span className="text-green-400 font-semibold">{metric.breakdown.withinSLA}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Outside SLA</span>
                  <span className="text-red-400 font-semibold">{metric.breakdown.outsideSLA}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!metric && !loading && (
        <div className="text-center text-slate-400 py-12">
          Click Refresh to load SLA data
        </div>
      )}
    </div>
  );
}

// ============================================================================
// WORKLOAD PANEL
// ============================================================================

function WorkloadPanel({
  result,
  onRefresh,
  loading,
}: {
  result: OperatorMetricResult | null;
  onRefresh: () => void;
  loading: boolean;
}) {
  const profile = result?.workloadProfile;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Workload Distribution</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white rounded-lg"
        >
          {loading ? 'Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {profile && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-400">{profile.totalOperators}</div>
              <div className="text-slate-400 text-sm">Operators</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">{profile.totalTasks}</div>
              <div className="text-slate-400 text-sm">Total Tasks</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">{profile.averageTasksPerOperator.toFixed(1)}</div>
              <div className="text-slate-400 text-sm">Avg per Operator</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">{profile.workloadBalance.balanceScore.toFixed(1)}</div>
              <div className="text-slate-400 text-sm">Balance Score</div>
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3">Operators</h4>
            <div className="space-y-2">
              {profile.operators.map(op => (
                <div key={op.operatorId} className="flex items-center justify-between py-2 border-b border-slate-600 last:border-0">
                  <div>
                    <div className="text-white font-medium">{op.operatorName}</div>
                    <div className="text-slate-400 text-sm">
                      {op.completedTasks} completed, {op.activeTasks} active
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">{op.totalTasks} tasks</div>
                    <div className="text-slate-400 text-sm">{op.completionRate.toFixed(1)}% complete</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!profile && !loading && (
        <div className="text-center text-slate-400 py-12">
          Click Refresh to load workload data
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CROSS-ENGINE PANEL
// ============================================================================

function CrossEnginePanel({
  result,
  onRefresh,
  loading,
}: {
  result: OperatorMetricResult | null;
  onRefresh: () => void;
  loading: boolean;
}) {
  const metric = result?.metrics.find(m => m.category === 'cross-engine-efficiency');

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Cross-Engine Efficiency</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white rounded-lg"
        >
          {loading ? 'Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {metric && 'breakdown' in metric && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-orange-400">
              {metric.value.toFixed(1)}%
            </div>
            <div className="text-slate-400 mt-2">Overall Completion Rate</div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3">By Engine</h4>
            <div className="space-y-3">
              {Object.entries(metric.breakdown.byEngine).map(([engine, data]: [string, any]) => (
                <div key={engine} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium capitalize">{engine}</span>
                    <span className="text-orange-400 font-semibold">{data.completionRate.toFixed(1)}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-slate-400">Tasks</div>
                      <div className="text-white">{data.totalTasks}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Resolved</div>
                      <div className="text-white">{data.resolvedTasks}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Avg Time</div>
                      <div className="text-white">{data.averageResolutionTime.toFixed(1)}h</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!metric && !loading && (
        <div className="text-center text-slate-400 py-12">
          Click Refresh to load cross-engine data
        </div>
      )}
    </div>
  );
}

// ============================================================================
// OPERATORS PANEL
// ============================================================================

function OperatorsPanel({
  result,
  onRefresh,
  loading,
}: {
  result: OperatorMetricResult | null;
  onRefresh: () => void;
  loading: boolean;
}) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Operator Performance</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-slate-600 text-white rounded-lg"
        >
          {loading ? 'Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {result?.performanceSnapshots && result.performanceSnapshots.length > 0 ? (
        <div className="space-y-4">
          {result.performanceSnapshots.map(snapshot => (
            <div key={snapshot.snapshotId} className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{snapshot.operatorName}</h3>
                  <p className="text-slate-400 text-sm">{snapshot.operatorId}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-pink-400">{snapshot.slaAdherencePercentage.toFixed(1)}%</div>
                  <div className="text-slate-400 text-sm">SLA Adherence</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">{snapshot.tasksCompleted}</div>
                  <div className="text-slate-400 text-sm">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{snapshot.tasksActive}</div>
                  <div className="text-slate-400 text-sm">Active</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">{snapshot.averageResolutionTimeHours.toFixed(1)}h</div>
                  <div className="text-slate-400 text-sm">Avg Resolution</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-400 py-12">
          Click Refresh to load operator performance data
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function MetricCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: number;
  icon: string;
  trend: number;
}) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {trend !== 0 && (
        <div className={`text-sm mt-2 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

function BreakdownCard({ title, data }: { title: string; data: Record<string, number> }) {
  return (
    <div className="bg-slate-700/50 rounded-lg p-4">
      <h4 className="text-lg font-semibold text-white mb-3">{title}</h4>
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-slate-300 capitalize text-sm">{key}</span>
            <span className="text-white font-semibold">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// CROSS-ENGINE HOOKS
// ============================================================================

function CrossEngineHooks() {
  const hooks = [
    { id: 'action-center', label: 'Action Center', path: '/actionCenter', icon: '📋' },
    { id: 'alert-center', label: 'Alert Center', path: '/alertCenter', icon: '🚨' },
    { id: 'auditor', label: 'Auditor', path: '/auditor', icon: '🔍' },
    { id: 'integrity', label: 'Integrity Monitor', path: '/integrity', icon: '🛡️' },
    { id: 'governance', label: 'Governance', path: '/governance', icon: '⚖️' },
    { id: 'documentation', label: 'Documentation', path: '/documentation', icon: '📚' },
    { id: 'simulation', label: 'Simulation', path: '/simulation', icon: '🎮' },
    { id: 'compliance', label: 'Compliance', path: '/compliance', icon: '✅' },
    { id: 'fabric', label: 'Fabric', path: '/fabric', icon: '🕸️' },
    { id: 'telemetry', label: 'Telemetry', path: '/telemetry', icon: '📡' },
  ];

  return (
    <div className="mt-12 bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
      <h3 className="text-xl font-semibold text-white mb-4">Cross-Engine Navigation</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {hooks.map(hook => (
          <a
            key={hook.id}
            href={hook.path}
            className="flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-all"
          >
            <span>{hook.icon}</span>
            <span className="text-sm font-medium">{hook.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
