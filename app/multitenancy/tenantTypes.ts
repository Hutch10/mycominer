// Phase 33: Multi-Tenant Hosting & Facility Federation types
// Deterministic, isolation-first structures

export type TenantStatus = 'active' | 'suspended' | 'decommissioned';

export interface TenantBoundary {
  workflows: string[];
  resources: string[];
  execution: string[];
  telemetry: string[];
  sops: string[];
  complianceLogs: string[];
  sandboxScenarios: string[];
  forecasting: string[];
  digitalTwin: string[];
}

export interface TenantResourceQuota {
  maxFacilities: number;
  maxUsers: number;
  maxWorkflows: number;
  maxSandboxScenarios: number;
  storageGb: number;
}

export interface FacilityCluster {
  clusterId: string;
  name: string;
  facilities: string[];
}

export interface TenantConfig {
  tenantId: string;
  name: string;
  status: TenantStatus;
  quotas: TenantResourceQuota;
  clusters: FacilityCluster[];
  boundary: TenantBoundary;
  createdAt: string;
}

export interface Tenant extends TenantConfig {
  owner: string;
  contact: string;
}

export type TenantEventCategory = 'tenant' | 'facility' | 'quota' | 'boundary' | 'federation';

export interface TenantEvent {
  eventId: string;
  tenantId: string;
  timestamp: string;
  category: TenantEventCategory;
  summary: string;
  details?: string;
  relatedIds?: string[];
}

export type TenantLogCategory = 'registry' | 'isolation' | 'quota' | 'federation' | 'approval' | 'rejection';

export interface TenantLogEntry {
  entryId: string;
  timestamp: string;
  category: TenantLogCategory;
  message: string;
  context?: {
    tenantId?: string;
    facilityId?: string;
    clusterId?: string;
  };
  details?: unknown;
}
