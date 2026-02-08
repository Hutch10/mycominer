import { SandboxLogEntry } from '../sandboxTypes';

interface Props {
  history: SandboxLogEntry[];
}

export function SandboxHistoryViewer({ history }: Props) {
  return (
    <section className="sb-card sb-card-ghost">
      <header className="sb-card-header">
        <div>
          <p className="sb-kicker">History</p>
          <h2>Sandbox Log</h2>
        </div>
      </header>
      <ul className="sb-history">
        {history.map((entry) => (
          <li key={entry.entryId} className="sb-history-row">
            <span className="sb-pill sb-pill-soft">{entry.category}</span>
            <span className="sb-history-msg">{entry.message}</span>
            <span className="sb-history-time">{entry.timestamp}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
