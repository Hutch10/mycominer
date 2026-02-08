'use client';

/**
 * Phase 52: Unified Alerting & Notification Center - Dashboard UI
 * 
 * Complete alert aggregation dashboard with cross-engine integration.
 */

import { useState, useEffect } from 'react';
import { AlertEngine } from './alertEngine';
import type {
  AlertQuery,
  AlertResult,
  Alert,
  AlertGroup,
  AlertCategory,
  AlertSeverity,
  AlertSource,
  AlertReference,
  AlertStatistics,
  AlertLogEntry,
  AlertPolicyContext,
} from './alertTypes';

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

function generateMockIntegrityAlerts(tenantId: string, facilityId?: string) {
  return [
    {
      alertId: 'mon-001',
      category: 'governance-drift',
      severity: 'high',
      title: 'Governance role changed from baseline',
      description: 'Governance decision GD-001 role drifted from approved lineage',
      scope: { tenantId, facilityId },
      affectedEntities: [{ entityId: 'GD-001', entityType: 'governance-decision', title: 'GD-001' }],
      relatedReferences: [],
      evidence: [{ field: 'role', baselineValue: 'approver', currentValue: 'reviewer', drift: { type: 'modified', details: 'Role downgraded' } }],
      detectedAt: new Date().toISOString(),
      status: 'new',
      rule: { ruleId: 'governance-drift-001' },
    },
    {
      alertId: 'mon-002',
      category: 'fabric-link-breakage',
      severity: 'medium',
      title: 'Fabric link no longer resolves',
      description: 'Link LINK-042 between Workflow WF-12 and SOP SOP-34 is broken',
      scope: { tenantId, facilityId },
      affectedEntities: [{ entityId: 'LINK-042', entityType: 'fabric-link', title: 'WF-12 → SOP-34' }],
      relatedReferences: [],
      evidence: [{ field: 'linkResolution', baselineValue: 'resolved', currentValue: 'broken', drift: { type: 'broken', details: 'Target SOP deleted' } }],
      detectedAt: new Date().toISOString(),
      status: 'new',
      rule: { ruleId: 'fabric-link-breakage-001' },
    },
  ];
}

function generateMockAuditAlerts(tenantId: string, facilityId?: string) {
  return [
    {
      findingId: 'audit-001',
      severity: 'critical',
      title: 'Compliance control missing',
      description: 'Control C-12 from FDA compliance pack is not implemented',
      scope: { tenantId, facilityId },
      affectedEntities: [{ entityId: 'C-12', entityType: 'compliance-control', title: 'FDA Control C-12' }],
      relatedReferences: [],
      evidence: [{ field: 'controlImplementation', currentValue: 'missing' }],
      auditedAt: new Date().toISOString(),
      status: 'new',
      auditId: 'AUDIT-2026-01',
    },
  ];
}

function generateMockComplianceAlerts(tenantId: string, facilityId?: string) {
  return [
    {
      packId: 'pack-fda',
      severity: 'high',
      title: 'FDA compliance pack configuration invalid',
      description: 'Configuration for FDA pack has become invalid',
      scope: { tenantId, facilityId },
      affectedEntities: [{ entityId: 'pack-fda', entityType: 'compliance-pack', title: 'FDA Compliance Pack' }],
      relatedReferences: [],
      evidence: [{ field: 'configuration.enabled', baselineValue: true, currentValue: false }],
      timestamp: new Date().toISOString(),
      status: 'new',
    },
  ];
}

// ============================================================================
// MAIN DASHBOARD
// ============================================================================

export default function AlertCenterDashboard() {
  const [tenantId] = useState('tenant-alpha');
  const [facilityId, setFacilityId] = useState<string | undefined>('facility-01');
  const [currentResult, setCurrentResult] = useState<AlertResult | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<AlertGroup | null>(null);
  const [statistics, setStatistics] = useState<AlertStatistics | null>(null);
  const [alertHistory, setAlertHistory] = useState<AlertLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize engine
  const [alertEngine] = useState(() => new AlertEngine(tenantId));

  useEffect(() => {
    loadStatistics();
    loadAlertHistory();
  }, []);

  const loadStatistics = () => {
    const stats = alertEngine.getStatistics();
    setStatistics(stats);
  };

  const loadAlertHistory = () => {
    const log = alertEngine.getAlertLog();
    const recent = log.getRecentEntries(100);
    setAlertHistory(recent);
  };

  const handleQuerySubmit = async (
    categories?: AlertCategory[],
    severities?: AlertSeverity[],
    sources?: AlertSource[],
    groupBy?: 'category' | 'severity' | 'entity' | 'engine'
  ) => {
    setLoading(true);

    try {
      const query: AlertQuery = {
        queryId: `query-${Date.now()}`,
        description: 'Alert center query',
        scope: {
          tenantId,
          facilityId,
        },
        categories,
        severities,
        sources,
        options: {
          includeSuppressed: false,
          maxAlerts: 100,
          sortBy: 'severity',
          sortOrder: 'desc',
          groupBy,
        },
        triggeredBy: 'user-001',
        triggeredAt: new Date().toISOString(),
      };

      const policyContext: AlertPolicyContext = {
        tenantId,
        facilityId,
        performedBy: 'user-001',
        userRoles: ['operator', 'auditor'],
        userPermissions: [
          'alert.query',
          'alert.view-all',
          'alert.integrity-drift',
          'alert.audit-finding',
          'alert.governance-drift',
          'alert.governance-lineage-break',
          'alert.fabric-link-break',
          'alert.documentation-drift',
          'alert.health-drift',
          'alert.analytics-anomaly',
          'alert.timeline-incident',
          'alert.compliance-issue',
          'alert.simulation-mismatch',
          'alert.intelligence-finding',
          'alert.source.integrity-monitor',
          'alert.source.auditor',
          'alert.source.health-engine',
          'alert.source.governance-system',
          'alert.source.governance-lineage',
          'alert.source.knowledge-fabric',
          'alert.source.documentation-bundler',
          'alert.source.intelligence-hub',
          'alert.source.simulation-engine',
          'alert.source.timeline-system',
          'alert.source.analytics-engine',
          'alert.source.compliance-engine',
          'facility.alert.query',
        ],
      };

      // Mock engine alerts (in production, fetch from real engines)
      const engineAlerts = {
        integrityMonitor: generateMockIntegrityAlerts(tenantId, facilityId),
        auditor: generateMockAuditAlerts(tenantId, facilityId),
        compliance: generateMockComplianceAlerts(tenantId, facilityId),
      };

      const result = await alertEngine.executeQuery(query, policyContext, engineAlerts);
      setCurrentResult(result);
      setSelectedAlert(null);
      setSelectedGroup(null);

      loadStatistics();
      loadAlertHistory();
    } catch (error) {
      console.error('Alert query failed:', error);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            🚨 Unified Alerting & Notification Center
          </h1>
          <p className="text-blue-300">
            Cross-engine alert aggregation with deterministic routing and tenant isolation
          </p>
          <div className="mt-2 text-sm text-slate-400">
            Tenant: <span className="text-blue-400">{tenantId}</span>
            {facilityId && (
              <>
                {' • '}Facility: <span className="text-blue-400">{facilityId}</span>
              </>
            )}
          </div>
        </div>

        {/* Statistics Overview */}
        {statistics && <AlertStatisticsViewer statistics={statistics} />}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column: Query Panel */}
          <div className="lg:col-span-1">
            <AlertQueryPanel onSubmit={handleQuerySubmit} loading={loading} />

            {/* Alert History */}
            <div className="mt-6">
              <AlertHistoryViewer
                history={alertHistory}
                onSelectEntry={(entry) => console.log('Selected entry:', entry)}
              />
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-2 space-y-6">
            {currentResult && (
              <>
                {/* Groups */}
                {currentResult.groups && currentResult.groups.length > 0 && (
                  <AlertGroupPanel
                    groups={currentResult.groups}
                    onSelectGroup={setSelectedGroup}
                  />
                )}

                {/* Alert List */}
                <AlertListPanel
                  result={currentResult}
                  onSelectAlert={setSelectedAlert}
                />

                {/* Selected Group Detail */}
                {selectedGroup && !selectedAlert && (
                  <AlertGroupDetailPanel group={selectedGroup} onSelectAlert={setSelectedAlert} />
                )}

                {/* Selected Alert Detail */}
                {selectedAlert && <AlertDetailPanel alert={selectedAlert} />}
              </>
            )}

            {!currentResult && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">🚨</div>
                <h3 className="text-xl font-semibold mb-2">No Alerts Loaded</h3>
                <p className="text-slate-400">
                  Run an alert query to aggregate alerts from all engines
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
// COMPONENT 1: ALERT QUERY PANEL
// ============================================================================

function AlertQueryPanel({
  onSubmit,
  loading,
}: {
  onSubmit: (
    categories?: AlertCategory[],
    severities?: AlertSeverity[],
    sources?: AlertSource[],
    groupBy?: 'category' | 'severity' | 'entity' | 'engine'
  ) => void;
  loading: boolean;
}) {
  const [selectedCategories, setSelectedCategories] = useState<AlertCategory[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<AlertSeverity[]>([]);
  const [selectedSources, setSelectedSources] = useState<AlertSource[]>([]);
  const [groupBy, setGroupBy] = useState<'category' | 'severity' | 'entity' | 'engine' | 'none'>('none');

  const categories: AlertCategory[] = [
    'integrity-drift',
    'audit-finding',
    'governance-drift',
    'governance-lineage-break',
    'fabric-link-break',
    'documentation-drift',
    'health-drift',
    'analytics-anomaly',
    'timeline-incident',
    'compliance-issue',
    'simulation-mismatch',
    'intelligence-finding',
  ];

  const severities: AlertSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];

  const sources: AlertSource[] = [
    'integrity-monitor',
    'auditor',
    'health-engine',
    'governance-system',
    'governance-lineage',
    'knowledge-fabric',
    'documentation-bundler',
    'intelligence-hub',
    'simulation-engine',
    'timeline-system',
    'analytics-engine',
    'compliance-engine',
  ];

  const handleSubmit = () => {
    onSubmit(
      selectedCategories.length > 0 ? selectedCategories : undefined,
      selectedSeverities.length > 0 ? selectedSeverities : undefined,
      selectedSources.length > 0 ? selectedSources : undefined,
      groupBy !== 'none' ? groupBy : undefined
    );
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">🔍 Alert Query</h2>

      {/* Categories */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Categories (Optional)</label>
        <div className="space-y-1 max-h-48 overflow-y-auto text-xs">
          {categories.map((category) => (
            <label key={category} className="flex items-center space-x-2">
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
        <div className="space-y-1">
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

      {/* Group By */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Group By</label>
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as any)}
          className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm"
        >
          <option value="none">No Grouping</option>
          <option value="category">By Category</option>
          <option value="severity">By Severity</option>
          <option value="entity">By Entity</option>
          <option value="engine">By Engine</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 px-4 py-2 rounded font-medium transition"
      >
        {loading ? 'Querying Alerts...' : 'Query Alerts'}
      </button>
    </div>
  );
}

// ============================================================================
// COMPONENT 2: ALERT LIST PANEL
// ============================================================================

function AlertListPanel({
  result,
  onSelectAlert,
}: {
  result: AlertResult;
  onSelectAlert: (alert: Alert) => void;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">📋 Alerts</h2>
        <span className="text-sm text-slate-400">
          {result.metadata.executionTime}ms
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/50 rounded p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{result.totalAlerts}</div>
          <div className="text-xs text-slate-400">Total</div>
        </div>
        <div className="bg-slate-900/50 rounded p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{result.newAlerts}</div>
          <div className="text-xs text-slate-400">New</div>
        </div>
        <div className="bg-slate-900/50 rounded p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{result.summary.affectedEntitiesCount}</div>
          <div className="text-xs text-slate-400">Entities</div>
        </div>
      </div>

      {/* Alerts */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {result.alerts.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            ✅ No alerts found
          </div>
        )}

        {result.alerts.map((alert) => (
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
                  <span className="text-xs text-slate-500">{alert.source}</span>
                </div>
                <h3 className="font-medium mb-1">{alert.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-2">{alert.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT 3: ALERT GROUP PANEL
// ============================================================================

function AlertGroupPanel({
  groups,
  onSelectGroup,
}: {
  groups: AlertGroup[];
  onSelectGroup: (group: AlertGroup) => void;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">📦 Alert Groups</h2>

      <div className="space-y-2">
        {groups.map((group) => (
          <button
            key={group.groupId}
            onClick={() => onSelectGroup(group)}
            className="w-full text-left bg-slate-900/50 hover:bg-slate-900 border border-slate-600 rounded p-4 transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 mb-1">{group.groupType}</div>
                <h3 className="font-medium">{group.groupKey}</h3>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-400">{group.summary.totalAlerts}</div>
                <div className="text-xs text-slate-400">{group.summary.newAlerts} new</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT 4: ALERT GROUP DETAIL PANEL
// ============================================================================

function AlertGroupDetailPanel({
  group,
  onSelectAlert,
}: {
  group: AlertGroup;
  onSelectAlert: (alert: Alert) => void;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">📦 Group: {group.groupKey}</h2>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900/50 rounded p-3 text-center">
          <div className="text-xl font-bold text-blue-400">{group.summary.totalAlerts}</div>
          <div className="text-xs text-slate-400">Total</div>
        </div>
        <div className="bg-slate-900/50 rounded p-3 text-center">
          <div className="text-xl font-bold text-yellow-400">{group.summary.newAlerts}</div>
          <div className="text-xs text-slate-400">New</div>
        </div>
        <div className="bg-slate-900/50 rounded p-3 text-center">
          <div className="text-xl font-bold text-green-400">{group.summary.affectedEntitiesCount}</div>
          <div className="text-xs text-slate-400">Entities</div>
        </div>
        <div className="bg-slate-900/50 rounded p-3 text-center">
          <div className="text-xl font-bold text-purple-400">{group.references.length}</div>
          <div className="text-xs text-slate-400">References</div>
        </div>
      </div>

      {/* Alerts in Group */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm text-slate-300 mb-2">Alerts in Group:</h3>
        {group.alerts.map((alert) => (
          <button
            key={alert.alertId}
            onClick={() => onSelectAlert(alert)}
            className="w-full text-left bg-slate-900/50 hover:bg-slate-900 rounded p-3 text-sm transition"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(alert.severity)}`}>
                {alert.severity}
              </span>
              <span className="text-slate-400">{alert.title}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT 5: ALERT DETAIL PANEL
// ============================================================================

function AlertDetailPanel({ alert }: { alert: Alert }) {
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
          <span className="text-sm text-slate-500">{alert.source}</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">{alert.title}</h3>
        <p className="text-slate-300">{alert.description}</p>
        <div className="mt-2 text-xs text-slate-500">
          Detected: {new Date(alert.detectedAt).toLocaleString()}
        </div>
      </div>

      {/* Evidence */}
      {alert.evidence && alert.evidence.length > 0 && (
        <div className="bg-slate-900/50 rounded p-4 mb-4">
          <h4 className="font-medium mb-2">🔍 Evidence</h4>
          <div className="space-y-2">
            {alert.evidence.map((e, i) => (
              <div key={i} className="text-sm">
                <div className="text-slate-400">{e.field}:</div>
                <div className="ml-4">
                  {e.baselineValue !== undefined && (
                    <div><span className="text-blue-400">Baseline:</span> {String(e.baselineValue)}</div>
                  )}
                  {e.currentValue !== undefined && (
                    <div><span className="text-orange-400">Current:</span> {String(e.currentValue)}</div>
                  )}
                  {e.drift && (
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded text-xs ${getDriftTypeColor(e.drift.type)}`}>
                        {e.drift.type.toUpperCase()}
                      </span>
                      <span className="ml-2 text-slate-500">{e.drift.details}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Affected Entities */}
      {alert.affectedEntities.length > 0 && (
        <AlertReferencePanel references={alert.affectedEntities} title="Affected Entities" />
      )}

      {/* Cross-Engine Integration Links */}
      <div className="bg-blue-900/20 border border-blue-700 rounded p-4 mt-4">
        <h4 className="font-medium mb-2">🔗 Related Systems</h4>
        <div className="grid grid-cols-2 gap-2">
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            📝 Explain Alert (Phase 37)
          </button>
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            📊 Open Incident (Phase 38)
          </button>
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            📈 Open Pattern (Phase 39)
          </button>
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            📚 Open Training (Phase 40)
          </button>
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            ⚖️ Open Governance (Phase 44)
          </button>
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            🔗 Open Lineage (Phase 45)
          </button>
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            🕸️ Open Fabric Links (Phase 46)
          </button>
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            📄 Open Documentation (Phase 47)
          </button>
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            🧠 Open Intelligence Hub (Phase 48)
          </button>
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            🎮 Open Simulation (Phase 49)
          </button>
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            🔍 Open Audit (Phase 50)
          </button>
          <button className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition">
            🛡️ Open Integrity Monitor (Phase 51)
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT 6: ALERT REFERENCE PANEL
// ============================================================================

function AlertReferencePanel({
  references,
  title,
}: {
  references: AlertReference[];
  title: string;
}) {
  return (
    <div className="bg-slate-900/50 rounded p-4 mb-4">
      <h4 className="font-medium mb-2">{title}</h4>
      <div className="space-y-2">
        {references.map((ref) => (
          <div key={ref.referenceId} className="text-sm border border-slate-700 rounded p-2">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-slate-700 rounded">{ref.referenceType}</span>
              <span className="text-xs text-slate-500">{ref.sourceEngine}</span>
            </div>
            <h5 className="font-medium mt-1">{ref.title}</h5>
            <p className="text-slate-400 text-xs">{ref.entityType}: {ref.entityId}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT 7: ALERT HISTORY VIEWER
// ============================================================================

function AlertHistoryViewer({
  history,
  onSelectEntry,
}: {
  history: AlertLogEntry[];
  onSelectEntry: (entry: AlertLogEntry) => void;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">📜 Alert History</h2>

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
// COMPONENT 8: ALERT STATISTICS VIEWER
// ============================================================================

function AlertStatisticsViewer({ statistics }: { statistics: AlertStatistics }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">📊 Alert Statistics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Stats */}
        <div className="bg-slate-900/50 rounded p-3">
          <div className="text-2xl font-bold text-blue-400">{statistics.totalAlerts}</div>
          <div className="text-xs text-slate-400">Total Alerts</div>
        </div>
        <div className="bg-slate-900/50 rounded p-3">
          <div className="text-2xl font-bold text-yellow-400">{statistics.alertsLast24Hours}</div>
          <div className="text-xs text-slate-400">Last 24h</div>
        </div>
        <div className="bg-slate-900/50 rounded p-3">
          <div className="text-2xl font-bold text-purple-400">{statistics.totalGroups}</div>
          <div className="text-xs text-slate-400">Groups</div>
        </div>
        <div className="bg-slate-900/50 rounded p-3">
          <div className="text-2xl font-bold text-green-400">{statistics.totalQueries}</div>
          <div className="text-xs text-slate-400">Queries</div>
        </div>
      </div>

      {/* Most Common */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-slate-900/50 rounded p-3">
          <div className="text-xs text-slate-400 mb-1">Most Common Category</div>
          <div className="text-sm font-medium text-blue-300">{statistics.mostCommonCategory}</div>
        </div>
        <div className="bg-slate-900/50 rounded p-3">
          <div className="text-xs text-slate-400 mb-1">Most Common Severity</div>
          <div className="text-sm font-medium text-orange-300 capitalize">{statistics.mostCommonSeverity}</div>
        </div>
        <div className="bg-slate-900/50 rounded p-3">
          <div className="text-xs text-slate-400 mb-1">Most Common Source</div>
          <div className="text-sm font-medium text-green-300">{statistics.mostCommonSource}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getSeverityColor(severity: AlertSeverity): string {
  const colors = {
    critical: 'bg-red-600 text-white',
    high: 'bg-orange-600 text-white',
    medium: 'bg-yellow-600 text-white',
    low: 'bg-blue-600 text-white',
    info: 'bg-slate-600 text-white',
  };
  return colors[severity];
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
