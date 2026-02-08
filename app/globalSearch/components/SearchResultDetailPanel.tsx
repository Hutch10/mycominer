"use client";

import React from 'react';
import { SearchResultItem } from '../globalSearchTypes';

interface Props {
  item?: SearchResultItem;
}

export function SearchResultDetailPanel({ item }: Props) {
  if (!item) {
    return (
      <div className="gs-card">
        <div className="gs-card-header">
          <h3>Result Detail</h3>
          <span className="gs-pill">Idle</span>
        </div>
        <p className="gs-sub">Select a result to view metadata, tenant context, and source links.</p>
      </div>
    );
  }

  return (
    <div className="gs-card">
      <div className="gs-card-header">
        <h3>{item.name}</h3>
        <span className="gs-pill">{item.type}</span>
      </div>
      <div className="gs-grid">
        <div>
          <p className="gs-label">Tenant</p>
          <p>{item.tenantId}</p>
        </div>
        {item.facilityId && (
          <div>
            <p className="gs-label">Facility</p>
            <p>{item.facilityId}</p>
          </div>
        )}
        <div>
          <p className="gs-label">Source</p>
          <p>{item.source}</p>
        </div>
      </div>
      {item.tags?.length ? (
        <div className="gs-tags">
          {item.tags.map((tag) => (
            <span key={tag} className="gs-pill-soft">{tag}</span>
          ))}
        </div>
      ) : null}
      {item.metadata && (
        <div className="gs-meta">
          <p className="gs-label">Metadata</p>
          <pre className="gs-pre">{JSON.stringify(item.metadata, null, 2)}</pre>
        </div>
      )}
      {item.link && <a className="gs-link-out" href={item.link}>Open in source system</a>}
      <button className="gs-button ghost" type="button">Explain These Results (Phase 25 hook)</button>
      {item.federated ? <p className="gs-sub">Federated item (read-only)</p> : null}
    </div>
  );
}
