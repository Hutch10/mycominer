/**
 * Phase 46: Multi-Tenant Data Fabric - Dashboard Page
 * 
 * Unified knowledge mesh explorer for operators and admins.
 * Visualizes cross-engine relationships and enables fabric queries.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  FabricEngine,
  FabricQuery,
  FabricResult,
  FabricNode,
  FabricEdge,
  FabricStatistics,
  initializeFabricWithSampleData
} from '../fabric';

// ============================================================================
// MAIN DASHBOARD
// ============================================================================

export default function FabricDashboardPage() {
  const [tenantId] = useState('demo-tenant');
  const [facilityId] = useState('facility-alpha');
  const [engine] = useState(() => {
    const eng = new FabricEngine(tenantId, facilityId);
    initializeFabricWithSampleData(eng);
    return eng;
  });

  const [statistics, setStatistics] = useState<FabricStatistics>(engine.getStatistics());
  const [activeTab, setActiveTab] = useState<'overview' | 'query' | 'graph' | 'history'>('overview');
  const [queryResult, setQueryResult] = useState<FabricResult | null>(null);
  const [selectedNode, setSelectedNode] = useState<FabricNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<FabricEdge | null>(null);

  useEffect(() => {
    setStatistics(engine.getStatistics());
  }, [engine]);

  const handleQuery = (query: FabricQuery) => {
    const result = engine.executeQuery(query, 'admin-user');
    setQueryResult(result);
    setStatistics(engine.getStatistics());
  };

  const handleExploreEntity = (entityType: string) => {
    const query: FabricQuery = {
      queryType: 'nodes-by-type',
      scope: {
        scope: 'facility',
        tenantId,
        facilityId
      },
      filters: {
        entityType: entityType as any
      }
    };
    handleQuery(query);
    setActiveTab('query');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          🕸️ Data Fabric & Knowledge Mesh
        </h1>
        <p className="text-purple-200">
          Unified knowledge across KG, Search, Timeline, Analytics, Training, Insights, Governance, Health, Marketplace
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="text-3xl mb-2">🔵</div>
          <div className="text-2xl font-bold text-white mb-1">{statistics.totalNodes}</div>
          <div className="text-purple-200 text-sm">Total Nodes</div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="text-3xl mb-2">🔗</div>
          <div className="text-2xl font-bold text-white mb-1">{statistics.totalEdges}</div>
          <div className="text-purple-200 text-sm">Total Links</div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="text-3xl mb-2">🔍</div>
          <div className="text-2xl font-bold text-white mb-1">{statistics.queriesLast24h}</div>
          <div className="text-purple-200 text-sm">Queries (24h)</div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="text-3xl mb-2">🌐</div>
          <div className="text-2xl font-bold text-white mb-1">
            {Object.keys(statistics.nodesByEngine).length}
          </div>
          <div className="text-purple-200 text-sm">Connected Engines</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 mb-6">
        <div className="flex gap-2 p-2">
          {['overview', 'query', 'graph', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 rounded-lg font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-purple-500 text-white'
                  : 'text-purple-200 hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        {activeTab === 'overview' && (
          <FabricOverview
            statistics={statistics}
            onExploreEntity={handleExploreEntity}
          />
        )}

        {activeTab === 'query' && (
          <FabricQueryPanel
            onQuery={handleQuery}
            queryResult={queryResult}
            onSelectNode={setSelectedNode}
            onSelectEdge={setSelectedEdge}
          />
        )}

        {activeTab === 'graph' && (
          <FabricGraphViewer
            nodes={engine.getAllNodes()}
            edges={engine.getAllEdges()}
            onSelectNode={setSelectedNode}
            onSelectEdge={setSelectedEdge}
          />
        )}

        {activeTab === 'history' && (
          <FabricHistoryViewer log={engine.getLog()} />
        )}
      </div>

      {/* Node Detail Modal */}
      {selectedNode && (
        <FabricNodeDetailPanel
          node={selectedNode}
          edges={engine.getEdgesForNode(selectedNode.id)}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {/* Edge Detail Modal */}
      {selectedEdge && (
        <FabricEdgeDetailPanel
          edge={selectedEdge}
          fromNode={engine.getNode(selectedEdge.fromNodeId)}
          toNode={engine.getNode(selectedEdge.toNodeId)}
          onClose={() => setSelectedEdge(null)}
        />
      )}
    </div>
  );
}

// ============================================================================
// FABRIC OVERVIEW COMPONENT
// ============================================================================

function FabricOverview({
  statistics,
  onExploreEntity
}: {
  statistics: FabricStatistics;
  onExploreEntity: (entityType: string) => void;
}) {
  const entityTypes = Object.entries(statistics.nodesByType).sort((a, b) => b[1] - a[1]);
  const engines = Object.entries(statistics.nodesByEngine).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Knowledge Fabric Overview</h2>
        <p className="text-purple-200 mb-6">
          The fabric unifies {statistics.totalNodes} entities from {Object.keys(statistics.nodesByEngine).length} engines
          with {statistics.totalEdges} semantic links.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entities by Type */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-3">Entities by Type</h3>
          <div className="space-y-2">
            {entityTypes.slice(0, 8).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => onExploreEntity(type)}
              >
                <span className="text-purple-200">{type}</span>
                <span className="text-white font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Entities by Engine */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-3">Entities by Source Engine</h3>
          <div className="space-y-2">
            {engines.map(([engine, count]) => (
              <div
                key={engine}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <span className="text-purple-200">{engine}</span>
                <span className="text-white font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => onExploreEntity('training-module')}
            className="px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-200 transition-colors"
          >
            📚 Training Modules
          </button>
          <button
            onClick={() => onExploreEntity('knowledge-pack')}
            className="px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-200 transition-colors"
          >
            📦 Knowledge Packs
          </button>
          <button
            onClick={() => onExploreEntity('health-finding')}
            className="px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-200 transition-colors"
          >
            🏥 Health Findings
          </button>
          <button
            onClick={() => onExploreEntity('analytics-pattern')}
            className="px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-200 transition-colors"
          >
            📊 Analytics Patterns
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FABRIC QUERY PANEL COMPONENT
// ============================================================================

function FabricQueryPanel({
  onQuery,
  queryResult,
  onSelectNode,
  onSelectEdge
}: {
  onQuery: (query: FabricQuery) => void;
  queryResult: FabricResult | null;
  onSelectNode: (node: FabricNode) => void;
  onSelectEdge: (edge: FabricEdge) => void;
}) {
  const [queryType, setQueryType] = useState<'knowledge-for-entity' | 'cross-engine-search' | 'lineage-trace'>('knowledge-for-entity');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Fabric Query</h2>
        <p className="text-purple-200 mb-4">
          Explore knowledge across all engines with powerful semantic queries
        </p>
      </div>

      {/* Query Type Selector */}
      <div className="flex gap-3">
        <button
          onClick={() => setQueryType('knowledge-for-entity')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            queryType === 'knowledge-for-entity'
              ? 'bg-purple-500 text-white'
              : 'bg-white/10 text-purple-200'
          }`}
        >
          Knowledge for Entity
        </button>
        <button
          onClick={() => setQueryType('cross-engine-search')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            queryType === 'cross-engine-search'
              ? 'bg-purple-500 text-white'
              : 'bg-white/10 text-purple-200'
          }`}
        >
          Cross-Engine Search
        </button>
        <button
          onClick={() => setQueryType('lineage-trace')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            queryType === 'lineage-trace'
              ? 'bg-purple-500 text-white'
              : 'bg-white/10 text-purple-200'
          }`}
        >
          Lineage Trace
        </button>
      </div>

      {/* Query Results */}
      {queryResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">
              Results: {queryResult.totalNodes} nodes, {queryResult.totalEdges} edges
            </h3>
            <span className="text-purple-200 text-sm">
              {queryResult.executionTimeMs}ms
            </span>
          </div>

          {/* Nodes */}
          {queryResult.nodes.length > 0 && (
            <div>
              <h4 className="text-md font-bold text-white mb-2">Nodes</h4>
              <div className="space-y-2">
                {queryResult.nodes.map((node) => (
                  <div
                    key={node.id}
                    className="p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => onSelectNode(node)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">{node.name}</span>
                      <span className="text-purple-300 text-sm">{node.entityType}</span>
                    </div>
                    <div className="text-purple-200 text-sm">
                      {node.sourceEngine} • Phase {node.sourcePhase}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Edges */}
          {queryResult.edges.length > 0 && (
            <div>
              <h4 className="text-md font-bold text-white mb-2">Links</h4>
              <div className="space-y-2">
                {queryResult.edges.slice(0, 10).map((edge) => (
                  <div
                    key={edge.id}
                    className="p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => onSelectEdge(edge)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-purple-300 text-sm">{edge.fromEntityType}</span>
                      <span className="text-purple-200">→</span>
                      <span className="text-purple-200 text-sm">{edge.edgeType}</span>
                      <span className="text-purple-200">→</span>
                      <span className="text-purple-300 text-sm">{edge.toEntityType}</span>
                    </div>
                    <div className="text-purple-200 text-sm mt-1">
                      Strength: {(edge.relationshipStrength * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!queryResult && (
        <div className="text-center py-12 text-purple-200">
          <div className="text-4xl mb-4">🔍</div>
          <div>Select a query type and execute to see results</div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FABRIC GRAPH VIEWER COMPONENT
// ============================================================================

function FabricGraphViewer({
  nodes,
  edges,
  onSelectNode,
  onSelectEdge
}: {
  nodes: FabricNode[];
  edges: FabricEdge[];
  onSelectNode: (node: FabricNode) => void;
  onSelectEdge: (edge: FabricEdge) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Knowledge Graph</h2>
        <p className="text-purple-200">
          Visualize {nodes.length} entities and {edges.length} relationships
        </p>
      </div>

      <div className="bg-white/5 rounded-lg p-8 border border-white/10 min-h-[400px] flex items-center justify-center">
        <div className="text-center text-purple-200">
          <div className="text-6xl mb-4">🕸️</div>
          <div className="text-lg mb-2">Interactive Graph Visualization</div>
          <div className="text-sm">
            Full D3.js graph visualization would be implemented here
          </div>
          <div className="mt-4 text-sm">
            {nodes.length} nodes • {edges.length} edges
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FABRIC HISTORY VIEWER COMPONENT
// ============================================================================

function FabricHistoryViewer({ log }: { log: any }) {
  const entries = log.getAllEntries().slice(0, 20);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Fabric History</h2>
        <p className="text-purple-200">Recent fabric operations</p>
      </div>

      <div className="space-y-2">
        {entries.map((entry: any) => (
          <div
            key={entry.id}
            className="p-3 bg-white/5 rounded-lg border border-white/10"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-medium">{entry.entryType}</span>
              <span className="text-purple-300 text-sm">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="text-purple-200 text-sm">
              By: {entry.performedBy}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// NODE DETAIL PANEL
// ============================================================================

function FabricNodeDetailPanel({
  node,
  edges,
  onClose
}: {
  node: FabricNode;
  edges: FabricEdge[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-slate-900 rounded-xl border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Node Details</h3>
            <button onClick={onClose} className="text-purple-200 hover:text-white">✕</button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-purple-200 text-sm mb-1">Name</div>
              <div className="text-white font-medium">{node.name}</div>
            </div>

            <div>
              <div className="text-purple-200 text-sm mb-1">Entity Type</div>
              <div className="text-white font-medium">{node.entityType}</div>
            </div>

            <div>
              <div className="text-purple-200 text-sm mb-1">Source Engine</div>
              <div className="text-white font-medium">
                {node.sourceEngine} • Phase {node.sourcePhase}
              </div>
            </div>

            <div>
              <div className="text-purple-200 text-sm mb-1">Scope</div>
              <div className="text-white font-mono text-sm">
                {node.scope.scope} • Tenant: {node.scope.tenantId}
                {node.scope.facilityId && ` • Facility: ${node.scope.facilityId}`}
              </div>
            </div>

            <div>
              <div className="text-purple-200 text-sm mb-1">Visibility</div>
              <div className="text-white font-medium">{node.visibility}</div>
            </div>

            <div>
              <div className="text-purple-200 text-sm mb-1">Connected Links</div>
              <div className="text-white font-medium">{edges.length}</div>
            </div>

            {node.description && (
              <div>
                <div className="text-purple-200 text-sm mb-1">Description</div>
                <div className="text-white">{node.description}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EDGE DETAIL PANEL
// ============================================================================

function FabricEdgeDetailPanel({
  edge,
  fromNode,
  toNode,
  onClose
}: {
  edge: FabricEdge;
  fromNode?: FabricNode;
  toNode?: FabricNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-slate-900 rounded-xl border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Link Details</h3>
            <button onClick={onClose} className="text-purple-200 hover:text-white">✕</button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-purple-200 text-sm mb-1">Link Type</div>
              <div className="text-white font-medium">{edge.edgeType}</div>
            </div>

            <div>
              <div className="text-purple-200 text-sm mb-1">From</div>
              <div className="text-white font-medium">
                {fromNode?.name || edge.fromNodeId} ({edge.fromEntityType})
              </div>
            </div>

            <div>
              <div className="text-purple-200 text-sm mb-1">To</div>
              <div className="text-white font-medium">
                {toNode?.name || edge.toNodeId} ({edge.toEntityType})
              </div>
            </div>

            <div>
              <div className="text-purple-200 text-sm mb-1">Relationship Strength</div>
              <div className="text-white font-medium">
                {(edge.relationshipStrength * 100).toFixed(0)}%
              </div>
            </div>

            <div>
              <div className="text-purple-200 text-sm mb-1">Rationale</div>
              <div className="text-white">{edge.relationshipRationale}</div>
            </div>

            <div>
              <div className="text-purple-200 text-sm mb-1">Created By</div>
              <div className="text-white font-medium">{edge.createdBy}</div>
            </div>

            <div>
              <div className="text-purple-200 text-sm mb-1">Created</div>
              <div className="text-white font-medium">
                {new Date(edge.created).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
