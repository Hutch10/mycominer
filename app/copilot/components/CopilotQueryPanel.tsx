"use client";

import React from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  contextChips: { label: string; value: string; onClick: () => void }[];
}

export function CopilotQueryPanel({ value, onChange, onSubmit, contextChips }: Props) {
  return (
    <div className="cp-card">
      <div className="cp-card-header">
        <h3>What do you need help with?</h3>
        <span className="cp-pill">Guidance only</span>
      </div>
      <input
        className="cp-input"
        placeholder="e.g., Over-temperature in Room A; deviation follow-up; cleaning cycle steps"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit();
        }}
      />
      <div className="cp-chips">
        {contextChips.map((chip) => (
          <button key={chip.label} type="button" className="cp-chip" onClick={chip.onClick}>
            {chip.label}: {chip.value}
          </button>
        ))}
      </div>
      <p className="cp-sub">No auto-execution. Suggestions must map to existing SOPs, workflows, or playbooks.</p>
      <button type="button" className="cp-button" onClick={onSubmit}>Get Guidance</button>
    </div>
  );
}
