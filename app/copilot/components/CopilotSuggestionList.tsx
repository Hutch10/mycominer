"use client";

import React from 'react';
import { CopilotSuggestion } from '../copilotTypes';

interface Props {
  suggestions: CopilotSuggestion[];
  onSelect: (suggestion: CopilotSuggestion) => void;
}

export function CopilotSuggestionList({ suggestions, onSelect }: Props) {
  return (
    <div className="cp-card">
      <div className="cp-card-header">
        <h3>Suggested Playbooks</h3>
        <span className="cp-pill">Read-only</span>
      </div>
      <p className="cp-sub">Deterministic, tenant-scoped guidance; federated items labeled.</p>
      <div className="cp-list">
        {suggestions.map((s) => (
          <button key={s.suggestionId} className="cp-link" onClick={() => onSelect(s)}>
            <div className="cp-row">
              <div>
                <p className="cp-label">Title</p>
                <p>{s.title}</p>
              </div>
              <div>
                <p className="cp-label">Tenant</p>
                <p>{s.tenantId}</p>
              </div>
              <div>
                <p className="cp-label">Reason</p>
                <p>{s.reason}</p>
              </div>
              {s.federated ? <span className="cp-pill-soft">Federated</span> : null}
            </div>
          </button>
        ))}
        {!suggestions.length && <p className="cp-sub">No playbooks matched.</p>}
      </div>
    </div>
  );
}
