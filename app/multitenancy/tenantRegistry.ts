import { FacilityCluster, Tenant, TenantConfig, TenantLogEntry, TenantResourceQuota } from './tenantTypes';
import { addTenantLog } from './tenantLog';

const tenants = new Map<string, Tenant>();

export function registerTenant(config: Omit<TenantConfig, 'createdAt'> & { owner: string; contact: string }): Tenant {
  const createdAt = new Date().toISOString();
  const tenant: Tenant = { ...config, createdAt, owner: config.owner, contact: config.contact };
  tenants.set(config.tenantId, tenant);
  addTenantLog({ category: 'registry', message: `Tenant registered: ${config.name}`, context: { tenantId: config.tenantId } });
  return tenant;
}

export function unregisterTenant(tenantId: string): void {
  tenants.delete(tenantId);
  addTenantLog({ category: 'registry', message: `Tenant unregistered`, context: { tenantId } });
}

export function getTenant(tenantId: string): Tenant | undefined {
  return tenants.get(tenantId);
}

export function listTenants(): Tenant[] {
  return Array.from(tenants.values());
}

export function updateQuotas(tenantId: string, quotas: TenantResourceQuota): Tenant | undefined {
  const tenant = tenants.get(tenantId);
  if (!tenant) return undefined;
  const updated = { ...tenant, quotas };
  tenants.set(tenantId, updated);
  addTenantLog({ category: 'quota', message: `Quotas updated`, context: { tenantId }, details: quotas });
  return updated;
}

export function assignFacilityCluster(tenantId: string, cluster: FacilityCluster): Tenant | undefined {
  const tenant = tenants.get(tenantId);
  if (!tenant) return undefined;
  const clusters = tenant.clusters.filter((c) => c.clusterId !== cluster.clusterId);
  clusters.push(cluster);
  const updated = { ...tenant, clusters };
  tenants.set(tenantId, updated);
  addTenantLog({ category: 'registry', message: `Cluster assigned: ${cluster.name}`, context: { tenantId, clusterId: cluster.clusterId } });
  return updated;
}
