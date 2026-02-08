/**
 * Sensor Adapters
 * Modular interfaces for different sensor/data sources
 */

import { AdapterInterface, SensorConfig, EnvironmentalReading, AdapterType } from './telemetryTypes';

/**
 * MockAdapter: Demo/testing mode
 * Generates realistic synthetic environmental data
 */
export class MockAdapter implements AdapterInterface {
  name = 'Mock Sensor';
  type: AdapterType = 'mock';
  private isConnected_ = false;
  private intervalId?: NodeJS.Timeout;
  private listeners: Map<string, Set<Function>> = new Map();

  async connect(config: SensorConfig): Promise<void> {
    this.isConnected_ = true;
    const interval = config.readingIntervalMs || 5000;

    this.intervalId = setInterval(() => {
      const reading = this.generateReading();
      this.emit('reading', reading);
    }, interval);
  }

  async disconnect(): Promise<void> {
    if (this.intervalId) clearInterval(this.intervalId);
    this.isConnected_ = false;
  }

  isConnected(): boolean {
    return this.isConnected_;
  }

  async read(): Promise<EnvironmentalReading> {
    return this.generateReading();
  }

  private generateReading(): EnvironmentalReading {
    // Simulate realistic conditions: slight variation around ideal fruiting
    const baseTemp = 22;
    const baseHumidity = 88;
    const baseCO2 = 1200;

    return {
      timestamp: Date.now(),
      temperature: baseTemp + (Math.random() - 0.5) * 2,
      humidity: baseHumidity + (Math.random() - 0.5) * 5,
      co2: baseCO2 + (Math.random() - 0.5) * 300,
      airflow: 50 + Math.random() * 30,
      light: 200 + Math.random() * 100,
      pressure: 101325 + (Math.random() - 0.5) * 100,
    };
  }

  on(event: string, handler: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: (data: any) => void): void {
    this.listeners.get(event)?.delete(handler);
  }

  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach((handler) => handler(data));
  }
}

/**
 * WebBluetoothAdapter: Connect to BLE environmental sensors
 */
export class WebBluetoothAdapter implements AdapterInterface {
  name = 'Web Bluetooth Sensor';
  type: AdapterType = 'bluetooth';
  // Use loose typing to avoid build-time DOM dependency when not in browser
  private device?: any;
  private characteristic?: any;
  private listeners: Map<string, Set<Function>> = new Map();

  async connect(config: SensorConfig): Promise<void> {
    try {
      const bluetooth = (navigator as any).bluetooth;
      if (!bluetooth) throw new Error('Web Bluetooth not supported');

      const device = await bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['environmental-sensing'],
      });

      const server = await device.gatt!.connect();
      const service = await server.getPrimaryService('environmental-sensing');
      this.characteristic = await service.getCharacteristic('temperature');

      this.device = device;
      this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = (event.target as any).value;
        const reading = this.parseReading(value!);
        this.emit('reading', reading);
      });
    } catch (error) {
      console.error('Bluetooth connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
  }

  isConnected(): boolean {
    return !!this.device?.gatt?.connected;
  }

  async read(): Promise<EnvironmentalReading> {
    if (!this.characteristic) throw new Error('Not connected');
    const value = await this.characteristic.readValue();
    return this.parseReading(value);
  }

  private parseReading(value: DataView): EnvironmentalReading {
    // Typical BLE environmental sensing service format
    const temperature = (value.getInt16(0, true) / 200.0);
    const humidity = value.getUint8(2);
    return {
      timestamp: Date.now(),
      temperature,
      humidity,
    };
  }

  on(event: string, handler: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: (data: any) => void): void {
    this.listeners.get(event)?.delete(handler);
  }

  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach((handler) => handler(data));
  }
}

/**
 * WebSerialAdapter: Connect via USB serial (Arduino, sensors with COM port)
 */
export class WebSerialAdapter implements AdapterInterface {
  name = 'Web Serial Sensor';
  type: AdapterType = 'serial';
  private port?: any;
  private reader?: any;
  private listeners: Map<string, Set<Function>> = new Map();

  async connect(config: SensorConfig): Promise<void> {
    try {
      const serial = (navigator as any).serial;
      if (!serial) throw new Error('Web Serial not supported');

      const port = await serial.requestPort();
      await port.open({ baudRate: 9600 });
      this.port = port;

      // Start reading
      this.startReading();
    } catch (error) {
      console.error('Serial connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.reader) {
      await this.reader.cancel();
    }
    if (this.port) {
      await this.port.close();
    }
  }

  isConnected(): boolean {
    return !!this.port;
  }

  async read(): Promise<EnvironmentalReading> {
    if (!this.reader) throw new Error('Not connected');
    // This would be called internally; real implementation depends on sensor protocol
    return { timestamp: Date.now() };
  }

  private async startReading(): Promise<void> {
    if (!this.port) return;
    this.reader = this.port.readable!.getReader();

    try {
      let buffer = '';
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        buffer += text;

        // Parse newline-delimited JSON or CSV
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const reading = JSON.parse(line) as EnvironmentalReading;
              this.emit('reading', reading);
            } catch (e) {
              console.warn('Failed to parse serial data:', line);
            }
          }
        }
      }
    } catch (error) {
      if ((error as DOMException).name !== 'NotAllowedError') {
        console.error('Serial read error:', error);
      }
    }
  }

  on(event: string, handler: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: (data: any) => void): void {
    this.listeners.get(event)?.delete(handler);
  }

  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach((handler) => handler(data));
  }
}

/**
 * WebSocketAdapter: Remote sensors via WebSocket
 */
export class WebSocketAdapter implements AdapterInterface {
  name = 'WebSocket Sensor';
  type: AdapterType = 'websocket';
  private ws?: WebSocket;
  private listeners: Map<string, Set<Function>> = new Map();
  private url: string = '';

  async connect(config: SensorConfig): Promise<void> {
    const url = config.schema?.url || 'ws://localhost:8080/telemetry';
    this.url = url;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);
        this.ws.onopen = () => resolve();
        this.ws.onerror = (error) => reject(error);
        this.ws.onmessage = (event) => {
          try {
            const reading = JSON.parse(event.data) as EnvironmentalReading;
            this.emit('reading', reading);
          } catch (e) {
            console.warn('Failed to parse WebSocket data:', event.data);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  async read(): Promise<EnvironmentalReading> {
    throw new Error('WebSocket adapter uses event streaming; use on("reading") instead');
  }

  on(event: string, handler: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: (data: any) => void): void {
    this.listeners.get(event)?.delete(handler);
  }

  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach((handler) => handler(data));
  }
}

/**
 * Factory to create adapters by type
 */
export function createAdapter(type: AdapterType): AdapterInterface {
  switch (type) {
    case 'mock':
      return new MockAdapter();
    case 'bluetooth':
      return new WebBluetoothAdapter();
    case 'serial':
      return new WebSerialAdapter();
    case 'websocket':
      return new WebSocketAdapter();
    default:
      throw new Error(`Unknown adapter type: ${type}`);
  }
}
