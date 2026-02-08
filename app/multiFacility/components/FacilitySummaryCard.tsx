'use client';

import React from 'react';
import { FacilityProfile, FacilityLoadSnapshot } from '../multiFacilityTypes';
import { facilityAggregator } from '../facilityAggregator';

interface FacilitySummaryCardProps {
  facility: FacilityProfile;
  loadSnapshot?: FacilityLoadSnapshot;
}

export const FacilitySummaryCard: React.FC<FacilitySummaryCardProps> = ({
  facility,
  loadSnapshot,
}) => {
  const loadPercent = loadSnapshot?.currentLoadPercent ?? 0;
  const contentionLevel = loadSnapshot?.contentionLevel ?? 'low';

  const contentionColor = {
    low: 'bg-emerald-100 border-emerald-300 text-emerald-900',
    medium: 'bg-amber-100 border-amber-300 text-amber-900',
    high: 'bg-rose-100 border-rose-300 text-rose-900',
  }[contentionLevel];

  const loadColor = {
    low: loadPercent < 40,
    medium: loadPercent >= 40 && loadPercent < 70,
    high: loadPercent >= 70,
  };

  const loadBarColor = loadColor.high
    ? 'bg-rose-500'
    : loadColor.medium
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{facility.name}</h3>
          <p className="text-sm text-gray-600">{facility.location}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${contentionColor}`}>
          {contentionLevel.charAt(0).toUpperCase() + contentionLevel.slice(1)} Load
        </span>
      </div>

      <div className="space-y-3">
        {/* Utilization Progress */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600">Utilization</span>
            <span className="text-sm font-semibold text-gray-900">{loadPercent}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full ${loadBarColor} transition-all`} style={{ width: `${loadPercent}%` }} />
          </div>
        </div>

        {/* Capacity Info */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Capacity</p>
            <p className="text-sm font-semibold text-gray-900">{facility.totalCapacityKg} kg</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Rooms</p>
            <p className="text-sm font-semibold text-gray-900">{facility.rooms.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Energy Budget</p>
            <p className="text-sm font-semibold text-gray-900">{facility.energyBudgetKwh} kWh</p>
          </div>
        </div>

        {/* Active Species */}
        {loadSnapshot && loadSnapshot.activeSpecies.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Active Species</p>
            <div className="flex flex-wrap gap-1">
              {loadSnapshot.activeSpecies.slice(0, 3).map((species) => (
                <span key={species} className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded text-xs">
                  {species}
                </span>
              ))}
              {loadSnapshot.activeSpecies.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-700 rounded text-xs">
                  +{loadSnapshot.activeSpecies.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
