"use client";

import React from 'react';
import { SearchLogEntry } from '../globalSearchTypes';

interface Props {
  log: SearchLogEntry[];
}

export function SearchHistoryViewer({ log }: Props) {
  return (
    <div className="gs-card gs-card-soft">
      <div className="gs-card-header">
        <h3>Search History</h3>
        <span className="gs-pill">Audit</span>
      </div>
      <p className="gs-sub">Queries, scopes, and aggregates are logged for audit. No PII stored.</p>
      <div className="gs-list">
        {log.map((entry) => (
          <div key={entry.entryId} className="gs-row">
            <div>
              <p className="gs-label">Category</p>
              <p>{entry.category}</p>
            </div>
            <div>
              <p className="gs-label">Message</p>
              <p>{entry.message}</p>
            </div>
            <div>
              <p className="gs-label">When</p>
              <p>{entry.timestamp}</p>
            </div>
          </div>
        ))}
        {!log.length && <p className="gs-sub">No history yet.</p>}
      </div>
    </div>
  );
}
