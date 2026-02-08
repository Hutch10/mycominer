"use client";

import React from 'react';
import { ComplianceEvent, ComplianceLogEntry, ComplianceReport, ComplianceReview, DeviationRecord } from '../complianceTypes';
import { ComplianceEventList } from './ComplianceEventList';
import { DeviationPanel } from './DeviationPanel';
import { CAPAPanel } from './CAPAPanel';
import { ComplianceReportViewer } from './ComplianceReportViewer';
import { ComplianceReviewPanel } from './ComplianceReviewPanel';
import { ComplianceHistoryViewer } from './ComplianceHistoryViewer';

interface Props {
  events: ComplianceEvent[];
  deviations: DeviationRecord[];
  report: ComplianceReport;
  review: ComplianceReview;
  history: ComplianceLogEntry[];
}

export function ComplianceDashboard({ events, deviations, report, review, history }: Props) {
  const handleApprove = () => {
    alert('Approve review (requires operator confirmation and audit log)');
  };

  const handleReject = () => {
    alert('Reject review (requires reason and audit log)');
  };

  return (
    <div className="cp-shell">
      <header className="cp-header">
        <div>
          <p className="cp-kicker">Phase 32 · Compliance & Audit</p>
          <h1>Compliance Dashboard</h1>
          <p className="cp-sub">Immutable audit trails for SOP, workflow, environment, and execution events. No biological claims.</p>
        </div>
        <div className="cp-links">
          <a href="/commandCenter">Command Center</a>
          <a href="/sop">SOPs</a>
          <a href="/sandbox">Sandbox</a>
        </div>
      </header>

      <div className="cp-layout">
        <div className="cp-col">
          <ComplianceEventList events={events} />
          <DeviationPanel deviations={deviations} />
          <CAPAPanel deviations={deviations} />
        </div>
        <div className="cp-col">
          <ComplianceReportViewer report={report} />
          <ComplianceReviewPanel review={review} onApprove={handleApprove} onReject={handleReject} />
          <ComplianceHistoryViewer history={history} />
        </div>
      </div>

      <style jsx global>{`
        .cp-shell {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 24px;
          background: linear-gradient(120deg, #f8fafc, #e2e8f0);
        }
        .cp-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .cp-header h1 {
          margin: 4px 0 6px;
          color: #0f172a;
          font-size: 28px;
        }
        .cp-sub { margin: 0; color: #334155; }
        .cp-links { display: flex; gap: 10px; flex-wrap: wrap; }
        .cp-links a { color: #0ea5e9; font-weight: 600; }
        .cp-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; align-items: start; }
        .cp-col { display: flex; flex-direction: column; gap: 14px; }
        .cp-card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; box-shadow: 0 8px 20px rgba(0,0,0,0.04); }
        .cp-card-soft { background: #f8fafc; }
        .cp-card-ghost { background: #edf2f7; }
        .cp-card-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
        .cp-kicker { margin: 0; letter-spacing: 0.1em; text-transform: uppercase; font-size: 11px; color: #475569; }
        .cp-label { margin: 0; color: #475569; font-size: 12px; }
        .cp-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
        .cp-list-block { margin-top: 8px; }
        .cp-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
        .cp-tile { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; background: #f8fafc; }
        .cp-tile-soft { background: #eef2ff; }
        .cp-pill { display: inline-flex; padding: 2px 8px; border-radius: 999px; font-size: 12px; color: #0f172a; background: #e2e8f0; }
        .cp-pill-info { background: #e0f2fe; }
        .cp-pill-minor { background: #dcfce7; }
        .cp-pill-major { background: #fef3c7; }
        .cp-pill-critical { background: #fecdd3; }
        .cp-pill-soft { background: #e2e8f0; }
        .cp-btn { padding: 8px 12px; border: none; border-radius: 8px; background: #0ea5e9; color: #0f172a; font-weight: 700; cursor: pointer; }
        .cp-btn:hover { background: #38bdf8; }
        .cp-btn-ghost { background: #e2e8f0; color: #0f172a; }
        .cp-meta { color: #475569; font-size: 12px; }
        .cp-history { list-style: none; padding: 0; margin: 0; display: grid; gap: 6px; }
        .cp-history-row { display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; background: #fff; }
        .cp-history-msg { color: #0f172a; }
        .cp-history-time { color: #475569; font-size: 12px; }
        @media (max-width: 900px) {
          .cp-layout { grid-template-columns: 1fr; }
          .cp-header { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
