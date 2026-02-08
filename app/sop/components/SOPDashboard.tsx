"use client";

import React from 'react';
import { SOPDocument } from '../sopTypes';
import { SOPListPanel } from './SOPListPanel';
import { SOPViewer } from './SOPViewer';
import { SOPDiffViewer } from './SOPDiffViewer';
import { SOPVersionHistoryViewer } from './SOPVersionHistoryViewer';
import { SOPApprovalPanel } from './SOPApprovalPanel';

interface Props {
  current: SOPDocument;
  previous: SOPDocument;
  versions: SOPDocument[];
  library: SOPDocument[];
}

export function SOPDashboard({ current, previous, versions, library }: Props) {
  const [selected, setSelected] = React.useState<SOPDocument>(current);

  const handleApprove = (sop: SOPDocument) => {
    alert(`Approve SOP ${sop.title}. Requires operator confirmation.`);
  };

  const handleReject = (sop: SOPDocument) => {
    alert(`Reject SOP ${sop.title}. Requires reason and audit log.`);
  };

  return (
    <div className="sop-shell">
      <header className="sop-header">
        <div>
          <p className="sop-kicker">Phase 31 · SOP Generator</p>
          <h1>Deterministic SOPs</h1>
          <p className="sop-sub">Built from existing workflows, resources, timing, telemetry, and safety data. Non-biological, informational only.</p>
        </div>
        <div className="sop-links">
          <a href="/commandCenter">Command Center</a>
          <a href="/forecasting">Forecasting</a>
          <a href="/sandbox">Sandbox</a>
        </div>
      </header>

      <div className="sop-layout">
        <div className="sop-col">
          <SOPListPanel sops={library} onSelect={setSelected} />
          <SOPViewer sop={selected} />
          <SOPApprovalPanel sop={selected} onApprove={handleApprove} onReject={handleReject} />
        </div>
        <div className="sop-col">
          <SOPDiffViewer current={current} previous={previous} />
          <SOPVersionHistoryViewer versions={versions} />
        </div>
      </div>

      <style jsx global>{`
        .sop-shell {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 24px;
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
        }
        .sop-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .sop-header h1 {
          margin: 4px 0 6px;
          color: #0f172a;
          font-size: 28px;
        }
        .sop-sub {
          margin: 0;
          color: #334155;
        }
        .sop-links {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .sop-links a { color: #0ea5e9; font-weight: 600; }
        .sop-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; align-items: start; }
        .sop-col { display: flex; flex-direction: column; gap: 14px; }
        .sop-card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; box-shadow: 0 8px 20px rgba(0,0,0,0.04); }
        .sop-card-soft { background: #f8fafc; }
        .sop-card-ghost { background: #edf2f7; }
        .sop-card-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
        .sop-kicker { margin: 0; letter-spacing: 0.1em; text-transform: uppercase; font-size: 11px; color: #475569; }
        .sop-label { margin: 0; color: #475569; font-size: 12px; }
        .sop-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
        .sop-row { display: flex; justify-content: space-between; gap: 8px; align-items: center; }
        .sop-tile { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; background: #f8fafc; }
        .sop-steps { margin: 8px 0 0; padding-left: 18px; color: #0f172a; }
        .sop-pill { display: inline-flex; padding: 2px 8px; border-radius: 999px; font-size: 12px; color: #0f172a; background: #e2e8f0; }
        .sop-pill-info { background: #e0f2fe; }
        .sop-pill-warning { background: #fef3c7; }
        .sop-pill-critical { background: #fecdd3; }
        .sop-link { width: 100%; text-align: left; border: none; background: none; cursor: pointer; padding: 0; }
        .sop-btn { padding: 8px 12px; border: none; border-radius: 8px; background: #0ea5e9; color: #0f172a; font-weight: 700; cursor: pointer; }
        .sop-btn:hover { background: #38bdf8; }
        .sop-btn-ghost { background: #e2e8f0; color: #0f172a; }
        .sop-actions { display: flex; gap: 8px; }
        @media (max-width: 900px) {
          .sop-layout { grid-template-columns: 1fr; }
          .sop-header { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
