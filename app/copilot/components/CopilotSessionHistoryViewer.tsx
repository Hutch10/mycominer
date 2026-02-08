"use client";

import React from 'react';
import { CopilotSessionLogEntry } from '../copilotTypes';

interface Props {
  log: CopilotSessionLogEntry[];
}

export function CopilotSessionHistoryViewer({ log }: Props) {
  return (
    <div className="cp-card cp-card-soft">
      <div className="cp-card-header">
        <h3>Copilot History</h3>
        <span className="cp-pill">Audit</span>
      </div>
      <p className="cp-sub">Sessions, queries, and suggestions are logged. No PII stored.</p>
      <div className="cp-list">
        {log.map((entry) => (
          <div key={entry.entryId} className="cp-row">
            <div>
              <p className="cp-label">Category</p>
              <p>{entry.category}</p>
            </div>
            <div>
              <p className="cp-label">Message</p>
              <p>{entry.message}</p>
            </div>
            <div>
              <p className="cp-label">When</p>
              <p>{entry.timestamp}</p>
            </div>
          </div>
        ))}
        {!log.length && <p className="cp-sub">No history yet.</p>}
      </div>
    </div>
  );
}
