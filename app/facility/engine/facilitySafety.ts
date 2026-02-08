'use client';

import { FacilityState, SafetyEvaluation, SafetyDecision, RoomState } from './facilityTypes';

function checkCrossRoomConflicts(state: FacilityState): SafetyEvaluation {
  const issues: string[] = [];
  const warnings: string[] = [];

  // naive conflict: same HVAC shared and opposing temp targets
  const sharedHVAC = state.sharedResources?.hvac;
  if (sharedHVAC) {
    const temps = state.rooms
      .map((r) => ({ id: r.config.id, targets: r.config.targets.temperature }))
      .filter((t) => t.targets);
    const min = Math.min(...temps.map((t) => t.targets![0]));
    const max = Math.max(...temps.map((t) => t.targets![1]));
    if (max - min > 6) warnings.push('Shared HVAC with widely separated temperature targets');
  }

  // device contention: same device in multiple rooms
  const deviceUse: Record<string, number> = {};
  state.rooms.forEach((r) => r.config.devices.forEach((d) => (deviceUse[d] = (deviceUse[d] || 0) + 1)));
  Object.entries(deviceUse).forEach(([device, count]) => {
    if (count > 1) warnings.push(`Device ${device} assigned to multiple rooms`);
  });

  // contamination propagation: if one room has alert mentioning mold
  const contaminated = state.rooms.filter((r) => r.alerts?.some((a) => a.toLowerCase().includes('mold')));
  if (contaminated.length > 0) warnings.push('Potential contamination propagation risk; isolate air handling');

  const decision: SafetyDecision = issues.length > 0 ? 'block' : warnings.length > 0 ? 'warn' : 'allow';
  return { decision, rationale: [...issues, ...warnings], alternatives: ['Isolate conflicting rooms', 'Align targets for shared HVAC'] };
}

export function evaluateFacilitySafety(state: FacilityState): SafetyEvaluation {
  return checkCrossRoomConflicts(state);
}
