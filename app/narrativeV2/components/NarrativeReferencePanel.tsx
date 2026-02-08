"use client";

import React from 'react';
import { NarrativeReference } from '../narrativeTypes';

interface Props {
  references: NarrativeReference[];
}

export function NarrativeReferencePanel({ references }: Props) {
  return (
    <div className="nv-card nv-card-soft">
      <div className="nv-card-header">
        <h3>References</h3>
        <span className="nv-pill">Traceable</span>
      </div>
      <p className="nv-sub">All references map to existing entities; federated items read-only.</p>
      <div className="nv-list">
        {references.map((ref) => (
          <div key={ref.id} className="nv-row">
            <div>
              <p className="nv-label">Label</p>
              <p>{ref.label}</p>
            </div>
            <div>
              <p className="nv-label">Type</p>
              <p>{ref.type}</p>
            </div>
            <div>
              <p className="nv-label">Tenant</p>
              <p>{ref.tenantId}</p>
            </div>
            {ref.federated ? <span className="nv-pill-soft">Federated</span> : null}
            {ref.link ? <a className="nv-link-out" href={ref.link}>Open</a> : null}
          </div>
        ))}
        {!references.length && <p className="nv-sub">No references provided.</p>}
      </div>
    </div>
  );
}
