// Phase 20: Replenishment Proposal Card Component
// Displays individual replenishment proposals with urgency

'use client';

import { ReplenishmentProposal } from '@/app/resource/resourceTypes';

interface ReplenishmentProposalCardProps {
  proposal: ReplenishmentProposal;
  onApprove?: (proposal: ReplenishmentProposal) => void;
}

export function ReplenishmentProposalCard({
  proposal,
  onApprove,
}: ReplenishmentProposalCardProps) {
  const urgencyColors = {
    immediate: 'border-red-500 bg-red-50 dark:bg-red-950',
    high: 'border-orange-500 bg-orange-50 dark:bg-orange-950',
    medium: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950',
    low: 'border-green-500 bg-green-50 dark:bg-green-950',
  };

  const urgencyBadgeColors = {
    immediate: 'bg-red-600 text-white',
    high: 'bg-orange-600 text-white',
    medium: 'bg-yellow-600 text-white',
    low: 'bg-green-600 text-white',
  };

  const urgencyIcons = {
    immediate: '🚨',
    high: '⚠️',
    medium: '📋',
    low: '✓',
  };

  const daysUntilDepletion = proposal.forecastedDepletionDate
    ? Math.ceil(
        (new Date(proposal.forecastedDepletionDate).getTime() - Date.now()) / (24 * 3600000)
      )
    : null;

  return (
    <div
      className={`border-2 rounded-lg p-4 ${urgencyColors[proposal.urgency]}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{urgencyIcons[proposal.urgency]}</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {proposal.resourceName}
            </h3>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Category: {proposal.category}
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
            urgencyBadgeColors[proposal.urgency]
          }`}
        >
          {proposal.urgency}
        </span>
      </div>

      {/* Quantities */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Current Stock</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {proposal.currentQuantity} {proposal.unit}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Order Quantity</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {proposal.orderQuantity} {proposal.unit}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Estimated Cost</span>
          <span className="font-medium text-gray-900 dark:text-white">
            ${proposal.estimatedCost.toFixed(2)}
          </span>
        </div>

        {daysUntilDepletion !== null && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Depletes In</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              {daysUntilDepletion} days
            </span>
          </div>
        )}
      </div>

      {/* Supplier */}
      {proposal.supplier && (
        <div className="mb-4 p-2 bg-white dark:bg-gray-800 rounded text-sm">
          <div className="font-medium text-gray-900 dark:text-white">
            Suggested Supplier
          </div>
          <div className="text-gray-600 dark:text-gray-400 mt-1">
            {proposal.supplier}
          </div>
        </div>
      )}

      {/* Rationale */}
      <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
          Rationale
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {proposal.rationale}
        </div>
      </div>

      {/* Approve Button */}
      {onApprove && (
        <button
          onClick={() => onApprove(proposal)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
        >
          Approve Replenishment Order
        </button>
      )}
    </div>
  );
}
