import { TimelineEvent, TimelineFilter, IncidentThread } from './timelineTypes';
import { filterTimeline, buildIncidentThreads, chronologicalTimeline } from './timelineIndexer';
import { logTimeline } from './timelineLog';

export interface TimelineEngineState {
  allEvents: TimelineEvent[];
  tenantId: string;
  federatedTenantIds?: string[];
}

export interface TimelineEngineInput {
  events: TimelineEvent[];
  tenantId: string;
  federatedTenantIds?: string[];
}

export function initTimelineEngine(input: TimelineEngineInput): TimelineEngineState {
  logTimeline('filter', 'Timeline engine initialized', { events: input.events.length, tenant: input.tenantId });
  return { allEvents: input.events, tenantId: input.tenantId, federatedTenantIds: input.federatedTenantIds };
}

export function getFilteredTimeline(state: TimelineEngineState, filter: TimelineFilter): TimelineEvent[] {
  const result = filterTimeline(state.allEvents, filter, state.tenantId, state.federatedTenantIds);
  logTimeline('filter', 'Timeline filtered', { results: result.length, types: filter.eventTypes?.length ?? 0 });
  return result;
}

export function getChronologicalTimeline(state: TimelineEngineState): TimelineEvent[] {
  return chronologicalTimeline(state.allEvents, state.tenantId, state.federatedTenantIds);
}

export function getIncidentThreads(state: TimelineEngineState): IncidentThread[] {
  const threads = buildIncidentThreads(state.allEvents, state.tenantId, state.federatedTenantIds);
  logTimeline('incident', 'Incident threads generated', { threads: threads.length });
  return threads;
}

export function getIncidentThreadsByFacility(state: TimelineEngineState, facilityId: string): IncidentThread[] {
  const threads = getIncidentThreads(state);
  return threads.filter((t) => t.facilityId === facilityId);
}
