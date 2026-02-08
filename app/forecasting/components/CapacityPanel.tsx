import { CapacitySnapshot } from '../forecastingTypes';

interface Props {
  capacity: CapacitySnapshot;
}

export function CapacityPanel({ capacity }: Props) {
  return (
    <section className="fc-card">
      <header className="fc-card-header">
        <div>
          <p className="fc-kicker">Capacity</p>
          <h2>Room & Equipment Utilization</h2>
        </div>
        <span className="fc-meta">Horizon: {capacity.horizonDays}d</span>
      </header>
      <div className="fc-grid">
        {capacity.roomUtilization.map((room) => (
          <div key={room.roomId} className="fc-tile">
            <div className="fc-tile-top">
              <strong>{room.roomId}</strong>
              <span>{room.utilizationPercent}% util</span>
            </div>
            <p>Available units: {room.availableCapacityUnits}</p>
            <p>Constraint: {room.constrainedBy}</p>
          </div>
        ))}
      </div>
      <div className="fc-grid">
        {capacity.equipmentAvailability.map((eq) => (
          <div key={eq.equipmentId} className="fc-tile fc-tile-soft">
            <div className="fc-tile-top">
              <strong>{eq.equipmentId}</strong>
              <span>{eq.cyclesPossible} cycles</span>
            </div>
            <p>Hours: {eq.availableHours.toFixed(1)}</p>
          </div>
        ))}
      </div>
      <div className="fc-strip">
        <div>
          <p className="fc-label">Substrate</p>
          <strong>{capacity.substrate.batchesPossible} batches</strong>
        </div>
        {capacity.labor.map((role) => (
          <div key={role.role}>
            <p className="fc-label">Labor · {role.role}</p>
            <strong>{role.batchesPossible} batches</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
