import { SOPDocument } from '../sopTypes';

interface Props {
  versions: SOPDocument[];
}

export function SOPVersionHistoryViewer({ versions }: Props) {
  return (
    <section className="sop-card sop-card-ghost">
      <header className="sop-card-header">
        <div>
          <p className="sop-kicker">Versions</p>
          <h2>History</h2>
        </div>
      </header>
      <ul className="sop-list">
        {versions.map((doc) => (
          <li key={doc.version.versionId} className="sop-tile">
            <div className="sop-row">
              <strong>{doc.version.versionId}</strong>
              <span className="sop-pill">{doc.version.lifecycle}</span>
            </div>
            <p className="sop-sub">{doc.version.changeSummary.summary}</p>
            <p className="sop-sub">{doc.version.createdAt}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
