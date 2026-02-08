import { SandboxParameterSet } from '../sandboxTypes';

interface Props {
  parameters: SandboxParameterSet;
}

export function ScenarioParametersPanel({ parameters }: Props) {
  return (
    <section className="sb-card sb-card-soft">
      <header className="sb-card-header">
        <div>
          <p className="sb-kicker">Parameters</p>
          <h2>Inputs & Setpoints</h2>
        </div>
      </header>
      <div className="sb-grid">
        <div>
          <p className="sb-label">Environment</p>
          <ul className="sb-list">
            <li>Temp: {parameters.environment?.targetTempC ?? '—'}°C</li>
            <li>Humidity: {parameters.environment?.targetHumidityPercent ?? '—'}%</li>
            <li>FAE/day: {parameters.environment?.faeSchedulePerDay ?? '—'}</li>
            <li>Energy bias: {parameters.environment?.energyBias ?? 1}x</li>
          </ul>
        </div>
        <div>
          <p className="sb-label">Schedule</p>
          <ul className="sb-list">
            <li>Start offset: {parameters.schedule?.startOffsetDays ?? 0} days</li>
            <li>Stagger: {parameters.schedule?.batchStaggerMinutes ?? 0} min</li>
            <li>Shift window: {parameters.schedule?.shiftWindowHours ?? 0} h</li>
          </ul>
        </div>
        <div>
          <p className="sb-label">Resources</p>
          <ul className="sb-list">
            <li>Labor Δ: {parameters.resources?.laborHoursDelta ?? 0} hours</li>
            <li>Equipment window Δ: {parameters.resources?.equipmentWindowDeltaHours ?? 0} hours</li>
          </ul>
        </div>
        <div>
          <p className="sb-label">Room reassignments</p>
          <ul className="sb-list">
            {parameters.roomAssignments && parameters.roomAssignments.length > 0 ? (
              parameters.roomAssignments.map((r) => (
                <li key={`${r.fromRoomId}-${r.toRoomId}`}>{r.fromRoomId} → {r.toRoomId}</li>
              ))
            ) : (
              <li>None</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
