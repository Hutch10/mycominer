/**
 * CAPACITY PLANNING - UI
 * Phase 56: Capacity Planning & Resource Forecasting
 * 
 * 7 UI components: Dashboard, ProjectionPanel, RiskPanel, BaselineViewer,
 * TrendViewer, HistoryViewer, StatisticsViewer with 5 cross-engine hooks.
 * 
 * NO GENERATIVE AI. NO PROBABILISTIC PREDICTION.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  CapacityEngine,
  CapacityQuery,
  CapacityResult,
  CapacityProjection,
  CapacityRiskWindow,
  CapacityBaseline,
  CapacityStatistics,
  CapacityPolicyContext,
  HistoricalMetricsInput,
  RealTimeSignalsInput,
} from './index';

// ============================================================================
// SAMPLE DATA GENERATION
// ============================================================================

function generateSampleHistoricalMetrics(): HistoricalMetricsInput[] {
  const metrics: HistoricalMetricsInput[] = [];
  const now = Date.now();

  for (let i = 0; i < 48; i++) {
    const timestamp = new Date(now - i * 3600000).toISOString();
    metrics.push({
      metricsId: `metric-${i}`,
      scope: { tenantId: 'tenant-mushroom-site' },
      timeRange: {
        start: timestamp,
        end: new Date(now - (i - 1) * 3600000).toISOString(),
      },
      operatorWorkload: {
        'operator-alice': 45 + Math.random() * 20,
        'operator-bob': 50 + Math.random() * 25,
        'operator-charlie': 40 + Math.random() * 15,
      },
      taskThroughput: 80 + Math.random() * 40,
      alertVolume: 30 + Math.random() * 20,
      slaAdherence: 92 + Math.random() * 6,
    });
  }

  return metrics.reverse();
}

function generateSampleRealTimeSignals(): RealTimeSignalsInput[] {
  const signals: RealTimeSignalsInput[] = [];
  const now = Date.now();

  for (let i = 0; i < 5; i++) {
    const timestamp = new Date(now - i * 300000).toISOString();
    signals.push({
      signalId: `signal-${i}`,
      scope: { tenantId: 'tenant-mushroom-site' },
      timestamp,
      liveWorkload: 52 + Math.random() * 15,
      activeTasks: 45 + Math.random() * 15,
      activeAlerts: 18 + Math.random() * 8,
      slaCountdowns: 5 + Math.random() * 3,
      workloadDelta: -2 + Math.random() * 8,
    });
  }

  return signals.reverse();
}

function generateSamplePolicyContext(): CapacityPolicyContext {
  return {
    userId: 'user-admin',
    userTenantId: 'tenant-mushroom-site',
    permissions: [
      'capacity:execute-query',
      'capacity:view-all-operators',
      'capacity:view-cross-engine',
      'capacity:view-resource-utilization',
      'capacity:view-risk-analysis',
      'capacity:long-range-forecast',
    ],
  };
}

// ============================================================================
// HOOK: USE CAPACITY ENGINE
// ============================================================================

function useCapacityEngine() {
  const [engine] = useState(() => new CapacityEngine());
  const [result, setResult] = useState<CapacityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeQuery = async (query: CapacityQuery) => {
    setLoading(true);
    setError(null);

    try {
      const historicalMetrics = generateSampleHistoricalMetrics();
      const realTimeSignals = generateSampleRealTimeSignals();
      const context = generateSamplePolicyContext();

      const queryResult = await engine.executeQuery(query, historicalMetrics, realTimeSignals, context);
      setResult(queryResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { engine, result, loading, error, executeQuery };
}

// ============================================================================
// HOOK: USE CAPACITY STATISTICS
// ============================================================================

function useCapacityStatistics(engine: CapacityEngine | null) {
  const [statistics, setStatistics] = useState<CapacityStatistics | null>(null);

  useEffect(() => {
    if (!engine) return;

    const interval = setInterval(() => {
      const stats = engine.getLog().getStatistics();
      setStatistics(stats);
    }, 2000);

    return () => clearInterval(interval);
  }, [engine]);

  return statistics;
}

// ============================================================================
// HOOK: USE OPERATOR ANALYTICS (Cross-Engine: Phase 54)
// ============================================================================

function useOperatorAnalytics() {
  return {
    totalOperators: 3,
    activeOperators: 3,
    averageWorkload: 48.5,
    peakWorkload: 75.2,
  };
}

// ============================================================================
// HOOK: USE REAL-TIME PERFORMANCE (Cross-Engine: Phase 55)
// ============================================================================

function useRealTimePerformance() {
  return {
    liveWorkload: 52.3,
    activeTasks: 47,
    activeAlerts: 19,
    workloadDelta: 3.8,
  };
}

// ============================================================================
// HOOK: USE ALERT AGGREGATION (Cross-Engine: Phase 52)
// ============================================================================

function useAlertAggregation() {
  return {
    totalAlerts: 156,
    criticalAlerts: 12,
    highAlerts: 34,
    mediumAlerts: 67,
    lowAlerts: 43,
  };
}

// ============================================================================
// HOOK: USE TASK MANAGEMENT (Cross-Engine: Phase 53)
// ============================================================================

function useTaskManagement() {
  return {
    totalTasks: 423,
    pendingTasks: 47,
    inProgressTasks: 89,
    completedTasks: 287,
  };
}

// ============================================================================
// COMPONENT: CAPACITY DASHBOARD
// ============================================================================

function CapacityDashboard() {
  const { engine, result, loading, error, executeQuery } = useCapacityEngine();
  const statistics = useCapacityStatistics(engine);
  const operatorAnalytics = useOperatorAnalytics();
  const realTimePerformance = useRealTimePerformance();

  const handleDefaultQuery = () => {
    const query: CapacityQuery = {
      queryId: `query-${Date.now()}`,
      description: 'Default capacity forecast',
      scope: {
        tenantId: 'tenant-mushroom-site',
      },
      categories: ['operator-workload', 'task-volume', 'alert-volume', 'sla-risk'],
      timeWindows: ['next-1-hour', 'next-4-hours', 'next-12-hours', 'next-24-hours'],
      methods: ['rolling-average', 'trend-slope'],
      includeRiskWindows: true,
      includeBaseline: true,
      requestedBy: 'user-admin',
      requestedAt: new Date().toISOString(),
    };

    executeQuery(query);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Capacity Planning</h1>
          <p className="text-sm text-gray-600 mt-1">
            Deterministic resource forecasting • Phase 56
          </p>
        </div>
        <button
          onClick={handleDefaultQuery}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Computing...' : 'Run Forecast'}
        </button>
      </div>

      {/* Cross-Engine Integration Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-gray-600">Operators (Phase 54)</div>
          <div className="text-2xl font-bold mt-1">{operatorAnalytics.totalOperators}</div>
          <div className="text-sm text-gray-500 mt-1">
            Avg Workload: {operatorAnalytics.averageWorkload.toFixed(1)}%
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="text-sm text-gray-600">Real-Time (Phase 55)</div>
          <div className="text-2xl font-bold mt-1">{realTimePerformance.liveWorkload.toFixed(1)}%</div>
          <div className="text-sm text-gray-500 mt-1">
            Delta: +{realTimePerformance.workloadDelta.toFixed(1)}%
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="text-sm text-gray-600">Projections</div>
          <div className="text-2xl font-bold mt-1">{result?.projections.length || 0}</div>
          <div className="text-sm text-gray-500 mt-1">
            Confidence: {result?.summary.averageConfidence.toFixed(0) || 0}%
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="text-sm text-gray-600">Risk Windows</div>
          <div className="text-2xl font-bold mt-1 text-red-600">{result?.summary.criticalRisks || 0}</div>
          <div className="text-sm text-gray-500 mt-1">
            Total: {result?.summary.totalRisks || 0}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {result.baseline && <BaselineViewer baseline={result.baseline} />}
          <ProjectionPanel projections={result.projections} />
          {result.riskWindows.length > 0 && <RiskPanel risks={result.riskWindows} />}
          <TrendViewer projections={result.projections} />
          {statistics && <StatisticsViewer statistics={statistics} />}
        </div>
      )}

      {/* History */}
      {engine && <HistoryViewer engine={engine} />}
    </div>
  );
}

// ============================================================================
// COMPONENT: BASELINE VIEWER
// ============================================================================

function BaselineViewer({ baseline }: { baseline: CapacityBaseline }) {
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Historical Baseline</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-gray-600">Tasks per Hour</div>
          <div className="text-2xl font-bold mt-1">{baseline.averageTasksPerHour.toFixed(1)}</div>
          <div className="text-sm text-gray-500 mt-1">
            Peak: {baseline.peakOperatorLoad.toFixed(1)}%
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-600">Alerts per Hour</div>
          <div className="text-2xl font-bold mt-1">{baseline.averageAlertsPerHour.toFixed(1)}</div>
        </div>

        <div>
          <div className="text-sm text-gray-600">SLA Adherence</div>
          <div className="text-2xl font-bold mt-1">{baseline.averageSLAAdherence.toFixed(1)}%</div>
          <div className="text-sm text-gray-500 mt-1">
            Breaches: {baseline.slaBreachCount}
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Period: {new Date(baseline.periodStart).toLocaleString()} to{' '}
        {new Date(baseline.periodEnd).toLocaleString()}
        <span className="ml-4">
          Confidence: <span className="font-semibold capitalize">{baseline.confidenceLevel}</span>
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: PROJECTION PANEL
// ============================================================================

function ProjectionPanel({ projections }: { projections: CapacityProjection[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = selectedCategory === 'all'
    ? projections
    : projections.filter(p => p.category === selectedCategory);

  const categories = Array.from(new Set(projections.map(p => p.category)));

  return (
    <div className="border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Capacity Projections</h2>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(proj => (
          <div key={proj.projectionId} className="border rounded p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-semibold">{proj.category}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {proj.timeWindow} • {proj.method}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold">
                  {proj.projectedValue.toFixed(1)} {proj.unit}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Range: {proj.projectedMin.toFixed(1)} - {proj.projectedMax.toFixed(1)}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Baseline:</span>{' '}
                {proj.baselineValue?.toFixed(1) || 'N/A'} {proj.unit}
              </div>
              <div>
                <span className="text-gray-600">Delta:</span>{' '}
                <span className={proj.deltaPercentage && proj.deltaPercentage > 0 ? 'text-red-600' : 'text-green-600'}>
                  {proj.deltaPercentage?.toFixed(1) || '0'}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">Trend:</span>{' '}
                <span className="capitalize">{proj.trendDirection}</span>
              </div>
            </div>

            <div className="mt-2 text-sm text-gray-500">
              Confidence: <span className="capitalize font-semibold">{proj.confidenceLevel}</span>
              <span className="ml-4">
                Valid until: {new Date(proj.validUntil).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No projections available for this category
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: RISK PANEL
// ============================================================================

function RiskPanel({ risks }: { risks: CapacityRiskWindow[] }) {
  const severityColors = {
    critical: 'border-red-500 bg-red-50',
    high: 'border-orange-500 bg-orange-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-blue-500 bg-blue-50',
  };

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Risk Windows</h2>

      <div className="space-y-3">
        {risks.map(risk => (
          <div key={risk.riskId} className={`border-l-4 rounded p-4 ${severityColors[risk.severity]}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-semibold flex items-center gap-2">
                  {risk.riskType}
                  <span className={`text-xs px-2 py-1 rounded uppercase font-bold
                    ${risk.severity === 'critical' ? 'bg-red-600 text-white' : ''}
                    ${risk.severity === 'high' ? 'bg-orange-600 text-white' : ''}
                    ${risk.severity === 'medium' ? 'bg-yellow-600 text-white' : ''}
                    ${risk.severity === 'low' ? 'bg-blue-600 text-white' : ''}
                  `}>
                    {risk.severity}
                  </span>
                </div>
                <div className="text-sm mt-2">{risk.description}</div>
              </div>

              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-red-600">{risk.riskScore}</div>
                <div className="text-xs text-gray-600">Risk Score</div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Window:</span>{' '}
                {new Date(risk.windowStart).toLocaleTimeString()} -{' '}
                {new Date(risk.windowEnd).toLocaleTimeString()}
              </div>
              <div>
                <span className="text-gray-600">Impact:</span>{' '}
                {risk.impactScore}/100
              </div>
            </div>

            {risk.recommendations.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-semibold text-gray-700">Recommendations:</div>
                <ul className="mt-1 text-sm space-y-1">
                  {risk.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: TREND VIEWER
// ============================================================================

function TrendViewer({ projections }: { projections: CapacityProjection[] }) {
  const trendCounts = {
    increasing: projections.filter(p => p.trendDirection === 'increasing').length,
    stable: projections.filter(p => p.trendDirection === 'stable').length,
    decreasing: projections.filter(p => p.trendDirection === 'decreasing').length,
  };

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Trend Analysis</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-red-50">
          <div className="text-sm text-gray-600">Increasing</div>
          <div className="text-3xl font-bold mt-2 text-red-600">{trendCounts.increasing}</div>
        </div>

        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="text-sm text-gray-600">Stable</div>
          <div className="text-3xl font-bold mt-2 text-gray-600">{trendCounts.stable}</div>
        </div>

        <div className="p-4 border rounded-lg bg-green-50">
          <div className="text-sm text-gray-600">Decreasing</div>
          <div className="text-3xl font-bold mt-2 text-green-600">{trendCounts.decreasing}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: STATISTICS VIEWER
// ============================================================================

function StatisticsViewer({ statistics }: { statistics: CapacityStatistics }) {
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">System Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="font-semibold mb-2">Activity Summary</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Queries:</span>
              <span className="font-semibold">{statistics.totalQueries}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Projections:</span>
              <span className="font-semibold">{statistics.totalProjections}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Risks:</span>
              <span className="font-semibold">{statistics.totalRisks}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="font-semibold mb-2">Risk Distribution</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Critical:</span>
              <span className="font-semibold text-red-600">{statistics.riskDistribution.critical}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">High:</span>
              <span className="font-semibold text-orange-600">{statistics.riskDistribution.high}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Medium:</span>
              <span className="font-semibold text-yellow-600">{statistics.riskDistribution.medium}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Low:</span>
              <span className="font-semibold text-blue-600">{statistics.riskDistribution.low}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: HISTORY VIEWER
// ============================================================================

function HistoryViewer({ engine }: { engine: CapacityEngine }) {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const latest = engine.getLog().getLatestEntries(10);
      setEntries(latest);
    }, 2000);

    return () => clearInterval(interval);
  }, [engine]);

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Recent Activity</h2>

      <div className="space-y-2">
        {entries.map(entry => (
          <div key={entry.entryId} className="text-sm p-3 border rounded bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="font-semibold capitalize">{entry.entryType.replace('-', ' ')}</span>
              <span className="text-xs text-gray-500">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {entries.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No activity yet
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function CapacityPlanningPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <CapacityDashboard />
    </div>
  );
}
