'use client';

import React, { useState } from 'react';
import { SharedResourcePlan } from '../multiFacilityTypes';

interface SharedResourcePanelProps {
  plans: SharedResourcePlan[];
  onApprovePlan: (plan: SharedResourcePlan) => void;
  onRejectPlan: (plan: SharedResourcePlan, reason: string) => void;
}

export const SharedResourcePanel: React.FC<SharedResourcePanelProps> = ({
  plans,
  onApprovePlan,
  onRejectPlan,
}) => {
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  const resourceTypeColor: Record<string, string> = {
    substrate: 'bg-amber-100 text-amber-900 border-amber-300',
    equipment: 'bg-blue-100 text-blue-900 border-blue-300',
    energy: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    'cold-storage': 'bg-cyan-100 text-cyan-900 border-cyan-300',
    labor: 'bg-purple-100 text-purple-900 border-purple-300',
    'sterilization-capacity': 'bg-rose-100 text-rose-900 border-rose-300',
  };

  const statusColor: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    audited: 'bg-blue-100 text-blue-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-rose-100 text-rose-700',
    implemented: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Shared Resource Plans</h3>
        <p className="text-sm text-gray-600">
          {plans.length} resource coordination {plans.length === 1 ? 'plan' : 'plans'} detected
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 text-sm">No resource contention detected</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <div
              key={plan.planId}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${resourceTypeColor[plan.resourceType]}`}
              onClick={() =>
                setExpandedPlanId(
                  expandedPlanId === plan.planId ? null : plan.planId
                )
              }
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${resourceTypeColor[plan.resourceType]}`}
                    >
                      {plan.resourceType.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor[plan.status]}`}>
                      {plan.status.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {plan.resourceType === 'substrate'
                      ? 'Substrate Rebalancing'
                      : plan.resourceType === 'equipment'
                        ? 'Equipment Sharing'
                        : plan.resourceType === 'energy'
                          ? 'Energy Load Balancing'
                          : `${plan.resourceType.replace('-', ' ')} Coordination`}
                  </h4>
                  <p className="text-sm text-gray-700">
                    Status: <span className="font-semibold">{plan.currentStatus}</span>
                  </p>
                </div>
                <span className="text-2xl">{expandedPlanId === plan.planId ? '▼' : '▶'}</span>
              </div>

              {expandedPlanId === plan.planId && (
                <div className="mt-4 pt-4 border-t border-current border-opacity-20 space-y-3">
                  {/* Affected Facilities */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Affected Facilities</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {plan.facilities.map((f) => (
                        <div key={f.facilityId} className="bg-white bg-opacity-50 rounded p-2 text-sm">
                          <p className="font-semibold text-gray-900">{f.facilityId}</p>
                          <p className="text-xs text-gray-600">
                            Priority: <span className="font-semibold">{f.priority}</span>
                          </p>
                          <p className="text-xs text-gray-600">
                            Current: {f.currentAllocation} | Requested: {f.requestedAllocation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Proposed Rebalancing */}
                  {plan.proposedRebalancing.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 mb-2">Proposed Transfers</h5>
                      <div className="space-y-2">
                        {plan.proposedRebalancing.slice(0, 2).map((rebal, idx) => (
                          <div key={idx} className="bg-white bg-opacity-50 rounded p-2 text-sm">
                            <p className="font-semibold text-gray-900">
                              {rebal.fromFacilityId} → {rebal.toFacilityId}
                            </p>
                            <p className="text-xs text-gray-600">
                              {rebal.quantity} {rebal.unit} • {rebal.implementationHours}h
                            </p>
                          </div>
                        ))}
                        {plan.proposedRebalancing.length > 2 && (
                          <p className="text-xs text-gray-600">
                            +{plan.proposedRebalancing.length - 2} more transfers
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {plan.status === 'draft' && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onApprovePlan(plan);
                        }}
                        className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded text-sm font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRejectPlan(plan, 'User rejection');
                        }}
                        className="flex-1 px-3 py-2 bg-rose-600 text-white rounded text-sm font-semibold hover:bg-rose-700 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
