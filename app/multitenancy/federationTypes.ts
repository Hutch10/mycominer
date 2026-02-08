import { TenantLogEntry } from './tenantTypes';

export interface FederationRequest {
  requestId: string;
  fromTenant: string;
  toTenant: string;
  scope: 'workflow' | 'resource' | 'sop' | 'optimization' | 'report';
  resourceIds: string[];
  readOnly: boolean;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface FederationApproval {
  approvalId: string;
  requestId: string;
  approver: string;
  decision: 'approved' | 'rejected';
  reason?: string;
  timestamp: string;
}

export interface FederationChannel {
  channelId: string;
  fromTenant: string;
  toTenant: string;
  policyId: string;
  status: 'active' | 'revoked';
  createdAt: string;
}

export interface FederationPolicy {
  policyId: string;
  description: string;
  allowedScopes: FederationRequest['scope'][];
  readOnly: boolean;
  requiresApproval: boolean;
}

export interface FederationEvent {
  eventId: string;
  requestId: string;
  channelId?: string;
  timestamp: string;
  summary: string;
  details?: string;
}

export type FederationLogEntry = TenantLogEntry & { category: 'federation' | TenantLogEntry['category'] };
