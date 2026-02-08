import { TenantDashboard } from './components/TenantDashboard';
import { initTenant, getTenantEngineState, setQuotas, assignCluster } from './tenantEngine';
import { TenantResourceQuota, FacilityCluster } from './tenantTypes';
import { processFederation } from './federationEngine';
import { FederationRequest, FederationPolicy } from './federationTypes';
import { getFederationLog } from './federationLog';

const baseQuotas: TenantResourceQuota = {
  maxFacilities: 6,
  maxUsers: 50,
  maxWorkflows: 120,
  maxSandboxScenarios: 40,
  storageGb: 500,
};

const tenantA = initTenant({
  tenantId: 'tenant-alpha',
  name: 'Alpha Myco Ops',
  status: 'active',
  quotas: baseQuotas,
  clusters: [],
  boundary: {
    workflows: ['wf-prep-fruit', 'wf-fast-cycle'],
    resources: ['eq-autoclave', 'room-prep', 'room-fruit'],
    execution: ['exec-1'],
    telemetry: ['telemetry-fruit'],
    sops: ['sop-alpha'],
    complianceLogs: ['comp-alpha'],
    sandboxScenarios: ['sandbox-alpha'],
    forecasting: ['forecast-alpha'],
    digitalTwin: ['dt-alpha'],
  },
  owner: 'ops-admin@alpha.com',
  contact: 'ops-admin@alpha.com',
});

const tenantB = initTenant({
  tenantId: 'tenant-beta',
  name: 'Beta Labs',
  status: 'active',
  quotas: { ...baseQuotas, maxFacilities: 3 },
  clusters: [],
  boundary: {
    workflows: ['wf-beta-sterile'],
    resources: ['eq-beta-autoclave', 'room-beta-clean'],
    execution: ['exec-2'],
    telemetry: ['telemetry-beta'],
    sops: ['sop-beta'],
    complianceLogs: ['comp-beta'],
    sandboxScenarios: ['sandbox-beta'],
    forecasting: ['forecast-beta'],
    digitalTwin: ['dt-beta'],
  },
  owner: 'admin@beta.com',
  contact: 'admin@beta.com',
});

const clusterA: FacilityCluster = { clusterId: 'cluster-north', name: 'North Campus', facilities: ['facility-01', 'facility-02'] };
const clusterB: FacilityCluster = { clusterId: 'cluster-south', name: 'South Lab', facilities: ['facility-03'] };
assignCluster(tenantA.tenantId, clusterA);
assignCluster(tenantB.tenantId, clusterB);
setQuotas(tenantB.tenantId, { ...tenantB.quotas, maxSandboxScenarios: 20 });

const federationRequest: FederationRequest = {
  requestId: 'fred-1',
  fromTenant: tenantA.tenantId,
  toTenant: tenantB.tenantId,
  scope: 'sop',
  resourceIds: ['sop-alpha-template'],
  readOnly: true,
  createdAt: new Date().toISOString(),
  status: 'pending',
};

const policy: FederationPolicy = {
  policyId: 'policy-readonly-sop',
  description: 'Allow read-only SOP template sharing',
  allowedScopes: ['sop'],
  readOnly: true,
  requiresApproval: true,
};

const federationResult = processFederation({ request: federationRequest, policy });
const { tenants, log } = getTenantEngineState();
const federationHistory = getFederationLog(50);

export default function TenantPage() {
  const selectedTenants = tenants;
  const approvals = federationResult.approval ? [federationResult.approval] : [];
  const requests = [federationRequest];

  return (
    <main>
      <TenantDashboard tenants={selectedTenants} requests={requests} approvals={approvals} history={federationHistory} />
      <section style={{ padding: '0 24px 24px' }}>
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px', background: '#fff' }}>
          <h3 style={{ marginTop: 0, color: '#0f172a' }}>Multitenancy Guardrails</h3>
          <ul style={{ color: '#334155' }}>
            <li>No cross-tenant data leakage; boundaries wrap workflows, resources, execution, telemetry, SOPs, compliance, sandbox, forecasting, and digital twin.</li>
            <li>Federation is opt-in, read-only, policy-checked, and audit-logged; no auto-execution across tenants.</li>
            <li>Admin-only tenant creation; facility assignment and quotas must be explicit.</li>
            <li>Integrations: Command Center (Phase 24), Marketplace (Phase 27), SOP Engine (Phase 31), Compliance Engine (Phase 32).</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
