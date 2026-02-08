import { SOPDocument } from '../sopTypes';

interface Props {
  current: SOPDocument;
  previous: SOPDocument;
}

export function SOPDiffViewer({ current, previous }: Props) {
  return (
    <section className="sop-card sop-card-soft">
      <header className="sop-card-header">
        <div>
          <p className="sop-kicker">Diff</p>
          <h2>Version Comparison</h2>
        </div>
      </header>
      <div className="sop-grid">
        <div>
          <p className="sop-label">Current</p>
          <strong>{current.version.versionId}</strong>
          <p className="sop-sub">Lifecycle: {current.version.lifecycle}</p>
        </div>
        <div>
          <p className="sop-label">Previous</p>
          <strong>{previous.version.versionId}</strong>
          <p className="sop-sub">Lifecycle: {previous.version.lifecycle}</p>
        </div>
      </div>
      <p className="sop-sub">Change summary: {current.version.changeSummary.summary}</p>
    </section>
  );
}
