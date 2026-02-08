import { SandboxComparison } from '../sandboxTypes';

interface Props {
  comparison: SandboxComparison;
}

export function SandboxComparisonPanel({ comparison }: Props) {
  const items = [
    { label: 'Capacity units', delta: comparison.capacityDelta.delta, trend: comparison.capacityDelta.trend },
    { label: 'Throughput (batches)', delta: comparison.throughputDelta.delta, trend: comparison.throughputDelta.trend },
    { label: 'Yield (units)', delta: comparison.yieldDelta.delta, trend: comparison.yieldDelta.trend },
    { label: 'Energy (kWh)', delta: comparison.energyDelta.delta, trend: comparison.energyDelta.trend },
    { label: 'Labor (hrs)', delta: comparison.laborDelta.delta, trend: comparison.laborDelta.trend },
  ];

  return (
    <section className="sb-card">
      <header className="sb-card-header">
        <div>
          <p className="sb-kicker">Comparison</p>
          <h2>Baseline vs Scenario</h2>
        </div>
        <span className="sb-meta">Baseline: {comparison.baselineId}</span>
      </header>
      <div className="sb-grid">
        {items.map((item) => (
          <div key={item.label} className="sb-tile">
            <div className="sb-tile-top">
              <strong>{item.label}</strong>
              <span className={`sb-pill sb-pill-${item.trend}`}>{item.trend}</span>
            </div>
            <p>Δ {item.delta.toFixed(1)}</p>
          </div>
        ))}
      </div>
      <div className="sb-list-block">
        <p className="sb-label">Room utilization deltas</p>
        <ul className="sb-list">
          {comparison.roomUtilizationDelta.map((r) => (
            <li key={r.roomId}>{r.roomId}: {r.delta.toFixed(1)}% ({r.trend})</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
