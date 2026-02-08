import { FederationEvent } from '../federationTypes';

interface Props {
  history: FederationEvent[];
}

export function FederationHistoryViewer({ history }: Props) {
  return (
    <section className="mt-card mt-card-ghost">
      <header className="mt-card-header">
        <div>
          <p className="mt-kicker">History</p>
          <h2>Federation Log</h2>
        </div>
      </header>
      <ul className="mt-history">
        {history.map((entry) => (
          <li key={entry.eventId} className="mt-history-row">
            <span className="mt-pill mt-pill-soft">{entry.requestId}</span>
            <span className="mt-history-msg">{entry.summary}</span>
            <span className="mt-history-time">{entry.timestamp}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
