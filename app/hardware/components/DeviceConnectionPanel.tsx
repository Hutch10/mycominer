'use client';

import { useState } from 'react';
import { deviceRegistry } from '../engine/deviceRegistry';
import { createHardwareAdapter } from '../engine/hardwareAdapters';
import { DeviceMetadata, ConnectionType } from '../engine/hardwareTypes';

interface DeviceConnectionPanelProps {
  onDeviceAdded?: (device: DeviceMetadata) => void;
}

export function DeviceConnectionPanel({ onDeviceAdded }: DeviceConnectionPanelProps) {
  const [form, setForm] = useState({
    name: '',
    kind: 'controller',
    connectionType: 'mock' as ConnectionType,
  });
  const [status, setStatus] = useState<string>('');

  const handleAdd = async () => {
    if (!form.name) return;
    const meta: DeviceMetadata = {
      id: `${form.connectionType}-${Date.now()}`,
      name: form.name,
      kind: form.kind as any,
      connectionType: form.connectionType,
      capabilities: [],
    };
    deviceRegistry.addDevice(meta);
    onDeviceAdded?.(meta);

    // Attempt adapter connect (optional)
    try {
      const adapter = createHardwareAdapter(meta.connectionType);
      await adapter.connect(meta);
      setStatus('Connected');
    } catch (e: any) {
      setStatus(e?.message ?? 'Connect failed');
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900 space-y-2">
      <div className="flex gap-2">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Device name"
          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
        />
        <select
          value={form.connectionType}
          onChange={(e) => setForm({ ...form, connectionType: e.target.value as ConnectionType })}
          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
        >
          <option value="mock">Mock</option>
          <option value="bluetooth">Web Bluetooth</option>
          <option value="serial">Web Serial</option>
          <option value="usb">WebUSB</option>
          <option value="websocket">WebSocket</option>
          <option value="mqtt">MQTT</option>
        </select>
        <button
          onClick={handleAdd}
          className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded"
        >
          Add & Connect
        </button>
      </div>
      {status && <p className="text-xs text-gray-600 dark:text-gray-400">{status}</p>}
    </div>
  );
}
