'use client';

import { StrategyProposal } from '@/app/strategy/engine/strategyTypes';

export default function StrategyProposalCard({ proposal, onAudit }: { proposal: StrategyProposal; onAudit?: () => void }) {
  const typeColors: Record<StrategyProposal['type'], string> = {
    energy: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    yield: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    'contamination-mitigation': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    scheduling: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    'resource-allocation': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    'multi-facility-coordination': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
  };

  const statusColors: Record<StrategyProposal['status'], string> = {
    draft: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    audited: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    simulated: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    approved: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    rejected: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    implemented: 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100',
    'rolled-back': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
  };

  const riskColors: Record<StrategyProposal['riskLevel'], string> = {
    low: 'text-green-600 dark:text-green-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    high: 'text-red-600 dark:text-red-400',
  };

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-lg">{proposal.title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{proposal.description}</p>
        </div>
        <div className="flex gap-1">
          <span className={`px-2 py-1 text-xs rounded font-medium ${typeColors[proposal.type]}`}>
            {proposal.type.replace('-', ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-xs">Confidence</p>
          <p className="font-semibold">{proposal.confidenceScore}%</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-xs">Risk Level</p>
          <p className={`font-semibold ${riskColors[proposal.riskLevel]}`}>{proposal.riskLevel}</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-xs">Source</p>
          <p className="font-semibold text-xs">{proposal.source.replace('-', ' ')}</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-xs">Systems</p>
          <p className="font-semibold text-xs">{proposal.affectedSystems.length}</p>
        </div>
      </div>

      <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
        <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">Expected Benefit:</p>
        <p className="text-blue-700 dark:text-blue-300">{proposal.expectedBenefit}</p>
      </div>

      <div className="mb-3">
        <p className="font-medium text-xs mb-1">Implementation Steps:</p>
        <ul className="list-disc list-inside text-xs space-y-0.5">
          {proposal.implementationSteps.slice(0, 2).map((step, idx) => (
            <li key={idx} className="text-gray-600 dark:text-gray-400">
              {step}
            </li>
          ))}
          {proposal.implementationSteps.length > 2 && (
            <li className="text-gray-500 italic">+{proposal.implementationSteps.length - 2} more steps</li>
          )}
        </ul>
      </div>

      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 text-xs rounded ${statusColors[proposal.status]}`}>
          {proposal.status}
        </span>
        {proposal.status === 'draft' && onAudit && (
          <button onClick={onAudit} className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded">
            Run Audit
          </button>
        )}
      </div>
    </div>
  );
}
