import {
  CapacitySnapshot,
  ThroughputEstimate,
  WorkflowTimingProfile,
} from './forecastingTypes';

export interface ThroughputEstimatorInput {
  facilityId: string;
  horizonDays: number;
  capacity: CapacitySnapshot;
  workflows: WorkflowTimingProfile[];
}

export function estimateThroughput(input: ThroughputEstimatorInput): ThroughputEstimate[] {
  return input.workflows.map((wf) => buildWorkflowEstimate(wf, input.capacity, input.horizonDays));
}

function buildWorkflowEstimate(wf: WorkflowTimingProfile, capacity: CapacitySnapshot, horizonDays: number): ThroughputEstimate {
  const delayFactor = wf.historicalDelayFactor ?? 0;
  const cycleTimeDays = wf.durationDays * (1 + delayFactor);
  const timeLimitedBatches = Math.max(0, Math.floor(horizonDays / cycleTimeDays));

  const roomConstraint = Math.min(
    ...wf.roomSequence.map((roomId) => findRoomCapacity(capacity, roomId))
  );

  const equipmentConstraint = wf.equipmentNeeded.length === 0
    ? Number.POSITIVE_INFINITY
    : Math.min(...wf.equipmentNeeded.map((id) => findEquipmentCycles(capacity, id)));

  const laborConstraint = capacity.labor.length === 0
    ? Number.POSITIVE_INFINITY
    : Math.min(...capacity.labor.map((l) => l.batchesPossible));

  const substrateConstraint = capacity.substrate.batchesPossible;

  const constraints = {
    time: timeLimitedBatches,
    room: roomConstraint,
    equipment: equipmentConstraint,
    labor: laborConstraint,
    substrate: substrateConstraint,
  } as const;

  const maxBatches = Math.max(0, Math.min(...Object.values(constraints)));
  const minBatches = Math.max(0, Math.min(maxBatches, Math.floor(maxBatches * 0.7)));
  const governingConstraint = findGoverningConstraint(constraints, maxBatches);

  const explain = buildExplanation(wf, cycleTimeDays, governingConstraint, maxBatches);

  return {
    facilityId: capacity.facilityId,
    horizonDays,
    workflowId: wf.workflowId,
    workflowName: wf.name,
    batchesMin: minBatches,
    batchesMax: maxBatches,
    governingConstraint,
    cycleTimeDays,
    explain,
  };
}

function findRoomCapacity(capacity: CapacitySnapshot, roomId: string): number {
  const room = capacity.roomUtilization.find((r) => r.roomId === roomId);
  return room ? room.availableCapacityUnits : 0;
}

function findEquipmentCycles(capacity: CapacitySnapshot, equipmentId: string): number {
  const equip = capacity.equipmentAvailability.find((e) => e.equipmentId === equipmentId);
  return equip ? equip.cyclesPossible : 0;
}

function findGoverningConstraint(
  constraints: Record<'time' | 'room' | 'equipment' | 'labor' | 'substrate', number>,
  maxBatches: number
): ThroughputEstimate['governingConstraint'] {
  const entries = Object.entries(constraints) as Array<['time' | 'room' | 'equipment' | 'labor' | 'substrate', number]>;
  const limiting = entries.find(([, value]) => value === maxBatches);
  const key = limiting ? limiting[0] : 'time';
  if (key === 'time') return 'time';
  return key;
}

function buildExplanation(
  wf: WorkflowTimingProfile,
  cycleTimeDays: number,
  constraint: ThroughputEstimate['governingConstraint'],
  maxBatches: number
): string {
  return [
    `${wf.name} cycle time: ${cycleTimeDays.toFixed(1)} days`,
    `Constraint: ${constraint}`,
    `Max batches in horizon: ${maxBatches}`,
  ].join(' | ');
}
