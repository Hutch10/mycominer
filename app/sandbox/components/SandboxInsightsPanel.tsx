import { SandboxInsight } from '../sandboxTypes';

interface Props {
  insights: SandboxInsight[];
}

export function SandboxInsightsPanel({ insights }: Props) {
  return (
    <section className="sb-card sb-card-soft">
      <header className="sb-card-header">
        <div>
          <p className="sb-kicker">Insights</p>
          <h2>Why This Scenario Matters</h2>
        </div>
      </header>
      <div className="sb-grid">
        {insights.map((insight) => (
          <div key={insight.insightId} className="sb-tile">
            <div className="sb-tile-top">
              <strong>{insight.summary}</strong>
              <span className={`sb-pill sb-pill-${insight.severity}`}>{insight.severity}</span>
            </div>
            <p>{insight.detail}</p>
            <p className="sb-label">When useful: {insight.whenUseful}</p>
            <p className="sb-label">Risks: {insight.risks}</p>
            <p className="sb-label">Rationale: {insight.rationale}</p>
          </div>
        ))}
        {insights.length === 0 && <p>No insights generated yet.</p>}
      </div>
    </section>
  );
}
