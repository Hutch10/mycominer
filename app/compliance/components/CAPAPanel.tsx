import { DeviationRecord } from '../complianceTypes';

interface Props {
  deviations: DeviationRecord[];
}

export function CAPAPanel({ deviations }: Props) {
  return (
    <section className="cp-card cp-card-soft">
      <header className="cp-card-header">
        <div>
          <p className="cp-kicker">CAPA</p>
          <h2>Corrective & Preventive Actions</h2>
        </div>
      </header>
      <ul className="cp-list">
        {deviations.map((d) => (
          <li key={`${d.deviationId}-capa`} className="cp-tile">
            <strong>{d.description}</strong>
            {d.correctiveAction && <p className="cp-sub">Corrective: {d.correctiveAction.description} · {d.correctiveAction.status}</p>}
            {d.preventiveAction && <p className="cp-sub">Preventive: {d.preventiveAction.description} · {d.preventiveAction.status}</p>}
            {!d.correctiveAction && !d.preventiveAction && <p className="cp-sub">No CAPA recorded</p>}
          </li>
        ))}
        {deviations.length === 0 && <li>No CAPA items</li>}
      </ul>
    </section>
  );
}
