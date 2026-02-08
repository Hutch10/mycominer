import {
  CapacitySnapshot,
  EquipmentAvailabilityProfile,
  LaborAvailabilityProfile,
  RoomCapacityProfile,
  SubstrateInventoryProfile,
} from './forecastingTypes';

export interface CapacityModelerInput {
  facilityId: string;
  horizonDays: number;
  rooms: RoomCapacityProfile[];
  equipment: EquipmentAvailabilityProfile[];
  substrate: SubstrateInventoryProfile;
  labor: LaborAvailabilityProfile[];
}

export function computeCapacitySnapshot(input: CapacityModelerInput): CapacitySnapshot {
  const timestamp = new Date().toISOString();
  const roomUtilization = input.rooms.map((room) => buildRoomUtilization(room, input.horizonDays));
  const equipmentAvailability = input.equipment.map((equip) => buildEquipmentAvailability(equip, input.horizonDays));

  const substrateBatches = Math.floor(input.substrate.volumeUnits / input.substrate.batchSizeUnits);
  const substrateAdjusted = Math.floor(substrateBatches * input.substrate.historicalCompletionRate);

  const laborCalc = input.labor.map((role) => {
    const hoursAvailable = role.hoursAvailablePerDay * input.horizonDays;
    const batchesPossible = Math.floor(hoursAvailable / role.hoursPerBatch);
    return { role: role.role, hoursAvailable, batchesPossible };
  });

  return {
    facilityId: input.facilityId,
    timestamp,
    horizonDays: input.horizonDays,
    roomUtilization,
    equipmentAvailability,
    substrate: {
      totalVolumeUnits: input.substrate.volumeUnits,
      batchesPossible: substrateAdjusted,
    },
    labor: laborCalc,
  };
}

function buildRoomUtilization(room: RoomCapacityProfile, horizonDays: number): CapacitySnapshot['roomUtilization'][number] {
  const cycles = horizonDays / room.turnoverDays;
  const effectiveUtilization = room.historicalUtilization ?? 1;
  const availableCapacityUnits = Math.floor(room.capacityUnits * cycles * effectiveUtilization);
  const utilizationPercent = Math.min(100, Math.round(cycles * 100));

  return {
    roomId: room.roomId,
    utilizationPercent,
    availableCapacityUnits,
    constrainedBy: cycles < 1 ? 'turnover' : availableCapacityUnits <= 0 ? 'capacity' : 'none',
  };
}

function buildEquipmentAvailability(equip: EquipmentAvailabilityProfile, horizonDays: number): CapacitySnapshot['equipmentAvailability'][number] {
  const hours = equip.availableHoursPerDay * horizonDays * (equip.historicalAvailability ?? 1);
  const cyclesPossible = Math.floor(hours / equip.cycleTimeHours);
  return { equipmentId: equip.equipmentId, availableHours: hours, cyclesPossible };
}
