"use client";

import React from 'react';
import { Tenant } from '../tenantTypes';
import { FederationApproval, FederationEvent, FederationRequest } from '../federationTypes';
import { TenantListPanel } from './TenantListPanel';
import { TenantConfigPanel } from './TenantConfigPanel';
import { FacilityClusterPanel } from './FacilityClusterPanel';
import { FederationRequestPanel } from './FederationRequestPanel';
import { FederationApprovalPanel } from './FederationApprovalPanel';
import { FederationHistoryViewer } from './FederationHistoryViewer';

interface Props {
  tenants: Tenant[];
  requests: FederationRequest[];
  approvals: FederationApproval[];
  history: FederationEvent[];
}

export function TenantDashboard({ tenants, requests, approvals, history }: Props) {
  const [selected, setSelected] = React.useState<Tenant | undefined>(tenants[0]);

  return (
    <div className="mt-shell">
      <header className="mt-header">
        <div>
          <p className="mt-kicker">Phase 33 · Multi-Tenant & Federation</p>
          <h1>Tenant & Federation Control</h1>
          <p className="mt-sub">Strict isolation, opt-in federation, audit-logged. No cross-tenant execution.</p>
        </div>
        <div className="mt-links">
          <a href="/commandCenter">Command Center</a>
          <a href="/sop">SOPs</a>
          <a href="/compliance">Compliance</a>
        </div>
      </header>

      <div className="mt-layout">
        <div className="mt-col">
          <TenantListPanel tenants={tenants} onSelect={setSelected} />
          {selected && <TenantConfigPanel tenant={selected} />}
          {selected && <FacilityClusterPanel clusters={selected.clusters} />} 
        </div>
        <div className="mt-col">
          <FederationRequestPanel requests={requests} />
          <FederationApprovalPanel approvals={approvals} />
          <FederationHistoryViewer history={history} />
        </div>
      </div>

      <style jsx global>{`
        .mt-shell { display: flex; flex-direction: column; gap: 20px; padding: 24px; background: linear-gradient(130deg, #f8fafc, #e2e8f0); }
        .mt-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .mt-header h1 { margin: 4px 0 6px; color: #0f172a; font-size: 28px; }
        .mt-sub { margin: 0; color: #334155; }
        .mt-links { display: flex; gap: 10px; flex-wrap: wrap; }
        .mt-links a { color: #0ea5e9; font-weight: 600; }
        .mt-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; align-items: start; }
        .mt-col { display: flex; flex-direction: column; gap: 14px; }
        .mt-card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; box-shadow: 0 8px 20px rgba(0,0,0,0.04); }
        .mt-card-soft { background: #f8fafc; }
        .mt-card-ghost { background: #edf2f7; }
        .mt-card-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
        .mt-kicker { margin: 0; letter-spacing: 0.1em; text-transform: uppercase; font-size: 11px; color: #475569; }
        .mt-label { margin: 0; color: #475569; font-size: 12px; }
        .mt-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
        .mt-list-block { margin-top: 8px; }
        .mt-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
        .mt-tile { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; background: #f8fafc; }
        .mt-pill { display: inline-flex; padding: 2px 8px; border-radius: 999px; font-size: 12px; color: #0f172a; background: #e2e8f0; }
        .mt-pill-soft { background: #e2e8f0; }
        .mt-link { width: 100%; text-align: left; border: none; background: none; cursor: pointer; padding: 0; }
        .mt-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; }
        .mt-sub { color: #334155; font-size: 13px; margin: 0; }
        .mt-history { list-style: none; padding: 0; margin: 0; display: grid; gap: 6px; }
        .mt-history-row { display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; background: #fff; }
        .mt-history-msg { color: #0f172a; }
        .mt-history-time { color: #475569; font-size: 12px; }
        @media (max-width: 900px) { .mt-layout { grid-template-columns: 1fr; } .mt-header { flex-direction: column; } }
      `}</style>
    </div>
  );
}
