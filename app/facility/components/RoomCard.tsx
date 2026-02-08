'use client';

import { RoomState } from '../engine/facilityTypes';

interface RoomCardProps {
  room: RoomState;
}

export function RoomCard({ room }: RoomCardProps) {
  const reading = room.currentReading;
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{room.config.name}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{room.config.species} • {room.config.stage}</p>
        </div>
        <span className="text-[11px] text-gray-500 dark:text-gray-400">{room.active ? 'Active' : 'Paused'}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300 mt-3">
        <Stat label="Temp" value={reading?.temperature} unit="°C" />
        <Stat label="Humidity" value={reading?.humidity} unit="%" />
        <Stat label="CO₂" value={reading?.co2} unit="ppm" />
        <Stat label="Airflow" value={reading?.airflow} unit="CFM" />
      </div>
      {room.config.devices.length > 0 && (
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">Devices: {room.config.devices.join(', ')}</p>
      )}
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value?: number; unit?: string }) {
  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded p-2">
      <p className="text-[11px] text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{value !== undefined ? value.toFixed(1) : '—'} {unit}</p>
    </div>
  );
}
