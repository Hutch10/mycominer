"use client";

import React from 'react';
import { NarrativeLogEntry } from '../narrativeTypes';

interface Props {
  log: NarrativeLogEntry[];
}

export function NarrativeHistoryViewer({ log }: Props) {
  return (
    <div className="nv-card nv-card-soft">
      <div className="nv-card-header">
        <h3>Narrative History</h3>
        <span className="nv-pill">Audit</span>
      </div>
      <p className="nv-sub">Requests and outputs are logged for traceability.</p>
      <div className="nv-list">
        {log.map((entry) => (
          <div key={entry.entryId} className="nv-row">
            <div>
              <p className="nv-label">Category</p>
              <p>{entry.category}</p>
            </div>
            <div>
              <p className="nv-label">Message</p>
              <p>{entry.message}</p>
            </div>
            <div>
              <p className="nv-label">When</p>
              <p>{entry.timestamp}</p>
            </div>
          </div>
        ))}
        {!log.length && <p className="nv-sub">No history yet.</p>}
      </div>
    </div>
  );
}
