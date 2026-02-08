import { SOPDocument } from '../sopTypes';

interface Props {
  sops: SOPDocument[];
  onSelect: (sop: SOPDocument) => void;
}

export function SOPListPanel({ sops, onSelect }: Props) {
  return (
    <section className="sop-card">
      <header className="sop-card-header">
        <div>
          <p className="sop-kicker">SOPs</p>
          <h2>Library</h2>
        </div>
      </header>
      <ul className="sop-list">
        {sops.map((sop) => (
          <li key={sop.sopId}>
            <button type="button" className="sop-link" onClick={() => onSelect(sop)}>
              <div className="sop-row">
                <div>
                  <strong>{sop.title}</strong>
                  <p className="sop-sub">{sop.category}</p>
                </div>
                <span className="sop-pill">{sop.version.lifecycle}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
