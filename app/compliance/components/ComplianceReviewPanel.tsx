import { ComplianceReview } from '../complianceTypes';

interface Props {
  review: ComplianceReview;
  onApprove?: () => void;
  onReject?: () => void;
}

export function ComplianceReviewPanel({ review, onApprove, onReject }: Props) {
  return (
    <section className="cp-card cp-card-soft">
      <header className="cp-card-header">
        <div>
          <p className="cp-kicker">Review</p>
          <h2>Compliance Review Workflow</h2>
        </div>
        <span className="cp-pill">{review.status}</span>
      </header>
      <div className="cp-list-block">
        <p className="cp-label">Comments</p>
        <ul className="cp-list">
          {review.reviewerComments.map((c, idx) => (
            <li key={idx} className="cp-tile">{c}</li>
          ))}
          {review.reviewerComments.length === 0 && <li>No comments</li>}
        </ul>
      </div>
      <div className="cp-list-block">
        <p className="cp-label">Approvals</p>
        <ul className="cp-list">
          {review.approvals.map((a, idx) => (
            <li key={idx} className="cp-tile">
              <div className="cp-row">
                <strong>{a.reviewer}</strong>
                <span className="cp-sub">{a.decision}</span>
              </div>
              <p className="cp-sub">{a.timestamp}</p>
              {a.reason && <p className="cp-sub">{a.reason}</p>}
            </li>
          ))}
          {review.approvals.length === 0 && <li>No approvals yet</li>}
        </ul>
      </div>
      <div className="cp-actions">
        <button type="button" className="cp-btn" onClick={onApprove}>Approve</button>
        <button type="button" className="cp-btn cp-btn-ghost" onClick={onReject}>Reject</button>
      </div>
    </section>
  );
}
