import { BottleneckAnalysis } from '../forecastingTypes';

interface Props {
  bottlenecks: BottleneckAnalysis;
}

export function BottleneckPanel({ bottlenecks }: Props) {
  return (
    <section className="fc-card">
      <header className="fc-card-header">
        <div>
          <p className="fc-kicker">Bottlenecks</p>
          <h2>Constraint Highlights</h2>
        </div>
      </header>
      {bottlenecks.bottlenecks.length === 0 && <p>No bottlenecks detected.</p>}
      <div className="fc-grid">
        {bottlenecks.bottlenecks.map((b) => (
          <div key={`${b.type}-${b.id}`} className="fc-tile">
            <div className="fc-tile-top">
              <strong>{b.type}</strong>
              <span className={`fc-pill fc-pill-${b.severity}`}>{b.severity}</span>
            </div>
            <p>{b.detail}</p>
            <p className="fc-label">ID: {b.id}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
