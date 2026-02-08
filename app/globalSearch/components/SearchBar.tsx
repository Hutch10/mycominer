"use client";

import React from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function SearchBar({ value, onChange, onSubmit }: Props) {
  return (
    <div className="gs-card">
      <div className="gs-row">
        <input
          className="gs-input"
          placeholder="Search workflows, SOPs, facilities, deviations..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit();
          }}
        />
        <button type="button" className="gs-button" onClick={onSubmit}>Search</button>
      </div>
      <p className="gs-sub">Natural-language style allowed, but results are deterministic and read-only.</p>
    </div>
  );
}
