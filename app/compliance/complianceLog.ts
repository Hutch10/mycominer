import { ComplianceEvent, ComplianceLogCategory, ComplianceLogEntry, DeviationRecord } from './complianceTypes';

const complianceEvents: ComplianceEvent[] = [];
const deviations: DeviationRecord[] = [];
const complianceLog: ComplianceLogEntry[] = [];

export function logComplianceEvent(event: ComplianceEvent): ComplianceEvent {
  complianceEvents.unshift(Object.freeze({ ...event }));
  complianceLog.unshift(makeLog('event', `Event logged: ${event.summary}`, { eventId: event.eventId }, event));
  return event;
}

export function logDeviation(record: DeviationRecord): DeviationRecord {
  deviations.unshift(Object.freeze({ ...record }));
  complianceLog.unshift(makeLog('deviation', `Deviation recorded: ${record.description}`, { deviationId: record.deviationId }, record));
  return record;
}

export function addLog(params: { category: ComplianceLogCategory; message: string; context?: ComplianceLogEntry['context']; details?: unknown }): ComplianceLogEntry {
  const entry = makeLog(params.category, params.message, params.context, params.details);
  complianceLog.unshift(entry);
  return entry;
}

function makeLog(category: ComplianceLogCategory, message: string, context?: ComplianceLogEntry['context'], details?: unknown): ComplianceLogEntry {
  return Object.freeze({
    entryId: `${category}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    category,
    message,
    context,
    details,
  });
}

export function getComplianceEvents(limit = 100): ComplianceEvent[] {
  return complianceEvents.slice(0, limit);
}

export function getDeviations(limit = 100): DeviationRecord[] {
  return deviations.slice(0, limit);
}

export function getComplianceLog(limit = 200): ComplianceLogEntry[] {
  return complianceLog.slice(0, limit);
}

export function filterComplianceLog(category: ComplianceLogCategory): ComplianceLogEntry[] {
  return complianceLog.filter((e) => e.category === category);
}
