import {
  DigitalTwinSnapshot,
  EquipmentState,
  FacilityLayout,
  RoomState,
} from './digitalTwinTypes';

export interface RoomTelemetry {
  roomId: string;
  temperatureC?: number;
  humidityPercent?: number;
  co2ppm?: number;
  energyKwh?: number;
  workflowStage?: string;
  occupancyPercent?: number;
  contaminationRisk?: 'low' | 'medium' | 'high';
  alerts?: string[];
}

export interface EquipmentTelemetry {
  equipmentId: string;
  status: EquipmentState['status'];
  utilizationPercent?: number;
  energyKwh?: number;
  throughputPerHour?: number;
  alerts?: string[];
}

export interface TelemetryEnvelope {
  facilityId: string;
  rooms: RoomTelemetry[];
  equipment: EquipmentTelemetry[];
  timestamp?: string;
}

export function buildSnapshot(layout: FacilityLayout, telemetry: TelemetryEnvelope): DigitalTwinSnapshot {
  const roomStates = layout.rooms.map((room) => mapRoomState(room.roomId, telemetry.rooms));
  const equipmentStates = layout.equipment.map((eq) => mapEquipmentState(eq.equipmentId, telemetry.equipment));

  const overlays = buildOverlays(roomStates, equipmentStates);

  return {
    snapshotId: `${layout.facilityId}-${telemetry.timestamp ?? Date.now()}`,
    facilityId: layout.facilityId,
    timestamp: telemetry.timestamp ?? new Date().toISOString(),
    layout,
    roomStates,
    equipmentStates,
    overlays,
  };
}

function mapRoomState(roomId: string, rooms: RoomTelemetry[]): RoomState {
  const data = rooms.find((r) => r.roomId === roomId);
  const color = deriveRoomColor(data);
  return {
    roomId,
    temperatureC: data?.temperatureC,
    humidityPercent: data?.humidityPercent,
    co2ppm: data?.co2ppm,
    energyKwh: data?.energyKwh,
    workflowStage: data?.workflowStage,
    occupancyPercent: data?.occupancyPercent,
    contaminationRisk: data?.contaminationRisk,
    alerts: data?.alerts ?? [],
    color,
  };
}

function mapEquipmentState(equipmentId: string, equipment: EquipmentTelemetry[]): EquipmentState {
  const data = equipment.find((e) => e.equipmentId === equipmentId);
  const color = deriveEquipmentColor(data?.status, data?.alerts);
  return {
    equipmentId,
    status: data?.status ?? 'offline',
    utilizationPercent: data?.utilizationPercent,
    energyKwh: data?.energyKwh,
    throughputPerHour: data?.throughputPerHour,
    alerts: data?.alerts ?? [],
    color,
  };
}

function deriveRoomColor(data?: RoomTelemetry): RoomState['color'] {
  if (!data) return 'red';
  if (data.contaminationRisk === 'high') return 'red';
  if ((data.temperatureC ?? 0) > 30) return 'red';
  if ((data.humidityPercent ?? 0) > 90) return 'yellow';
  if ((data.contaminationRisk === 'medium') || (data.alerts && data.alerts.length > 0)) return 'yellow';
  return 'green';
}

function deriveEquipmentColor(status?: EquipmentState['status'], alerts?: string[]): EquipmentState['color'] {
  if (status === 'alert') return 'red';
  if (status === 'offline') return 'yellow';
  if (alerts && alerts.length > 0) return 'yellow';
  return 'green';
}

function buildOverlays(roomStates: RoomState[], equipmentStates: EquipmentState[]): DigitalTwinSnapshot['overlays'] {
  const heatmap = roomStates
    .filter((r) => typeof r.temperatureC === 'number')
    .map((r) => ({ roomId: r.roomId, value: r.temperatureC ?? 0, metric: 'temperature' as const }));

  const bottlenecks = roomStates
    .filter((r) => (r.occupancyPercent ?? 0) > 85)
    .map((r) => r.roomId);

  const offlineEquipment = equipmentStates
    .filter((eq) => eq.status === 'offline' || eq.status === 'alert')
    .map((eq) => eq.equipmentId);

  return { heatmap, bottlenecks, offlineEquipment };
}
