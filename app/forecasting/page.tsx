import { buildDeterministicForecast, ForecastingEngineInput } from './forecastingEngine';
import { getForecastLog } from './forecastingLog';
import { ForecastingDashboard } from './components/ForecastingDashboard';

const sampleInput: ForecastingEngineInput = {
  facilityId: 'cultivation-hub-01',
  horizonDays: 14,
  rooms: [
    { roomId: 'prep', name: 'Prep', capacityUnits: 40, turnoverDays: 2, historicalUtilization: 0.9 },
    { roomId: 'inoc', name: 'Inoculation', capacityUnits: 24, turnoverDays: 3, historicalUtilization: 0.85 },
    { roomId: 'incub', name: 'Incubation', capacityUnits: 120, turnoverDays: 10, historicalUtilization: 0.75 },
    { roomId: 'fruit', name: 'Fruiting', capacityUnits: 200, turnoverDays: 10, historicalUtilization: 0.7 },
  ],
  equipment: [
    { equipmentId: 'autoclave-01', name: 'Autoclave', availableHoursPerDay: 6, cycleTimeHours: 2, historicalAvailability: 0.92 },
    { equipmentId: 'hvac-01', name: 'HVAC', availableHoursPerDay: 24, cycleTimeHours: 24, historicalAvailability: 0.98 },
    { equipmentId: 'rack-01', name: 'Rack Line', availableHoursPerDay: 18, cycleTimeHours: 6, historicalAvailability: 0.9 },
  ],
  substrate: {
    substrateType: 'supplemented-block',
    volumeUnits: 600,
    batchSizeUnits: 10,
    historicalCompletionRate: 0.93,
  },
  labor: [
    { role: 'tech', hoursAvailablePerDay: 18, hoursPerBatch: 1.5 },
    { role: 'supervisor', hoursAvailablePerDay: 6, hoursPerBatch: 0.3 },
  ],
  workflows: [
    {
      workflowId: 'wf-prep-fruit',
      name: 'Prep → Inoc → Incub → Fruit',
      durationDays: 24,
      roomSequence: ['prep', 'inoc', 'incub', 'fruit'],
      equipmentNeeded: ['autoclave-01', 'rack-01'],
      historicalDelayFactor: 0.08,
    },
    {
      workflowId: 'wf-fast-cycle',
      name: 'Prep → Inoc → Fruit',
      durationDays: 14,
      roomSequence: ['prep', 'inoc', 'fruit'],
      equipmentNeeded: ['autoclave-01', 'rack-01'],
      historicalDelayFactor: 0.05,
    },
  ],
};

export default function ForecastingPage() {
  const report = buildDeterministicForecast(sampleInput);
  const history = getForecastLog(20);

  return (
    <main>
      <ForecastingDashboard report={report} history={history} />
      <section style={{ padding: '0 24px 24px' }}>
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px', background: '#fff' }}>
          <h3 style={{ marginTop: 0, color: '#0f172a' }}>Integration & Guardrails</h3>
          <ul style={{ color: '#334155' }}>
            <li>Data inputs: Workflow Engine (Phase 19), Resource Engine (Phase 20), Execution Engine (Phase 21), Optimization Engine (Phase 22), Multi-Facility Engine (Phase 23), Command Center (Phase 24), Digital Twin (Phase 28).</li>
            <li>Deterministic only: ranges derived from capacity, cycle times, substrate volume, labor hours, and historical timing. No biological predictions.</li>
            <li>Operator actions: review bottlenecks, reroute batches, adjust schedules, or request additional resources before committing execution.</li>
            <li>Use “Explain This Forecast” to surface traceability (Phase 25 hook point).</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
