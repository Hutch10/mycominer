// Phase 38: Global Timeline & Incident Replay types
// Deterministic, read-only chronological view

export type TimelineEventType =
  | 'workflowExecutionEvent'
  | 'resourceAllocationEvent'
  | 'telemetryEvent'
  | 'environmentalException'
  | 'deviation'
  | 'CAPAAction'
  | 'SOPChange'
  | 'sandboxScenarioRun'
  | 'sandboxPromotionProposal'
  | 'forecastGeneration'
  | 'complianceEvent'
  | 'facilityStatusChange';

export type EventSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface TimelineEvent {
  eventId: string;
  timestamp: string;
  type: TimelineEventType;
  severity: EventSeverity;
  tenantId: string;
  facilityId?: string;
  roomId?: string;
  workflowId?: string;
  title: string;
  description: string;
  linkedIds?: string[];
  sourceSystem: string;
  incidentThreadId?: string;
}

export interface TimelineSpan {
  startTime: string;
  endTime: string;
  label: string;
  events: TimelineEvent[];
}

export interface IncidentThread {
  threadId: string;
  startTime: string;
  endTime?: string;
  tenantId: string;
  facilityId?: string;
  severity: EventSeverity;
  title: string;
  events: TimelineEvent[];
  keyEvents: TimelineEvent[];
  resolved: boolean;
}

export interface IncidentReplayState {
  threadId: string;
  currentIndex: number;
  totalEvents: number;
  events: TimelineEvent[];
  currentEvent: TimelineEvent;
}

export interface TimelineFilter {
  tenants?: string[];
  facilities?: string[];
  rooms?: string[];
  eventTypes?: TimelineEventType[];
  severities?: EventSeverity[];
  startTime?: string;
  endTime?: string;
  workflowIds?: string[];
}

export type TimelineLogCategory = 'filter' | 'replay' | 'incident' | 'access';

export interface TimelineLogEntry {
  entryId: string;
  timestamp: string;
  category: TimelineLogCategory;
  message: string;
  context?: Record<string, unknown>;
}
