"use client";

import React from 'react';
import { CopilotSuggestion } from '../copilotTypes';

interface Props {
  suggestion?: CopilotSuggestion;
}

export function CopilotPlaybookViewer({ suggestion }: Props) {
  if (!suggestion) {
    return (
      <div className="cp-card">
        <div className="cp-card-header">
          <h3>Playbook Details</h3>
          <span className="cp-pill">Idle</span>
        </div>
        <p className="cp-sub">Select a suggested playbook to view steps and references.</p>
      </div>
    );
  }

  return (
    <div className="cp-card">
      <div className="cp-card-header">
        <h3>{suggestion.title}</h3>
        <span className="cp-pill">{suggestion.federated ? 'Federated' : 'Tenant'}</span>
      </div>
      <p className="cp-sub">Guidance only; no actions executed. Steps reference existing SOPs/workflows.</p>
      <div className="cp-list">
        {suggestion.steps.map((step) => (
          <div key={step.id} className="cp-block">
            <div className="cp-row">
              <div>
                <p className="cp-label">Step</p>
                <p>{step.title}</p>
              </div>
              {step.safetyNote ? <span className="cp-pill-soft">Safety</span> : null}
            </div>
            {step.references.map((ref) => (
              <div key={ref.stepId} className="cp-row cp-row-dense">
                <div>
                  <p className="cp-label">Source</p>
                  <p>{ref.sourceType} · {ref.sourceId}</p>
                </div>
                <div>
                  <p className="cp-label">Description</p>
                  <p>{ref.description}</p>
                </div>
                {ref.safetyNote ? (
                  <div>
                    <p className="cp-label">Safety</p>
                    <p>{ref.safetyNote}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="cp-row">
        <button className="cp-button ghost" type="button">Explain Why These Steps (Phase 25 hook)</button>
        <button className="cp-button ghost" type="button">Open SOP</button>
        <button className="cp-button ghost" type="button">Open Compliance Record</button>
        <button className="cp-button ghost" type="button">Open in Sandbox</button>
      </div>
    </div>
  );
}
