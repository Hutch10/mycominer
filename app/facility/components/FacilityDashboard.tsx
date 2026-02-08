'use client';

import { useEffect, useState } from 'react';
import { roomManager } from '../engine/roomManager';
import { facilityOrchestrator } from '../engine/facilityOrchestrator';
import { facilityLogAggregator } from '../engine/facilityLogAggregator';
import { optimizationEngine } from '../engine/optimizationEngine';
import { RoomState, SafetyEvaluation, OptimizationProposal } from '../engine/facilityTypes';
import { RoomCard } from './RoomCard';
import { RoomStatusPanel } from './RoomStatusPanel';
import { FacilityMap } from './FacilityMap';
import { FacilitySafetyPanel } from './FacilitySafetyPanel';
import { OptimizationPanel } from './OptimizationPanel';
import { FacilityLogViewer } from './FacilityLogViewer';

export function FacilityDashboard() {
  const [rooms, setRooms] = useState<RoomState[]>(roomManager.list());
  const [safety, setSafety] = useState<SafetyEvaluation>({ decision: 'allow', rationale: [] });
  const [logs, setLogs] = useState(facilityLogAggregator.list());
  const [proposals, setProposals] = useState<OptimizationProposal[]>([]);

  useEffect(() => {
    const seed = roomManager.createRoom({ name: 'Room A', species: 'oyster', stage: 'fruiting', devices: ['fan-1'], telemetrySources: ['tele-1'], targets: { temperature: [18, 22], humidity: [85, 95] } });
    roomManager.createRoom({ name: 'Room B', species: 'shiitake', stage: 'colonization', devices: ['heater-1'], telemetrySources: ['tele-2'], targets: { temperature: [20, 24], humidity: [70, 85] } });
    setRooms(roomManager.list());
    setSafety(facilityOrchestrator.evaluateSafety());
    setLogs(facilityLogAggregator.list());
    setProposals([optimizationEngine.proposeEnergySavings(), optimizationEngine.proposeAirflowBalancing()]);
    return () => {
      // no-op cleanup
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RoomStatusPanel rooms={rooms} />
        <FacilitySafetyPanel safety={safety} />
      </div>

      <FacilityMap rooms={rooms} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Rooms</p>
          {rooms.map((room) => (
            <RoomCard key={room.config.id} room={room} />
          ))}
        </div>
        <OptimizationPanel proposals={proposals} />
      </div>

      <FacilityLogViewer logs={logs} />
    </div>
  );
}
