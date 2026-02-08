import { FederationApproval, FederationChannel, FederationEvent, FederationPolicy, FederationRequest } from './federationTypes';
import { logFederationEvent, logFederationRequest } from './federationLog';
import { addTenantLog } from './tenantLog';

export interface FederationEngineInput {
  request: FederationRequest;
  policy: FederationPolicy;
}

export interface FederationEngineResult {
  request: FederationRequest;
  approval?: FederationApproval;
  channel?: FederationChannel;
  events: FederationEvent[];
}

export function processFederation(input: FederationEngineInput): FederationEngineResult {
  const events: FederationEvent[] = [];
  events.push(logFederationRequest(input.request));

  const approved = validatePolicy(input.request, input.policy);
  let approval: FederationApproval | undefined;
  let channel: FederationChannel | undefined;

  if (approved) {
    approval = {
      approvalId: `fap-${Date.now()}`,
      requestId: input.request.requestId,
      approver: 'policy-engine',
      decision: 'approved',
      timestamp: new Date().toISOString(),
    };
    channel = {
      channelId: `fch-${Date.now()}`,
      fromTenant: input.request.fromTenant,
      toTenant: input.request.toTenant,
      policyId: input.policy.policyId,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    events.push(logFederationEvent({
      eventId: `fed-approved-${Date.now()}`,
      requestId: input.request.requestId,
      channelId: channel.channelId,
      timestamp: new Date().toISOString(),
      summary: 'Federation approved',
      details: 'Read-only sharing established',
    }));
    addTenantLog({ category: 'federation', message: 'Federation approved', context: { tenantId: input.request.fromTenant } });
    addTenantLog({ category: 'federation', message: 'Federation approved', context: { tenantId: input.request.toTenant } });
  } else {
    approval = {
      approvalId: `fap-${Date.now()}`,
      requestId: input.request.requestId,
      approver: 'policy-engine',
      decision: 'rejected',
      reason: 'Policy rejected scope or readOnly setting',
      timestamp: new Date().toISOString(),
    };
    events.push(logFederationEvent({
      eventId: `fed-rejected-${Date.now()}`,
      requestId: input.request.requestId,
      timestamp: new Date().toISOString(),
      summary: 'Federation rejected',
      details: approval.reason,
    }));
    addTenantLog({ category: 'federation', message: 'Federation rejected', context: { tenantId: input.request.fromTenant }, details: approval.reason });
  }

  return { request: input.request, approval, channel, events };
}

function validatePolicy(request: FederationRequest, policy: FederationPolicy): boolean {
  if (!policy.allowedScopes.includes(request.scope)) return false;
  if (policy.readOnly && request.readOnly !== true) return false;
  if (policy.requiresApproval && request.status !== 'approved' && request.status !== 'pending') return false;
  return true;
}
