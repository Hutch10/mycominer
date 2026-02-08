"use client";

import React from 'react';
import { SearchFilter, SearchScope } from '../globalSearchTypes';

interface Props {
  scope: SearchScope;
  tenantId: string;
  federatedTenantIds?: string[];
  filters: SearchFilter;
  availableTypes: string[];
  availableFacilities: string[];
  availableTenants: string[];
  onScopeChange: (scope: SearchScope) => void;
  onTenantChange: (tenant: string) => void;
  onFederatedChange: (tenants: string[]) => void;
  onFiltersChange: (filters: SearchFilter) => void;
}

export function AdvancedFilterPanel({ scope, tenantId, federatedTenantIds, filters, availableTypes, availableFacilities, availableTenants, onScopeChange, onTenantChange, onFederatedChange, onFiltersChange }: Props) {
  const toggle = (key: keyof SearchFilter, value: string) => {
    const current = filters[key] as string[] | undefined;
    const next = current?.includes(value) ? current.filter((v) => v !== value) : [...(current ?? []), value];
    onFiltersChange({ ...filters, [key]: next });
  };

  const toggleFederated = (tenant: string) => {
    const next = federatedTenantIds?.includes(tenant) ? federatedTenantIds.filter((t) => t !== tenant) : [...(federatedTenantIds ?? []), tenant];
    onFederatedChange(next);
  };

  return (
    <div className="gs-card gs-card-soft">
      <div className="gs-card-header">
        <h3>Advanced Filters</h3>
        <span className="gs-pill">Scope</span>
      </div>
      <p className="gs-sub">Tenant-aware filters; federated is read-only and policy-bound.</p>

      <div className="gs-form">
        <label className="gs-label">Scope</label>
        <div className="gs-row">
          <label><input type="radio" name="scope" checked={scope === 'tenant'} onChange={() => onScopeChange('tenant')} /> Tenant</label>
          <label><input type="radio" name="scope" checked={scope === 'federated'} onChange={() => onScopeChange('federated')} /> Federated (read-only)</label>
        </div>

        <label className="gs-label">Tenant</label>
        <input className="gs-input" value={tenantId} onChange={(e) => onTenantChange(e.target.value)} />

        <label className="gs-label">Federated Tenants</label>
        <div className="gs-grid">
          {availableTenants.filter((t) => t !== tenantId).map((tenant) => (
            <button key={tenant} type="button" className={`gs-chip ${federatedTenantIds?.includes(tenant) ? 'active' : ''}`} onClick={() => toggleFederated(tenant)}>
              {tenant}
            </button>
          ))}
        </div>

        <label className="gs-label">Types</label>
        <div className="gs-grid">
          {availableTypes.map((type) => (
            <button key={type} type="button" className={`gs-chip ${filters.types?.includes(type) ? 'active' : ''}`} onClick={() => toggle('types', type)}>
              {type}
            </button>
          ))}
        </div>

        <label className="gs-label">Facilities</label>
        <div className="gs-grid">
          {availableFacilities.map((facility) => (
            <button key={facility} type="button" className={`gs-chip ${filters.facilities?.includes(facility) ? 'active' : ''}`} onClick={() => toggle('facilities', facility)}>
              {facility}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
