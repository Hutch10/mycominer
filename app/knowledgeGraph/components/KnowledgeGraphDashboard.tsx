"use client";

import React from 'react';
import { GraphBuilderInput } from '../graphBuilder';
import { initializeKnowledgeGraph, runKnowledgeGraphQuery } from '../knowledgeGraphEngine';
import { getGraphLog } from '../knowledgeGraphLog';
import { boundedPath, neighbors } from '../graphIndexer';
import { KGNode, KGQuery, KGResult } from '../knowledgeGraphTypes';
import { KGQueryBuilderPanel } from './KGQueryBuilderPanel';
import { KGQueryResultPanel } from './KGQueryResultPanel';
import { KGNodeDetailPanel } from './KGNodeDetailPanel';
import { KGNeighborhoodViewer } from './KGNeighborhoodViewer';
import { KGPathViewer } from './KGPathViewer';
import { KnowledgeGraphHistoryViewer } from './KnowledgeGraphHistoryViewer';

interface Props {
  builderInput: GraphBuilderInput;
  initialQuery: KGQuery;
}

export function KnowledgeGraphDashboard({ builderInput, initialQuery }: Props) {
  const [state] = React.useState(() => initializeKnowledgeGraph(builderInput));
  const [query, setQuery] = React.useState<KGQuery>(initialQuery);
  const [result, setResult] = React.useState<KGResult>(() => runKnowledgeGraphQuery(state, initialQuery));
  const [selected, setSelected] = React.useState<KGNode | undefined>(result.nodes[0]);
  const [history, setHistory] = React.useState(() => getGraphLog(100));

  const availableFacilities = React.useMemo(() => Array.from(new Set(state.graph.nodes.map((n) => n.facilityId).filter(Boolean))) as string[], [state.graph.nodes]);
  const availableTenants = React.useMemo(() => Array.from(new Set(state.graph.nodes.map((n) => n.tenantId))), [state.graph.nodes]);

  const runQuery = () => {
    const next = runKnowledgeGraphQuery(state, query);
    setResult(next);
    setSelected(next.nodes[0]);
    setHistory(getGraphLog(100));
  };

  const allowedTenantIds = React.useMemo(() => new Set([query.tenantId, ...(query.federatedTenantIds ?? [])]), [query]);
  const scopedEdges = React.useMemo(() => state.graph.edges.filter((e) => allowedTenantIds.has(e.tenantId)), [state.graph.edges, allowedTenantIds]);

  const neighborhoodEdges = React.useMemo(() => {
    if (!selected) return [] as typeof state.graph.edges;
    const all = neighbors(selected.id, state.index);
    return all.filter((e) => allowedTenantIds.has(e.tenantId));
  }, [selected, state.index, allowedTenantIds]);

  const pathEdges = React.useMemo(() => {
    if (!selected) return [] as typeof state.graph.edges;
    const target = result.nodes.find((n) => n.id !== selected.id);
    if (!target) return [] as typeof state.graph.edges;
    const edges = boundedPath(selected.id, target.id, state.index, query.maxDepth ?? 3);
    return edges.filter((e) => allowedTenantIds.has(e.tenantId));
  }, [selected, result.nodes, state.index, query.maxDepth, allowedTenantIds]);

  return (
    <div className="kg-shell">
      <header className="kg-header">
        <div>
          <p className="kg-kicker">Phase 34 · Global Knowledge Graph</p>
          <h1>Semantic Federation Dashboard</h1>
          <p className="kg-sub">Deterministic, read-only semantic layer across workflows, facilities, SOPs, and telemetry. Tenant isolation enforced; federation honored.</p>
        </div>
        <div className="kg-links">
          <a href="/commandCenter">Command Center</a>
          <a href="/sop">SOPs</a>
          <a href="/compliance">Compliance</a>
          <a href="/multitenancy">Tenants</a>
        </div>
      </header>

      <div className="kg-layout">
        <div className="kg-col">
          <KGQueryBuilderPanel
            value={query}
            onChange={setQuery}
            onRun={runQuery}
            availableFacilities={availableFacilities}
            availableTenants={availableTenants.filter((t) => t !== query.tenantId)}
          />
          <KGQueryResultPanel result={result} onSelectNode={setSelected} />
          <KnowledgeGraphHistoryViewer log={history} />
        </div>
        <div className="kg-col">
          <KGNodeDetailPanel node={selected} />
          <KGNeighborhoodViewer anchor={selected} edges={neighborhoodEdges} nodes={state.graph.nodes} onSelectNode={setSelected} />
          <KGPathViewer pathEdges={pathEdges} nodes={state.graph.nodes} />
          <div className="kg-card kg-card-ghost">
            <h3>Guardrails</h3>
            <ul className="kg-list-text">
              <li>Graph is read-only; no writes back to workflows, resources, execution, telemetry, SOPs, compliance, sandbox, or forecasting.</li>
              <li>Tenant boundaries enforced; federated data only when allowed and always read-only.</li>
              <li>Deterministic relationships; no biological inference, no predictions.</li>
              <li>Queries are logged with category and scope for audit.</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .kg-shell { display: flex; flex-direction: column; gap: 20px; padding: 24px; background: linear-gradient(125deg, #f8fafc, #e2e8f0); }
        .kg-header { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
        .kg-header h1 { margin: 4px 0 6px; color: #0f172a; font-size: 28px; }
        .kg-sub { margin: 0; color: #334155; font-size: 13px; }
        .kg-kicker { margin: 0; letter-spacing: 0.1em; text-transform: uppercase; font-size: 11px; color: #475569; }
        .kg-links { display: flex; gap: 10px; flex-wrap: wrap; }
        .kg-links a { color: #0ea5e9; font-weight: 600; }
        .kg-layout { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 16px; align-items: start; }
        .kg-col { display: flex; flex-direction: column; gap: 14px; }
        .kg-card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; box-shadow: 0 8px 20px rgba(0,0,0,0.04); }
        .kg-card-soft { background: #f8fafc; }
        .kg-card-ghost { background: #edf2f7; }
        .kg-card-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
        .kg-label { margin: 0; color: #475569; font-size: 12px; }
        .kg-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
        .kg-list-block { margin-top: 12px; }
        .kg-list-text { margin: 0; padding-left: 18px; color: #334155; display: grid; gap: 6px; }
        .kg-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; align-items: center; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; text-align: left; }
        .kg-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
        .kg-pill { display: inline-flex; padding: 2px 8px; border-radius: 999px; font-size: 12px; color: #0f172a; background: #e2e8f0; }
        .kg-pill-soft { display: inline-flex; padding: 2px 8px; border-radius: 999px; font-size: 12px; color: #0f172a; background: #d1fae5; }
        .kg-links a:hover, .kg-link:hover { text-decoration: underline; }
        .kg-link { width: 100%; text-align: left; border: none; background: none; cursor: pointer; padding: 0; }
        .kg-subtle { color: #475569; }
        .kg-button { margin-top: 10px; padding: 10px 14px; border-radius: 8px; border: 1px solid #0ea5e9; background: #0ea5e9; color: #fff; font-weight: 600; cursor: pointer; }
        .kg-button.ghost { background: #fff; color: #0ea5e9; }
        .kg-form { display: grid; gap: 8px; }
        .kg-input { width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #cbd5e1; }
        .kg-chip { border: 1px solid #cbd5e1; border-radius: 999px; padding: 6px 10px; background: #f8fafc; cursor: pointer; }
        .kg-chip.active { background: #0ea5e9; color: #fff; border-color: #0ea5e9; }
        .kg-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
        .kg-meta { margin-top: 12px; }
        .kg-pre { background: #0b1623; color: #e2e8f0; border-radius: 8px; padding: 10px; font-size: 12px; overflow: auto; }
        @media (max-width: 900px) { .kg-layout { grid-template-columns: 1fr; } .kg-header { flex-direction: column; } }
      `}</style>
    </div>
  );
}
