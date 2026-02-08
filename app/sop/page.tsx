import { buildDeterministicSOP } from './sopEngine';
import { assembleSOP } from './sopAssembler';
import { SOPDocument } from './sopTypes';
import { SOPDashboard } from './components/SOPDashboard';
import { getSopLog } from './sopLog';

const workflowSample = {
  workflowId: 'wf-prep-fruit',
  name: 'Prep → Inoc → Incub → Fruit',
  steps: [
    { id: 'prep', title: 'Prep media', description: 'Prepare media and containers', durationMinutes: 60 },
    { id: 'sterilize', title: 'Sterilize', description: 'Load and run sterilization cycle', durationMinutes: 120 },
    { id: 'inoc', title: 'Inoculate', description: 'Perform sterile inoculation per checklist', durationMinutes: 45 },
    { id: 'incub', title: 'Incubate', description: 'Place into incubation room; monitor daily schedule', durationMinutes: 30 },
    { id: 'fruit', title: 'Fruiting', description: 'Move to fruiting room; set airflow and humidity per schedule', durationMinutes: 30 },
    { id: 'clean', title: 'Turnover', description: 'Clean surfaces and reset room for next batch', durationMinutes: 40 },
  ],
  resources: [
    { resourceId: 'room-prep', name: 'Prep Room', type: 'room', quantity: 1, unit: 'room', availabilityWindow: 'Daytime' },
    { resourceId: 'eq-autoclave', name: 'Autoclave', type: 'equipment', quantity: 1, unit: 'unit', availabilityWindow: 'Slots via Resource Engine' },
    { resourceId: 'labor-tech', name: 'Technician', type: 'labor', quantity: 2, unit: 'hours', availabilityWindow: 'Shift-based' },
  ],
  safety: [
    { noteId: 'ppe', title: 'PPE Required', description: 'Wear gloves, eye protection, and mask in sterile zones.', severity: 'warning' },
    { noteId: 'heat', title: 'Hot Surfaces', description: 'Autoclave surfaces are hot post-cycle; allow cooldown.', severity: 'info' },
  ],
  timingNotes: 'Use existing workflow timing; no biological timing included.',
};

const baselineSop = assembleSOP({ workflow: workflowSample, category: 'workflow' });
const approvedSop: SOPDocument = { ...baselineSop, version: { ...baselineSop.version, lifecycle: 'approved', versionId: 'v-approved' } };

const library: SOPDocument[] = [baselineSop, approvedSop];

export default function SOPPage() {
  const sopResult = buildDeterministicSOP({ workflow: workflowSample, category: 'workflow' });
  const current = sopResult.sop;
  const previous = approvedSop;
  const versions: SOPDocument[] = [approvedSop, current];
  const history = getSopLog(20);

  return (
    <main>
      <SOPDashboard current={current} previous={previous} versions={versions} library={library} />
      <section style={{ padding: '0 24px 24px' }}>
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px', background: '#fff' }}>
          <h3 style={{ marginTop: 0, color: '#0f172a' }}>SOP Guardrails</h3>
          <ul style={{ color: '#334155' }}>
            <li>Deterministic assembly only; uses existing workflow steps, resources, timing, and safety notes.</li>
            <li>No biological claims or predictions; informational SOPs only.</li>
            <li>Lifecycle: draft → review → approved → published; operator approval required before active use.</li>
            <li>Integration: Command Center (baseline context), Narrative Engine (Phase 25 explainers), Forecasting (Phase 29 timing), Sandbox (Phase 30 scenarios).</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
