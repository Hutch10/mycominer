"use client";

import React from 'react';
import { SearchBar } from './SearchBar';
import { AdvancedFilterPanel } from './AdvancedFilterPanel';
import { SearchResultList } from './SearchResultList';
import { SearchResultDetailPanel } from './SearchResultDetailPanel';
import { SearchResultGroupPanel } from './SearchResultGroupPanel';
import { SearchHistoryViewer } from './SearchHistoryViewer';
import { SearchQuery, SearchResultItem } from '../globalSearchTypes';
import { runGlobalSearch } from '../globalSearchEngine';
import { GraphBuilderInput } from '../../knowledgeGraph/graphBuilder';
import { getSearchLog } from '../searchLog';

interface Props {
  builderInput: GraphBuilderInput;
  searchQuery: SearchQuery;
  sourceData: Record<string, SearchResultItem[]>;
}

const availableTypes = ['workflow', 'sop', 'facility', 'room', 'equipment', 'complianceEvent', 'deviation', 'capa', 'telemetryStream', 'forecast', 'sandboxScenario', 'plugin', 'digitalTwinSnapshot', 'resource'];

export function GlobalSearchDashboard({ builderInput, searchQuery, sourceData }: Props) {
  const [text, setText] = React.useState(searchQuery.text ?? '');
  const [query, setQuery] = React.useState<SearchQuery>(searchQuery);
  const [result, setResult] = React.useState(() => runGlobalSearch({ builderInput, searchQuery, sourceData }).lastResult);
  const [history, setHistory] = React.useState(() => getSearchLog(100));
  const [selected, setSelected] = React.useState<SearchResultItem | undefined>(result.flat[0]);

  const availableFacilities = React.useMemo(() => Array.from(new Set(builderInput.sources.records.map((r) => r.facilityId).filter(Boolean))) as string[], [builderInput.sources.records]);
  const availableTenants = React.useMemo(() => Array.from(new Set(builderInput.sources.records.map((r) => r.tenantId))), [builderInput.sources.records]);

  const runSearch = () => {
    const base = { ...query, text };
    const next = runGlobalSearch({ builderInput, searchQuery: base, sourceData }).lastResult;
    setResult(next);
    setSelected(next.flat[0]);
    setHistory(getSearchLog(100));
  };

  return (
    <div className="gs-shell">
      <header className="gs-header">
        <div>
          <p className="gs-kicker">Phase 35 · Global Search</p>
          <h1>Natural-Language Semantic Search</h1>
          <p className="gs-sub">Deterministic, read-only search across workflows, SOPs, facilities, telemetry, and more. Tenant isolation enforced.</p>
        </div>
        <div className="gs-links">
          <a href="/knowledgeGraph">Knowledge Graph</a>
          <a href="/commandCenter">Command Center</a>
          <a href="/sop">SOPs</a>
          <a href="/compliance">Compliance</a>
        </div>
      </header>

      <div className="gs-layout">
        <div className="gs-col">
          <SearchBar value={text} onChange={setText} onSubmit={runSearch} />
          <AdvancedFilterPanel
            scope={query.scope}
            tenantId={query.tenantId}
            federatedTenantIds={query.federatedTenantIds}
            filters={query.filters ?? {}}
            availableTypes={availableTypes}
            availableFacilities={availableFacilities}
            availableTenants={availableTenants}
            onScopeChange={(scope) => setQuery({ ...query, scope })}
            onTenantChange={(tenantId) => setQuery({ ...query, tenantId })}
            onFederatedChange={(federatedTenantIds) => setQuery({ ...query, federatedTenantIds })}
            onFiltersChange={(filters) => setQuery({ ...query, filters })}
          />
          <SearchResultList groups={result.groups} onSelect={setSelected} />
          <SearchHistoryViewer log={history} />
        </div>
        <div className="gs-col">
          <SearchResultDetailPanel item={selected} />
          <SearchResultGroupPanel items={result.flat} />
          <div className="gs-card gs-card-ghost">
            <h3>Guardrails</h3>
            <ul className="gs-list-text">
              <li>Search is read-only; no writes or executions are triggered.</li>
              <li>Results are traceable to knowledge graph or engine entities; no synthetic items.</li>
              <li>Tenant and federation boundaries enforced consistently with Phase 33.</li>
              <li>No biological inference or predictions; purely structural relationships.</li>
            </ul>
            <button type="button" className="gs-button ghost">Explain These Results (Phase 25 hook)</button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .gs-shell { display: flex; flex-direction: column; gap: 20px; padding: 24px; background: linear-gradient(128deg, #f8fafc, #e2e8f0); }
        .gs-header { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
        .gs-header h1 { margin: 4px 0 6px; color: #0f172a; font-size: 28px; }
        .gs-sub { margin: 0; color: #334155; font-size: 13px; }
        .gs-kicker { margin: 0; letter-spacing: 0.1em; text-transform: uppercase; font-size: 11px; color: #475569; }
        .gs-links { display: flex; gap: 10px; flex-wrap: wrap; }
        .gs-links a { color: #0ea5e9; font-weight: 600; }
        .gs-layout { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 16px; align-items: start; }
        .gs-col { display: flex; flex-direction: column; gap: 14px; }
        .gs-card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; box-shadow: 0 8px 20px rgba(0,0,0,0.04); }
        .gs-card-soft { background: #f8fafc; }
        .gs-card-ghost { background: #edf2f7; }
        .gs-card-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
        .gs-label { margin: 0; color: #475569; font-size: 12px; }
        .gs-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
        .gs-list-text { margin: 0; padding-left: 18px; color: #334155; display: grid; gap: 6px; }
        .gs-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; align-items: center; }
        .gs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
        .gs-pill { display: inline-flex; padding: 2px 8px; border-radius: 999px; font-size: 12px; color: #0f172a; background: #e2e8f0; }
        .gs-pill-soft { display: inline-flex; padding: 2px 8px; border-radius: 999px; font-size: 12px; color: #0f172a; background: #d1fae5; }
        .gs-link { width: 100%; text-align: left; border: none; background: none; cursor: pointer; padding: 0; }
        .gs-link:hover, .gs-links a:hover { text-decoration: underline; }
        .gs-input { width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #cbd5e1; }
        .gs-button { padding: 10px 14px; border-radius: 8px; border: 1px solid #0ea5e9; background: #0ea5e9; color: #fff; font-weight: 600; cursor: pointer; }
        .gs-button.ghost { background: #fff; color: #0ea5e9; }
        .gs-chip { border: 1px solid #cbd5e1; border-radius: 999px; padding: 6px 10px; background: #f8fafc; cursor: pointer; }
        .gs-chip.active { background: #0ea5e9; color: #fff; border-color: #0ea5e9; }
        .gs-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
        .gs-meta { margin-top: 12px; }
        .gs-pre { background: #0b1623; color: #e2e8f0; border-radius: 8px; padding: 10px; font-size: 12px; overflow: auto; }
        .gs-group { border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; background: #fff; }
        .gs-link-out { display: inline-block; margin-top: 10px; color: #0ea5e9; font-weight: 600; }
        @media (max-width: 900px) { .gs-layout { grid-template-columns: 1fr; } .gs-header { flex-direction: column; } }
      `}</style>
    </div>
  );
}
