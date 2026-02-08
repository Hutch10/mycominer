import { ForecastingReport } from '../forecastingTypes';

interface Props {
  report: ForecastingReport;
}

export function ForecastingReportViewer({ report }: Props) {
  return (
    <section className="fc-card fc-card-ghost">
      <header className="fc-card-header">
        <div>
          <p className="fc-kicker">Report</p>
          <h2>Forecasting Report</h2>
        </div>
        <span className="fc-meta">{report.timestamp}</span>
      </header>
      <div className="fc-strip">
        <div>
          <p className="fc-label">Throughput entries</p>
          <strong>{report.throughput.length}</strong>
        </div>
        <div>
          <p className="fc-label">Yield ranges</p>
          <strong>{report.yieldRanges.length}</strong>
        </div>
        <div>
          <p className="fc-label">Insights</p>
          <strong>{report.insights.length}</strong>
        </div>
      </div>
      <div className="fc-links">
        <a href="/commandCenter">Command Center</a>
        <a href="/digitalTwin">Digital Twin</a>
        <a href="/workflows">Workflows</a>
        <a href="/resources">Resources</a>
        <a href="/execution">Execution</a>
        <a href="/optimization">Optimization</a>
        <a href="/multiFacility">Multi-Facility</a>
      </div>
    </section>
  );
}
