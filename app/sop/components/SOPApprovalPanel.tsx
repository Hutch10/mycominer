import { SOPDocument } from '../sopTypes';

interface Props {
  sop: SOPDocument;
  onApprove?: (sop: SOPDocument) => void;
  onReject?: (sop: SOPDocument) => void;
}

export function SOPApprovalPanel({ sop, onApprove, onReject }: Props) {
  return (
    <section className="sop-card">
      <header className="sop-card-header">
        <div>
          <p className="sop-kicker">Approval</p>
          <h2>Review & Publish</h2>
        </div>
      </header>
      <p className="sop-sub">Lifecycle: {sop.version.lifecycle}</p>
      <div className="sop-actions">
        <button type="button" className="sop-btn" onClick={() => onApprove?.(sop)}>Approve</button>
        <button type="button" className="sop-btn sop-btn-ghost" onClick={() => onReject?.(sop)}>Reject</button>
      </div>
    </section>
  );
}
