"use client";

import React from 'react';
import { BottleneckAnalysis, ForecastingLogEntry, ForecastingReport, ThroughputEstimate } from '../forecastingTypes';
import { CapacityPanel } from './CapacityPanel';
import { ThroughputPanel } from './ThroughputPanel';
import { YieldRangePanel } from './YieldRangePanel';
import { BottleneckPanel } from './BottleneckPanel';
import { ForecastingReportViewer } from './ForecastingReportViewer';
import { ForecastingHistoryViewer } from './ForecastingHistoryViewer';

interface Props {
  report: ForecastingReport;
  history: ForecastingLogEntry[];
}

export function ForecastingDashboard({ report, history }: Props) {
  const handleExplain = (t: ThroughputEstimate) => {
    // Placeholder for Phase 25 explanation hook
    alert(`Explain forecast for ${t.workflowName}:\n${t.explain}`);
  };

  return (
    <div className="fc-shell">
      <header className="fc-header">
        <div>
          <p className="fc-kicker">Phase 29 · Deterministic Forecasting</p>
          <h1>Yield & Throughput Modeling</h1>
          <p className="fc-sub">Operational, non-biological ranges driven by capacity and timing.</p>
        </div>
        <div className="fc-links">
          <a href="/commandCenter">Command Center</a>
          <a href="/digitalTwin">Digital Twin</a>
          <a href="/execution">Execution</a>
        </div>
      </header>

      <div className="fc-layout">
        <div className="fc-col">
          <CapacityPanel capacity={report.capacity} />
          <ThroughputPanel throughput={report.throughput} onExplain={handleExplain} />
          <YieldRangePanel yieldRanges={report.yieldRanges} />
        </div>
        <div className="fc-col">
          <BottleneckPanel bottlenecks={report.bottlenecks as BottleneckAnalysis} />
          <ForecastingReportViewer report={report} />
          <ForecastingHistoryViewer history={history} />
        </div>
      </div>

      <style jsx global>{`
        .fc-shell {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 24px;
          background: linear-gradient(145deg, #f8fafc, #e2e8f0);
        }
        .fc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .fc-header h1 {
          margin: 4px 0 6px;
          color: #0f172a;
          font-size: 28px;
        }
        .fc-sub {
          margin: 0;
          color: #334155;
        }
        .fc-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
          align-items: start;
        }
        .fc-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .fc-card {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 14px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.04);
        }
        .fc-card-ghost {
          background: #f8fafc;
        }
        .fc-card-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 8px;
        }
        .fc-kicker {
          margin: 0;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-size: 11px;
          color: #475569;
        }
        .fc-meta {
          color: #475569;
          font-size: 12px;
        }
        .fc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 10px;
        }
        .fc-tile {
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 10px;
          background: #f8fafc;
        }
        .fc-tile-soft {
          background: #eef2ff;
        }
        .fc-tile-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .fc-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }
        .fc-label {
          margin: 0;
          color: #475569;
          font-size: 12px;
        }
        .fc-explain {
          color: #475569;
          font-size: 12px;
        }
        .fc-btn {
          margin-top: 6px;
          padding: 6px 10px;
          background: #0ea5e9;
          color: #0f172a;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }
        .fc-btn:hover {
          background: #38bdf8;
        }
        .fc-links {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .fc-links a {
          color: #0ea5e9;
          font-weight: 600;
        }
        .fc-pill {
          display: inline-flex;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 12px;
          color: #0f172a;
          background: #e2e8f0;
        }
        .fc-pill-high { background: #fecdd3; }
        .fc-pill-medium { background: #fef3c7; }
        .fc-pill-low { background: #dcfce7; }
        .fc-pill-soft { background: #e2e8f0; }
        .fc-history {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 6px;
        }
        .fc-history-row {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 10px;
          align-items: center;
          padding: 8px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: #fff;
        }
        .fc-history-msg {
          color: #0f172a;
        }
        .fc-history-time {
          color: #475569;
          font-size: 12px;
        }
        @media (max-width: 900px) {
          .fc-layout {
            grid-template-columns: 1fr;
          }
          .fc-header {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
