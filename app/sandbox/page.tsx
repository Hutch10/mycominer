import { buildDeterministicForecast } from '../forecasting/forecastingEngine';
import { ForecastingEngineInput } from '../forecasting/forecastingTypes';
import { getSandboxLog } from './sandboxLog';
import { executeSandbox } from './sandboxEngine';
import { SandboxDashboard } from './components/SandboxDashboard';

const baselineForecastInput: ForecastingEngineInput = {
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

const baselineReport = buildDeterministicForecast(baselineForecastInput);

const scenarioInput = {
  name: 'Cooler, higher airflow, shift labor',
  description: 'Test lower temp, higher FAE, add labor hours, and reassign some incub space to fruiting.',
  baselineId: 'live-baseline',
  parameters: {
    environment: { targetTempC: 18, targetHumidityPercent: 88, faeSchedulePerDay: 16, energyBias: 1.1 },
    schedule: { startOffsetDays: 0, batchStaggerMinutes: 90, shiftWindowHours: 12 },
    resources: { laborHoursDelta: 40, equipmentWindowDeltaHours: 20 },
    roomAssignments: [
      { fromRoomId: 'incub', toRoomId: 'fruit' },
    ],
  },
};

export default function SandboxPage() {
  const { scenario, result, comparison, insights } = executeSandbox(scenarioInput, baselineForecastInput, baselineReport);
  const history = getSandboxLog(30);

  return (
    <main>
      <SandboxDashboard
        scenario={scenario}
        result={result}
        comparison={comparison}
        insights={insights}
        history={history}
      />
      <section style={{ padding: '0 24px 24px' }}>
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px', background: '#fff' }}>
          <h3 style={{ marginTop: 0, color: '#0f172a' }}>Sandbox Guardrails</h3>
          <ul style={{ color: '#334155' }}>
            <li>All results are sandbox-only, non-binding, and do not touch live systems.</li>
            <li>Promotion requires explicit operator approval and safety checks.</li>
            <li>Data sources: Command Center (baseline), Forecasting Engine (Phase 29), Digital Twin (Phase 28), Multi-Facility (Phase 23).</li>
            <li>No biological simulation—only operational setpoint and capacity recomputation.</li>
            <li>Use “Explain This Scenario” for Phase 25 narrative traceability.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
