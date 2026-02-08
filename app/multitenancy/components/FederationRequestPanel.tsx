import { FederationRequest } from '../federationTypes';

interface Props {
  requests: FederationRequest[];
}

export function FederationRequestPanel({ requests }: Props) {
  return (
    <section className="mt-card">
      <header className="mt-card-header">
        <div>
          <p className="mt-kicker">Federation</p>
          <h2>Requests</h2>
        </div>
      </header>
      <ul className="mt-list">
        {requests.map((req) => (
          <li key={req.requestId} className="mt-tile">
            <div className="mt-row">
              <strong>{req.fromTenant} → {req.toTenant}</strong>
              <span className="mt-pill">{req.status}</span>
            </div>
            <p className="mt-sub">Scope: {req.scope} · Read-only: {req.readOnly ? 'yes' : 'no'}</p>
            <p className="mt-sub">Resources: {req.resourceIds.join(', ') || 'None'}</p>
          </li>
        ))}
        {requests.length === 0 && <li>No federation requests</li>}
      </ul>
    </section>
  );
}
