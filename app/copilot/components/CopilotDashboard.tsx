"use client";

import React from 'react';
import { CopilotQuery, CopilotSuggestion, CopilotStepReference } from '../copilotTypes';
import { runCopilot } from '../copilotEngine';
import { getCopilotLog } from '../copilotSessionLog';
import { CopilotQueryPanel } from './CopilotQueryPanel';
import { CopilotSuggestionList } from './CopilotSuggestionList';
import { CopilotPlaybookViewer } from './CopilotPlaybookViewer';
import { CopilotStepDetailPanel } from './CopilotStepDetailPanel';
import { CopilotSessionHistoryViewer } from './CopilotSessionHistoryViewer';

interface Props {
  initialQuery: CopilotQuery;
}

export function CopilotDashboard({ initialQuery }: Props) {
  const [text, setText] = React.useState(initialQuery.text);
  const [query, setQuery] = React.useState<CopilotQuery>(initialQuery);
  const [result, setResult] = React.useState(() => runCopilot(initialQuery));
  const [selectedSuggestion, setSelectedSuggestion] = React.useState<CopilotSuggestion | undefined>(result.suggestions[0]);
  const [selectedRef, setSelectedRef] = React.useState<CopilotStepReference | undefined>(undefined);
  const [history, setHistory] = React.useState(() => getCopilotLog(100));

  const contextChips = [
    { label: 'Tenant', value: query.context.tenantId, onClick: () => setQuery({ ...query }) },
    { label: 'Facility', value: query.context.facilityId ?? 'n/a', onClick: () => setQuery({ ...query }) },
    { label: 'Room', value: query.context.roomId ?? 'n/a', onClick: () => setQuery({ ...query }) },
  ];

  const run = () => {
    const nextQuery = { ...query, text };
    const next = runCopilot(nextQuery);
    setResult(next);
    setSelectedSuggestion(next.suggestions[0]);
    setSelectedRef(undefined);
    setHistory(getCopilotLog(100));
  };

  return (
    <div className="cp-shell">
      <header className="cp-header">
        <div>
          <p className="cp-kicker">Phase 36 · Operator Copilot</p>
          <h1>Guided Playbooks & Checklists</h1>
          <p className="cp-sub">Deterministic, read-only guidance mapped to SOPs/workflows. Tenant isolation and federation guardrails enforced.</p>
        </div>
        <div className="cp-links">
          <a href="/knowledgeGraph">Knowledge Graph</a>
          <a href="/globalSearch">Global Search</a>
          <a href="/sop">SOPs</a>
          <a href="/compliance">Compliance</a>
        </div>
      </header>

      <div className="cp-layout">
        <div className="cp-col">
          <CopilotQueryPanel value={text} onChange={setText} onSubmit={run} contextChips={contextChips} />
          <CopilotSuggestionList suggestions={result.suggestions} onSelect={setSelectedSuggestion} />
          <CopilotSessionHistoryViewer log={history} />
        </div>
        <div className="cp-col">
          <CopilotPlaybookViewer suggestion={selectedSuggestion} />
          <CopilotStepDetailPanel suggestion={selectedSuggestion} selectedRef={selectedRef} onSelectRef={setSelectedRef} />
          <div className="cp-card cp-card-ghost">
            <h3>Guardrails</h3>
            <ul className="cp-list-text">
              <li>Guidance only; no actions executed by Copilot.</li>
              <li>All steps reference existing SOPs, workflows, or registered playbooks; no new actions.</li>
              <li>Tenant and federation boundaries enforced; federated items are read-only.</li>
              <li>No biological claims or predictions.</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .cp-shell { display: flex; flex-direction: column; gap: 20px; padding: 24px; background: linear-gradient(128deg, #f8fafc, #e2e8f0); }
        .cp-header { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
        .cp-header h1 { margin: 4px 0 6px; color: #0f172a; font-size: 28px; }
        .cp-sub { margin: 0; color: #334155; font-size: 13px; }
        .cp-kicker { margin: 0; letter-spacing: 0.1em; text-transform: uppercase; font-size: 11px; color: #475569; }
        .cp-links { display: flex; gap: 10px; flex-wrap: wrap; }
        .cp-links a { color: #0ea5e9; font-weight: 600; }
        .cp-layout { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 16px; align-items: start; }
        .cp-col { display: flex; flex-direction: column; gap: 14px; }
        .cp-card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; box-shadow: 0 8px 20px rgba(0,0,0,0.04); }
        .cp-card-soft { background: #f8fafc; }
        .cp-card-ghost { background: #edf2f7; }
        .cp-card-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
        .cp-label { margin: 0; color: #475569; font-size: 12px; }
        .cp-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
        .cp-list-text { margin: 0; padding-left: 18px; color: #334155; display: grid; gap: 6px; }
        .cp-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; align-items: center; }
        .cp-row-dense { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); }
        .cp-block { border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; background: #fff; display: grid; gap: 8px; }
        .cp-pill { display: inline-flex; padding: 2px 8px; border-radius: 999px; font-size: 12px; color: #0f172a; background: #e2e8f0; }
        .cp-pill-soft { display: inline-flex; padding: 2px 8px; border-radius: 999px; font-size: 12px; color: #0f172a; background: #d1fae5; }
        .cp-link { width: 100%; text-align: left; border: none; background: none; cursor: pointer; padding: 0; }
        .cp-link:hover, .cp-links a:hover { text-decoration: underline; }
        .cp-input { width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #cbd5e1; }
        .cp-button { padding: 10px 14px; border-radius: 8px; border: 1px solid #0ea5e9; background: #0ea5e9; color: #fff; font-weight: 600; cursor: pointer; }
        .cp-button.ghost { background: #fff; color: #0ea5e9; }
        .cp-chip { border: 1px solid #cbd5e1; border-radius: 999px; padding: 6px 10px; background: #f8fafc; cursor: pointer; }
        .cp-chips { display: flex; gap: 8px; flex-wrap: wrap; margin: 10px 0; }
        .cp-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
        .cp-meta { margin-top: 12px; }
        .cp-pre { background: #0b1623; color: #e2e8f0; border-radius: 8px; padding: 10px; font-size: 12px; overflow: auto; }
        @media (max-width: 900px) { .cp-layout { grid-template-columns: 1fr; } .cp-header { flex-direction: column; } }
      `}</style>
    </div>
  );
}
