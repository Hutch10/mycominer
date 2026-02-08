import { runComplianceEngine } from './complianceEngine';
import { startReview, updateReviewStatus } from './complianceReviewWorkflow';
import { ComplianceDashboard } from './components/ComplianceDashboard';
import { getComplianceLog } from './complianceLog';
import { ComplianceEvent, DeviationRecord } from './complianceTypes';

const sampleEvents: ComplianceEvent[] = [
  { eventId: 'ev-1', timestamp: new Date().toISOString(), facilityId: 'cultivation-hub-01', category: 'sop', severity: 'info', summary: 'SOP updated to v-approved', details: 'Prep → Inoc → Incub → Fruit SOP approved', relatedIds: ['sop-1'] },
  { eventId: 'ev-2', timestamp: new Date().toISOString(), facilityId: 'cultivation-hub-01', category: 'environment', severity: 'minor', summary: 'Humidity out of range', details: 'Fruiting room at 95% for 20 min', relatedIds: ['room-fruit'] },
  { eventId: 'ev-3', timestamp: new Date().toISOString(), facilityId: 'cultivation-hub-01', category: 'sandbox', severity: 'info', summary: 'Sandbox scenario promoted', details: 'Scenario ID sandbox-123 proposed for promotion', relatedIds: ['sandbox-123'] },
];

const sampleDeviations: DeviationRecord[] = [
  { deviationId: 'dev-1', timestamp: new Date().toISOString(), facilityId: 'cultivation-hub-01', source: 'sop', description: 'Skipped PPE checklist step', severity: 'major', expected: 'Complete PPE checklist', observed: 'PPE step unchecked', relatedIds: ['sop-1'] },
  { deviationId: 'dev-2', timestamp: new Date().toISOString(), facilityId: 'cultivation-hub-01', source: 'environment', description: 'Temp drifted below 16C', severity: 'minor', expected: 'Maintain 18-20C', observed: '15.8C for 12 min', relatedIds: ['room-fruit'] },
];

const engineResult = runComplianceEngine({ facilityId: 'cultivation-hub-01', events: sampleEvents, deviations: sampleDeviations });

const reviewDraft = startReview(engineResult.report.reportId);
const review = updateReviewStatus(reviewDraft, 'in-review');

export default function CompliancePage() {
  const history = getComplianceLog(50);

  return (
    <main>
      <ComplianceDashboard
        events={engineResult.events}
        deviations={engineResult.deviations}
        report={engineResult.report}
        review={review}
        history={history}
      />
      <section style={{ padding: '0 24px 24px' }}>
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px', background: '#fff' }}>
          <h3 style={{ marginTop: 0, color: '#0f172a' }}>Compliance Guardrails</h3>
          <ul style={{ color: '#334155' }}>
            <li>All records immutable once logged; new annotations create new entries.</li>
            <li>No biological claims or predictions; factual, timestamped records only.</li>
            <li>Approvals are required before publishing reviews or reports.</li>
            <li>Integrations: SOP (Phase 31), Workflow (Phase 19), Resource (Phase 20), Execution (Phase 21), Telemetry (Phase 8), Command Center (Phase 24), Sandbox (Phase 30), Forecasting (Phase 29).</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
