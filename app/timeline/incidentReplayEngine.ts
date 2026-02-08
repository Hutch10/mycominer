import { IncidentThread, IncidentReplayState, TimelineEvent } from './timelineTypes';
import { logTimeline } from './timelineLog';

export interface IncidentReplayInput {
  thread: IncidentThread;
}

export function initIncidentReplay(input: IncidentReplayInput): IncidentReplayState {
  const { thread } = input;
  const sorted = thread.events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  logTimeline('replay', 'Incident replay started', {
    threadId: thread.threadId,
    events: sorted.length,
    tenant: thread.tenantId,
    facility: thread.facilityId,
  });

  return {
    threadId: thread.threadId,
    currentIndex: 0,
    totalEvents: sorted.length,
    events: sorted,
    currentEvent: sorted[0],
  };
}

export function nextEvent(state: IncidentReplayState): IncidentReplayState {
  if (state.currentIndex >= state.totalEvents - 1) return state;
  const nextIdx = state.currentIndex + 1;
  return { ...state, currentIndex: nextIdx, currentEvent: state.events[nextIdx] };
}

export function previousEvent(state: IncidentReplayState): IncidentReplayState {
  if (state.currentIndex <= 0) return state;
  const prevIdx = state.currentIndex - 1;
  return { ...state, currentIndex: prevIdx, currentEvent: state.events[prevIdx] };
}

export function jumpToKeyEvent(state: IncidentReplayState, direction: 'next' | 'prev'): IncidentReplayState {
  const keyTypes = ['deviation', 'CAPAAction', 'SOPChange', 'environmentalException'];
  let searchIdx = direction === 'next' ? state.currentIndex + 1 : state.currentIndex - 1;
  const step = direction === 'next' ? 1 : -1;

  while (searchIdx >= 0 && searchIdx < state.totalEvents) {
    if (keyTypes.includes(state.events[searchIdx].type)) {
      return { ...state, currentIndex: searchIdx, currentEvent: state.events[searchIdx] };
    }
    searchIdx += step;
  }

  return state;
}

export function jumpToEventType(state: IncidentReplayState, eventType: string): IncidentReplayState {
  const idx = state.events.findIndex((e) => e.type === eventType);
  if (idx < 0) return state;
  return { ...state, currentIndex: idx, currentEvent: state.events[idx] };
}
