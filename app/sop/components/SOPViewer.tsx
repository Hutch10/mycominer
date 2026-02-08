import { SOPDocument } from '../sopTypes';

interface Props {
  sop: SOPDocument;
}

export function SOPViewer({ sop }: Props) {
  return (
    <section className="sop-card">
      <header className="sop-card-header">
        <div>
          <p className="sop-kicker">SOP</p>
          <h2>{sop.title}</h2>
          <p className="sop-sub">Category: {sop.category} · Version: {sop.version.versionId} ({sop.version.lifecycle})</p>
        </div>
      </header>
      <div className="sop-section">
        <h3>Safety Notes</h3>
        <ul className="sop-list">
          {sop.safety.map((note) => (
            <li key={note.noteId} className="sop-tile">
              <div className="sop-row">
                <strong>{note.title}</strong>
                <span className={`sop-pill sop-pill-${note.severity}`}>{note.severity}</span>
              </div>
              <p className="sop-sub">{note.description}</p>
            </li>
          ))}
          {sop.safety.length === 0 && <li>No safety notes</li>}
        </ul>
      </div>
      <div className="sop-section">
        <h3>Resources</h3>
        <ul className="sop-list">
          {sop.resources.map((r) => (
            <li key={r.resourceId} className="sop-tile">
              <div className="sop-row">
                <strong>{r.name}</strong>
                <span className="sop-sub">{r.type} · {r.quantity} {r.unit}</span>
              </div>
              {r.availabilityWindow && <p className="sop-sub">Window: {r.availabilityWindow}</p>}
            </li>
          ))}
          {sop.resources.length === 0 && <li>No resources listed</li>}
        </ul>
      </div>
      <div className="sop-section">
        <h3>Sections & Steps</h3>
        {sop.sections.map((section) => (
          <div key={section.sectionId} className="sop-tile">
            <div className="sop-row">
              <strong>{section.title}</strong>
              {section.summary && <span className="sop-sub">{section.summary}</span>}
            </div>
            <ol className="sop-steps">
              {section.steps.map((step) => (
                <li key={step.stepId}>
                  <div className="sop-row">
                    <strong>{step.title}</strong>
                    {step.durationMinutes !== undefined && <span className="sop-sub">{step.durationMinutes} min</span>}
                  </div>
                  <p className="sop-sub">{step.description}</p>
                </li>
              ))}
              {section.steps.length === 0 && <li>No steps listed</li>}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
