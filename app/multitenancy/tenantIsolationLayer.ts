import { Tenant, TenantEvent } from './tenantTypes';
import { addTenantLog } from './tenantLog';

export interface IsolationCheckInput {
  tenant: Tenant;
  resourceId: string;
  resourceType: keyof Tenant['boundary'];
}

export function enforceIsolation(input: IsolationCheckInput): boolean {
  const allowed = input.tenant.boundary[input.resourceType].includes(input.resourceId);
  if (!allowed) {
    addTenantLog({ category: 'isolation', message: `Isolation block for ${input.resourceId}`, context: { tenantId: input.tenant.tenantId } });
  }
  return allowed;
}

export function recordTenantEvent(event: TenantEvent): TenantEvent {
  addTenantLog({ category: 'isolation', message: `Tenant event: ${event.summary}`, context: { tenantId: event.tenantId }, details: event });
  return event;
}
