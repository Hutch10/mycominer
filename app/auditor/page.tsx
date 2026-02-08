'use client';

/**
 * Phase 50: Autonomous System Auditor - Dashboard UI
 * 
 * Complete audit dashboard with query panel, results viewer, findings inspector,
 * reference explorer, audit history, and statistics.
 */

import { useState, useEffect } from 'react';
import { AuditorEngine } from './auditorEngine';
import type {
  AuditQuery,
  AuditResult,
  AuditFinding,
  AuditCategory,
  AuditSeverity,
  AuditReference,
  AuditStatistics,
  AuditLogEntry,
  AuditPolicyContext,
} from './auditorTypes';

// ============================================================================
// MAIN DASHBOARD
// ============================================================================

export default function AuditorDashboard() {
  const [tenantId] = useState('tenant-alpha');
  const [facilityId, setFacilityId] = useState<string | undefined>('facility-01');
  const [currentResult, setCurrentResult] = useState<AuditResult | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<AuditFinding | null>(null);
  const [statistics, setStatistics] = useState<AuditStatistics | null>(null);
  const [auditHistory, setAuditHistory] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize engine
  const [auditorEngine] = useState(() => new AuditorEngine(tenantId));

  // Load statistics on mount
  useEffect(() => {
    loadStatistics();
    loadAuditHistory();
  }, []);

  const loadStatistics = () => {
    const stats = auditorEngine.getStatistics();
    setStatistics(stats);
  };

  const loadAuditHistory = () => {
    const log = auditorEngine.getAuditLog();
    const recent = log.getRecentEntries(50);
    setAuditHistory(recent);
  };

  const handleAuditSubmit = async (query: AuditQuery) => {
    setLoading(true);

    try {
      const policyContext: AuditPolicyContext = {
        tenantId,
        facilityId,
        performedBy: 'user-001',
        userRoles: ['auditor', 'operator'],
        userPermissions: [
          'audit.run',
          'audit.full-system',
          'audit.facility',
          'audit.category',
          'audit.rule',
          'audit.entity',
          'facility.audit',
          'audit.workflow-sop-alignment',
          'audit.governance-correctness',
          'audit.governance-lineage',
          'audit.health-drift-validation',
          'audit.analytics-consistency',
          'audit.documentation-completeness',
          'audit.fabric-integrity',
          'audit.cross-engine-consistency',
          'audit.compliance-pack-validation',
        ],
      };

      const result = await auditorEngine.executeAudit(query, policyContext);
      setCurrentResult(result);
      setSelectedFinding(null);

      // Refresh statistics and history
      loadStatistics();
      loadAuditHistory();
    } catch (error) {
      console.error('Audit failed:', error);
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
            🔍 Autonomous System Auditor
          </h1>
          <p className="text-blue-300">
            Deterministic compliance auditing across all system engines
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
        {statistics && (
          <AuditStatisticsViewer statistics={statistics} />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column: Query Panel */}
          <div className="lg:col-span-1">
            <AuditQueryPanel
              tenantId={tenantId}
              facilityId={facilityId}
              onSubmit={handleAuditSubmit}
              loading={loading}
            />

            {/* Audit History */}
            <div className="mt-6">
              <AuditHistoryViewer
                history={auditHistory}
                onSelectEntry={(entry) => {
                  if (entry.entryType === 'finding') {
                    // Load the finding
                    console.log('Selected finding entry:', entry);
                  }
                }}
              />
            </div>
          </div>

          {/* Right Column: Results and Findings */}
          <div className="lg:col-span-2 space-y-6">
            {currentResult && (
              <>
                <AuditResultViewer
                  result={currentResult}
                  onSelectFinding={setSelectedFinding}
                />

                {selectedFinding && (
                  <>
                    <AuditFindingPanel finding={selectedFinding} />
                    {selectedFinding.affectedEntities.length > 0 && (
                      <AuditReferencePanel references={selectedFinding.affectedEntities} />
                    )}
                  </>
                )}
              </>
            )}

            {!currentResult && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No Audit Results</h3>
                <p className="text-slate-400">
                  Submit an audit query to see compliance findings
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
// COMPONENT 1: AUDIT QUERY PANEL
// ============================================================================

function AuditQueryPanel({
  tenantId,
  facilityId,
  onSubmit,
  loading,
}: {
  tenantId: string;
  facilityId?: string;
  onSubmit: (query: AuditQuery) => void;
  loading: boolean;
}) {
  const [queryType, setQueryType] = useState<'full-system' | 'facility' | 'category' | 'rule'>('facility');
  const [selectedCategories, setSelectedCategories] = useState<AuditCategory[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<AuditSeverity[]>([]);

  const categories: AuditCategory[] = [
    'workflow-sop-alignment',
    'governance-correctness',
    'governance-lineage',
    'health-drift-validation',
    'analytics-consistency',
    'documentation-completeness',
    'fabric-integrity',
    'cross-engine-consistency',
    'compliance-pack-validation',
  ];

  const severities: AuditSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];

  const handleSubmit = () => {
    const query: AuditQuery = {
      queryId: `query-${Date.now()}`,
      queryType,
      queryText: `Audit ${queryType} for ${tenantId}`,
      scope: {
        tenantId,
        facilityId: queryType === 'facility' ? facilityId : undefined,
      },
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      severities: selectedSeverities.length > 0 ? selectedSeverities : undefined,
      options: {
        includeResolved: false,
        includeFalsePositives: false,
        maxFindings: 100,
        sortBy: 'severity',
        sortOrder: 'desc',
      },
      performedBy: 'user-001',
      performedAt: new Date().toISOString(),
    };

    onSubmit(query);
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">🔍 Audit Query</h2>

      {/* Query Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Query Type</label>
        <select
          value={queryType}
          onChange={(e) => setQueryType(e.target.value as any)}
          className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2"
        >
          <option value="full-system">Full System</option>
          <option value="facility">Facility</option>
          <option value="category">By Category</option>
          <option value="rule">By Rule</option>
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
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 px-4 py-2 rounded font-medium transition"
      >
        {loading ? 'Running Audit...' : 'Run Audit'}
      </button>
    </div>
  );
}

// ============================================================================
// COMPONENT 2: AUDIT RESULT VIEWER
// ============================================================================

function AuditResultViewer({
  result,
  onSelectFinding,
}: {
  result: AuditResult;
  onSelectFinding: (finding: AuditFinding) => void;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">📊 Audit Results</h2>
        <span className="text-sm text-slate-400">
          {result.metadata.executionTime}ms
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/50 rounded p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{result.totalFindings}</div>
          <div className="text-xs text-slate-400">Total Findings</div>
        </div>
        <div className="bg-slate-900/50 rounded p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{result.summary.rulesPassed}</div>
          <div className="text-xs text-slate-400">Rules Passed</div>
        </div>
        <div className="bg-slate-900/50 rounded p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{result.summary.rulesFailed}</div>
          <div className="text-xs text-slate-400">Rules Failed</div>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {result.findings.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            ✅ No compliance issues found
          </div>
        )}

        {result.findings.map((finding) => (
          <button
            key={finding.findingId}
            onClick={() => onSelectFinding(finding)}
            className="w-full text-left bg-slate-900/50 hover:bg-slate-900 border border-slate-600 rounded p-4 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(finding.severity)}`}>
                    {finding.severity.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400">{finding.category}</span>
                </div>
                <h3 className="font-medium mb-1">{finding.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-2">{finding.description}</p>
              </div>
              <div className="text-xs text-slate-500 ml-4">
                {finding.affectedEntities.length} affected
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT 3: AUDIT FINDING PANEL
// ============================================================================

function AuditFindingPanel({ finding }: { finding: AuditFinding }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">🔎 Finding Details</h2>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-3 py-1 rounded font-medium ${getSeverityColor(finding.severity)}`}>
            {finding.severity.toUpperCase()}
          </span>
          <span className="text-sm text-slate-400">{finding.category}</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">{finding.title}</h3>
        <p className="text-slate-300">{finding.description}</p>
      </div>

      {/* Rule Info */}
      <div className="bg-slate-900/50 rounded p-4 mb-4">
        <h4 className="font-medium mb-2">📋 Rule</h4>
        <div className="text-sm space-y-1">
          <div><span className="text-slate-400">ID:</span> {finding.rule.ruleId}</div>
          <div><span className="text-slate-400">Name:</span> {finding.rule.ruleName}</div>
          <div><span className="text-slate-400">Description:</span> {finding.rule.ruleDescription}</div>
        </div>
      </div>

      {/* Evidence */}
      {finding.evidence && finding.evidence.length > 0 && (
        <div className="bg-slate-900/50 rounded p-4 mb-4">
          <h4 className="font-medium mb-2">🔍 Evidence</h4>
          <div className="space-y-2">
            {finding.evidence.map((e, i) => {
              const expectedStr = e.expectedValue !== undefined && e.expectedValue !== null 
                ? String(e.expectedValue) 
                : null;
              const actualStr = e.actualValue !== undefined 
                ? (e.actualValue === null ? 'null' : String(e.actualValue))
                : null;
              
              return (
                <div key={i} className="text-sm">
                  <div className="text-slate-400">{e.field}:</div>
                  <div className="ml-4">
                    {expectedStr && (
                      <div><span className="text-green-400">Expected:</span> {expectedStr}</div>
                    )}
                    {actualStr !== null && (
                      <div><span className="text-red-400">Actual:</span> {actualStr}</div>
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

      {/* Remediation */}
      {finding.remediation && (
        <div className="bg-blue-900/20 border border-blue-700 rounded p-4">
          <h4 className="font-medium mb-2">💡 Remediation</h4>
          <p className="text-sm text-slate-300">
            {typeof finding.remediation === 'string' 
              ? finding.remediation 
              : finding.remediation.description}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT 4: AUDIT REFERENCE PANEL
// ============================================================================

function AuditReferencePanel({ references }: { references: AuditReference[] }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">🔗 Affected Entities</h2>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {references.map((ref) => (
          <div
            key={ref.referenceId}
            className="bg-slate-900/50 border border-slate-600 rounded p-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-1 bg-slate-700 rounded">{ref.referenceType}</span>
                  <span className="text-xs text-slate-500">{ref.sourceEngine}</span>
                </div>
                <h4 className="font-medium">{ref.title}</h4>
                <p className="text-sm text-slate-400">{ref.entityType}: {ref.entityId}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT 5: AUDIT HISTORY VIEWER
// ============================================================================

function AuditHistoryViewer({
  history,
  onSelectEntry,
}: {
  history: AuditLogEntry[];
  onSelectEntry: (entry: AuditLogEntry) => void;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">📜 Audit History</h2>

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
// COMPONENT 6: AUDIT STATISTICS VIEWER
// ============================================================================

function AuditStatisticsViewer({ statistics }: { statistics: AuditStatistics }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">📈 Audit Statistics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Stats */}
        <div className="bg-slate-900/50 rounded p-3">
          <div className="text-2xl font-bold text-blue-400">{statistics.totalAudits}</div>
          <div className="text-xs text-slate-400">Total Audits</div>
        </div>
        <div className="bg-slate-900/50 rounded p-3">
          <div className="text-2xl font-bold text-yellow-400">{statistics.totalFindings}</div>
          <div className="text-xs text-slate-400">Total Findings</div>
        </div>
        <div className="bg-slate-900/50 rounded p-3">
          <div className="text-2xl font-bold text-purple-400">{statistics.auditsLast24Hours}</div>
          <div className="text-xs text-slate-400">Audits (24h)</div>
        </div>
        <div className="bg-slate-900/50 rounded p-3">
          <div className="text-2xl font-bold text-orange-400">{statistics.findingsLast24Hours}</div>
          <div className="text-xs text-slate-400">Findings (24h)</div>
        </div>
      </div>

      {/* Severity Breakdown */}
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">By Severity</h3>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(statistics.findingsBySeverity).map(([severity, count]) => (
            <div key={severity} className="bg-slate-900/50 rounded p-2 text-center">
              <div className={`text-lg font-bold ${getSeverityTextColor(severity as AuditSeverity)}`}>
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

function getSeverityColor(severity: AuditSeverity): string {
  const colors = {
    critical: 'bg-red-600 text-white',
    high: 'bg-orange-600 text-white',
    medium: 'bg-yellow-600 text-white',
    low: 'bg-blue-600 text-white',
    info: 'bg-slate-600 text-white',
  };
  return colors[severity];
}

function getSeverityTextColor(severity: AuditSeverity): string {
  const colors = {
    critical: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-yellow-400',
    low: 'text-blue-400',
    info: 'text-slate-400',
  };
  return colors[severity];
}
