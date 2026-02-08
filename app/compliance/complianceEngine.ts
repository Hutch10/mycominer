import { ComplianceEvent, ComplianceReport, DeviationRecord } from './complianceTypes';
import { logComplianceEvent, getComplianceEvents, getDeviations, addLog } from './complianceLog';
import { recordDeviation } from './deviationTracker';
import { generateComplianceReport, ComplianceReportInput } from './complianceReportGenerator';

export interface ComplianceEngineInput {
  facilityId: string;
  events?: ComplianceEvent[];
  deviations?: DeviationRecord[];
}

export interface ComplianceEngineResult {
  events: ComplianceEvent[];
  deviations: DeviationRecord[];
  report: ComplianceReport;
}

export function runComplianceEngine(input: ComplianceEngineInput): ComplianceEngineResult {
  const now = new Date().toISOString();

  (input.events ?? []).forEach((event) => logComplianceEvent(event));
  (input.deviations ?? []).forEach((dev) => logDeviationWrapper(dev));

  const events = getComplianceEvents(200);
  const deviations = getDeviations(200);

  const reportInput: ComplianceReportInput = {
    facilityId: input.facilityId,
    period: 'daily',
    from: now,
    to: now,
    events,
    deviations,
  };
  const report = generateComplianceReport(reportInput);

  addLog({ category: 'report', message: `Compliance engine compiled report ${report.reportId}`, context: { reportId: report.reportId } });

  return { events, deviations, report };
}

function logDeviationWrapper(dev: DeviationRecord): DeviationRecord {
  // Preserve immutability by re-logging rather than mutating
  return recordDeviation({
    facilityId: dev.facilityId,
    source: dev.source,
    description: dev.description,
    severity: dev.severity,
    expected: dev.expected,
    observed: dev.observed,
    relatedIds: dev.relatedIds,
  });
}
