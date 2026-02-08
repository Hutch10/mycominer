'use client';

import { RoomState } from '../engine/facilityTypes';

interface RoomStatusPanelProps {
  rooms: RoomState[];
}

export function RoomStatusPanel({ rooms }: RoomStatusPanelProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900">
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Room Status</p>
      {rooms.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">No rooms configured</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rooms.map((r) => (
            <div key={r.config.id} className="border border-gray-100 dark:border-gray-800 rounded p-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.config.name}</p>
              <p className="text-[11px] text-gray-600 dark:text-gray-400">{r.config.species} • {r.config.stage}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Devices: {r.config.devices.length}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Telemetry: {r.config.telemetrySources.length}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
