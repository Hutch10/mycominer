"use client";

import React from 'react';
import { KGQuery, KGNodeType } from '../knowledgeGraphTypes';

interface Props {
  value: KGQuery;
  onChange: (query: KGQuery) => void;
  onRun: () => void;
  availableFacilities: string[];
  availableTenants: string[];
}

const typeOptions: KGNodeType[] = ['workflow', 'resource', 'facility', 'room', 'equipment', 'sop', 'complianceEvent', 'deviation', 'capa', 'telemetryStream', 'forecast', 'sandboxScenario', 'plugin', 'digitalTwinSnapshot'];

export function KGQueryBuilderPanel({ value, onChange, onRun, availableFacilities, availableTenants }: Props) {
  const toggleType = (type: KGNodeType) => {
    const has = value.nodeTypes?.includes(type);
    const nodeTypes = has ? value.nodeTypes?.filter((t) => t !== type) : [...(value.nodeTypes ?? []), type];
    onChange({ ...value, nodeTypes });
  };

  const toggleTenant = (tenantId: string) => {
    const has = value.federatedTenantIds?.includes(tenantId);
    const federatedTenantIds = has ? value.federatedTenantIds?.filter((t) => t !== tenantId) : [...(value.federatedTenantIds ?? []), tenantId];
    onChange({ ...value, federatedTenantIds });
  };

  const toggleFacility = (facilityId: string) => {
    const has = value.facilities?.includes(facilityId);
    const facilities = has ? value.facilities?.filter((f) => f !== facilityId) : [...(value.facilities ?? []), facilityId];
    onChange({ ...value, facilities });
  };

  return (
    <div className="kg-card">
      <div className="kg-card-header">
        <h3>Query Builder</h3>
        <span className="kg-pill">Read-only</span>
      </div>
      <p className="kg-sub">Build semantic queries with tenant-aware scope. No writes, no execution.</p>

      <div className="kg-form">
        <label className="kg-label">Scope</label>
        <div className="kg-row">
          <label><input type="radio" name="scope" checked={value.scope === 'tenant'} onChange={() => onChange({ ...value, scope: 'tenant' })} /> Tenant-only</label>
          <label><input type="radio" name="scope" checked={value.scope === 'federated'} onChange={() => onChange({ ...value, scope: 'federated' })} /> Federated (read-only)</label>
        </div>

        <label className="kg-label">Tenant</label>
        <input className="kg-input" value={value.tenantId} onChange={(e) => onChange({ ...value, tenantId: e.target.value })} />

        <label className="kg-label">Federated Tenants</label>
        <div className="kg-grid">
          {availableTenants.map((tenant) => (
            <button key={tenant} type="button" className={`kg-chip ${value.federatedTenantIds?.includes(tenant) ? 'active' : ''}`} onClick={() => toggleTenant(tenant)}>
              {tenant}
            </button>
          ))}
        </div>

        <label className="kg-label">Node Types</label>
        <div className="kg-grid">
          {typeOptions.map((type) => (
            <button key={type} type="button" className={`kg-chip ${value.nodeTypes?.includes(type) ? 'active' : ''}`} onClick={() => toggleType(type)}>
              {type}
            </button>
          ))}
        </div>

        <label className="kg-label">Facilities</label>
        <div className="kg-grid">
          {availableFacilities.map((facility) => (
            <button key={facility} type="button" className={`kg-chip ${value.facilities?.includes(facility) ? 'active' : ''}`} onClick={() => toggleFacility(facility)}>
              {facility}
            </button>
          ))}
        </div>

        <label className="kg-label">Anchor Node ID (optional)</label>
        <input className="kg-input" placeholder="node-id" value={value.anchorId ?? ''} onChange={(e) => onChange({ ...value, anchorId: e.target.value || undefined })} />

        <label className="kg-label">Max Depth</label>
        <input className="kg-input" type="number" min={1} max={5} value={value.maxDepth ?? 1} onChange={(e) => onChange({ ...value, maxDepth: Number(e.target.value) })} />

        <label className="kg-label">Max Nodes</label>
        <input className="kg-input" type="number" min={1} max={200} value={value.maxNodes ?? 50} onChange={(e) => onChange({ ...value, maxNodes: Number(e.target.value) })} />
      </div>

      <button type="button" className="kg-button" onClick={onRun}>Run Query</button>
    </div>
  );
}
