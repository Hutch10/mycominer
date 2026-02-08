'use client';

import { DeviceMetadata, HardwareAction, HardwareLogEntry } from './hardwareTypes';

class DeviceRegistry {
  private devices: Map<string, DeviceMetadata> = new Map();
  private actions: Map<string, HardwareAction> = new Map();
  private listeners: Map<string, Set<Function>> = new Map();
  private logs: HardwareLogEntry[] = [];

  addDevice(meta: DeviceMetadata) {
    this.devices.set(meta.id, { ...meta, lastSeen: Date.now() });
    this.emit('device-added', meta);
  }

  updateLastSeen(id: string) {
    const meta = this.devices.get(id);
    if (meta) {
      meta.lastSeen = Date.now();
      this.devices.set(id, meta);
      this.emit('device-updated', meta);
    }
  }

  list(): DeviceMetadata[] {
    return Array.from(this.devices.values());
  }

  get(id: string): DeviceMetadata | undefined {
    return this.devices.get(id);
  }

  registerAction(action: HardwareAction) {
    this.actions.set(action.id, action);
    this.emit('action-registered', action);
  }

  updateAction(actionId: string, updates: Partial<HardwareAction>) {
    const current = this.actions.get(actionId);
    if (!current) return;
    const next = { ...current, ...updates };
    this.actions.set(actionId, next);
    this.emit('action-updated', next);
  }

  getActions(): HardwareAction[] {
    return Array.from(this.actions.values());
  }

  log(entry: HardwareLogEntry) {
    this.logs.push(entry);
    if (this.logs.length > 5000) this.logs.shift();
    this.emit('log', entry);
  }

  getLogs(limit = 200): HardwareLogEntry[] {
    return this.logs.slice(-limit);
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

export const deviceRegistry = new DeviceRegistry();
