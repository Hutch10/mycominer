'use client';

import { OptimizationProposal } from './facilityTypes';
import { roomManager } from './roomManager';

class OptimizationEngine {
  proposeEnergySavings(): OptimizationProposal {
    const rooms = roomManager.list();
    return {
      id: `energy-${Date.now()}`,
      title: 'Energy optimization',
      rationale: 'Stagger lighting schedules and cluster similar species',
      actions: rooms.map((r) => ({
        roomId: r.config.id,
        description: `Shift lighting schedule for ${r.config.name} by 30 minutes to balance load`,
        expectedImpact: 'Reduced peak power draw',
      })),
      requiresApproval: true,
    };
  }

  proposeAirflowBalancing(): OptimizationProposal {
    const rooms = roomManager.list();
    return {
      id: `air-${Date.now()}`,
      title: 'Airflow balancing',
      rationale: 'Normalize CO₂ scrubbing and FAE demand across rooms',
      actions: rooms.map((r) => ({
        roomId: r.config.id,
        description: `Set airflow to midpoint of target range in ${r.config.name}`,
        expectedImpact: 'Stable CO₂ and humidity',
      })),
      requiresApproval: true,
    };
  }
}

export const optimizationEngine = new OptimizationEngine();
