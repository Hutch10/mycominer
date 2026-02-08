'use client';

import { DeviceCapability } from '../engine/hardwareTypes';

interface DeviceCapabilityPanelProps {
  capabilities: DeviceCapability[];
}

export function DeviceCapabilityPanel({ capabilities }: DeviceCapabilityPanelProps) {
  if (!capabilities || capabilities.length === 0) {
    return <p className="text-xs text-gray-500 dark:text-gray-400">No declared capabilities</p>;
  }

  return (
    <div className="space-y-2">
      {capabilities.map((cap) => (
        <div key={cap.id} className="border border-gray-200 dark:border-gray-800 rounded p-2">
          <p className="text-xs font-semibold text-gray-900 dark:text-white">{cap.type.toUpperCase()} • {cap.description}</p>
          {cap.fields && cap.fields.length > 0 && (
            <div className="mt-1 grid grid-cols-2 gap-1 text-[11px] text-gray-600 dark:text-gray-400">
              {cap.fields.map((f) => (
                <div key={f.key} className="flex justify-between">
                  <span>{f.label}</span>
                  <span>{f.min !== undefined && f.max !== undefined ? `${f.min}–${f.max}${f.unit ?? ''}` : f.unit ?? ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
