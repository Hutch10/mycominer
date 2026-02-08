"use client";

import React from 'react';
import { TimelineLogEntry } from '../timelineTypes';

interface Props {
  log: TimelineLogEntry[];
}

export function TimelineHistoryViewer({ log }: Props) {
  return (
    <div className="tl-card tl-card-soft">
      <div className="tl-card-header">
        <h3>Timeline History</h3>
        <span className="tl-pill">Audit</span>
      </div>
      <p className="tl-sub">Filter and replay sessions are logged for compliance and traceability.</p>
      <div className="tl-list">
        {log.map((entry) => (
          <div key={entry.entryId} className="tl-row">
            <div>
              <p className="tl-label">Category</p>
              <p>{entry.category}</p>
            </div>
            <div>
              <p className="tl-label">Message</p>
              <p>{entry.message}</p>
            </div>
            <div>
              <p className="tl-label">When</p>
              <p>{new Date(entry.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ))}
        {!log.length && <p className="tl-sub">No history yet.</p>}
      </div>
    </div>
  );
}
