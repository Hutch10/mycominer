import { Tenant } from '../tenantTypes';

interface Props {
  tenant: Tenant;
}

export function TenantConfigPanel({ tenant }: Props) {
  return (
    <section className="mt-card">
      <header className="mt-card-header">
        <div>
          <p className="mt-kicker">Config</p>
          <h2>Tenant Config & Quotas</h2>
        </div>
        <span className="mt-pill">{tenant.status}</span>
      </header>
      <div className="mt-grid">
        <div>
          <p className="mt-label">Owner</p>
          <strong>{tenant.owner}</strong>
        </div>
        <div>
          <p className="mt-label">Contact</p>
          <strong>{tenant.contact}</strong>
        </div>
        <div>
          <p className="mt-label">Max facilities</p>
          <strong>{tenant.quotas.maxFacilities}</strong>
        </div>
        <div>
          <p className="mt-label">Max workflows</p>
          <strong>{tenant.quotas.maxWorkflows}</strong>
        </div>
        <div>
          <p className="mt-label">Sandbox scenarios</p>
          <strong>{tenant.quotas.maxSandboxScenarios}</strong>
        </div>
        <div>
          <p className="mt-label">Storage</p>
          <strong>{tenant.quotas.storageGb} GB</strong>
        </div>
      </div>
      <div className="mt-list-block">
        <p className="mt-label">Boundary (non-exhaustive)</p>
        <ul className="mt-list">
          <li>Workflows: {tenant.boundary.workflows.length}</li>
          <li>Resources: {tenant.boundary.resources.length}</li>
          <li>Execution: {tenant.boundary.execution.length}</li>
          <li>SOPs: {tenant.boundary.sops.length}</li>
          <li>Compliance logs: {tenant.boundary.complianceLogs.length}</li>
        </ul>
      </div>
    </section>
  );
}
