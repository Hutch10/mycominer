"use client";

import React from 'react';
import { SandboxComparison, SandboxInsight, SandboxLogEntry, SandboxResult, SandboxScenario } from '../sandboxTypes';
import { ScenarioBuilderPanel } from './ScenarioBuilderPanel';
import { ScenarioParametersPanel } from './ScenarioParametersPanel';
import { SandboxResultsPanel } from './SandboxResultsPanel';
import { SandboxComparisonPanel } from './SandboxComparisonPanel';
import { SandboxInsightsPanel } from './SandboxInsightsPanel';
import { SandboxHistoryViewer } from './SandboxHistoryViewer';

interface Props {
  scenario: SandboxScenario;
  result: SandboxResult;
  comparison: SandboxComparison;
  insights: SandboxInsight[];
  history: SandboxLogEntry[];
}

export function SandboxDashboard({ scenario, result, comparison, insights, history }: Props) {
  const handleCloneFromLive = () => {
    alert('Clone from Live requested. This is a placeholder; integrate Command Center feed.');
  };

  const handlePromote = () => {
    alert('Promotion requested. This creates a proposal and requires safety approval.');
  };

  const handleExplainScenario = () => {
    alert('Explain This Scenario (Phase 25 narrative hook).');
  };

  return (
    <div className="sb-shell">
      <header className="sb-header">
        <div>
          <p className="sb-kicker">Phase 30 · Sandbox / What If</p>
          <h1>Operational Scenario Sandbox</h1>
          <p className="sb-sub">Isolated, non-binding exploration of setpoints, schedules, and resources.</p>
        </div>
        <div className="sb-links">
          <a href="/commandCenter">Command Center</a>
          <a href="/digitalTwin">Digital Twin</a>
          <a href="/forecasting">Forecasting</a>
        </div>
      </header>

      <div className="sb-layout">
        <div className="sb-col">
          <ScenarioBuilderPanel scenario={scenario} onCloneFromLive={handleCloneFromLive} onPromote={handlePromote} />
          <ScenarioParametersPanel parameters={scenario.parameters} />
          <SandboxResultsPanel result={result} />
          <SandboxComparisonPanel comparison={comparison} />
        </div>
        <div className="sb-col">
          <SandboxInsightsPanel insights={insights} />
          <SandboxHistoryViewer history={history} />
          <button type="button" className="sb-btn sb-btn-wide" onClick={handleExplainScenario}>
            Explain This Scenario
          </button>
        </div>
      </div>

      <style jsx global>{`
        .sb-shell {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 24px;
          background: radial-gradient(circle at 20% 20%, #f8fafc, #e2e8f0);
        }
        .sb-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .sb-header h1 {
          margin: 4px 0 6px;
          color: #0f172a;
          font-size: 28px;
        }
        .sb-sub {
          margin: 0;
          color: #334155;
        }
        .sb-links {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .sb-links a {
          color: #0ea5e9;
          font-weight: 600;
        }
        .sb-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
          align-items: start;
        }
        .sb-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .sb-card {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 14px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.04);
        }
        .sb-card-soft { background: #f8fafc; }
        .sb-card-ghost { background: #edf2f7; }
        .sb-card-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 8px;
        }
        .sb-kicker {
          margin: 0;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-size: 11px;
          color: #475569;
        }
        .sb-meta {
          color: #475569;
          font-size: 12px;
        }
        .sb-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
        }
        .sb-label {
          margin: 0;
          color: #475569;
          font-size: 12px;
        }
        .sb-list {
          margin: 0;
          padding-left: 16px;
          color: #0f172a;
        }
        .sb-list-block {
          margin-top: 8px;
        }
        .sb-tile {
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 10px;
          background: #f8fafc;
        }
        .sb-tile-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .sb-pill {
          display: inline-flex;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 12px;
          color: #0f172a;
          background: #e2e8f0;
        }
        .sb-pill-better { background: #dcfce7; }
        .sb-pill-worse { background: #fee2e2; }
        .sb-pill-mixed { background: #fef3c7; }
        .sb-pill-neutral { background: #e2e8f0; }
        .sb-pill-low { background: #dcfce7; }
        .sb-pill-medium { background: #fef3c7; }
        .sb-pill-high { background: #fecdd3; }
        .sb-pill-soft { background: #e2e8f0; }
        .sb-btn {
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          background: #0ea5e9;
          color: #0f172a;
          font-weight: 700;
          cursor: pointer;
        }
        .sb-btn:hover { background: #38bdf8; }
        .sb-btn-ghost {
          background: #e2e8f0;
          color: #0f172a;
        }
        .sb-btn-wide {
          width: 100%;
          text-align: center;
        }
        .sb-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .sb-desc { color: #334155; }
        .sb-history { list-style: none; padding: 0; margin: 0; display: grid; gap: 6px; }
        .sb-history-row { display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; background: #fff; }
        .sb-history-msg { color: #0f172a; }
        .sb-history-time { color: #475569; font-size: 12px; }
        @media (max-width: 900px) {
          .sb-layout { grid-template-columns: 1fr; }
          .sb-header { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
