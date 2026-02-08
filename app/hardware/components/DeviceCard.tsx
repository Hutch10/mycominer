'use client';

import { DeviceMetadata } from '../engine/hardwareTypes';

interface DeviceCardProps {
  device: DeviceMetadata;
}

export function DeviceCard({ device }: DeviceCardProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{device.name}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{device.kind} • {device.connectionType}</p>
          {device.model && <p className="text-xs text-gray-500 dark:text-gray-500">{device.model}</p>}
          {device.firmware && <p className="text-xs text-gray-500 dark:text-gray-500">FW {device.firmware}</p>}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
          <p>ID: {device.id}</p>
          {device.lastSeen && <p>Last seen: {new Date(device.lastSeen).toLocaleTimeString()}</p>}
        </div>
      </div>
      {device.tags && device.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-600 dark:text-gray-400">
          {device.tags.map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
