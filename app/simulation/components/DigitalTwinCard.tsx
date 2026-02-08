'use client';

import { DigitalTwinSnapshot } from '@/app/simulation/engine/simulationTypes';

export default function DigitalTwinCard({ snapshot }: { snapshot: DigitalTwinSnapshot }) {
  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-2">{snapshot.facilityName}</h3>
      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <p>
          <span className="font-medium">Mode:</span> {snapshot.mode}
        </p>
        <p>
          <span className="font-medium">Rooms:</span> {snapshot.metadata.totalRooms}
        </p>
        <p>
          <span className="font-medium">Devices:</span> {snapshot.metadata.totalDevices}
        </p>
        <p>
          <span className="font-medium">Species:</span> {snapshot.metadata.species.join(', ') || 'None'}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Generated: {new Date(snapshot.timestamp).toLocaleString()}
        </p>
      </div>
      <div className="mt-3">
        <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
          Virtual Twin
        </span>
      </div>
    </div>
  );
}
