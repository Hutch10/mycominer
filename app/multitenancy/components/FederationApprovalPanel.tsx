import { FederationApproval } from '../federationTypes';

interface Props {
  approvals: FederationApproval[];
}

export function FederationApprovalPanel({ approvals }: Props) {
  return (
    <section className="mt-card mt-card-soft">
      <header className="mt-card-header">
        <div>
          <p className="mt-kicker">Approvals</p>
          <h2>Federation Decisions</h2>
        </div>
      </header>
      <ul className="mt-list">
        {approvals.map((app) => (
          <li key={app.approvalId} className="mt-tile">
            <div className="mt-row">
              <strong>{app.decision}</strong>
              <span className="mt-sub">{app.timestamp}</span>
            </div>
            <p className="mt-sub">Request: {app.requestId}</p>
            {app.reason && <p className="mt-sub">Reason: {app.reason}</p>}
          </li>
        ))}
        {approvals.length === 0 && <li>No approvals yet</li>}
      </ul>
    </section>
  );
}
