import { EquipmentNode, FacilityLayout, LayoutMode, Position, RoomLayout, Size, SpatialLink, ViewDimension } from './digitalTwinTypes';

interface LayoutInputRoom {
  roomId: string;
  name: string;
  purpose: string;
  capacity: number;
}

interface LayoutInputEquipment {
  equipmentId: string;
  name: string;
  type: string;
  roomId: string;
  status: 'online' | 'offline' | 'maintenance' | 'alert';
}

export interface FacilityLayoutInput {
  facilityId: string;
  facilityName: string;
  view?: ViewDimension;
  layoutMode?: LayoutMode;
  rooms: LayoutInputRoom[];
  equipment: LayoutInputEquipment[];
  gridCellSize?: Size;
}

const defaultSize: Size = { width: 8, height: 4, depth: 3 };
const defaultGridCellSize: Size = { width: 12, height: 8, depth: 3 };

export function buildFacilityLayout(input: FacilityLayoutInput): FacilityLayout {
  const view: ViewDimension = input.view ?? '2d';
  const layoutMode: LayoutMode = input.layoutMode ?? 'grid';
  const gridCellSize = input.gridCellSize ?? defaultGridCellSize;

  const rooms: RoomLayout[] = input.rooms.map((room, index) => {
    const position = computeRoomPosition(index, layoutMode, gridCellSize);
    return {
      roomId: room.roomId,
      name: room.name,
      purpose: room.purpose,
      position,
      size: defaultSize,
      capacity: room.capacity,
      adjacency: [],
    };
  });

  const spatialLinks = buildSpatialLinks(rooms, layoutMode);
  applyAdjacency(rooms, spatialLinks);

  const equipment: EquipmentNode[] = input.equipment.map((item) => ({
    equipmentId: item.equipmentId,
    name: item.name,
    type: item.type,
    roomId: item.roomId,
    position: { x: 1, y: 1, z: 0 },
    footprint: { width: 2, height: 2, depth: 1 },
    status: item.status,
  }));

  return {
    facilityId: input.facilityId,
    facilityName: input.facilityName,
    view,
    layoutMode,
    rooms,
    equipment,
    spatialLinks,
    updatedAt: new Date().toISOString(),
  };
}

function computeRoomPosition(index: number, mode: LayoutMode, cell: Size): Position {
  if (mode === 'flow') {
    return { x: 0, y: index * (cell.height + 2), z: 0, level: 0 };
  }

  const columns = mode === 'adjacency' ? Math.max(2, Math.ceil(Math.sqrt(index + 1))) : 3;
  const col = index % columns;
  const row = Math.floor(index / columns);
  return { x: col * (cell.width + 4), y: row * (cell.height + 4), z: 0, level: 0 };
}

function buildSpatialLinks(rooms: RoomLayout[], mode: LayoutMode): SpatialLink[] {
  const links: SpatialLink[] = [];
  for (let i = 0; i < rooms.length - 1; i += 1) {
    const from = rooms[i];
    const to = rooms[i + 1];
    links.push({
      linkId: `${from.roomId}-${to.roomId}`,
      fromRoomId: from.roomId,
      toRoomId: to.roomId,
      type: mode === 'flow' ? 'flow' : 'hallway',
      distance: computeDistance(from.position, to.position),
    });
  }
  return links;
}

function applyAdjacency(rooms: RoomLayout[], links: SpatialLink[]): void {
  const map = new Map<string, RoomLayout>();
  rooms.forEach((room) => map.set(room.roomId, room));
  links.forEach((link) => {
    const from = map.get(link.fromRoomId);
    const to = map.get(link.toRoomId);
    if (from && !from.adjacency.includes(link.toRoomId)) {
      from.adjacency.push(link.toRoomId);
    }
    if (to && !to.adjacency.includes(link.fromRoomId)) {
      to.adjacency.push(link.fromRoomId);
    }
  });
}

function computeDistance(a: Position, b: Position): number {
  const dx = (a.x ?? 0) - (b.x ?? 0);
  const dy = (a.y ?? 0) - (b.y ?? 0);
  const dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
