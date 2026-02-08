'use client';

/**
 * Phase 48: Operator Intelligence Hub - UI
 * 
 * Unified cross-engine assistant interface.
 * Queries 13 engines and displays comprehensive, deterministic results.
 * 
 * CRITICAL CONSTRAINTS:
 * - No generative AI content
 * - All data from real engines
 * - Tenant isolation enforced
 * - Cross-engine hooks for navigation
 */

import React, { useState, useEffect } from 'react';
import type {
  HubQuery,
  HubResult,
  HubSection,
  HubReference,
  HubQueryType,
  HubSourceEngine,
  HubLogEntry,
  HubStatistics,
  HubLineageChain,
  HubImpactMap,
} from './hubTypes';
import { HubEngine } from './hubEngine';

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function OperatorIntelligenceHubPage() {
  const [tenantId] = useState('tenant-alpha');
  const [facilityId, setFacilityId] = useState<string>('facility-01');
  const [engine] = useState(() => new HubEngine('tenant-alpha'));
  
  const [activeTab, setActiveTab] = useState<'query' | 'result' | 'history' | 'stats'>('query');
  const [currentResult, setCurrentResult] = useState<HubResult | null>(null);
  const [selectedSection, setSelectedSection] = useState<HubSection | null>(null);
  const [selectedReference, setSelectedReference] = useState<HubReference | null>(null);
  const [statistics, setStatistics] = useState<HubStatistics | null>(null);
  const [loading, setLoading] = useState(false);

  // Load statistics
  useEffect(() => {
    setStatistics(engine.getStatistics());
  }, [engine]);

  // Handle query execution
  const handleExecuteQuery = async (query: HubQuery) => {
    setLoading(true);
    try {
      const result = await engine.executeQuery(query);
      setCurrentResult(result);
      setStatistics(engine.getStatistics());
      setActiveTab('result');
    } catch (error) {
      console.error('Query execution failed:', error);
      alert(error instanceof Error ? error.message : 'Query failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                🧠 Operator Intelligence Hub
              </h1>
              <p className="text-slate-600">
                Unified cross-engine assistant • 13 engines • Deterministic responses
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">Tenant: {tenantId}</div>
              <div className="text-sm text-slate-600">Facility: {facilityId}</div>
            </div>
          </div>
        </div>

        {/* Statistics Bar */}
        {statistics && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-blue-600">{statistics.totalQueries}</div>
              <div className="text-sm text-slate-600">Total Queries</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-green-600">{statistics.averageQueryTime}ms</div>
              <div className="text-sm text-slate-600">Avg Response Time</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-purple-600">{statistics.mostQueriedEngine}</div>
              <div className="text-sm text-slate-600">Most Used Engine</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-orange-600">{statistics.queriesLast24Hours}</div>
              <div className="text-sm text-slate-600">Queries (24h)</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-slate-200 flex">
            {[
              { id: 'query', label: '🔍 Query', icon: '🔍' },
              { id: 'result', label: '📊 Results', icon: '📊' },
              { id: 'history', label: '📜 History', icon: '📜' },
              { id: 'stats', label: '📈 Statistics', icon: '📈' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'query' && (
              <HubQueryPanel
                tenantId={tenantId}
                facilityId={facilityId}
                engine={engine}
                onExecute={handleExecuteQuery}
                loading={loading}
              />
            )}

            {activeTab === 'result' && currentResult && (
              <HubResultViewer
                result={currentResult}
                onSelectSection={setSelectedSection}
                onSelectReference={setSelectedReference}
              />
            )}

            {activeTab === 'history' && (
              <HubHistoryViewer engine={engine} />
            )}

            {activeTab === 'stats' && statistics && (
              <HubStatisticsViewer statistics={statistics} />
            )}
          </div>
        </div>

        {/* Section Detail Modal */}
        {selectedSection && (
          <HubSectionPanel
            section={selectedSection}
            onClose={() => setSelectedSection(null)}
          />
        )}

        {/* Reference Detail Modal */}
        {selectedReference && (
          <HubReferencePanel
            reference={selectedReference}
            onClose={() => setSelectedReference(null)}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// HUB QUERY PANEL
// ============================================================================

interface HubQueryPanelProps {
  tenantId: string;
  facilityId: string;
  engine: HubEngine;
  onExecute: (query: HubQuery) => void;
  loading: boolean;
}

function HubQueryPanel({ tenantId, facilityId, engine, onExecute, loading }: HubQueryPanelProps) {
  const [queryType, setQueryType] = useState<HubQueryType>('entity-lookup');
  const [queryText, setQueryText] = useState('');
  const [entityId, setEntityId] = useState('');
  const [entityType, setEntityType] = useState('');

  const queryTypes: Array<{ value: HubQueryType; label: string; description: string }> = [
    { value: 'entity-lookup', label: '🔍 Entity Lookup', description: 'Find all info about a specific entity' },
    { value: 'cross-engine-summary', label: '📊 Cross-Engine Summary', description: 'Summarize across all engines' },
    { value: 'incident-overview', label: '🚨 Incident Overview', description: 'Full incident details with related data' },
    { value: 'lineage-trace', label: '🔗 Lineage Trace', description: 'Trace lineage across engines' },
    { value: 'impact-analysis', label: '💥 Impact Analysis', description: 'Analyze impact of changes/decisions' },
    { value: 'governance-explanation', label: '⚖️ Governance Explanation', description: 'Explain governance decisions' },
    { value: 'documentation-bundle', label: '📚 Documentation Bundle', description: 'Retrieve all docs for a topic' },
    { value: 'fabric-neighborhood', label: '🕸️ Fabric Neighborhood', description: 'Get fabric-connected entities' },
  ];

  const handleExecute = () => {
    let query: HubQuery;

    switch (queryType) {
      case 'entity-lookup':
        query = engine.buildEntityLookupQuery(entityId, entityType, 'admin-user');
        break;
      case 'cross-engine-summary':
        query = engine.buildCrossEngineSummaryQuery(queryText, facilityId, 'admin-user');
        break;
      case 'incident-overview':
        query = engine.buildIncidentOverviewQuery(entityId, 'admin-user');
        break;
      case 'lineage-trace':
        query = engine.buildLineageTraceQuery(entityId, entityType, 'admin-user');
        break;
      case 'impact-analysis':
        query = engine.buildImpactAnalysisQuery(entityId, entityType, 'admin-user');
        break;
      case 'governance-explanation':
        query = engine.buildGovernanceExplanationQuery(entityId, 'admin-user');
        break;
      case 'documentation-bundle':
        query = engine.buildDocumentationBundleQuery(queryText, 'admin-user');
        break;
      case 'fabric-neighborhood':
        query = engine.buildFabricNeighborhoodQuery(entityId, entityType, 'admin-user');
        break;
      default:
        return;
    }

    onExecute(query);
  };

  const needsEntityId = ['entity-lookup', 'incident-overview', 'lineage-trace', 'impact-analysis', 'governance-explanation', 'fabric-neighborhood'].includes(queryType);
  const needsQueryText = ['cross-engine-summary', 'documentation-bundle'].includes(queryType);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Query Type</label>
        <div className="grid grid-cols-2 gap-3">
          {queryTypes.map((qt) => (
            <button
              key={qt.value}
              onClick={() => setQueryType(qt.value)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                queryType === qt.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-medium text-slate-900">{qt.label}</div>
              <div className="text-sm text-slate-600 mt-1">{qt.description}</div>
            </button>
          ))}
        </div>
      </div>

      {needsQueryText && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Query Text</label>
          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Enter your query..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {needsEntityId && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Entity ID</label>
            <input
              type="text"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              placeholder="e.g., incident-001"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Entity Type</label>
            <input
              type="text"
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              placeholder="e.g., incident"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      <button
        onClick={handleExecute}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
      >
        {loading ? '⏳ Executing Query...' : '🚀 Execute Query'}
      </button>
    </div>
  );
}

// ============================================================================
// HUB RESULT VIEWER
// ============================================================================

interface HubResultViewerProps {
  result: HubResult;
  onSelectSection: (section: HubSection) => void;
  onSelectReference: (reference: HubReference) => void;
}

function HubResultViewer({ result, onSelectSection, onSelectReference }: HubResultViewerProps) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Query Summary</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold text-blue-600">{result.summary.totalEnginesQueried}</div>
            <div className="text-sm text-slate-600">Engines Queried</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{result.summary.enginesWithResults.length}</div>
            <div className="text-sm text-slate-600">Engines w/ Results</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{result.summary.totalReferences}</div>
            <div className="text-sm text-slate-600">Total References</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{result.summary.queryExecutionTime}ms</div>
            <div className="text-sm text-slate-600">Execution Time</div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Results by Engine</h3>
        <div className="space-y-4">
          {result.sections.map((section) => (
            <div
              key={section.sectionId}
              className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectSection(section)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-900">{getEngineIcon(section.sourceEngine)} {section.title}</h4>
                <span className="text-sm text-slate-600">{section.references.length} results</span>
              </div>
              <p className="text-slate-600 mb-3">{section.summary}</p>
              <div className="flex gap-2">
                {section.references.slice(0, 3).map((ref) => (
                  <button
                    key={ref.referenceId}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectReference(ref);
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                  >
                    {ref.title}
                  </button>
                ))}
                {section.references.length > 3 && (
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-sm">
                    +{section.references.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lineage Chains */}
      {result.lineageChains && result.lineageChains.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">🔗 Lineage Chains</h3>
          <div className="space-y-3">
            {result.lineageChains.map((chain) => (
              <div key={chain.chainId} className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="font-medium text-slate-900">{chain.startEntity.title}</div>
                  <div className="text-slate-400">→</div>
                  <div className="font-medium text-slate-900">{chain.endEntity.title}</div>
                  <span className="ml-auto text-sm text-slate-600">Depth: {chain.totalDepth}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Impact Map */}
      {result.impactMap && (
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">💥 Impact Analysis</h3>
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="mb-4">
              <h4 className="font-bold text-slate-900 mb-2">{result.impactMap.targetEntity.title}</h4>
              <div className="text-3xl font-bold text-orange-600">Impact Score: {result.impactMap.totalImpactScore}/100</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="font-medium text-slate-700 mb-2">⬆️ Upstream ({result.impactMap.upstreamImpacts.length})</div>
                {result.impactMap.upstreamImpacts.slice(0, 3).map((impact) => (
                  <div key={impact.entityId} className="text-sm text-slate-600 mb-1">{impact.title}</div>
                ))}
              </div>
              <div>
                <div className="font-medium text-slate-700 mb-2">⬇️ Downstream ({result.impactMap.downstreamImpacts.length})</div>
                {result.impactMap.downstreamImpacts.slice(0, 3).map((impact) => (
                  <div key={impact.entityId} className="text-sm text-slate-600 mb-1">{impact.title}</div>
                ))}
              </div>
              <div>
                <div className="font-medium text-slate-700 mb-2">↔️ Peers ({result.impactMap.peerImpacts.length})</div>
                {result.impactMap.peerImpacts.slice(0, 3).map((impact) => (
                  <div key={impact.entityId} className="text-sm text-slate-600 mb-1">{impact.title}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HUB SECTION PANEL
// ============================================================================

interface HubSectionPanelProps {
  section: HubSection;
  onClose: () => void;
}

function HubSectionPanel({ section, onClose }: HubSectionPanelProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-8 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">{getEngineIcon(section.sourceEngine)} {section.title}</h3>
            <button onClick={onClose} className="text-white hover:text-slate-200 text-2xl">×</button>
          </div>
          <p className="mt-2 opacity-90">{section.summary}</p>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          <div className="space-y-4">
            {section.references.map((ref) => (
              <div key={ref.referenceId} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-slate-900">{ref.title}</h4>
                  <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded">{ref.referenceType}</span>
                </div>
                {ref.description && <p className="text-slate-600 mb-2">{ref.description}</p>}
                <div className="text-sm text-slate-500">
                  Entity: {ref.entityType} • ID: {ref.entityId}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HUB REFERENCE PANEL
// ============================================================================

interface HubReferencePanelProps {
  reference: HubReference;
  onClose: () => void;
}

function HubReferencePanel({ reference, onClose }: HubReferencePanelProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-8 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">{reference.title}</h3>
            <button onClick={onClose} className="text-white hover:text-slate-200 text-2xl">×</button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-slate-600 mb-1">Reference Type</div>
              <div className="font-medium text-slate-900">{reference.referenceType}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Entity Type</div>
              <div className="font-medium text-slate-900">{reference.entityType}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Entity ID</div>
              <div className="font-mono text-sm text-slate-900">{reference.entityId}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Source Engine</div>
              <div className="font-medium text-slate-900">{getEngineIcon(reference.sourceEngine)} {reference.sourceEngine}</div>
            </div>
            {reference.description && (
              <div>
                <div className="text-sm text-slate-600 mb-1">Description</div>
                <div className="text-slate-900">{reference.description}</div>
              </div>
            )}
            {reference.relationshipType && (
              <div>
                <div className="text-sm text-slate-600 mb-1">Relationship</div>
                <div className="font-medium text-slate-900">{reference.relationshipType}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-slate-600 mb-1">Metadata</div>
              <pre className="bg-slate-50 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(reference.metadata, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HUB HISTORY VIEWER
// ============================================================================

interface HubHistoryViewerProps {
  engine: HubEngine;
}

function HubHistoryViewer({ engine }: HubHistoryViewerProps) {
  const log = engine.getLog();
  const entries = log.getRecentEntries(20);

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-bold text-slate-900">Recent Operations</h3>
      {entries.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No operations yet</div>
      ) : (
        <div className="space-y-2">
          {entries.reverse().map((entry) => (
            <div key={entry.entryId} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getEntryTypeColor(entry.entryType)}`}>
                    {entry.entryType}
                  </span>
                  <span className="ml-3 text-slate-600">{entry.timestamp}</span>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${entry.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {entry.success ? '✓ Success' : '✗ Failed'}
                </span>
              </div>
              {entry.query && (
                <div className="mt-2 text-sm text-slate-700">
                  <strong>{entry.query.queryType}:</strong> {entry.query.queryText}
                </div>
              )}
              {entry.routing && (
                <div className="mt-2 text-sm text-slate-600">
                  Routed to: {entry.routing.routedEngines.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HUB STATISTICS VIEWER
// ============================================================================

interface HubStatisticsViewerProps {
  statistics: HubStatistics;
}

function HubStatisticsViewer({ statistics }: HubStatisticsViewerProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Query Statistics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-600">{statistics.totalQueries}</div>
            <div className="text-sm text-slate-600">Total Queries</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-600">{statistics.averageQueryTime}ms</div>
            <div className="text-sm text-slate-600">Avg Query Time</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-red-600">{statistics.totalErrors}</div>
            <div className="text-sm text-slate-600">Total Errors</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Queries by Type</h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(statistics.queriesByType).map(([type, count]) => (
            <div key={type} className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="font-bold text-slate-900">{count}</div>
              <div className="text-sm text-slate-600">{type}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Queries by Engine</h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(statistics.queriesByEngine).map(([engine, count]) => (
            <div key={engine} className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="font-bold text-slate-900">{count}</div>
              <div className="text-sm text-slate-600">{getEngineIcon(engine as HubSourceEngine)} {engine}</div>
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

function getEngineIcon(engine: HubSourceEngine): string {
  const icons: Record<HubSourceEngine, string> = {
    'search': '🔍',
    'knowledge-graph': '🕸️',
    'narrative': '📖',
    'timeline': '⏰',
    'analytics': '📊',
    'training': '🎓',
    'marketplace': '🛒',
    'insights': '💡',
    'health': '❤️',
    'governance': '⚖️',
    'governance-history': '📜',
    'fabric': '🧵',
    'documentation': '📚',
  };
  return icons[engine] || '📦';
}

function getEntryTypeColor(entryType: string): string {
  const colors: Record<string, string> = {
    'query': 'bg-blue-100 text-blue-700',
    'routing': 'bg-purple-100 text-purple-700',
    'assembly': 'bg-green-100 text-green-700',
    'policy-decision': 'bg-orange-100 text-orange-700',
    'error': 'bg-red-100 text-red-700',
  };
  return colors[entryType] || 'bg-slate-100 text-slate-700';
}
