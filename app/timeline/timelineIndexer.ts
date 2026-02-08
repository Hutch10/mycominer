import { TimelineEvent, TimelineFilter, IncidentThread } from './timelineTypes';
import { logTimeline } from './timelineLog';

export interface TimelineIndexerInput {
  events: TimelineEvent[];
}

function isTenantAllowed(event: TimelineEvent, tenantId: string, federatedTenantIds?: string[]): boolean {
  if (event.tenantId === tenantId) return true;
  return federatedTenantIds?.includes(event.tenantId) === true;
}

function applyScopeFilter(events: TimelineEvent[], tenantId: string, federatedTenantIds?: string[]): TimelineEvent[] {
  return events.filter((e) => isTenantAllowed(e, tenantId, federatedTenantIds));
}

export function filterTimeline(events: TimelineEvent[], filter: TimelineFilter, tenantId: string, federatedTenantIds?: string[]): TimelineEvent[] {
  let filtered = applyScopeFilter(events, tenantId, federatedTenantIds);

  if (filter.facilities?.length) filtered = filtered.filter((e) => e.facilityId && filter.facilities?.includes(e.facilityId));
  if (filter.rooms?.length) filtered = filtered.filter((e) => e.roomId && filter.rooms?.includes(e.roomId));
  if (filter.eventTypes?.length) filtered = filtered.filter((e) => filter.eventTypes?.includes(e.type));
  if (filter.severities?.length) filtered = filtered.filter((e) => filter.severities?.includes(e.severity));
  if (filter.workflowIds?.length) filtered = filtered.filter((e) => e.workflowId && filter.workflowIds?.includes(e.workflowId));

  if (filter.startTime) filtered = filtered.filter((e) => e.timestamp >= filter.startTime!);
  if (filter.endTime) filtered = filtered.filter((e) => e.timestamp <= filter.endTime!);

  return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function groupIncidentEvents(events: TimelineEvent[]): Map<string, TimelineEvent[]> {
  const threads = new Map<string, TimelineEvent[]>();
  const pending: TimelineEvent[] = [];

  events.forEach((e) => {
    if (e.incidentThreadId) {
      const list = threads.get(e.incidentThreadId) ?? [];
      threads.set(e.incidentThreadId, [...list, e]);
    } else if (['deviation', 'CAPAAction', 'SOPChange', 'environmentalException'].includes(e.type)) {
      pending.push(e);
    }
  });

  pending.forEach((e) => {
    const threadId = `incident-${e.timestamp.slice(0, 10)}-${e.facilityId ?? 'global'}`;
    const list = threads.get(threadId) ?? [];
    threads.set(threadId, [...list, e]);
  });

  return threads;
}

export function buildIncidentThreads(events: TimelineEvent[], tenantId: string, federatedTenantIds?: string[]): IncidentThread[] {
  const filtered = applyScopeFilter(events, tenantId, federatedTenantIds);
  const grouped = groupIncidentEvents(filtered);

  const threads: IncidentThread[] = Array.from(grouped.entries()).map(([threadId, threadEvents]) => {
    const sorted = threadEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const keyEvents = sorted.filter((e) => ['deviation', 'CAPAAction', 'SOPChange', 'environmentalException'].includes(e.type));
    const maxSeverity = sorted.reduce((m, e) => {
      const sev = { info: 0, low: 1, medium: 2, high: 3, critical: 4 }[e.severity] ?? 0;
      return sev > m ? sev : m;
    }, 0);
    const severities = { 0: 'info', 1: 'low', 2: 'medium', 3: 'high', 4: 'critical' };

    return {
      threadId,
      startTime: sorted[0]?.timestamp ?? new Date().toISOString(),
      endTime: sorted[sorted.length - 1]?.timestamp,
      tenantId: sorted[0]?.tenantId ?? tenantId,
      facilityId: sorted[0]?.facilityId,
      severity: (severities[maxSeverity as keyof typeof severities] ?? 'info') as any,
      title: `Incident ${threadId.slice(-8)} @ ${sorted[0]?.facilityId ?? 'global'}`,
      events: sorted,
      keyEvents,
      resolved: sorted.some((e) => e.type === 'CAPAAction'),
    };
  });

  logTimeline('incident', 'Incident threads built', { threads: threads.length, events: filtered.length });
  return threads.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}

export function chronologicalTimeline(events: TimelineEvent[], tenantId: string, federatedTenantIds?: string[]): TimelineEvent[] {
  const filtered = applyScopeFilter(events, tenantId, federatedTenantIds);
  return filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}
