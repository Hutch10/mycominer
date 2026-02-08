'use client';

import { ConnectionType, DeviceMetadata, DeviceCapability } from './hardwareTypes';
import { deviceRegistry } from './deviceRegistry';

export interface HardwareAdapter {
  type: ConnectionType;
  name: string;
  connect(device: DeviceMetadata): Promise<void>;
  disconnect(deviceId: string): Promise<void>;
  read?(deviceId: string): Promise<any>;
  write?(deviceId: string, payload: any): Promise<void>;
  capabilities?(deviceId: string): Promise<DeviceCapability[]>;
  validate?(meta: DeviceMetadata): Promise<boolean>;
}

abstract class BaseAdapter implements HardwareAdapter {
  abstract type: ConnectionType;
  abstract name: string;
  async connect(_device: DeviceMetadata): Promise<void> {
    throw new Error('connect not implemented');
  }
  async disconnect(_deviceId: string): Promise<void> {}
}

export class WebBluetoothHardwareAdapter extends BaseAdapter {
  type: ConnectionType = 'bluetooth';
  name = 'Web Bluetooth Adapter';
  private devices: Map<string, any> = new Map();

  async connect(device: DeviceMetadata): Promise<void> {
    const bluetooth = (navigator as any)?.bluetooth;
    if (!bluetooth) throw new Error('Web Bluetooth not supported');
    const dev = await bluetooth.requestDevice({ acceptAllDevices: true });
    this.devices.set(device.id, dev);
    deviceRegistry.updateLastSeen(device.id);
  }

  async disconnect(deviceId: string): Promise<void> {
    const dev = this.devices.get(deviceId);
    if (dev?.gatt?.connected) await dev.gatt.disconnect();
    this.devices.delete(deviceId);
  }
}

export class WebSerialHardwareAdapter extends BaseAdapter {
  type: ConnectionType = 'serial';
  name = 'Web Serial Adapter';
  private ports: Map<string, any> = new Map();

  async connect(device: DeviceMetadata): Promise<void> {
    const serial = (navigator as any)?.serial;
    if (!serial) throw new Error('Web Serial not supported');
    const port = await serial.requestPort();
    await port.open({ baudRate: 9600 });
    this.ports.set(device.id, port);
    deviceRegistry.updateLastSeen(device.id);
  }

  async disconnect(deviceId: string): Promise<void> {
    const port = this.ports.get(deviceId);
    if (port) await port.close();
    this.ports.delete(deviceId);
  }
}

export class WebUSBHardwareAdapter extends BaseAdapter {
  type: ConnectionType = 'usb';
  name = 'WebUSB Adapter';
  private devices: Map<string, any> = new Map();

  async connect(device: DeviceMetadata): Promise<void> {
    const usb = (navigator as any)?.usb;
    if (!usb) throw new Error('WebUSB not supported');
    const dev = await usb.requestDevice({ filters: [] });
    await dev.open();
    if (dev.configuration === null) await dev.selectConfiguration(1);
    this.devices.set(device.id, dev);
    deviceRegistry.updateLastSeen(device.id);
  }

  async disconnect(deviceId: string): Promise<void> {
    const dev = this.devices.get(deviceId);
    if (dev) await dev.close();
    this.devices.delete(deviceId);
  }
}

export class WebSocketHardwareAdapter extends BaseAdapter {
  type: ConnectionType = 'websocket';
  name = 'WebSocket Adapter';
  private sockets: Map<string, WebSocket> = new Map();

  async connect(device: DeviceMetadata): Promise<void> {
    const url = device.tags?.find((t) => t.startsWith('ws://') || t.startsWith('wss://'));
    if (!url) throw new Error('Missing WebSocket URL tag');
    const socket = new WebSocket(url);
    this.sockets.set(device.id, socket);
    deviceRegistry.updateLastSeen(device.id);
  }

  async disconnect(deviceId: string): Promise<void> {
    const socket = this.sockets.get(deviceId);
    socket?.close();
    this.sockets.delete(deviceId);
  }
}

export class MQTTHardwareAdapter extends BaseAdapter {
  type: ConnectionType = 'mqtt';
  name = 'MQTT Adapter';
  private clients: Map<string, any> = new Map();

  async connect(device: DeviceMetadata): Promise<void> {
    // Placeholder for MQTT client creation; keep optional
    const endpoint = device.tags?.find((t) => t.startsWith('mqtt://') || t.startsWith('wss://'));
    if (!endpoint) throw new Error('Missing MQTT endpoint');
    const client = { endpoint }; // substitute for real client
    this.clients.set(device.id, client);
    deviceRegistry.updateLastSeen(device.id);
  }

  async disconnect(deviceId: string): Promise<void> {
    this.clients.delete(deviceId);
  }
}

export function createHardwareAdapter(type: ConnectionType): HardwareAdapter {
  switch (type) {
    case 'bluetooth':
      return new WebBluetoothHardwareAdapter();
    case 'serial':
      return new WebSerialHardwareAdapter();
    case 'usb':
      return new WebUSBHardwareAdapter();
    case 'websocket':
      return new WebSocketHardwareAdapter();
    case 'mqtt':
      return new MQTTHardwareAdapter();
    default:
      return new WebSocketHardwareAdapter();
  }
}
