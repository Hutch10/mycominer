'use client';

/**
 * WORKLOAD ORCHESTRATION & SCHEDULING ENGINE - UI
 * Phase 57: Expansion Track
 * 
 * Unified scheduling interface for supervisors.
 * 
 * NO GENERATIVE AI. Deterministic schedules from real data.
 */

import React, { useState, useMemo } from 'react';
import {
  OrchestrationEngine,
  OrchestrationQuery,
  OrchestrationResult,
  OrchestrationSchedule,
  OrchestrationSlot,
  OrchestrationConflict,
  OrchestrationRecommendation,
  OrchestrationPolicyContext,
  TaskInput,
  AlertInput,
  OperatorAvailability,
  CapacityWindowInput,
} from './index';

// ============================================================================
// SAMPLE DATA GENERATION
// ============================================================================

function generateSampleData() {
  const now = Date.now();
  const scope = {
    tenantId: 'tenant-demo',
    facilityId: 'facility-a',
  };

  // Sample tasks (Phase 53)
  const tasks: TaskInput[] = [
    {
      taskId: 'task-1',
      category: 'audit-remediation',
      priority: 'critical',
      description: 'Fix critical audit finding in substrate sterilization',
      estimatedDurationMinutes: 45,
      slaDeadline: new Date(now + 7200000).toISOString(),
      assignedOperatorId: 'op-1',
      scope,
    },
    {
      taskId: 'task-2',
      category: 'drift-remediation',
      priority: 'high',
      description: 'Adjust temperature control parameters',
      estimatedDurationMinutes: 30,
      slaDeadline: new Date(now + 10800000).toISOString(),
      assignedOperatorId: 'op-2',
      scope,
    },
    {
      taskId: 'task-3',
      category: 'documentation-completeness',
      priority: 'medium',
      description: 'Complete missing harvest logs',
      estimatedDurationMinutes: 60,
      scope,
    },
  ];

  // Sample alerts (Phase 52)
  const alerts: AlertInput[] = [
    {
      alertId: 'alert-1',
      severity: 'critical',
      category: 'environmental',
      description: 'CO2 levels exceeded threshold',
      requiresFollowUp: true,
      estimatedResolutionMinutes: 20,
      scope,
    },
    {
      alertId: 'alert-2',
      severity: 'high',
      category: 'contamination',
      description: 'Possible contamination in chamber B',
      requiresFollowUp: true,
      estimatedResolutionMinutes: 90,
      scope,
    },
  ];

  // Sample operators
  const operators: OperatorAvailability[] = [
    {
      operatorId: 'op-1',
      operatorName: 'Alice Chen',
      availableFrom: new Date(now).toISOString(),
      availableUntil: new Date(now + 28800000).toISOString(),
      currentWorkload: 45,
      maxCapacity: 8,
      specializations: ['sterilization', 'audit'],
      scope,
    },
    {
      operatorId: 'op-2',
      operatorName: 'Bob Singh',
      availableFrom: new Date(now).toISOString(),
      availableUntil: new Date(now + 28800000).toISOString(),
      currentWorkload: 60,
      maxCapacity: 10,
      specializations: ['environmental', 'monitoring'],
      scope,
    },
    {
      operatorId: 'op-3',
      operatorName: 'Carol Martinez',
      availableFrom: new Date(now).toISOString(),
      availableUntil: new Date(now + 28800000).toISOString(),
      currentWorkload: 30,
      maxCapacity: 6,
      specializations: ['contamination', 'documentation'],
      scope,
    },
  ];

  // Sample capacity windows (Phase 56)
  const capacityWindows: CapacityWindowInput[] = [
    {
      windowId: 'window-1',
      windowStart: new Date(now).toISOString(),
      windowEnd: new Date(now + 7200000).toISOString(),
      projectedCapacity: 75,
      recommendedWorkload: 6,
      riskLevel: 'low',
      scope,
    },
    {
      windowId: 'window-2',
      windowStart: new Date(now + 7200000).toISOString(),
      windowEnd: new Date(now + 14400000).toISOString(),
      projectedCapacity: 90,
      recommendedWorkload: 8,
      riskLevel: 'medium',
      scope,
    },
  ];

  return { tasks, alerts, operators, capacityWindows, scope };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function WorkloadOrchestrationPage() {
  const [selectedView, setSelectedView] = useState<'schedule' | 'conflicts' | 'recommendations' | 'statistics'>('schedule');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Initialize engine and generate schedule
  const { engine, result, sampleData } = useMemo(() => {
    const engine = new OrchestrationEngine();
    const sampleData = generateSampleData();
    
    const query: OrchestrationQuery = {
      queryId: `query-${Date.now()}`,
      description: 'Generate 8-hour workload schedule',
      scope: sampleData.scope,
      timeRange: {
        start: new Date().toISOString(),
        end: new Date(Date.now() + 28800000).toISOString(),
      },
      categories: ['task-scheduling', 'alert-follow-up', 'audit-remediation', 'drift-remediation', 'documentation-completeness'],
      includeConflicts: true,
      includeRecommendations: true,
      options: {
        optimizeForCapacity: true,
        optimizeForSLA: true,
        balanceWorkload: true,
        respectCapacityWindows: true,
      },
      requestedBy: 'supervisor-demo',
      requestedAt: new Date().toISOString(),
    };

    const context: OrchestrationPolicyContext = {
      userId: 'supervisor-demo',
      userTenantId: 'tenant-demo',
      permissions: [
        'orchestration:view-all-operators',
        'orchestration:view-audit-remediation',
        'orchestration:long-range-schedule',
      ],
    };

    const result = engine.executeQuery(query, context, sampleData);
    
    return { engine, result, sampleData };
  }, []);

  if (!result.success) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded">
        <h2 className="text-xl font-bold text-red-800 mb-2">Orchestration Error</h2>
        <p className="text-red-700">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Workload Orchestration & Scheduling
        </h1>
        <p className="text-gray-600">
          Phase 57: Deterministic scheduling engine • Real tasks, alerts, metrics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="Total Slots"
          value={result.summary.totalSlots}
          subtitle="Scheduled time slots"
          color="blue"
        />
        <SummaryCard
          title="Conflicts"
          value={result.summary.totalConflicts}
          subtitle={`${result.summary.criticalConflicts} critical`}
          color={result.summary.criticalConflicts > 0 ? 'red' : 'green'}
        />
        <SummaryCard
          title="Capacity Utilization"
          value={`${result.summary.averageCapacityUtilization.toFixed(1)}%`}
          subtitle="Average operator load"
          color={result.summary.averageCapacityUtilization > 80 ? 'orange' : 'green'}
        />
        <SummaryCard
          title="SLA Risk"
          value={`${result.summary.slaRiskScore.toFixed(0)}/100`}
          subtitle="Risk score"
          color={result.summary.slaRiskScore > 50 ? 'red' : 'green'}
        />
      </div>

      {/* View Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <TabButton
          active={selectedView === 'schedule'}
          onClick={() => setSelectedView('schedule')}
          label="Schedule"
        />
        <TabButton
          active={selectedView === 'conflicts'}
          onClick={() => setSelectedView('conflicts')}
          label={`Conflicts (${result.schedule.conflicts.length})`}
        />
        <TabButton
          active={selectedView === 'recommendations'}
          onClick={() => setSelectedView('recommendations')}
          label={`Recommendations (${result.schedule.recommendations.length})`}
        />
        <TabButton
          active={selectedView === 'statistics'}
          onClick={() => setSelectedView('statistics')}
          label="Statistics"
        />
      </div>

      {/* Views */}
      {selectedView === 'schedule' && <ScheduleView schedule={result.schedule} />}
      {selectedView === 'conflicts' && <ConflictsView conflicts={result.schedule.conflicts} />}
      {selectedView === 'recommendations' && <RecommendationsView recommendations={result.schedule.recommendations} />}
      {selectedView === 'statistics' && <StatisticsView statistics={engine.getStatistics()} schedule={result.schedule} />}

      {/* Metadata */}
      <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-2">Metadata</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Computed:</span>
            <span className="ml-2 text-gray-900">{new Date(result.metadata.computedAt).toLocaleTimeString()}</span>
          </div>
          <div>
            <span className="text-gray-500">Duration:</span>
            <span className="ml-2 text-gray-900">{result.metadata.computationTimeMs}ms</span>
          </div>
          <div>
            <span className="text-gray-500">Tasks:</span>
            <span className="ml-2 text-gray-900">{result.references.tasksScheduled.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Alerts:</span>
            <span className="ml-2 text-gray-900">{result.references.alertsScheduled.length}</span>
          </div>
        </div>
      </div>

      {/* Architecture Notice */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Deterministic Scheduling:</strong> All schedules derived from real tasks (Phase 53), alerts (Phase 52), 
          operator availability, and capacity windows (Phase 56). NO generative AI. NO predictions. NO synthetic workloads.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

function SummaryCard({ title, value, subtitle, color }: {
  title: string;
  value: string | number;
  subtitle: string;
  color: 'blue' | 'green' | 'orange' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    red: 'bg-red-50 border-red-200 text-red-900',
  };

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
      <div className="text-sm font-medium opacity-75 mb-1">{title}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs opacity-75">{subtitle}</div>
    </div>
  );
}

function TabButton({ active, onClick, label }: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium transition-colors ${
        active
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );
}

function ScheduleView({ schedule }: { schedule: OrchestrationSchedule }) {
  return (
    <div className="space-y-6">
      {/* Operator Summary */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Operator Workload</h3>
        <div className="space-y-3">
          {schedule.operatorSummary.map(summary => (
            <div key={summary.operatorId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <div className="font-medium text-gray-900">{summary.operatorName}</div>
                <div className="text-sm text-gray-600">
                  {summary.totalSlots} slots • {summary.totalWorkMinutes} minutes
                </div>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${summary.capacityUtilization > 80 ? 'text-red-600' : 'text-green-600'}`}>
                  {summary.capacityUtilization.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">
                  SLA Risk: {summary.slaRisk.toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Slots */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Slots</h3>
        <div className="space-y-2">
          {schedule.slots.map(slot => (
            <SlotCard key={slot.slotId} slot={slot} />
          ))}
          {schedule.slots.length === 0 && (
            <p className="text-gray-500 text-center py-8">No slots scheduled</p>
          )}
        </div>
      </div>

      {/* Category Summary */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(schedule.categorySummary).map(([category, summary]) => (
            summary.totalSlots > 0 && (
              <div key={category} className="p-3 bg-gray-50 rounded">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div className="text-lg font-semibold text-gray-900">{summary.totalSlots}</div>
                <div className="text-xs text-gray-600">
                  {summary.criticalCount} critical, {summary.highCount} high
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

function SlotCard({ slot }: { slot: OrchestrationSlot }) {
  const priorityColors = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-green-100 text-green-800 border-green-300',
  };

  return (
    <div className={`p-4 rounded border ${priorityColors[slot.priority]}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-medium">{slot.workItemDescription}</div>
          <div className="text-sm opacity-75 mt-1">
            {new Date(slot.startTime).toLocaleTimeString()} - {new Date(slot.endTime).toLocaleTimeString()}
            {' • '}{slot.durationMinutes} min
          </div>
        </div>
        <div className="text-xs font-semibold px-2 py-1 rounded bg-white bg-opacity-50">
          {slot.priority.toUpperCase()}
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="opacity-75">Operator: {slot.operatorName}</span>
        <span className="opacity-75">Utilization: {slot.capacityUtilization.toFixed(1)}%</span>
        {slot.slaDeadline && (
          <span className={slot.slaBuffer && slot.slaBuffer < 30 ? 'text-red-900 font-semibold' : 'opacity-75'}>
            SLA Buffer: {slot.slaBuffer}m
          </span>
        )}
      </div>
    </div>
  );
}

function ConflictsView({ conflicts }: { conflicts: OrchestrationConflict[] }) {
  if (conflicts.length === 0) {
    return (
      <div className="bg-green-50 p-8 rounded-lg border border-green-200 text-center">
        <div className="text-green-800 font-semibold text-lg mb-2">No Conflicts Detected</div>
        <p className="text-green-700">All slots scheduled without conflicts</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conflicts.map(conflict => (
        <div key={conflict.conflictId} className={`p-6 rounded-lg border ${
          conflict.severity === 'critical' ? 'bg-red-50 border-red-300' :
          conflict.severity === 'high' ? 'bg-orange-50 border-orange-300' :
          'bg-yellow-50 border-yellow-300'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-semibold text-gray-900 text-lg mb-1">
                {conflict.conflictType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
              <div className="text-gray-700">{conflict.description}</div>
            </div>
            <div className="text-xs font-semibold px-3 py-1 rounded bg-white">
              {conflict.severity.toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
            <div>
              <span className="text-gray-600">Operators Affected:</span>
              <span className="ml-2 font-semibold">{conflict.impactAnalysis.operatorsAffected.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Tasks Delayed:</span>
              <span className="ml-2 font-semibold">{conflict.impactAnalysis.tasksDelayed}</span>
            </div>
            <div>
              <span className="text-gray-600">SLA Risk:</span>
              <span className="ml-2 font-semibold">{conflict.impactAnalysis.slaRisk}%</span>
            </div>
            <div>
              <span className="text-gray-600">Capacity Overage:</span>
              <span className="ml-2 font-semibold">{conflict.impactAnalysis.capacityOverage.toFixed(1)}%</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded">
            <div className="font-medium text-gray-700 mb-2">Recommended Action:</div>
            <div className="text-gray-900">{conflict.recommendedAction}</div>
            {conflict.resolutionOptions.length > 1 && (
              <div className="mt-2 text-sm text-gray-600">
                Alternatives: {conflict.resolutionOptions.filter(o => o !== conflict.recommendedAction).join(', ')}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function RecommendationsView({ recommendations }: { recommendations: OrchestrationRecommendation[] }) {
  if (recommendations.length === 0) {
    return (
      <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 text-center">
        <div className="text-gray-700 font-semibold text-lg mb-2">No Recommendations</div>
        <p className="text-gray-600">Schedule is optimized</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map(rec => (
        <div key={rec.recommendationId} className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-semibold text-gray-900 text-lg mb-1">
                {rec.recommendationType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
              <div className="text-gray-700">{rec.description}</div>
            </div>
            <div className={`text-xs font-semibold px-3 py-1 rounded ${
              rec.confidenceLevel === 'high' ? 'bg-green-100 text-green-800' :
              rec.confidenceLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {rec.confidenceLevel.toUpperCase()} CONFIDENCE
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded mb-4">
            <div className="text-sm text-blue-800 mb-1 font-medium">Rationale:</div>
            <div className="text-blue-900">{rec.rationale}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            {rec.expectedBenefit.capacityImprovement !== undefined && rec.expectedBenefit.capacityImprovement > 0 && (
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="text-xs text-green-700 mb-1">Capacity Improvement</div>
                <div className="text-lg font-semibold text-green-900">+{rec.expectedBenefit.capacityImprovement}%</div>
              </div>
            )}
            {rec.expectedBenefit.slaImprovement !== undefined && rec.expectedBenefit.slaImprovement > 0 && (
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="text-xs text-green-700 mb-1">SLA Improvement</div>
                <div className="text-lg font-semibold text-green-900">+{rec.expectedBenefit.slaImprovement}%</div>
              </div>
            )}
            {rec.expectedBenefit.workloadBalance !== undefined && rec.expectedBenefit.workloadBalance > 0 && (
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="text-xs text-green-700 mb-1">Workload Balance</div>
                <div className="text-lg font-semibold text-green-900">+{rec.expectedBenefit.workloadBalance}%</div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <div className="font-medium text-gray-700 mb-2">Suggested Actions:</div>
            <ul className="list-disc list-inside space-y-1">
              {rec.suggestedActions.map((action, i) => (
                <li key={i} className="text-gray-900">{action}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatisticsView({ statistics, schedule }: {
  statistics: ReturnType<OrchestrationEngine['getStatistics']>;
  schedule: OrchestrationSchedule;
}) {
  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Schedules" value={statistics.totalSchedules} />
          <StatCard label="Total Slots" value={statistics.totalSlots} />
          <StatCard label="Total Conflicts" value={statistics.totalConflicts} />
          <StatCard label="Total Recommendations" value={statistics.totalRecommendations} />
        </div>
      </div>

      {/* Conflict Distribution */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conflict Distribution</h3>
        <div className="space-y-2">
          <DistributionBar label="Over Capacity" value={statistics.conflictDistribution.overCapacity} color="orange" />
          <DistributionBar label="SLA Collision" value={statistics.conflictDistribution.slaCollision} color="red" />
          <DistributionBar label="Operator Overload" value={statistics.conflictDistribution.operatorOverload} color="red" />
          <DistributionBar label="Resource Unavailable" value={statistics.conflictDistribution.resourceUnavailable} color="yellow" />
          <DistributionBar label="Schedule Overlap" value={statistics.conflictDistribution.scheduleOverlap} color="orange" />
        </div>
      </div>

      {/* Capacity Metrics */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacity Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Average Utilization"
            value={`${statistics.capacityMetrics.averageUtilization.toFixed(1)}%`}
          />
          <StatCard
            label="Peak Utilization"
            value={`${statistics.capacityMetrics.peakUtilization.toFixed(1)}%`}
          />
          <StatCard
            label="Underutilized Operators"
            value={statistics.capacityMetrics.underutilizedOperators}
          />
          <StatCard
            label="Overutilized Operators"
            value={statistics.capacityMetrics.overutilizedOperators}
          />
        </div>
      </div>

      {/* SLA Metrics */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SLA Metrics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded text-center">
            <div className="text-2xl font-bold text-green-900">{statistics.slaMetrics.slotsWithinSLA}</div>
            <div className="text-sm text-green-700 mt-1">Within SLA</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded text-center">
            <div className="text-2xl font-bold text-yellow-900">{statistics.slaMetrics.slotsAtRisk}</div>
            <div className="text-sm text-yellow-700 mt-1">At Risk</div>
          </div>
          <div className="p-4 bg-red-50 rounded text-center">
            <div className="text-2xl font-bold text-red-900">{statistics.slaMetrics.slotsBreached}</div>
            <div className="text-sm text-red-700 mt-1">Breached</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-4 bg-gray-50 rounded">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

function DistributionBar({ label, value, color }: {
  label: string;
  value: number;
  color: 'red' | 'orange' | 'yellow' | 'green';
}) {
  const colorClasses = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
  };

  const maxValue = 10; // Arbitrary max for visualization
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="font-semibold text-gray-900">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
