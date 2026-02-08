import { ComplianceEvent, ComplianceReport, DeviationRecord } from './complianceTypes';
import { addLog } from './complianceLog';

export interface ComplianceReportInput {
  facilityId: string;
  period: ComplianceReport['period'];
  from: string;
  to: string;
  events: ComplianceEvent[];
  deviations: DeviationRecord[];
}

export function generateComplianceReport(input: ComplianceReportInput): ComplianceReport {
  const scorecard = buildScorecard(input.events);
  const capa = input.deviations.map((d) => ({ deviationId: d.deviationId, corrective: d.correctiveAction, preventive: d.preventiveAction }));

  const report: ComplianceReport = {
    reportId: `comp-${Date.now()}`,
    period: input.period,
    facilityId: input.facilityId,
    from: input.from,
    to: input.to,
    events: input.events,
    deviations: input.deviations,
    capa,
    scorecard,
    narrative: 'Deterministic compliance summary. No predictions included.',
  };

  addLog({ category: 'report', message: `Compliance report generated: ${report.reportId}`, context: { reportId: report.reportId }, details: scorecard });
  return report;
}

function buildScorecard(events: ComplianceEvent[]): ComplianceReport['scorecard'] {
  const buckets = new Map<string, { category: ComplianceEvent['category']; count: number; critical: number }>();
  events.forEach((e) => {
    if (!buckets.has(e.category)) {
      buckets.set(e.category, { category: e.category, count: 0, critical: 0 });
    }
    const bucket = buckets.get(e.category)!;
    bucket.count += 1;
    if (e.severity === 'critical') bucket.critical += 1;
  });
  return Array.from(buckets.values());
}
