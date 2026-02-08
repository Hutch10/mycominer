import { ComplianceReport } from '../complianceTypes';

interface Props {
  report: ComplianceReport;
}

export function ComplianceReportViewer({ report }: Props) {
  return (
    <section className="cp-card">
      <header className="cp-card-header">
        <div>
          <p className="cp-kicker">Report</p>
          <h2>Compliance Report</h2>
        </div>
        <span className="cp-meta">{report.period} · {report.from} - {report.to}</span>
      </header>
      <div className="cp-grid">
        <div>
          <p className="cp-label">Events</p>
          <strong>{report.events.length}</strong>
        </div>
        <div>
          <p className="cp-label">Deviations</p>
          <strong>{report.deviations.length}</strong>
        </div>
        <div>
          <p className="cp-label">Critical events</p>
          <strong>{report.scorecard.reduce((s, c) => s + c.critical, 0)}</strong>
        </div>
      </div>
      <div className="cp-list-block">
        <p className="cp-label">Scorecard</p>
        <ul className="cp-list">
          {report.scorecard.map((s) => (
            <li key={s.category} className="cp-tile cp-tile-soft">
              <div className="cp-row">
                <strong>{s.category}</strong>
                <span className="cp-pill">{s.count}</span>
              </div>
              <p className="cp-sub">Critical: {s.critical}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
