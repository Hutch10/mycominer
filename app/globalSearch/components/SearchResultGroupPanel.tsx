"use client";

import React from 'react';
import { SearchResultItem } from '../globalSearchTypes';

interface Props {
  items: SearchResultItem[];
}

export function SearchResultGroupPanel({ items }: Props) {
  const byFacility = new Map<string, SearchResultItem[]>();
  items.forEach((item) => {
    const key = item.facilityId ?? 'unassigned';
    byFacility.set(key, [...(byFacility.get(key) ?? []), item]);
  });

  return (
    <div className="gs-card gs-card-soft">
      <div className="gs-card-header">
        <h3>Facility Grouping</h3>
        <span className="gs-pill">Context</span>
      </div>
      <p className="gs-sub">Grouped by facility for quick triage. Read-only drill-downs only.</p>
      <div className="gs-list">
        {Array.from(byFacility.entries()).map(([facility, list]) => (
          <div key={facility} className="gs-row">
            <div>
              <p className="gs-label">Facility</p>
              <p>{facility}</p>
            </div>
            <div>
              <p className="gs-label">Items</p>
              <p>{list.length}</p>
            </div>
          </div>
        ))}
        {!items.length && <p className="gs-sub">No items to group.</p>}
      </div>
    </div>
  );
}
