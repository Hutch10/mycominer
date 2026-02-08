'use client';

import { LoadBalancingPlan } from '@/app/optimization/optimizationTypes';

interface Props {
  plan: LoadBalancingPlan;
}

export function LoadBalancingPanel({ plan }: Props) {
  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-indigo-700">Load Balancing</div>
          <h2 className="text-xl font-bold text-indigo-900">Distribution plan</h2>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-indigo-900">{plan.peakReductionKwh}</div>
          <div className="text-xs text-indigo-700">kWh peak reduction</div>
        </div>
      </div>

      {plan.shifts.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-semibold text-indigo-900 mb-2">Task shifts</div>
          <div className="space-y-2">
            {plan.shifts.map((shift) => (
              <div key={shift.shiftId} className="rounded-lg bg-white p-3 text-sm text-indigo-800">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{shift.fromRoom} → {shift.toRoom}</span>
                  <span className="text-indigo-700">{shift.expectedEnergyReduction} kWh</span>
                </div>
                <div className="text-xs opacity-75 mt-1">{shift.expectedLabor}h labor | Risk: {shift.riskLevel}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {plan.staggeredSchedules.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-semibold text-indigo-900 mb-2">Staggered schedules</div>
          <div className="space-y-2">
            {plan.staggeredSchedules.map((sched, i) => (
              <div key={i} className="rounded-lg bg-white p-3 text-sm text-indigo-800">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{sched.resource}</span>
                  <span className="text-indigo-700">{sched.originalStartTime} → {sched.newStartTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="text-sm font-semibold text-indigo-900 mb-2">Room rebalancing</div>
        <div className="space-y-2">
          {plan.rebalancedRooms.map((room) => (
            <div key={room.roomId} className="rounded-lg bg-white p-3 text-sm text-indigo-800">
              <div className="flex items-center justify-between">
                <span className="font-medium">{room.roomId}</span>
                <span className="text-indigo-700">{room.prevPeakKwh} → {room.newPeakKwh} kWh</span>
              </div>
              <div className="w-full bg-indigo-100 rounded h-2 mt-2">
                <div className="bg-indigo-600 h-2 rounded" style={{ width: `${(room.newPeakKwh / 50) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-2 text-sm">
        <div className="rounded-lg bg-white px-3 py-2 text-indigo-800">
          <span className="opacity-75">Implementation</span>
          <div className="font-semibold">{plan.totalImplementationHours}h</div>
        </div>
        <div className="rounded-lg bg-white px-3 py-2 text-indigo-800">
          <span className="opacity-75">Confidence</span>
          <div className="font-semibold">{plan.confidence}%</div>
        </div>
      </div>
    </div>
  );
}
