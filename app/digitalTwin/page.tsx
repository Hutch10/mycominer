'use client';

import { DigitalTwinLegend } from './components/DigitalTwinLegend';
import { DigitalTwinCanvas } from './components/DigitalTwinCanvas';
import { buildDeterministicTwin } from './digitalTwinEngine';

const sampleData = {
  layout: {
    facilityId: 'cultivation-hub-01',
    facilityName: 'Cultivation Hub 01',
    layoutMode: 'flow' as const,
    view: '2d' as const,
    rooms: [
      { roomId: 'prep', name: 'Prep', purpose: 'Media prep', capacity: 6 },
      { roomId: 'inoc', name: 'Inoculation', purpose: 'Sterile work', capacity: 4 },
      { roomId: 'incub', name: 'Incubation', purpose: 'Colonization', capacity: 8 },
      { roomId: 'fruit', name: 'Fruiting', purpose: 'Production', capacity: 10 },
      { roomId: 'post', name: 'Post-Process', purpose: 'Drying/pack', capacity: 5 },
    ],
    equipment: [
      { equipmentId: 'hvac-01', name: 'HVAC North', type: 'HVAC', roomId: 'fruit', status: 'online' },
      { equipmentId: 'rack-01', name: 'Rack A', type: 'Rack', roomId: 'fruit', status: 'online' },
      { equipmentId: 'autoclave-01', name: 'Autoclave', type: 'Sterilizer', roomId: 'prep', status: 'maintenance' },
    ],
  },
  telemetry: {
    facilityId: 'cultivation-hub-01',
    timestamp: new Date().toISOString(),
    rooms: [
      { roomId: 'prep', temperatureC: 24.5, humidityPercent: 55, occupancyPercent: 60, contaminationRisk: 'low' },
      { roomId: 'inoc', temperatureC: 22.5, humidityPercent: 50, occupancyPercent: 70, contaminationRisk: 'medium', alerts: ['HEPA check'] },
      { roomId: 'incub', temperatureC: 26, humidityPercent: 60, occupancyPercent: 88, contaminationRisk: 'low' },
      { roomId: 'fruit', temperatureC: 18, humidityPercent: 92, occupancyPercent: 92, contaminationRisk: 'medium', energyKwh: 42 },
      { roomId: 'post', temperatureC: 20, humidityPercent: 48, occupancyPercent: 45, contaminationRisk: 'low' },
    ],
    equipment: [
      { equipmentId: 'hvac-01', status: 'online', energyKwh: 18, utilizationPercent: 76 },
      { equipmentId: 'rack-01', status: 'online', utilizationPercent: 84 },
      { equipmentId: 'autoclave-01', status: 'offline', alerts: ['Awaiting service'] },
    ],
  },
};

export default function DigitalTwinPage() {
  const { snapshot, insights } = buildDeterministicTwin(sampleData);

  return (
    <main className="dt-shell">
      <header className="dt-header">
        <div>
          <p className="dt-kicker">Phase 28 · Digital Twin</p>
          <h1>Deterministic Visualization Layer</h1>
          <p className="dt-subtitle">Read-only layout + state map for cultivation hub operations.</p>
        </div>
      </header>

      <DigitalTwinLegend />
      <DigitalTwinCanvas snapshot={snapshot} insights={insights} />

      <section className="dt-meta">
        <div>
          <h3>Snapshot</h3>
          <p>{snapshot.timestamp}</p>
        </div>
        <div>
          <h3>Layout</h3>
          <p>{snapshot.layout.layoutMode.toUpperCase()} · {snapshot.layout.view.toUpperCase()}</p>
        </div>
        <div>
          <h3>Insight Count</h3>
          <p>{insights.length}</p>
        </div>
      </section>

      <style jsx>{`
        .dt-shell {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 24px;
        }
        .dt-header h1 {
          margin: 4px 0 8px;
          font-size: 28px;
          color: #0f172a;
        }
        .dt-kicker {
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 12px;
          margin: 0;
          color: #475569;
        }
        .dt-subtitle {
          margin: 0;
          color: #334155;
          font-size: 14px;
        }
        .dt-meta {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
        }
        .dt-meta div {
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          padding: 12px;
          border-radius: 8px;
        }
        .dt-meta h3 {
          margin: 0 0 4px;
          font-size: 14px;
          color: #0f172a;
        }
        .dt-meta p {
          margin: 0;
          color: #334155;
          font-size: 13px;
        }
      `}</style>
    </main>
  );
}
