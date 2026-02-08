import { DeviationRecord } from '../complianceTypes';

interface Props {
  deviations: DeviationRecord[];
}

export function DeviationPanel({ deviations }: Props) {
  return (
    <section className="cp-card">
      <header className="cp-card-header">
        <div>
          <p className="cp-kicker">Deviations</p>
          <h2>SOP & Operational Deviations</h2>
        </div>
      </header>
      <ul className="cp-list">
        {deviations.map((d) => (
          <li key={d.deviationId} className="cp-tile">
            <div className="cp-row">
              <strong>{d.description}</strong>
              <span className={`cp-pill cp-pill-${d.severity}`}>{d.severity}</span>
            </div>
            <p className="cp-sub">{d.source} · {d.timestamp}</p>
            {d.expected && <p className="cp-sub">Expected: {d.expected}</p>}
            {d.observed && <p className="cp-sub">Observed: {d.observed}</p>}
            {d.rootCause && <p className="cp-sub">Root cause: {d.rootCause}</p>}
            {d.correctiveAction && <p className="cp-sub">Corrective: {d.correctiveAction.description} ({d.correctiveAction.status})</p>}
            {d.preventiveAction && <p className="cp-sub">Preventive: {d.preventiveAction.description} ({d.preventiveAction.status})</p>}
          </li>
        ))}
        {deviations.length === 0 && <li>No deviations recorded</li>}
      </ul>
    </section>
  );
}
