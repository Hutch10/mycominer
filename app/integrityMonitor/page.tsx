'use client';

/**
 * Phase 51: Continuous Integrity Monitor - Dashboard UI
 * 
 * Complete monitoring dashboard with cycle management, alert viewing, and cross-engine integration.
 */

import { useState, useEffect } from 'react';
import { MonitorEngine } from './monitorEngine';
import type {
  MonitorCheck,
  MonitorResult,
  MonitorAlert,
  MonitorCategory,
  MonitorSeverity,
  MonitorReference,
  MonitorStatistics,
  MonitorLogEntry,
  MonitorPolicyContext,
  MonitorFrequency,
} from './monitorTypes';

// ============================================================================
// MAIN DASHBOARD
// ============================================================================

export default function IntegrityMonitorDashboard() {
  const [tenantId] = useState('tenant-alpha');
  const [facilityId, setFacilityId] = useState<string | undefined>('facility-01');
  const [currentResult, setCurrentResult] = useState<MonitorResult | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<MonitorAlert | null>(null);
  const [statistics, setStatistics] = useState<MonitorStatistics | null>(null);
  const [monitorHistory, setMonitorHistory] = useState<MonitorLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize engine
  const [monitorEngine] = useState(() => new MonitorEngine(tenantId));

  useEffect(() => {
    loadStatistics();
    loadMonitorHistory();
  }, []);

  const loadStatistics = () => {
    const stats = monitorEngine.getStatistics();
    setStatistics(stats);
  };

  const loadMonitorHistory = () => {
    const log = monitorEngine.getMonitorLog();
    const recent = log.getRecentEntries(50);
    setMonitorHistory(recent);
  };

  const handleCycleSubmit = async (check: MonitorCheck, frequency: MonitorFrequency) => {
    setLoading(true);

    try {
      const policyContext: MonitorPolicyContext = {
        tenantId,
        facilityId,
        performedBy: 'user-001',
        userRoles: ['operator', 'auditor'],
        userPermissions: [
          'monitor.run',
          'monitor.full-system',
          'monitor.facility',
          'monitor.category',
          'monitor.rule',
          'facility.monitor',
          'monitor.governance-drift',
          'monitor.governance-lineage-breakage',
          'monitor.workflow-sop-drift',
          'monitor.documentation-completeness-drift',
          'monitor.fabric-link-breakage',
          'monitor.cross-engine-metadata-mismatch',
          'monitor.health-drift',
          'monitor.analytics-pattern-drift',
          'monitor.compliance-pack-drift',
        ],
      };

      const result = await monitorEngine.executeCheck(check, policyContext, frequency);
      setCurrentResult(result);
      setSelectedAlert(null);

      loadStatistics();
      loadMonitorHistory();
    } catch (error) {
      console.error('Monitoring cycle failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            🛡️ Continuous Integrity Monitor
          </h1>
          <p className="text-purple-300">
            Deterministic drift and anomaly detection across all system engines
          </p>
          <div className="mt-2 text-sm text-slate-400">
            Tenant: <span className="text-purple-400">{tenantId}</span>
            {facilityId && (
              <>
                {' • '}Facility: <span className="text-purple-400">{facilityId}</span>
              </>
            )}
          </div>
        </div>

        {/* Statistics Overview */}
        {statistics && (
          <MonitorStatisticsViewer statistics={statistics} />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column: Cycle Panel */}
          <div className="lg:col-span-1">
            <MonitorCyclePanel
              tenantId={tenantId}
              facilityId={facilityId}
              onSubmit={handleCycleSubmit}
              loading={loading}
            />

            {/* Monitor History */}
            <div className="mt-6">
              <MonitorHistoryViewer
                history={monitorHistory}
                onSelectEntry={(entry) => {
                  console.log('Selected history entry:', entry);
                }}
              />
            </div>
          </div>

          {/* Right Column: Results and Alerts */}
          <div className="lg:col-span-2 space-y-6">
            {currentResult?.cycle && (
              <>
                <MonitorAlertViewer
                  cycle={currentResult.cycle}
                  onSelectAlert={setSelectedAlert}
                />

                {selectedAlert && (
                  <MonitorAlertDetailPanel alert={selectedAlert} />
                )}
              </>
            )}

            {!currentResult && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">🛡️</div>
                <h3 className="text-xl font-semibold mb-2">No Monitoring Results</h3>
                <p className="text-slate-400">
                  Run a monitoring cycle to detect drift and anomalies
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT 1: MONITOR CYCLE PANEL
// ============================================================================

function MonitorCyclePanel({
  tenantId,
  facilityId,
  onSubmit,
  loading,
}: {
  tenantId: string;
  facilityId?: string;
  onSubmit: (check: MonitorCheck, frequency: MonitorFrequency) => void;
  loading: boolean;
}) {
  const [checkType, setCheckType] = useState<'full-system' | 'facility' | 'category' | 'rule'>('facility');
  const [frequency, setFrequency] = useState<MonitorFrequency>('manual');
  const [selectedCategories, setSelectedCategories] = useState<MonitorCategory[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<MonitorSeverity[]>([]);

  const categories: MonitorCategory[] = [
    'governance-drift',
    'governance-lineage-breakage',
    'workflow-sop-drift',
    'documentation-completeness-drift',
    'fabric-link-breakage',
    'cross-engine-metadata-mismatch',
    'health-drift',
    'analytics-pattern-drift',
    'compliance-pack-drift',
  ];

  const severities: MonitorSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];

  const handleSubmit = () => {
    const check: MonitorCheck = {
      checkId: `check-${Date.now()}`,
      checkType,
      description: `Monitor ${checkType} for ${tenantId}`,
      scope: {
        tenantId,
        facilityId: checkType === 'facility' ? facilityId : undefined,
      },
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      severities: selectedSeverities.length > 0 ? selectedSeverities : undefined,
      options: {
        includeSuppressed: false,
        maxAlerts: 100,
        sortBy: 'severity',
        sortOrder: 'desc',
      },
      triggeredBy: frequency === 'manual' ? 'manual' : 'scheduler',
      triggeredAt: new Date().toISOString(),
    };

    onSubmit(check, frequency);
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">🔄 Monitoring Cycle</h2>

      {/* Check Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Check Type</label>
        <select
          value={checkType}
          onChange={(e) => setCheckType(e.target.value as any)}
          className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2"
        >
          <option value="full-system">Full System</option>
          <option value="facility">Facility</option>
          <option value="category">By Category</option>
          <option value="rule">By Rule</option>
        </select>
      </div>

      {/* Frequency */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Frequency</label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as MonitorFrequency)}
          className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2"
        >
          <option value="manual">Manual (Run Now)</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      {/* Categories */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Categories (Optional)</label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <label key={category} className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCategories([...selectedCategories, category]);
                  } else {
                    setSelectedCategories(selectedCategories.filter(c => c !== category));
                  }
                }}
                className="rounded"
              />
              <span className="text-slate-300">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Severities */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Severities (Optional)</label>
        <div className="space-y-2">
          {severities.map((severity) => (
            <label key={severity} className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={selectedSeverities.includes(severity)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedSeverities([...selectedSeverities, severity]);
                  } else {
                    setSelectedSeverities(selectedSeverities.filter(s => s !== severity));
                  }
                }}
                className="rounded"
              />
              <span className="text-slate-300 capitalize">{severity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 px-4 py-2 rounded font-medium transition"
      >
        {loading ? 'Running Cycle...' : frequency === 'manual' ? 'Run Now' : `Schedule ${frequency}`}
      </button>
    </div>
  );
}

// ============================================================================
// COMPONENT 2: MONITOR ALERT VIEWER
// ============================================================================

function MonitorAlertViewer({
  cycle,
  onSelectAlert,
}: {
  cycle: any;
  onSelectAlert: (alert: MonitorAlert) => void;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">⚠️ Monitoring Alerts</h2>
        <span className="text-sm text-slate-400">
          {cycle.metadata.executionTime}ms
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/50 rounded p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">{cycle.totalAlerts}</div>
          <div className="text-xs text-slate-400">Total Alerts</div>
        </div>
        <div className="bg-slate-900/50 rounded p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{cycle.newAlerts}</div>
          <div className="text-xs text-slate-400">New Alerts</div>
        </div>
        <div className="bg-slate-900/50 rounded p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{cycle.summary.rulesPassed}</div>
          <div className="text-xs text-slate-400">Rules Passed</div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {cycle.alerts.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            ✅ No integrity issues detected
          </div>
        )}

        {cycle.alerts.map((alert: MonitorAlert) => (
          <button
            key={alert.alertId}
            onClick={() => onSelectAlert(alert)}
            className="w-full text-left bg-slate-900/50 hover:bg-slate-900 border border-slate-600 rounded p-4 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400">{alert.category}</span>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(alert.status)}`}>
                    {alert.status}
                  </span>
                </div>
                <h3 className="font-medium mb-1">{alert.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-2">{alert.description}</p>
              </div>
              <div className="text-xs text-slate-500 ml-4">
                {alert.affectedEntities.length} affected
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT 3: MONITOR ALERT DETAIL PANEL
// ============================================================================

function MonitorAlertDetailPanel({ alert }: { alert: MonitorAlert }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">🔍 Alert Details</h2>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-3 py-1 rounded font-medium ${getSeverityColor(alert.severity)}`}>
            {alert.severity.toUpperCase()}
          </span>
          <span className="text-sm text-slate-400">{alert.category}</span>
          <span className={`text-sm px-2 py-1 rounded ${getStatusColor(alert.status)}`}>
            {alert.status}
          </span>
        </div>
        <h3 className="text-lg font-semibold mb-2">{alert.title}</h3>
        <p className="text-slate-300">{alert.description}</p>
      </div>

      {/* Rule Info */}
      <div className="bg-slate-900/50 rounded p-4 mb-4">
        <h4 className="font-medium mb-2">📋 Rule</h4>
        <div className="text-sm space-y-1">
          <div><span className="text-slate-400">ID:</span> {alert.rule.ruleId}</div>
          <div><span className="text-slate-400">Name:</span> {alert.rule.ruleName}</div>
          <div><span className="text-slate-400">Description:</span> {alert.rule.ruleDescription}</div>
        </div>
      </div>

      {/* Evidence (Drift Detection) */}
      {alert.evidence && alert.evidence.length > 0 && (
        <div className="bg-slate-900/50 rounded p-4 mb-4">
          <h4 className="font-medium mb-2">🔍 Evidence (Drift)</h4>
          <div className="space-y-2">
            {alert.evidence.map((e, i) => {
              const baselineStr = e.baselineValue !== undefined && e.baselineValue !== null 
                ? String(e.baselineValue) 
                : null;
              const currentStr = e.currentValue !== undefined 
                ? (e.currentValue === null ? 'null' : String(e.currentValue))
                : null;
              
              return (
                <div key={i} className="text-sm">
                  <div className="text-slate-400">{e.field}:</div>
                  <div className="ml-4">
                    {baselineStr && (
                      <div><span className="text-blue-400">Baseline:</span> {baselineStr}</div>
                    )}
                    {currentStr !== null && (
                      <div><span className="text-orange-400">Current:</span> {currentStr}</div>
                    )}
                    {e.drift && (
                      <div className="mt-1">
                        <span className={`px-2 py-1 rounded text-xs ${getDriftTypeColor(e.drift.type)}`}>
                          {e.drift.type.toUpperCase()}
                        </span>
                        <span className="ml-2 text-slate-500">{e.drift.details}</span>
                      </div>
                    )}
                    {e.additionalContext && (
                      <div className="text-slate-500 mt-1">{e.additionalContext}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Affected Entities */}
      {alert.affectedEntities.length > 0 && (
        <div className="bg-slate-900/50 rounded p-4 mb-4">
          <h4 className="font-medium mb-2">🔗 Affected Entities</h4>
          <div className="space-y-2">
            {alert.affectedEntities.map((ref) => (
              <div key={ref.referenceId} className="text-sm border border-slate-700 rounded p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-slate-700 rounded">{ref.referenceType}</span>
                      <span className="text-xs text-slate-500">{ref.sourceEngine}</span>
                    </div>
                    <h5 className="font-medium mt-1">{ref.title}</h5>
                    <p className="text-slate-400">{ref.entityType}: {ref.entityId}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cross-Engine Integration Links */}
      <div className="bg-purple-900/20 border border-purple-700 rounded p-4 mb-4">
        <h4 className="font-medium mb-2">🔗 Related Systems</h4>
        <div className="grid grid-cols-2 gap-2">
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            📝 View Explanation (Phase 37)
          </button>
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            📊 View Incident (Phase 38)
          </button>
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            📈 View Pattern (Phase 39)
          </button>
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            📚 View Training (Phase 40)
          </button>
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            ⚖️ View Governance (Phase 44)
          </button>
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            🔗 View Lineage (Phase 45)
          </button>
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            🕸️ View Fabric Links (Phase 46)
          </button>
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            📄 View Documentation (Phase 47)
          </button>
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            🧠 View Intelligence Hub (Phase 48)
          </button>
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            🎮 View Simulation (Phase 49)
          </button>
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            🔍 View Audit Result (Phase 50)
          </button>
        </div>
      </div>

      {/* Remediation */}
      {alert.remediation && (
        <div className="bg-blue-900/20 border border-blue-700 rounded p-4">
          <h4 className="font-medium mb-2">💡 Remediation</h4>
          <p className="text-sm text-slate-300">{alert.remediation.description}</p>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-slate-400">Action:</span>
            <span className="px-2 py-1 bg-slate-700 rounded">{alert.remediation.actionType}</span>
            <span className="text-slate-400">Target:</span>
            <span className="px-2 py-1 bg-slate-700 rounded">{alert.remediation.targetEngine}</span>
            <span className="text-slate-400">Effort:</span>
            <span className={`px-2 py-1 rounded ${getEffortColor(alert.remediation.estimatedEffort)}`}>
              {alert.remediation.estimatedEffort}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT 4: MONITOR HISTORY VIEWER
// ============================================================================

function MonitorHistoryViewer({
  history,
  onSelectEntry,
}: {
  history: MonitorLogEntry[];
  onSelectEntry: (entry: MonitorLogEntry) => void;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">📜 Monitor History</h2>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {history.slice(-10).reverse().map((entry) => (
          <button
            key={entry.entryId}
            onClick={() => onSelectEntry(entry)}
            className="w-full text-left bg-slate-900/50 hover:bg-slate-900 rounded p-2 text-sm transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${entry.success ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-slate-300">{entry.entryType}</span>
              </div>
              <span className="text-xs text-slate-500">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT 5: MONITOR STATISTICS VIEWER
// ============================================================================

function MonitorStatisticsViewer({ statistics }: { statistics: MonitorStatistics }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">📊 Monitoring Statistics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Stats */}
        <div className="bg-slate-900/50 rounded p-3">
          <div className="text-2xl font-bold text-purple-400">{statistics.totalCycles}</div>
          <div className="text-xs text-slate-400">Total Cycles</div>
        </div>
        <div className="bg-slate-900/50 rounded p-3">
          <div className="text-2xl font-bold text-yellow-400">{statistics.totalAlerts}</div>
          <div className="text-xs text-slate-400">Total Alerts</div>
        </div>
        <div className="bg-slate-900/50 rounded p-3">
          <div className="text-2xl font-bold text-orange-400">{statistics.cyclesLast24Hours}</div>
          <div className="text-xs text-slate-400">Cycles (24h)</div>
        </div>
        <div className="bg-slate-900/50 rounded p-3">
          <div className="text-2xl font-bold text-red-400">{statistics.alertsLast24Hours}</div>
          <div className="text-xs text-slate-400">Alerts (24h)</div>
        </div>
      </div>

      {/* Severity Breakdown */}
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">By Severity</h3>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(statistics.alertsBySeverity).map(([severity, count]) => (
            <div key={severity} className="bg-slate-900/50 rounded p-2 text-center">
              <div className={`text-lg font-bold ${getSeverityTextColor(severity as MonitorSeverity)}`}>
                {count}
              </div>
              <div className="text-xs text-slate-400 capitalize">{severity}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getSeverityColor(severity: MonitorSeverity): string {
  const colors = {
    critical: 'bg-red-600 text-white',
    high: 'bg-orange-600 text-white',
    medium: 'bg-yellow-600 text-white',
    low: 'bg-blue-600 text-white',
    info: 'bg-slate-600 text-white',
  };
  return colors[severity];
}

function getSeverityTextColor(severity: MonitorSeverity): string {
  const colors = {
    critical: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-yellow-400',
    low: 'text-blue-400',
    info: 'text-slate-400',
  };
  return colors[severity];
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: 'bg-yellow-600 text-white',
    acknowledged: 'bg-blue-600 text-white',
    resolved: 'bg-green-600 text-white',
    'false-positive': 'bg-gray-600 text-white',
    suppressed: 'bg-slate-600 text-white',
  };
  return colors[status] || 'bg-slate-600 text-white';
}

function getDriftTypeColor(type: string): string {
  const colors: Record<string, string> = {
    added: 'bg-green-700 text-white',
    removed: 'bg-red-700 text-white',
    modified: 'bg-yellow-700 text-white',
    broken: 'bg-orange-700 text-white',
  };
  return colors[type] || 'bg-slate-700 text-white';
}

function getEffortColor(effort?: string): string {
  const colors: Record<string, string> = {
    low: 'bg-green-700 text-white',
    medium: 'bg-yellow-700 text-white',
    high: 'bg-red-700 text-white',
  };
  return colors[effort || 'medium'] || 'bg-slate-700 text-white';
}
