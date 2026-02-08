import { FederationEvent, FederationRequest } from './federationTypes';

const federationLog: FederationEvent[] = [];

export function logFederationRequest(request: FederationRequest): FederationEvent {
  const event: FederationEvent = {
    eventId: `fed-${Date.now()}`,
    requestId: request.requestId,
    timestamp: new Date().toISOString(),
    summary: `Federation request ${request.requestId} from ${request.fromTenant} to ${request.toTenant}`,
    details: JSON.stringify({ scope: request.scope, readOnly: request.readOnly, resources: request.resourceIds }),
  };
  federationLog.unshift(event);
  return event;
}

export function logFederationEvent(event: FederationEvent): FederationEvent {
  federationLog.unshift(event);
  return event;
}

export function getFederationLog(limit = 100): FederationEvent[] {
  return federationLog.slice(0, limit);
}
