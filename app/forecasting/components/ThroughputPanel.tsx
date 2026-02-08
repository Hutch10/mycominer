"use client";

import { ThroughputEstimate } from '../forecastingTypes';

interface Props {
  throughput: ThroughputEstimate[];
  onExplain?: (throughput: ThroughputEstimate) => void;
}

export function ThroughputPanel({ throughput, onExplain }: Props) {
  return (
    <section className="fc-card">
      <header className="fc-card-header">
        <div>
          <p className="fc-kicker">Throughput</p>
          <h2>Deterministic Batch Ranges</h2>
        </div>
      </header>
      <div className="fc-grid">
        {throughput.map((t) => (
          <div key={t.workflowId} className="fc-tile">
            <div className="fc-tile-top">
              <strong>{t.workflowName}</strong>
              <span>{t.batchesMin}–{t.batchesMax} batches</span>
            </div>
            <p>Cycle: {t.cycleTimeDays.toFixed(1)}d · Constraint: {t.governingConstraint}</p>
            <p className="fc-explain">{t.explain}</p>
            <button
              type="button"
              className="fc-btn"
              onClick={() => onExplain?.(t)}
              aria-label={`Explain forecast for ${t.workflowName}`}
            >
              Explain This Forecast
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
