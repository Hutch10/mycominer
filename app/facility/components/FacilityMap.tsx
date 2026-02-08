'use client';

import { RoomState } from '../engine/facilityTypes';

interface FacilityMapProps {
  rooms: RoomState[];
}

export function FacilityMap({ rooms }: FacilityMapProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900">
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Facility Map (abstract)</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {rooms.map((r) => (
          <div key={r.config.id} className="border border-gray-100 dark:border-gray-800 rounded p-2 bg-gray-50 dark:bg-gray-800">
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{r.config.name}</p>
            <p className="text-[11px] text-gray-600 dark:text-gray-400">{r.config.species}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Stage: {r.config.stage}</p>
          </div>
        ))}
        {rooms.length === 0 && <p className="text-xs text-gray-500 dark:text-gray-400">Add rooms to visualize layout</p>}
      </div>
    </div>
  );
}
