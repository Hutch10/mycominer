'use client';

import { StrategyPlan } from '@/app/strategy/engine/strategyTypes';

export default function StrategyPlanPanel({ plan }: { plan: StrategyPlan }) {
  const statusColors: Record<StrategyPlan['status'], string> = {
    draft: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    ready: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    approved: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    rejected: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    'in-progress': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    completed: 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100',
  };

  return (
    <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">{plan.name}</h3>
          <p className="text-gray-600 dark:text-gray-400">{plan.description}</p>
        </div>
        <span className={`px-3 py-1 text-sm rounded font-medium ${statusColors[plan.status]}`}>
          {plan.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Proposals Included</p>
          <p className="text-2xl font-bold">{plan.proposals.length}</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Overall Confidence</p>
          <p className="text-2xl font-bold">{plan.overallConfidence}%</p>
        </div>
      </div>

      {plan.impactSummary && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded">
          <p className="font-medium text-green-800 dark:text-green-200 text-sm mb-2">Projected Impact:</p>
          <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
            {plan.impactSummary.estimatedEnergyReduction && (
              <p>⚡ Energy reduction: {plan.impactSummary.estimatedEnergyReduction}%</p>
            )}
            {plan.impactSummary.estimatedYieldIncrease && (
              <p>🌱 Yield increase: {plan.impactSummary.estimatedYieldIncrease}%</p>
            )}
            {plan.impactSummary.contaminationRiskReduction && (
              <p>🛡️ Contamination risk reduction: {plan.impactSummary.contaminationRiskReduction}%</p>
            )}
            {plan.impactSummary.resourcesRequired && (
              <p>💰 Resources: {plan.impactSummary.resourcesRequired.join(', ')}</p>
            )}
          </div>
        </div>
      )}

      {plan.tradeoffs.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
          <p className="font-medium text-yellow-800 dark:text-yellow-200 text-sm mb-2">Tradeoffs:</p>
          <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            {plan.tradeoffs.slice(0, 3).map((tradeoff, idx) => (
              <li key={idx}>{tradeoff}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4">
        <p className="font-medium text-sm mb-2">Prioritized Proposals:</p>
        <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
          {plan.priorityOrder.slice(0, 5).map((propId, idx) => {
            const prop = plan.proposals.find((p) => p.id === propId);
            return prop ? <li key={idx}>{prop.title}</li> : null;
          })}
          {plan.priorityOrder.length > 5 && <li className="italic text-gray-500">+{plan.priorityOrder.length - 5} more</li>}
        </ol>
      </div>

      {plan.approvalNotes && (
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm">
          <p className="font-medium mb-1">Approval Notes:</p>
          <p className="text-gray-700 dark:text-gray-300">{plan.approvalNotes}</p>
        </div>
      )}
    </div>
  );
}
