'use client';

import { OptimizationProposal } from '@/app/optimization/optimizationTypes';

interface Props {
  proposal: OptimizationProposal;
  onApprove?: () => void;
  onReject?: () => void;
}

export function OptimizationProposalCard({ proposal, onApprove, onReject }: Props) {
  const categoryColor = {
    'energy-efficiency': 'text-emerald-700 bg-emerald-50 border-emerald-200',
    'substrate-optimization': 'text-amber-700 bg-amber-50 border-amber-200',
    'equipment-utilization': 'text-blue-700 bg-blue-50 border-blue-200',
    'load-balancing': 'text-indigo-700 bg-indigo-50 border-indigo-200',
    'labor-alignment': 'text-purple-700 bg-purple-50 border-purple-200',
    'contamination-risk-reduction': 'text-rose-700 bg-rose-50 border-rose-200',
    'waste-reduction': 'text-orange-700 bg-orange-50 border-orange-200',
  }[proposal.category];

  return (
    <div className={`rounded-xl border p-4 ${categoryColor}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wide opacity-75">{proposal.category}</div>
          <h3 className="text-lg font-semibold mt-1">{proposal.title}</h3>
          <p className="text-sm mt-2 opacity-90">{proposal.description}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
          proposal.status === 'approved' ? 'bg-green-200 text-green-800' :
          proposal.status === 'rejected' ? 'bg-red-200 text-red-800' :
          'bg-slate-200 text-slate-800'
        }`}>
          {proposal.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-medium">
        {proposal.expectedBenefit.costSavings && (
          <div>
            <div className="opacity-75">Cost savings</div>
            <div>${proposal.expectedBenefit.costSavings.toFixed(2)}</div>
          </div>
        )}
        {proposal.expectedBenefit.kwhReduction && (
          <div>
            <div className="opacity-75">Energy reduction</div>
            <div>{proposal.expectedBenefit.kwhReduction.toFixed(1)} kWh</div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className={`px-2 py-1 text-xs font-medium rounded ${
          proposal.riskLevel === 'low' ? 'bg-green-200 text-green-900' :
          proposal.riskLevel === 'medium' ? 'bg-yellow-200 text-yellow-900' :
          'bg-red-200 text-red-900'
        }`}>
          Risk: {proposal.riskLevel}
        </span>
        <span className="text-sm font-medium">Confidence: {proposal.confidence}%</span>
      </div>

      {proposal.status === 'draft' && (
        <div className="mt-4 flex gap-2">
          <button onClick={onReject} className="flex-1 px-3 py-2 rounded-lg border border-current opacity-50 hover:opacity-75 text-sm font-medium transition">
            Reject
          </button>
          <button onClick={onApprove} className="flex-1 px-3 py-2 rounded-lg bg-black text-white hover:opacity-90 text-sm font-medium transition">
            Approve
          </button>
        </div>
      )}
    </div>
  );
}
