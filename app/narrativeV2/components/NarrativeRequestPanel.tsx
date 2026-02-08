"use client";

import React from 'react';

interface Props {
  prompt: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  scope: 'tenant' | 'federated';
  onScopeChange: (scope: 'tenant' | 'federated') => void;
  contextChips: { label: string; value: string; onClick: () => void }[];
}

export function NarrativeRequestPanel({ prompt, onChange, onSubmit, scope, onScopeChange, contextChips }: Props) {
  return (
    <div className="nv-card">
      <div className="nv-card-header">
        <h3>Explain This</h3>
        <span className="nv-pill">Read-only</span>
      </div>
      <input
        className="nv-input"
        placeholder="e.g., Explain this forecast; Explain this path; Explain these results"
        value={prompt}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(); }}
      />
      <div className="nv-row">
        <label><input type="radio" checked={scope === 'tenant'} onChange={() => onScopeChange('tenant')} /> Tenant</label>
        <label><input type="radio" checked={scope === 'federated'} onChange={() => onScopeChange('federated')} /> Federated (read-only)</label>
      </div>
      <div className="nv-chips">
        {contextChips.map((chip) => (
          <button key={chip.label} type="button" className="nv-chip" onClick={chip.onClick}>{chip.label}: {chip.value}</button>
        ))}
      </div>
      <p className="nv-sub">Deterministic explanations only; no new data, no biological inference, no execution.</p>
      <button className="nv-button" type="button" onClick={onSubmit}>Generate Explanation</button>
    </div>
  );
}
