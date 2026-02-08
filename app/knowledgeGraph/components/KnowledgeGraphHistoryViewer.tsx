"use client";

import React from 'react';
import { KnowledgeGraphLogEntry } from '../knowledgeGraphTypes';

interface Props {
  log: KnowledgeGraphLogEntry[];
}

export function KnowledgeGraphHistoryViewer({ log }: Props) {
  return (
    <div className="kg-card kg-card-soft">
      <div className="kg-card-header">
        <h3>Knowledge Graph History</h3>
        <span className="kg-pill">Audit</span>
      </div>
      <p className="kg-sub">Builds, queries, and federation-scope lookups are captured here.</p>
      <div className="kg-list">
        {log.map((entry) => (
          <div key={entry.entryId} className="kg-row">
            <div>
              <p className="kg-label">Category</p>
              <p>{entry.category}</p>
            </div>
            <div>
              <p className="kg-label">Message</p>
              <p>{entry.message}</p>
            </div>
            <div>
              <p className="kg-label">When</p>
              <p>{entry.timestamp}</p>
            </div>
          </div>
        ))}
        {!log.length && <p className="kg-sub">No history logged yet.</p>}
      </div>
    </div>
  );
}
