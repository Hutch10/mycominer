'use client';

/**
 * REAL-TIME PERFORMANCE MONITORING DASHBOARD
 * Phase 55: Real-Time Performance Monitoring
 * 
 * Live monitoring of operator performance, SLA adherence, workload changes,
 * and cross-engine operational signals.
 */

import React, { useState, useEffect } from 'react';

// ============================================================================
// SAMPLE DATA GENERATION
// ============================================================================

function generateSampleStreamState() {
  return {
    stateId: 'state-001',
    scope: { tenantId: 'tenant-alpha', facilityId: 'facility-01' },
    recentEvents: Array.from({ length: 50 }, (_, i) => ({
      eventId: `event-${i}`,
      category: ['task-lifecycle', 'alert-lifecycle', 'audit-finding', 'drift-detection'][Math.floor(Math.random() * 4)] as any,
      eventType: ['created', 'acknowledged', 'resolved'][Math.floor(Math.random() * 3)],
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      scope: { tenantId: 'tenant-alpha', facilityId: 'facility-01' },
      severity: ['critical', 'high', 'medium', 'low', 'info'][Math.floor(Math.random() * 5)] as any,
      entityId: `entity-${i}`,
      entityType: 'task',
      operatorId: `operator-${Math.floor(Math.random() * 5) + 1}`,
      operatorName: `Operator ${Math.floor(Math.random() * 5) + 1}`,
      metadata: { sourceSystem: 'action-center', sourcePhase: 53 },
      payload: {},
    })),
    maxEventBufferSize: 1000,
    rollingMetrics: {
      totalEventsReceived: 1247,
      eventsPerMinute: 12,
      eventsByCategory: {
        'task-lifecycle': 523,
        'alert-lifecycle': 342,
        'audit-finding': 201,
        'drift-detection': 181,
      },
      eventsBySeverity: {
        critical: 45,
        high: 123,
        medium: 456,
        low: 423,
        info: 200,
      },
    },
    slaCountdowns: [
      { entityId: 'task-001', entityType: 'task', severity: 'critical', startTime: new Date(Date.now() - 2 * 3600000).toISOString(), slaThresholdHours: 4, timeRemainingHours: 2, status: 'ok' as const },
      { entityId: 'task-002', entityType: 'task', severity: 'high', startTime: new Date(Date.now() - 20 * 3600000).toISOString(), slaThresholdHours: 24, timeRemainingHours: 4, status: 'warning' as const },
      { entityId: 'alert-003', entityType: 'alert', severity: 'critical', startTime: new Date(Date.now() - 5 * 3600000).toISOString(), slaThresholdHours: 4, timeRemainingHours: -1, status: 'breach' as const },
    ],
    workloadState: [
      { operatorId: 'op-001', operatorName: 'Alice', activeTasks: 8, criticalTasks: 2, highTasks: 3, mediumTasks: 2, lowTasks: 1, lastUpdated: new Date().toISOString() },
      { operatorId: 'op-002', operatorName: 'Bob', activeTasks: 5, criticalTasks: 0, highTasks: 2, mediumTasks: 2, lowTasks: 1, lastUpdated: new Date().toISOString() },
      { operatorId: 'op-003', operatorName: 'Charlie', activeTasks: 12, criticalTasks: 3, highTasks: 4, mediumTasks: 3, lowTasks: 2, lastUpdated: new Date().toISOString() },
    ],
    streamHealth: {
      isActive: true,
      lastEventReceived: new Date().toISOString(),
      eventLag: 125,
      missedEvents: 0,
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    lastUpdated: new Date().toISOString(),
  };
}

function generateSampleMetrics() {
  return [
    {
      metricId: 'metric-001',
      category: 'live-workload' as const,
      name: 'Live Workload',
      value: 25,
      unit: 'tasks',
      scope: { tenantId: 'tenant-alpha', facilityId: 'facility-01' },
      computedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 60000).toISOString(),
      breakdown: {
        bySeverity: { critical: 5, high: 9, medium: 7, low: 4 },
      },
      metadata: { sampleSize: 3, dataSource: ['task-lifecycle-events'], confidenceLevel: 'high' as const },
    },
    {
      metricId: 'metric-002',
      category: 'sla-countdown' as const,
      name: 'SLA Countdown Timers',
      value: 3,
      unit: 'timers',
      scope: { tenantId: 'tenant-alpha', facilityId: 'facility-01' },
      computedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 10000).toISOString(),
      breakdown: {
        byStatus: { breach: 1, warning: 1, ok: 1 },
      },
      metadata: { sampleSize: 3, dataSource: ['task-lifecycle-events', 'alert-lifecycle-events'], confidenceLevel: 'high' as const },
    },
    {
      metricId: 'metric-003',
      category: 'response-latency' as const,
      name: 'Alert Response Latency',
      value: 12.5,
      unit: 'minutes',
      scope: { tenantId: 'tenant-alpha', facilityId: 'facility-01' },
      computedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 60000).toISOString(),
      metadata: { sampleSize: 15, dataSource: ['alert-lifecycle-events'], confidenceLevel: 'high' as const },
    },
  ];
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function MetricCard({ title, value, unit, trend, status }: {
  title: string;
  value: number | string;
  unit: string;
  trend?: { direction: string; changeRate: number };
  status?: 'good' | 'warning' | 'critical';
}) {
  const statusColors = {
    good: 'bg-green-100 border-green-300',
    warning: 'bg-yellow-100 border-yellow-300',
    critical: 'bg-red-100 border-red-300',
  };

  return (
    <div className={`border rounded-lg p-4 ${status ? statusColors[status] : 'bg-white border-gray-200'}`}>
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-3xl font-bold mb-1">
        {value} <span className="text-lg text-gray-500">{unit}</span>
      </div>
      {trend && (
        <div className={`text-sm ${trend.direction === 'increasing' ? 'text-red-600' : trend.direction === 'decreasing' ? 'text-green-600' : 'text-gray-500'}`}>
          {trend.direction === 'increasing' ? '↑' : trend.direction === 'decreasing' ? '↓' : '→'} {Math.abs(trend.changeRate).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: 'bg-red-600 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-yellow-500 text-black',
    low: 'bg-blue-500 text-white',
    info: 'bg-gray-400 text-white',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[severity] || 'bg-gray-300'}`}>
      {severity.toUpperCase()}
    </span>
  );
}

// ============================================================================
// CROSS-ENGINE HOOKS
// ============================================================================

function CrossEngineHooks() {
  return (
    <div className="bg-gray-50 border rounded-lg p-4">
      <h3 className="font-semibold mb-3">Cross-Engine Navigation</h3>
      <div className="grid grid-cols-3 gap-2">
        <a href="/actionCenter" className="text-sm bg-white border rounded px-3 py-2 hover:bg-gray-100 text-center">Action Center</a>
        <a href="/alertCenter" className="text-sm bg-white border rounded px-3 py-2 hover:bg-gray-100 text-center">Alert Center</a>
        <a href="/auditor" className="text-sm bg-white border rounded px-3 py-2 hover:bg-gray-100 text-center">Auditor</a>
        <a href="/integrity" className="text-sm bg-white border rounded px-3 py-2 hover:bg-gray-100 text-center">Integrity Monitor</a>
        <a href="/governance" className="text-sm bg-white border rounded px-3 py-2 hover:bg-gray-100 text-center">Governance</a>
        <a href="/documentation" className="text-sm bg-white border rounded px-3 py-2 hover:bg-gray-100 text-center">Documentation</a>
        <a href="/simulation" className="text-sm bg-white border rounded px-3 py-2 hover:bg-gray-100 text-center">Simulation</a>
        <a href="/fabric" className="text-sm bg-white border rounded px-3 py-2 hover:bg-gray-100 text-center">Fabric</a>
        <a href="/operatorAnalytics" className="text-sm bg-white border rounded px-3 py-2 hover:bg-gray-100 text-center">Operator Analytics</a>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENTS
// ============================================================================

function RealTimeMetricPanel({ metrics }: { metrics: any[] }) {
  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Live Metrics</h2>
      <div className="grid grid-cols-3 gap-4">
        {metrics.map(metric => (
          <MetricCard
            key={metric.metricId}
            title={metric.name}
            value={metric.value}
            unit={metric.unit}
            trend={metric.trend}
          />
        ))}
      </div>
    </div>
  );
}

function RealTimeStreamViewer({ streamState }: { streamState: any }) {
  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Event Stream</h2>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {streamState.recentEvents.slice(-20).reverse().map((event: any) => (
          <div key={event.eventId} className="border-l-4 border-blue-500 pl-3 py-2 bg-gray-50">
            <div className="flex items-center gap-2 mb-1">
              <SeverityBadge severity={event.severity} />
              <span className="text-sm font-medium">{event.category}</span>
              <span className="text-sm text-gray-500">{event.eventType}</span>
            </div>
            <div className="text-xs text-gray-600">
              {event.operatorName} • {new Date(event.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RealTimeSLATimer({ slaCountdowns }: { slaCountdowns: any[] }) {
  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">SLA Countdowns</h2>
      <div className="space-y-3">
        {slaCountdowns.map(countdown => (
          <div key={countdown.entityId} className={`border-l-4 pl-3 py-2 ${countdown.status === 'breach' ? 'border-red-500 bg-red-50' : countdown.status === 'warning' ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'}`}>
            <div className="flex justify-between items-start mb-1">
              <div>
                <div className="font-medium">{countdown.entityType} {countdown.entityId}</div>
                <div className="text-sm text-gray-600"><SeverityBadge severity={countdown.severity} /></div>
              </div>
              <div className={`text-2xl font-bold ${countdown.status === 'breach' ? 'text-red-600' : countdown.status === 'warning' ? 'text-yellow-600' : 'text-green-600'}`}>
                {countdown.timeRemainingHours.toFixed(1)}h
              </div>
            </div>
            <div className="text-xs text-gray-500">
              SLA: {countdown.slaThresholdHours}h • Status: {countdown.status.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RealTimeWorkloadViewer({ workloadState }: { workloadState: any[] }) {
  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Operator Workload</h2>
      <div className="space-y-3">
        {workloadState.map(operator => (
          <div key={operator.operatorId} className="border rounded p-3 bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium">{operator.operatorName}</div>
              <div className="text-2xl font-bold">{operator.activeTasks}</div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="bg-red-100 rounded px-2 py-1 text-center">
                <div className="font-bold">{operator.criticalTasks}</div>
                <div className="text-gray-600">Critical</div>
              </div>
              <div className="bg-orange-100 rounded px-2 py-1 text-center">
                <div className="font-bold">{operator.highTasks}</div>
                <div className="text-gray-600">High</div>
              </div>
              <div className="bg-yellow-100 rounded px-2 py-1 text-center">
                <div className="font-bold">{operator.mediumTasks}</div>
                <div className="text-gray-600">Medium</div>
              </div>
              <div className="bg-blue-100 rounded px-2 py-1 text-center">
                <div className="font-bold">{operator.lowTasks}</div>
                <div className="text-gray-600">Low</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RealTimeTrendPanel({ streamState }: { streamState: any }) {
  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Performance Trends</h2>
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          title="Events Per Minute"
          value={streamState.rollingMetrics.eventsPerMinute}
          unit="events/min"
        />
        <MetricCard
          title="Total Events Received"
          value={streamState.rollingMetrics.totalEventsReceived}
          unit="events"
        />
        <div className="col-span-2 border rounded p-3 bg-gray-50">
          <div className="text-sm font-medium mb-2">Events by Category</div>
          {Object.entries(streamState.rollingMetrics.eventsByCategory).map(([category, count]: [string, any]) => (
            <div key={category} className="flex justify-between text-sm mb-1">
              <span>{category}</span>
              <span className="font-bold">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RealTimeHistoryViewer({ streamState }: { streamState: any }) {
  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Stream Health</h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
          <span className="text-sm">Stream Status</span>
          <span className={`px-3 py-1 rounded font-medium ${streamState.streamHealth.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {streamState.streamHealth.isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
          <span className="text-sm">Event Lag</span>
          <span className="font-bold">{streamState.streamHealth.eventLag}ms</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
          <span className="text-sm">Missed Events</span>
          <span className="font-bold">{streamState.streamHealth.missedEvents}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
          <span className="text-sm">Last Event</span>
          <span className="text-xs">{new Date(streamState.streamHealth.lastEventReceived).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

function RealTimePerformanceDashboard() {
  const [streamState, setStreamState] = useState(generateSampleStreamState());
  const [metrics, setMetrics] = useState(generateSampleMetrics());
  const [view, setView] = useState<'overview' | 'stream' | 'sla' | 'workload' | 'trends' | 'health'>('overview');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStreamState(generateSampleStreamState());
      setMetrics(generateSampleMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Real-Time Performance Monitoring</h1>
          <p className="text-gray-600">Phase 55: Live operator performance, SLA adherence, and workload tracking</p>
        </div>

        {/* Navigation */}
        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="flex gap-2">
            <button onClick={() => setView('overview')} className={`px-4 py-2 rounded ${view === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Overview</button>
            <button onClick={() => setView('stream')} className={`px-4 py-2 rounded ${view === 'stream' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Event Stream</button>
            <button onClick={() => setView('sla')} className={`px-4 py-2 rounded ${view === 'sla' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>SLA Timers</button>
            <button onClick={() => setView('workload')} className={`px-4 py-2 rounded ${view === 'workload' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Workload</button>
            <button onClick={() => setView('trends')} className={`px-4 py-2 rounded ${view === 'trends' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Trends</button>
            <button onClick={() => setView('health')} className={`px-4 py-2 rounded ${view === 'health' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Stream Health</button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {view === 'overview' && (
            <>
              <RealTimeMetricPanel metrics={metrics} />
              <div className="grid grid-cols-2 gap-6">
                <RealTimeSLATimer slaCountdowns={streamState.slaCountdowns} />
                <RealTimeWorkloadViewer workloadState={streamState.workloadState} />
              </div>
            </>
          )}

          {view === 'stream' && <RealTimeStreamViewer streamState={streamState} />}
          {view === 'sla' && <RealTimeSLATimer slaCountdowns={streamState.slaCountdowns} />}
          {view === 'workload' && <RealTimeWorkloadViewer workloadState={streamState.workloadState} />}
          {view === 'trends' && <RealTimeTrendPanel streamState={streamState} />}
          {view === 'health' && <RealTimeHistoryViewer streamState={streamState} />}

          {/* Cross-Engine Navigation */}
          <CrossEngineHooks />
        </div>
      </div>
    </div>
  );
}

export default RealTimePerformanceDashboard;
