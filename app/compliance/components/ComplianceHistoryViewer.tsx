import { ComplianceLogEntry } from '../complianceTypes';

interface Props {
  history: ComplianceLogEntry[];
}

export function ComplianceHistoryViewer({ history }: Props) {
  return (
    <section className="cp-card cp-card-ghost">
      <header className="cp-card-header">
        <div>
          <p className="cp-kicker">History</p>
          <h2>Compliance Log</h2>
        </div>
      </header>
      <ul className="cp-history">
        {history.map((entry) => (
          <li key={entry.entryId} className="cp-history-row">
            <span className="cp-pill cp-pill-soft">{entry.category}</span>
            <span className="cp-history-msg">{entry.message}</span>
            <span className="cp-history-time">{entry.timestamp}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
