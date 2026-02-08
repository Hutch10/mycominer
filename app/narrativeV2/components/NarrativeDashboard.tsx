"use client";

import React from 'react';
import { NarrativeExplanation, NarrativeReference, NarrativeRequest } from '../narrativeTypes';
import { runNarrativeEngineV2 } from '../narrativeEngineV2';
import { getNarrativeLog } from '../narrativeLog';
import { NarrativeRequestPanel } from './NarrativeRequestPanel';
import { NarrativeExplanationViewer } from './NarrativeExplanationViewer';
import { NarrativeReferencePanel } from './NarrativeReferencePanel';
import { NarrativeHistoryViewer } from './NarrativeHistoryViewer';

interface Props {
  initialRequest: NarrativeRequest;
  references: NarrativeReference[];
}

export function NarrativeDashboard({ initialRequest, references }: Props) {
  const [prompt, setPrompt] = React.useState(initialRequest.prompt);
  const [scope, setScope] = React.useState<'tenant' | 'federated'>(initialRequest.context.scope);
  const [req, setReq] = React.useState<NarrativeRequest>(initialRequest);
  const [explanation, setExplanation] = React.useState<NarrativeExplanation>(() => runNarrativeEngineV2({ request: initialRequest, references }));
  const [history, setHistory] = React.useState(() => getNarrativeLog(100));

  const contextChips = [
    { label: 'Tenant', value: req.context.tenantId, onClick: () => setReq({ ...req }) },
    { label: 'Target', value: req.context.target, onClick: () => setReq({ ...req }) },
    { label: 'Facility', value: req.context.facilityId ?? 'n/a', onClick: () => setReq({ ...req }) },
  ];

  const run = () => {
    const nextReq: NarrativeRequest = {
      ...req,
      prompt,
      context: { ...req.context, scope },
    };
    const next = runNarrativeEngineV2({ request: nextReq, references });
    setReq(nextReq);
    setExplanation(next);
    setHistory(getNarrativeLog(100));
  };

  return (
    <div className="nv-shell">
      <header className="nv-header">
        <div>
          <p className="nv-kicker">Phase 37 · Narrative Engine v2</p>
          <h1>Explainability Layer</h1>
          <p className="nv-sub">Deterministic, traceable explanations for forecasts, sandbox, SOPs, compliance, KG, search, and Copilot. Read-only; no biological inference.</p>
        </div>
        <div className="nv-links">
          <a href="/knowledgeGraph">Knowledge Graph</a>
          <a href="/globalSearch">Global Search</a>
          <a href="/copilot">Copilot</a>
          <a href="/sop">SOPs</a>
        </div>
      </header>

      <div className="nv-layout">
        <div className="nv-col">
          <NarrativeRequestPanel
            prompt={prompt}
            onChange={setPrompt}
            onSubmit={run}
            scope={scope}
            onScopeChange={setScope}
            contextChips={contextChips}
          />
          <NarrativeHistoryViewer log={history} />
        </div>
        <div className="nv-col">
          <NarrativeExplanationViewer explanation={explanation} />
          <NarrativeReferencePanel references={explanation.references} />
          <div className="nv-card nv-card-ghost">
            <h3>Guardrails</h3>
            <ul className="nv-list-text">
              <li>Read-only explanations; no execution or data mutation.</li>
              <li>References must map to real entities; no hallucinated data.</li>
              <li>Tenant and federation boundaries enforced per request scope.</li>
              <li>No biological predictions or inference.</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .nv-shell { display: flex; flex-direction: column; gap: 20px; padding: 24px; background: linear-gradient(128deg, #f8fafc, #e2e8f0); }
        .nv-header { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
        .nv-header h1 { margin: 4px 0 6px; color: #0f172a; font-size: 28px; }
        .nv-sub { margin: 0; color: #334155; font-size: 13px; }
        .nv-kicker { margin: 0; letter-spacing: 0.1em; text-transform: uppercase; font-size: 11px; color: #475569; }
        .nv-links { display: flex; gap: 10px; flex-wrap: wrap; }
        .nv-links a { color: #0ea5e9; font-weight: 600; }
        .nv-layout { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 16px; align-items: start; }
        .nv-col { display: flex; flex-direction: column; gap: 14px; }
        .nv-card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; box-shadow: 0 8px 20px rgba(0,0,0,0.04); }
        .nv-card-soft { background: #f8fafc; }
        .nv-card-ghost { background: #edf2f7; }
        .nv-card-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
        .nv-label { margin: 0; color: #475569; font-size: 12px; }
        .nv-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
        .nv-list-text { margin: 0; padding-left: 18px; color: #334155; display: grid; gap: 6px; }
        .nv-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; align-items: center; }
        .nv-block { border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; background: #fff; display: grid; gap: 6px; }
        .nv-pill { display: inline-flex; padding: 2px 8px; border-radius: 999px; font-size: 12px; color: #0f172a; background: #e2e8f0; }
        .nv-pill-soft { display: inline-flex; padding: 2px 8px; border-radius: 999px; font-size: 12px; color: #0f172a; background: #d1fae5; }
        .nv-link-out { color: #0ea5e9; font-weight: 600; }
        .nv-link-out:hover, .nv-links a:hover { text-decoration: underline; }
        .nv-input { width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #cbd5e1; }
        .nv-button { margin-top: 8px; padding: 10px 14px; border-radius: 8px; border: 1px solid #0ea5e9; background: #0ea5e9; color: #fff; font-weight: 600; cursor: pointer; }
        .nv-button.ghost { background: #fff; color: #0ea5e9; }
        .nv-chip { border: 1px solid #cbd5e1; border-radius: 999px; padding: 6px 10px; background: #f8fafc; cursor: pointer; }
        .nv-chips { display: flex; gap: 8px; flex-wrap: wrap; margin: 10px 0; }
        @media (max-width: 900px) { .nv-layout { grid-template-columns: 1fr; } .nv-header { flex-direction: column; } }
      `}</style>
    </div>
  );
}
