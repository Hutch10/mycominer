import { Tenant, TenantConfig, TenantResourceQuota } from './tenantTypes';
import { registerTenant, unregisterTenant, listTenants, updateQuotas, assignFacilityCluster } from './tenantRegistry';
import { enforceIsolation } from './tenantIsolationLayer';
import { addTenantLog, getTenantLog } from './tenantLog';

export interface TenantEngineResult {
  tenants: Tenant[];
  log: ReturnType<typeof getTenantLog>;
}

export function initTenant(config: Omit<TenantConfig, 'createdAt'> & { owner: string; contact: string }): Tenant {
  const tenant = registerTenant(config);
  addTenantLog({ category: 'registry', message: 'Tenant initialized', context: { tenantId: tenant.tenantId } });
  return tenant;
}

export function removeTenant(tenantId: string): void {
  unregisterTenant(tenantId);
}

export function setQuotas(tenantId: string, quotas: TenantResourceQuota): void {
  updateQuotas(tenantId, quotas);
}

export function assignCluster(tenantId: string, cluster: Tenant['clusters'][number]): void {
  assignFacilityCluster(tenantId, cluster);
}

export function checkAccess(tenant: Tenant, resourceId: string, resourceType: keyof Tenant['boundary']): boolean {
  return enforceIsolation({ tenant, resourceId, resourceType });
}

export function getTenantEngineState(): TenantEngineResult {
  return { tenants: listTenants(), log: getTenantLog(200) };
}
