'use client';

/**
 * Phase 48: Global Coverage Sweep & Missing Systems Detector
 * 
 * COVERAGE DASHBOARD
 * 
 * Operator- and admin-friendly UI for:
 * - Running coverage scans
 * - Viewing missing components
 * - Inspecting gaps by category
 * - Accessing phase metadata
 * - Opening fabric links
 * - Viewing governance decisions
 * - Explaining gaps via Narrative Engine
 */

import React, { useState, useEffect } from 'react';
import {
  CoverageEngine,
  CoverageQuery,
  CoverageResult,
  CoverageGap,
  CoverageStatistics,
  PhaseRecord,
  CoverageGapCategory,
  CoverageGapSeverity,
  PhaseNumber,
  CompletenessScore
} from './index';

export default function CoverageDashboardPage() {
  const [tenantId, setTenantId] = useState<string>('tenant-alpha');
  const [engine, setEngine] = useState<CoverageEngine | null>(null);
  const [statistics, setStatistics] = useState<CoverageStatistics | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [coverageResult, setCoverageResult] = useState<CoverageResult | null>(null);
  const [selectedGap, setSelectedGap] = useState<CoverageGap | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<PhaseRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize engine
  useEffect(() => {
    const newEngine = new CoverageEngine(tenantId);
    setEngine(newEngine);
    setStatistics(newEngine.getStatistics());
  }, [tenantId]);

  // Handle coverage query
  const handleExecuteQuery = async (query: CoverageQuery) => {
    if (!engine) return;

    setLoading(true);
    try {
      const result = await engine.executeCoverageQuery(query, 'admin-user');
      setCoverageResult(result);
      setStatistics(engine.getStatistics());
      setActiveTab('gaps');
    } catch (error) {
      console.error('Coverage query failed:', error);
      alert('Coverage query failed. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
          🔍 Coverage Sweep Dashboard
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Phase 48: Global Coverage Sweep & Missing Systems Detector
        </p>
        <p style={{ color: '#888', fontSize: '14px', marginTop: '5px' }}>
          Deterministic audit of all phases (32-48) to identify missing components and structural gaps
        </p>
      </header>

      {/* Statistics Cards */}
      {statistics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Total Gaps Detected</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc3545' }}>{statistics.totalGapsDetected}</div>
          </div>
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Critical Gaps</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc3545' }}>{statistics.criticalGapsUnresolved}</div>
          </div>
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>System Completeness</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: statistics.overallSystemCompleteness >= 80 ? '#28a745' : '#ffc107' }}>
              {statistics.overallSystemCompleteness}%
            </div>
          </div>
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Queries (24h)</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>{statistics.queriesLast24h}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #dee2e6' }}>
        {['overview', 'query', 'gaps', 'phases', 'history'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              background: activeTab === tab ? '#007bff' : 'transparent',
              color: activeTab === tab ? 'white' : '#666',
              border: 'none',
              borderBottom: activeTab === tab ? '3px solid #007bff' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab ? 'bold' : 'normal'
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && engine && statistics && (
          <CoverageOverview
            statistics={statistics}
            engine={engine}
            onExecuteQuery={handleExecuteQuery}
          />
        )}
        {activeTab === 'query' && (
          <CoverageQueryPanel
            onExecuteQuery={handleExecuteQuery}
            loading={loading}
          />
        )}
        {activeTab === 'gaps' && coverageResult && (
          <CoverageGapList
            result={coverageResult}
            onSelectGap={setSelectedGap}
          />
        )}
        {activeTab === 'phases' && engine && (
          <PhaseCompletenessViewer
            engine={engine}
            onSelectPhase={setSelectedPhase}
          />
        )}
        {activeTab === 'history' && engine && (
          <CoverageHistoryViewer
            engine={engine}
          />
        )}
      </div>

      {/* Gap Detail Modal */}
      {selectedGap && (
        <CoverageGapDetailPanel
          gap={selectedGap}
          onClose={() => setSelectedGap(null)}
        />
      )}

      {/* Phase Detail Modal */}
      {selectedPhase && engine && (
        <PhaseDetailPanel
          phase={selectedPhase}
          completeness={engine.getCompletenessScore(selectedPhase.phaseNumber)}
          onClose={() => setSelectedPhase(null)}
        />
      )}
    </div>
  );
}

// ============================================================================
// COVERAGE OVERVIEW COMPONENT
// ============================================================================

function CoverageOverview({
  statistics,
  engine,
  onExecuteQuery
}: {
  statistics: CoverageStatistics;
  engine: CoverageEngine;
  onExecuteQuery: (query: CoverageQuery) => void;
}) {
  const quickActions = [
    { label: 'List All Gaps', queryType: 'list-all-gaps' as const },
    { label: 'Critical Gaps Only', queryType: 'list-gaps-by-severity' as const, severity: 'critical' as const },
    { label: 'Missing Integrations', queryType: 'list-missing-integrations' as const },
    { label: 'Phase Completeness', queryType: 'list-phase-completeness' as const }
  ];

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>System Coverage Overview</h2>

      {/* Gap Distribution */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Gap Distribution</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          {Object.entries(statistics.gapsByCategory).map(([category, count]) => (
            <div key={category} style={{ background: '#fff', padding: '15px', border: '1px solid #dee2e6', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>{formatCategory(category)}</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: getSeverityColor(count > 5 ? 'high' : 'medium') }}>
                {count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          {quickActions.map(action => (
            <button
              key={action.label}
              onClick={() => onExecuteQuery({
                queryType: action.queryType,
                scope: { scope: 'global' },
                filters: action.severity ? { severity: action.severity } : {}
              })}
              style={{
                padding: '15px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phase Completeness Summary */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Phase Completeness Scores</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
          {Object.entries(statistics.phaseCompletenessScores).map(([phase, score]) => (
            <div key={phase} style={{ background: '#fff', padding: '12px', border: '1px solid #dee2e6', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Phase {phase}</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: getCompletenessColor(score) }}>
                {score}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COVERAGE QUERY PANEL COMPONENT
// ============================================================================

function CoverageQueryPanel({
  onExecuteQuery,
  loading
}: {
  onExecuteQuery: (query: CoverageQuery) => void;
  loading: boolean;
}) {
  const [queryType, setQueryType] = useState<string>('list-all-gaps');
  const [category, setCategory] = useState<string>('');
  const [severity, setSeverity] = useState<string>('');
  const [phase, setPhase] = useState<string>('');

  const handleExecute = () => {
    const query: CoverageQuery = {
      queryType: queryType as any,
      scope: { scope: 'global' },
      filters: {
        ...(category && { category: category as CoverageGapCategory }),
        ...(severity && { severity: severity as CoverageGapSeverity }),
        ...(phase && { phase: parseInt(phase) as PhaseNumber }),
        includeReferences: true,
        includeMetadata: true,
        includeRecommendations: true
      },
      options: {
        format: 'json',
        includePhaseInventory: true,
        includeIntegrationMatrix: true,
        sortBy: 'severity'
      }
    };

    onExecuteQuery(query);
  };

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Execute Coverage Query</h2>

      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        {/* Query Type */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Query Type</label>
          <select
            value={queryType}
            onChange={(e) => setQueryType(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '14px', border: '1px solid #ced4da', borderRadius: '4px' }}
          >
            <option value="list-all-gaps">List All Gaps</option>
            <option value="list-gaps-by-category">List Gaps by Category</option>
            <option value="list-gaps-by-phase">List Gaps by Phase</option>
            <option value="list-gaps-by-severity">List Gaps by Severity</option>
            <option value="list-missing-integrations">List Missing Integrations</option>
            <option value="list-phase-completeness">List Phase Completeness</option>
            <option value="list-engine-coverage">List Engine Coverage</option>
          </select>
        </div>

        {/* Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '15px' }}>
          {/* Category */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Category (Optional)</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '10px', fontSize: '14px', border: '1px solid #ced4da', borderRadius: '4px' }}
            >
              <option value="">All Categories</option>
              <option value="missing-engine">Missing Engine</option>
              <option value="missing-ui-layer">Missing UI Layer</option>
              <option value="missing-integration">Missing Integration</option>
              <option value="missing-policy">Missing Policy</option>
              <option value="missing-documentation">Missing Documentation</option>
              <option value="missing-lineage">Missing Lineage</option>
              <option value="missing-health-checks">Missing Health Checks</option>
              <option value="missing-fabric-links">Missing Fabric Links</option>
              <option value="missing-governance-coverage">Missing Governance Coverage</option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Severity (Optional)</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              style={{ width: '100%', padding: '10px', fontSize: '14px', border: '1px solid #ced4da', borderRadius: '4px' }}
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Info</option>
            </select>
          </div>

          {/* Phase */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Phase (Optional)</label>
            <select
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              style={{ width: '100%', padding: '10px', fontSize: '14px', border: '1px solid #ced4da', borderRadius: '4px' }}
            >
              <option value="">All Phases</option>
              {[32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48].map(p => (
                <option key={p} value={p}>Phase {p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Execute Button */}
        <button
          onClick={handleExecute}
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: loading ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            width: '100%'
          }}
        >
          {loading ? 'Executing...' : 'Execute Coverage Scan'}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// COVERAGE GAP LIST COMPONENT
// ============================================================================

function CoverageGapList({
  result,
  onSelectGap
}: {
  result: CoverageResult;
  onSelectGap: (gap: CoverageGap) => void;
}) {
  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>{result.title}</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>{result.description}</p>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', border: '1px solid #dee2e6' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total Gaps</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{result.summary.totalGaps}</div>
        </div>
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', border: '1px solid #dee2e6' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Critical</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>{result.summary.criticalGaps}</div>
        </div>
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', border: '1px solid #dee2e6' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>High</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fd7e14' }}>{result.summary.highGaps}</div>
        </div>
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', border: '1px solid #dee2e6' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Execution Time</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{result.executionTimeMs}ms</div>
        </div>
      </div>

      {/* Gap List */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Detected Gaps ({result.gaps.length})</h3>
        {result.gaps.map(gap => (
          <div
            key={gap.id}
            onClick={() => onSelectGap(gap)}
            style={{
              background: '#fff',
              padding: '15px',
              marginBottom: '10px',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              cursor: 'pointer',
              borderLeft: `4px solid ${getSeverityColor(gap.severity)}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{gap.title}</h4>
              <span style={{
                padding: '4px 12px',
                background: getSeverityColor(gap.severity),
                color: 'white',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {gap.severity.toUpperCase()}
              </span>
            </div>
            <p style={{ color: '#666', margin: '0 0 10px 0', fontSize: '14px' }}>{gap.description}</p>
            <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#888' }}>
              <span>📊 Category: {formatCategory(gap.category)}</span>
              <span>🔢 Phases: {gap.affectedPhases.join(', ')}</span>
              <span>⚙️ Engines: {gap.affectedEngines.length}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// PHASE COMPLETENESS VIEWER COMPONENT
// ============================================================================

function PhaseCompletenessViewer({
  engine,
  onSelectPhase
}: {
  engine: CoverageEngine;
  onSelectPhase: (phase: PhaseRecord) => void;
}) {
  const phases = engine.getPhaseInventory();

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Phase Completeness Analysis</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
        {phases.map(phase => {
          const completeness = engine.getCompletenessScore(phase.phaseNumber);
          return (
            <div
              key={phase.phaseNumber}
              onClick={() => onSelectPhase(phase)}
              style={{
                background: '#fff',
                padding: '15px',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                cursor: 'pointer',
                borderTop: `4px solid ${getCompletenessColor(completeness?.score || 0)}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>Phase {phase.phaseNumber}</h3>
                <span style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: getCompletenessColor(completeness?.score || 0)
                }}>
                  {completeness?.score}%
                </span>
              </div>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>{phase.phaseName}</p>
              <div style={{ fontSize: '12px', color: '#888' }}>
                <div>✓ Engines: {phase.engines.length}</div>
                <div>✓ UI Components: {phase.uiComponents.length}</div>
                <div>✓ Integrations: {phase.integrations.length}</div>
                {completeness && completeness.missingComponents.length > 0 && (
                  <div style={{ color: '#dc3545', marginTop: '5px' }}>
                    ✗ Missing: {completeness.missingComponents.join(', ')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// COVERAGE HISTORY VIEWER COMPONENT
// ============================================================================

function CoverageHistoryViewer({ engine }: { engine: CoverageEngine }) {
  const log = engine.getLog();
  const entries = log.getAllEntries().slice(-20).reverse();

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Recent Coverage Operations</h2>

      <div>
        {entries.map(entry => (
          <div
            key={entry.id}
            style={{
              background: '#fff',
              padding: '15px',
              marginBottom: '10px',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              borderLeft: `4px solid ${entry.success ? '#28a745' : '#dc3545'}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'between', marginBottom: '5px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{entry.type}</span>
              <span style={{ color: '#888', fontSize: '12px' }}>{new Date(entry.timestamp).toLocaleString()}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Performer: {entry.performer} | Scope: {entry.scope.scope} | Status: {entry.success ? '✅ Success' : '❌ Failed'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// GAP DETAIL MODAL COMPONENT
// ============================================================================

function CoverageGapDetailPanel({
  gap,
  onClose
}: {
  gap: CoverageGap;
  onClose: () => void;
}) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '700px',
        maxHeight: '80vh',
        overflow: 'auto',
        width: '90%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{gap.title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>Category:</span> {formatCategory(gap.category)}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>Severity:</span>{' '}
            <span style={{ color: getSeverityColor(gap.severity), fontWeight: 'bold' }}>
              {gap.severity.toUpperCase()}
            </span>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>Description:</span> {gap.description}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>Affected Phases:</span> {gap.affectedPhases.join(', ')}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>Affected Engines:</span> {gap.affectedEngines.join(', ')}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>Detected At:</span> {new Date(gap.detectedAt).toLocaleString()}
          </div>
        </div>

        {gap.recommendations.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Recommendations</h3>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              {gap.recommendations.map((rec, i) => (
                <li key={i} style={{ marginBottom: '5px', color: '#666' }}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {gap.metadata && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Metadata</h3>
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', fontSize: '14px' }}>
              <div><strong>Expected:</strong> {gap.metadata.expectedComponent}</div>
              <div><strong>Actual:</strong> {gap.metadata.actualComponent || 'None'}</div>
              <div><strong>Impact:</strong> {gap.metadata.impactAnalysis}</div>
              <div><strong>Estimated Effort:</strong> {gap.metadata.estimatedEffort}</div>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            width: '100%'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// PHASE DETAIL MODAL COMPONENT
// ============================================================================

function PhaseDetailPanel({
  phase,
  completeness,
  onClose
}: {
  phase: PhaseRecord;
  completeness: CompletenessScore | null;
  onClose: () => void;
}) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflow: 'auto',
        width: '90%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Phase {phase.phaseNumber}: {phase.phaseName}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#666' }}>{phase.description}</p>
          <div style={{ fontSize: '14px', color: '#888', marginTop: '10px' }}>
            <div>Completed: {phase.completedDate}</div>
            <div>Files: {phase.totalFiles} | Lines: {phase.totalLines}</div>
            <div>Status: {phase.status}</div>
          </div>
        </div>

        {completeness && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
              Completeness Score: {' '}
              <span style={{ color: getCompletenessColor(completeness.score) }}>
                {completeness.score}%
              </span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '15px' }}>
              {Object.entries(completeness.breakdown).map(([key, value]) => (
                <div key={key} style={{
                  padding: '10px',
                  background: value ? '#d4edda' : '#f8d7da',
                  borderRadius: '4px',
                  fontSize: '12px',
                  textAlign: 'center'
                }}>
                  {value ? '✅' : '❌'} {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Engines ({phase.engines.length})</h3>
          {phase.engines.map(engine => (
            <div key={engine.engineName} style={{ background: '#f8f9fa', padding: '10px', marginBottom: '5px', borderRadius: '4px' }}>
              <div style={{ fontWeight: 'bold' }}>{engine.engineName}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Type: {engine.engineType} | Capabilities: {engine.capabilities.join(', ')}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            width: '100%'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getSeverityColor(severity: CoverageGapSeverity): string {
  const colors: Record<CoverageGapSeverity, string> = {
    'critical': '#dc3545',
    'high': '#fd7e14',
    'medium': '#ffc107',
    'low': '#17a2b8',
    'info': '#6c757d'
  };
  return colors[severity];
}

function getCompletenessColor(score: number): string {
  if (score >= 90) return '#28a745';
  if (score >= 70) return '#ffc107';
  if (score >= 50) return '#fd7e14';
  return '#dc3545';
}

function formatCategory(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
