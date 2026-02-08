'use client';

import { FacilityState, RoomId, OptimizationProposal } from './facilityTypes';
import { roomManager } from './roomManager';
import { evaluateFacilitySafety } from './facilitySafety';
import { facilityLogAggregator } from './facilityLogAggregator';

class FacilityOrchestrator {
  private state: FacilityState = { rooms: [] };

  snapshot(): FacilityState {
    this.state.rooms = roomManager.list();
    return { ...this.state, rooms: [...this.state.rooms] };
  }

  detectConflicts(): string[] {
    const conflicts: string[] = [];
    const rooms = roomManager.list();

    // shared devices
    const deviceUse: Record<string, RoomId[]> = {};
    rooms.forEach((r) => r.config.devices.forEach((d) => (deviceUse[d] = [...(deviceUse[d] ?? []), r.config.id])));
    Object.entries(deviceUse).forEach(([device, ids]) => {
      if (ids.length > 1) conflicts.push(`Device ${device} shared by rooms ${ids.join(', ')}`);
    });

    return conflicts;
  }

  proposeFacilityPlan(): OptimizationProposal {
    const rooms = roomManager.list();
    const title = 'Facility optimization plan';
    const actions = rooms.map((r) => ({
      roomId: r.config.id,
      description: `Align airflow to midpoint of target for ${r.config.name}`,
      expectedImpact: 'More stable CO₂ and humidity distribution',
    }));
    return {
      id: `opt-${Date.now()}`,
      title,
      rationale: 'Balance airflow and align shared resources',
      actions,
      requiresApproval: true,
    };
  }

  evaluateSafety(): ReturnType<typeof evaluateFacilitySafety> {
    const snapshot = this.snapshot();
    const result = evaluateFacilitySafety(snapshot);
    facilityLogAggregator.add({
      id: `safety-${Date.now()}`,
      timestamp: Date.now(),
      category: 'safety',
      message: `Safety decision: ${result.decision}`,
      context: { rationale: result.rationale },
    });
    return result;
  }
}

export const facilityOrchestrator = new FacilityOrchestrator();
