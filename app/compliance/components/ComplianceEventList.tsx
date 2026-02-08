import { ComplianceEvent } from '../complianceTypes';

interface Props {
  events: ComplianceEvent[];
}

export function ComplianceEventList({ events }: Props) {
  return (
    <section className="cp-card">
      <header className="cp-card-header">
        <div>
          <p className="cp-kicker">Events</p>
          <h2>Compliance Events</h2>
        </div>
      </header>
      <ul className="cp-list">
        {events.map((ev) => (
          <li key={ev.eventId} className="cp-tile">
            <div className="cp-row">
              <strong>{ev.summary}</strong>
              <span className={`cp-pill cp-pill-${ev.severity}`}>{ev.severity}</span>
            </div>
            <p className="cp-sub">{ev.category} · {ev.timestamp}</p>
            {ev.details && <p className="cp-sub">{ev.details}</p>}
          </li>
        ))}
        {events.length === 0 && <li>No events logged</li>}
      </ul>
    </section>
  );
}
