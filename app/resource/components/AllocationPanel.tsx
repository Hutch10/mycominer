// Phase 20: Allocation Panel Component
// Displays resource allocations with fulfillment status

'use client';

import { AllocationPlan, ResourceAllocation } from '@/app/resource/resourceTypes';

interface AllocationPanelProps {
  plan: AllocationPlan | null;
  onApprove?: () => void;
  onReject?: () => void;
}

export function AllocationPanel({ plan, onApprove, onReject }: AllocationPanelProps) {
  if (!plan) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No allocation plan generated yet
      </div>
    );
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'pending-approval': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  };

  // Group allocations by category
  const grouped = plan.allocations.reduce((acc, alloc) => {
    if (!acc[alloc.category]) acc[alloc.category] = [];
    acc[alloc.category].push(alloc);
    return acc;
  }, {} as Record<string, ResourceAllocation[]>);

  const fulfillmentRate = plan.allocations.length > 0
    ? (plan.allocations.filter(a => a.quantityAllocated >= a.quantityRequested).length / plan.allocations.length) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Allocation Plan
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Plan ID: {plan.planId}
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[plan.status]}`}>
          {plan.status}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Fulfillment Rate</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {fulfillmentRate.toFixed(0)}%
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Confidence</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {plan.confidence}%
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Unmet Requirements</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {plan.unmetRequirements.length}
          </div>
        </div>
      </div>

      {/* Allocations by Category */}
      {Object.entries(grouped).map(([category, allocations]) => (
        <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white capitalize mb-3">
            {category.replace('-', ' ')}
          </h3>

          <div className="space-y-2">
            {allocations.map((alloc, idx) => {
              const isFulfilled = alloc.quantityAllocated >= alloc.quantityRequested;
              const fulfillmentPercent = (alloc.quantityAllocated / alloc.quantityRequested) * 100;

              return (
                <div
                  key={idx}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {alloc.resourceName}
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Requested: {alloc.quantityRequested} {alloc.unit} •{' '}
                        Allocated: {alloc.quantityAllocated} {alloc.unit}
                      </div>

                      {/* Fulfillment bar */}
                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            isFulfilled ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${Math.min(100, fulfillmentPercent)}%` }}
                        />
                      </div>

                      {alloc.source && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Source: {alloc.source}
                        </div>
                      )}
                    </div>

                    <span
                      className={`ml-4 px-2 py-1 rounded text-xs font-medium ${
                        isFulfilled
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}
                    >
                      {isFulfilled ? 'Full' : 'Partial'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Unmet Requirements */}
      {plan.unmetRequirements.length > 0 && (
        <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-950">
          <h3 className="text-lg font-medium text-red-900 dark:text-red-300 mb-3">
            Unmet Requirements ({plan.unmetRequirements.length})
          </h3>

          <div className="space-y-2">
            {plan.unmetRequirements.map((req, idx) => (
              <div key={idx} className="text-sm text-red-800 dark:text-red-400">
                • {req.resourceName}: {req.quantityNeeded} {req.unit}
                {req.rationale && ` - ${req.rationale}`}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conflicts */}
      {plan.conflicts.length > 0 && (
        <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950">
          <h3 className="text-lg font-medium text-yellow-900 dark:text-yellow-300 mb-3">
            Conflicts ({plan.conflicts.length})
          </h3>

          <div className="space-y-2">
            {plan.conflicts.map((conflict, idx) => (
              <div key={idx} className="text-sm text-yellow-800 dark:text-yellow-400">
                • {conflict}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Actions */}
      {plan.status === 'pending-approval' && onApprove && onReject && (
        <div className="flex gap-3">
          <button
            onClick={onApprove}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Approve Allocation
          </button>
          <button
            onClick={onReject}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reject Allocation
          </button>
        </div>
      )}
    </div>
  );
}
