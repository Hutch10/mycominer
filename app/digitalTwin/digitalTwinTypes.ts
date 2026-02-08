// Phase 28: Digital Twin Types
// Deterministic visualization-only types (no simulation)

export type LayoutMode = 'grid' | 'flow' | 'adjacency';
export type ViewDimension = '2d' | '3d';

export interface Position {
  x: number;
  y: number;
  z?: number;
  level?: number;
}

export interface Size {
  width: number;
  height: number;
  depth?: number;
}

export interface FacilityLayout {
  facilityId: string;
  facilityName: string;
  view: ViewDimension;
  layoutMode: LayoutMode;
  rooms: RoomLayout[];
  equipment: EquipmentNode[];
  spatialLinks: SpatialLink[];
  updatedAt: string;
}

export interface RoomLayout {
  roomId: string;
  name: string;
  purpose: string;
  position: Position;
  size: Size;
  capacity: number;
  adjacency: string[]; // neighbor roomIds
}

export interface EquipmentNode {
  equipmentId: string;
  name: string;
  type: string;
  roomId: string;
  position: Position; // relative to room
  footprint: Size;
  status: 'online' | 'offline' | 'maintenance' | 'alert';
}

export interface SpatialLink {
  linkId: string;
  fromRoomId: string;
  toRoomId: string;
  type: 'door' | 'hallway' | 'elevator' | 'stairs' | 'flow';
  distance: number;
  direction?: 'north' | 'south' | 'east' | 'west' | 'up' | 'down';
}

export interface RoomState {
  roomId: string;
  temperatureC?: number;
  humidityPercent?: number;
  co2ppm?: number;
  contaminationRisk?: 'low' | 'medium' | 'high';
  energyKwh?: number;
  workflowStage?: string;
  occupancyPercent?: number;
  alerts?: string[];
  color?: 'green' | 'yellow' | 'red';
}

export interface EquipmentState {
  equipmentId: string;
  status: 'online' | 'offline' | 'maintenance' | 'alert';
  utilizationPercent?: number;
  energyKwh?: number;
  throughputPerHour?: number;
  alerts?: string[];
  color?: 'green' | 'yellow' | 'red';
}

export interface DigitalTwinSnapshot {
  snapshotId: string;
  facilityId: string;
  timestamp: string;
  layout: FacilityLayout;
  roomStates: RoomState[];
  equipmentStates: EquipmentState[];
  overlays: {
    heatmap?: Array<{ roomId: string; value: number; metric: 'temperature' | 'humidity' | 'energy' | 'load' }>;
    bottlenecks?: string[]; // roomIds
    offlineEquipment?: string[]; // equipmentIds
  };
}

export type DigitalTwinInsightType =
  | 'bottleneck'
  | 'load-imbalance'
  | 'offline-equipment'
  | 'contamination-risk'
  | 'energy-hotspot'
  | 'workflow-lag';

export interface DigitalTwinInsight {
  insightId: string;
  facilityId: string;
  timestamp: string;
  type: DigitalTwinInsightType;
  severity: 'low' | 'medium' | 'high';
  summary: string;
  details: string;
  impactedRooms?: string[];
  impactedEquipment?: string[];
  suggestedView?: ViewDimension;
}

export type DigitalTwinLogCategory =
  | 'snapshot'
  | 'layout-generated'
  | 'state-mapped'
  | 'insight-generated'
  | 'export';

export interface DigitalTwinLogEntry {
  entryId: string;
  timestamp: string;
  category: DigitalTwinLogCategory;
  message: string;
  context: {
    facilityId?: string;
    snapshotId?: string;
    layoutId?: string;
    insightId?: string;
  };
  details?: unknown;
}
