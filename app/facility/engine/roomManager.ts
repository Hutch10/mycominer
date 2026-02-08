'use client';

import { RoomConfig, RoomState, RoomId, DeviceId, TelemetrySourceId } from './facilityTypes';

class RoomManager {
  private rooms: Map<RoomId, RoomState> = new Map();
  private listeners: Map<string, Set<Function>> = new Map();

  createRoom(config: Omit<RoomConfig, 'id'> & { id?: RoomId }): RoomState {
    const id = config.id ?? `room-${Date.now()}`;
    const state: RoomState = {
      config: {
        id,
        name: config.name,
        species: config.species,
        stage: config.stage,
        devices: config.devices ?? [],
        telemetrySources: config.telemetrySources ?? [],
        targets: config.targets ?? {},
      },
      active: true,
      lastUpdated: Date.now(),
      alerts: [],
    };
    this.rooms.set(id, state);
    this.emit('room-updated', state);
    return state;
  }

  updateRoom(id: RoomId, updates: Partial<RoomConfig>): RoomState | undefined {
    const current = this.rooms.get(id);
    if (!current) return;
    current.config = { ...current.config, ...updates, id: current.config.id };
    current.lastUpdated = Date.now();
    this.rooms.set(id, current);
    this.emit('room-updated', current);
    return current;
  }

  deleteRoom(id: RoomId): void {
    this.rooms.delete(id);
    this.emit('room-deleted', id);
  }

  assignDevice(roomId: RoomId, deviceId: DeviceId) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    if (!room.config.devices.includes(deviceId)) room.config.devices.push(deviceId);
    room.lastUpdated = Date.now();
    this.emit('room-updated', room);
  }

  assignTelemetry(roomId: RoomId, sourceId: TelemetrySourceId) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    if (!room.config.telemetrySources.includes(sourceId)) room.config.telemetrySources.push(sourceId);
    room.lastUpdated = Date.now();
    this.emit('room-updated', room);
  }

  setStage(roomId: RoomId, stage: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.config.stage = stage;
    room.lastUpdated = Date.now();
    this.emit('room-updated', room);
  }

  setSpecies(roomId: RoomId, species: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.config.species = species;
    room.lastUpdated = Date.now();
    this.emit('room-updated', room);
  }

  list(): RoomState[] {
    return Array.from(this.rooms.values());
  }

  get(id: RoomId): RoomState | undefined {
    return this.rooms.get(id);
  }

  updateTelemetry(roomId: RoomId, reading: Partial<RoomState['currentReading']>) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.currentReading = { ...room.currentReading, ...reading };
    room.lastUpdated = Date.now();
    this.emit('room-updated', room);
  }

  on(event: string, handler: (payload: any) => void) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: (payload: any) => void) {
    this.listeners.get(event)?.delete(handler);
  }

  private emit(event: string, payload: any) {
    this.listeners.get(event)?.forEach((h) => h(payload));
  }
}

export const roomManager = new RoomManager();
