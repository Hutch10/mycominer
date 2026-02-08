"use client";

import React from 'react';
import { SandboxScenario } from '../sandboxTypes';

interface Props {
  scenario: SandboxScenario;
  onCloneFromLive?: () => void;
  onPromote?: (scenario: SandboxScenario) => void;
}

export function ScenarioBuilderPanel({ scenario, onCloneFromLive, onPromote }: Props) {
  return (
    <section className="sb-card">
      <header className="sb-card-header">
        <div>
          <p className="sb-kicker">Sandbox / What If</p>
          <h2>Scenario Builder</h2>
        </div>
        <div className="sb-actions">
          <button type="button" className="sb-btn" onClick={onCloneFromLive}>
            Clone from Live
          </button>
          <button
            type="button"
            className="sb-btn sb-btn-ghost"
            onClick={() => onPromote?.(scenario)}
            aria-label="Promote sandbox scenario (proposal only)"
          >
            Promote Scenario
          </button>
        </div>
      </header>
      <div className="sb-grid">
        <div>
          <p className="sb-label">Name</p>
          <strong>{scenario.name}</strong>
        </div>
        <div>
          <p className="sb-label">Status</p>
          <span className="sb-pill">{scenario.status}</span>
        </div>
        <div>
          <p className="sb-label">Baseline</p>
          <span>{scenario.baselineId ?? 'Live'}</span>
        </div>
        <div>
          <p className="sb-label">Created</p>
          <span>{scenario.createdAt}</span>
        </div>
      </div>
      {scenario.description && <p className="sb-desc">{scenario.description}</p>}
    </section>
  );
}
