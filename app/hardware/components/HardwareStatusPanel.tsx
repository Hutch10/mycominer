'use client';

import { DeviceMetadata, HardwareLogEntry } from '../engine/hardwareTypes';

interface HardwareStatusPanelProps {
  devices: DeviceMetadata[];
  logs: HardwareLogEntry[];
}

export function HardwareStatusPanel({ devices, logs }: HardwareStatusPanelProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900 space-y-3">
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">Devices ({devices.length})</p>
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 flex flex-wrap gap-2">
          {devices.map((d) => (
            <span key={d.id} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
              {d.name} • {d.connectionType}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">Recent Actions</p>
        {logs.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">No actions logged</p>
        ) : (
          <div className="mt-2 space-y-1 text-[11px] text-gray-700 dark:text-gray-300 max-h-40 overflow-y-auto">
            {logs.slice(-10).reverse().map((l) => (
              <div key={l.id} className="flex justify-between">
                <span>{new Date(l.timestamp).toLocaleTimeString()} • {l.message}</span>
                <span className="uppercase">{l.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
