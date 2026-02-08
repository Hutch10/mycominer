import { ForecastingLogEntry } from '../forecastingTypes';

interface Props {
  history: ForecastingLogEntry[];
}

export function ForecastingHistoryViewer({ history }: Props) {
  return (
    <section className="fc-card fc-card-ghost">
      <header className="fc-card-header">
        <div>
          <p className="fc-kicker">History</p>
          <h2>Forecasting Log</h2>
        </div>
      </header>
      <ul className="fc-history">
        {history.map((entry) => (
          <li key={entry.entryId}>
            <div className="fc-history-row">
              <span className="fc-pill fc-pill-soft">{entry.category}</span>
              <span className="fc-history-msg">{entry.message}</span>
              <span className="fc-history-time">{entry.timestamp}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
