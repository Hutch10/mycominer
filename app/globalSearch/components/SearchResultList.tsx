"use client";

import React from 'react';
import { SearchResultGroup, SearchResultItem } from '../globalSearchTypes';

interface Props {
  groups: SearchResultGroup[];
  onSelect: (item: SearchResultItem) => void;
}

export function SearchResultList({ groups, onSelect }: Props) {
  return (
    <div className="gs-card">
      <div className="gs-card-header">
        <h3>Results</h3>
        <span className="gs-pill">Grouped</span>
      </div>
      <p className="gs-sub">Deterministic matches grouped by type. Federated items are labeled.</p>
      <div className="gs-list">
        {groups.map((group) => (
          <div key={group.label} className="gs-group">
            <div className="gs-row">
              <h4>{group.label}</h4>
              <span className="gs-pill-soft">{group.items.length}</span>
            </div>
            <div className="gs-list">
              {group.items.map((item) => (
                <button key={item.id} className="gs-link" onClick={() => onSelect(item)}>
                  <div className="gs-row">
                    <div>
                      <p className="gs-label">Name</p>
                      <p>{item.name}</p>
                    </div>
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
                    {item.federated ? <span className="gs-pill-soft">Federated</span> : null}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
        {!groups.length && <p className="gs-sub">No results.</p>}
      </div>
    </div>
  );
}
