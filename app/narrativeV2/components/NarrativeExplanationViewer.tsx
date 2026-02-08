"use client";

import React from 'react';
import { NarrativeExplanation } from '../narrativeTypes';

interface Props {
  explanation?: NarrativeExplanation;
}

export function NarrativeExplanationViewer({ explanation }: Props) {
  if (!explanation) {
    return (
      <div className="nv-card">
        <div className="nv-card-header">
          <h3>Narrative</h3>
          <span className="nv-pill">Idle</span>
        </div>
        <p className="nv-sub">Run an explanation request to see sections and rationale.</p>
      </div>
    );
  }

  return (
    <div className="nv-card">
      <div className="nv-card-header">
        <h3>{explanation.target}</h3>
        <span className="nv-pill">{explanation.scope}</span>
      </div>
      <p className="nv-sub">Deterministic explanation; read-only; tenant scope enforced.</p>
      <div className="nv-list">
        {explanation.sections.map((sec, idx) => (
          <div key={`${sec.title}-${idx}`} className="nv-block">
            <div className="nv-row">
              <h4>{sec.title}</h4>
              {sec.safetyNote ? <span className="nv-pill-soft">Safety</span> : null}
            </div>
            <p className="nv-subtle">{sec.body}</p>
            {sec.safetyNote ? <p className="nv-sub">Safety: {sec.safetyNote}</p> : null}
          </div>
        ))}
      </div>
      <button className="nv-button ghost" type="button">Open in KG</button>
      <button className="nv-button ghost" type="button">Open in Search</button>
    </div>
  );
}
