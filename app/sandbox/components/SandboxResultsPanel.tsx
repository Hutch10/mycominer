import { SandboxResult } from '../sandboxTypes';

interface Props {
  result: SandboxResult;
}

export function SandboxResultsPanel({ result }: Props) {
  return (
    <section className="sb-card">
      <header className="sb-card-header">
        <div>
          <p className="sb-kicker">Results</p>
          <h2>Scenario Outputs (Non-binding)</h2>
        </div>
        <span className="sb-pill">Sandbox</span>
      </header>
      <div className="sb-grid">
        <div>
          <p className="sb-label">Energy</p>
          <strong>{result.energyEstimateKwh} kWh</strong>
        </div>
        <div>
          <p className="sb-label">Labor</p>
          <strong>{result.laborHoursEstimate.toFixed(1)} hrs</strong>
        </div>
        <div>
          <p className="sb-label">Throughput entries</p>
          <strong>{result.forecast.throughput.length}</strong>
        </div>
        <div>
          <p className="sb-label">Yield ranges</p>
          <strong>{result.forecast.yieldRanges.length}</strong>
        </div>
      </div>
    </section>
  );
}
