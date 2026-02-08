'use client';

import { useState } from 'react';
import { ControllerRecommendation, HardwareAction } from '../engine/hardwareTypes';
import { ensureSafeAction } from '../engine/hardwareSafety';

interface ControllerActionPanelProps {
  recommendations: ControllerRecommendation[];
  onApprove: (rec: ControllerRecommendation) => Promise<HardwareAction>;
}

export function ControllerActionPanel({ recommendations, onApprove }: ControllerActionPanelProps) {
  const [status, setStatus] = useState<string>('');

  if (recommendations.length === 0) {
    return <p className="text-xs text-gray-500 dark:text-gray-400">No pending actions</p>;
  }

  const handleApprove = async (rec: ControllerRecommendation) => {
    const safety = ensureSafeAction(rec, {});
    if (!safety.ok) {
      setStatus(safety.errors[0] ?? 'Rejected by safety');
      return;
    }
    const action = await onApprove(rec);
    setStatus(`Action ${action.status}`);
  };

  return (
    <div className="space-y-2">
      {recommendations.map((rec) => (
        <div key={rec.actionId} className="border border-gray-200 dark:border-gray-800 rounded p-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{rec.title}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{rec.rationale}</p>
          <pre className="text-[11px] bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1 text-gray-700 dark:text-gray-300">{JSON.stringify(rec.params, null, 2)}</pre>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleApprove(rec)}
              className="px-3 py-1 text-xs font-semibold bg-green-600 text-white rounded"
            >
              Approve & Execute
            </button>
            <button className="px-3 py-1 text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
              Reject
            </button>
          </div>
        </div>
      ))}
      {status && <p className="text-xs text-gray-600 dark:text-gray-400">{status}</p>}
    </div>
  );
}
