import { Tenant } from '../tenantTypes';

interface Props {
  tenants: Tenant[];
  onSelect: (tenant: Tenant) => void;
}

export function TenantListPanel({ tenants, onSelect }: Props) {
  return (
    <section className="mt-card">
      <header className="mt-card-header">
        <div>
          <p className="mt-kicker">Tenants</p>
          <h2>Tenant Directory</h2>
        </div>
      </header>
      <ul className="mt-list">
        {tenants.map((tenant) => (
          <li key={tenant.tenantId}>
            <button type="button" className="mt-link" onClick={() => onSelect(tenant)}>
              <div className="mt-row">
                <div>
                  <strong>{tenant.name}</strong>
                  <p className="mt-sub">{tenant.status}</p>
                </div>
                <span className="mt-pill">Facilities: {tenant.clusters.reduce((sum, c) => sum + c.facilities.length, 0)}</span>
              </div>
            </button>
          </li>
        ))}
        {tenants.length === 0 && <li>No tenants</li>}
      </ul>
    </section>
  );
}
