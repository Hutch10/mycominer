import { YieldRangeEstimate } from '../forecastingTypes';

interface Props {
  yieldRanges: YieldRangeEstimate[];
}

export function YieldRangePanel({ yieldRanges }: Props) {
  return (
    <section className="fc-card">
      <header className="fc-card-header">
        <div>
          <p className="fc-kicker">Yield (Non-biological)</p>
          <h2>Volume Ranges</h2>
        </div>
      </header>
      <div className="fc-grid">
        {yieldRanges.map((y) => (
          <div key={y.workflowId} className="fc-tile fc-tile-soft">
            <div className="fc-tile-top">
              <strong>{y.workflowName}</strong>
              <span>{y.volumeMin}–{y.volumeMax} units</span>
            </div>
            <p>Batches: {y.batchesMin}–{y.batchesMax}</p>
            <p className="fc-explain">{y.explain}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
