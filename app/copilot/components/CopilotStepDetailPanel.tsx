"use client";

import React from 'react';
import { CopilotSuggestion, CopilotStepReference } from '../copilotTypes';

interface Props {
  suggestion?: CopilotSuggestion;
  selectedRef?: CopilotStepReference;
  onSelectRef: (ref: CopilotStepReference) => void;
}

export function CopilotStepDetailPanel({ suggestion, selectedRef, onSelectRef }: Props) {
  const refs = suggestion?.steps.flatMap((s) => s.references) ?? [];

  return (
    <div className="cp-card cp-card-soft">
      <div className="cp-card-header">
        <h3>Step References</h3>
        <span className="cp-pill">Traceable</span>
      </div>
      <p className="cp-sub">All steps map to SOPs, workflows, or playbooks; no new actions.</p>
      <div className="cp-list">
        {refs.map((ref) => (
          <button key={ref.stepId} className="cp-link" onClick={() => onSelectRef(ref)}>
            <div className="cp-row cp-row-dense">
              <div>
                <p className="cp-label">Source</p>
                <p>{ref.sourceType} · {ref.sourceId}</p>
              </div>
              <div>
                <p className="cp-label">Description</p>
                <p>{ref.description}</p>
              </div>
              {ref.safetyNote ? <span className="cp-pill-soft">Safety</span> : null}
            </div>
          </button>
        ))}
        {!refs.length && <p className="cp-sub">No references selected.</p>}
      </div>
      {selectedRef && (
        <div className="cp-block">
          <p className="cp-label">Selected Reference</p>
          <p>{selectedRef.description}</p>
          <p className="cp-sub">Source: {selectedRef.sourceType} · {selectedRef.sourceId}</p>
          {selectedRef.safetyNote ? <p className="cp-sub">Safety: {selectedRef.safetyNote}</p> : null}
        </div>
      )}
    </div>
  );
}
