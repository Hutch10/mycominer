'use client';

import React, { useState } from 'react';
import { GlobalOptimizationProposal } from '../multiFacilityTypes';

interface GlobalOptimizationPanelProps {
  proposals: GlobalOptimizationProposal[];
  onApproveProposal: (proposal: GlobalOptimizationProposal) => void;
  onRejectProposal: (proposal: GlobalOptimizationProposal) => void;
}

const categoryColors: Record<string, string> = {
  'cross-facility-energy-optimization': 'bg-emerald-100 border-emerald-300 text-emerald-900',
  'yield-balancing': 'bg-amber-100 border-amber-300 text-amber-900',
  'contamination-risk-mitigation': 'bg-rose-100 border-rose-300 text-rose-900',
  'schedule-coordination': 'bg-indigo-100 border-indigo-300 text-indigo-900',
  'shared-resource-optimization': 'bg-blue-100 border-blue-300 text-blue-900',
  'labor-reallocation': 'bg-purple-100 border-purple-300 text-purple-900',
  'facility-specialization': 'bg-cyan-100 border-cyan-300 text-cyan-900',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  audited: 'bg-blue-100 text-blue-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
  implemented: 'bg-indigo-100 text-indigo-700',
};

export const GlobalOptimizationPanel: React.FC<GlobalOptimizationPanelProps> = ({
  proposals,
  onApproveProposal,
  onRejectProposal,
}) => {
  const [expandedProposalId, setExpandedProposalId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Global Optimization Proposals</h3>
        <p className="text-sm text-gray-600">
          {proposals.length} cross-facility {proposals.length === 1 ? 'proposal' : 'proposals'}
        </p>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 text-sm">No optimization opportunities identified</p>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => {
            const categoryColor = categoryColors[proposal.category] || 'bg-gray-100 border-gray-300 text-gray-900';
            const statusColor = statusColors[proposal.status] || 'bg-gray-100';
            const isExpanded = expandedProposalId === proposal.proposalId;

            return (
              <div
                key={proposal.proposalId}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${categoryColor}`}
                onClick={() =>
                  setExpandedProposalId(isExpanded ? null : proposal.proposalId)
                }
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">{proposal.title}</h4>
                    <p className="text-sm text-gray-700 mb-2">{proposal.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor}`}>
                        {proposal.status.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-white bg-opacity-50">
                        Confidence: {proposal.confidence}%
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        proposal.riskLevel === 'high'
                          ? 'bg-rose-200 text-rose-900'
                          : proposal.riskLevel === 'medium'
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-emerald-200 text-emerald-900'
                      }`}>
                        Risk: {proposal.riskLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <span className="text-2xl">{isExpanded ? '▼' : '▶'}</span>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-current border-opacity-20 space-y-4 text-gray-900 text-sm">
                    {/* Expected Benefits */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Expected Benefits</h5>
                      <ul className="space-y-1 text-xs">
                        {proposal.expectedBenefit.globalEnergyReduction !== undefined && (
                          <li>• Energy Reduction: {proposal.expectedBenefit.globalEnergyReduction} kWh</li>
                        )}
                        {proposal.expectedBenefit.globalYieldIncrease !== undefined && (
                          <li>• Yield Increase: {proposal.expectedBenefit.globalYieldIncrease} kg</li>
                        )}
                        {proposal.expectedBenefit.globalCostSaving !== undefined && (
                          <li>• Cost Saving: ${proposal.expectedBenefit.globalCostSaving}</li>
                        )}
                        {proposal.expectedBenefit.contaminationRiskReduction !== undefined && (
                          <li>• Contamination Risk Reduction: {proposal.expectedBenefit.contaminationRiskReduction}</li>
                        )}
                        {proposal.expectedBenefit.laborReduction !== undefined && (
                          <li>• Labor Hours Saved: {proposal.expectedBenefit.laborReduction}h</li>
                        )}
                      </ul>
                    </div>

                    {/* Implementation */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Implementation</h5>
                      <p className="text-xs text-gray-700 mb-1">
                        Total Time: {proposal.implementation.totalImplementationHours}h | Complexity: {proposal.implementation.complexity}
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-700">
                        {proposal.implementation.steps.slice(0, 3).map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                        {proposal.implementation.steps.length > 3 && (
                          <li>+{proposal.implementation.steps.length - 3} more steps</li>
                        )}
                      </ul>
                    </div>

                    {/* Affected Facilities */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Affected Facilities</h5>
                      <div className="flex flex-wrap gap-1">
                        {proposal.affectedFacilities.map((fid) => (
                          <span
                            key={fid}
                            className="px-2 py-1 bg-white bg-opacity-50 rounded text-xs font-semibold"
                          >
                            {fid}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Rollback Capability */}
                    <div className={`p-2 rounded text-xs ${
                      proposal.rollbackCapability.feasible
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-rose-200 text-rose-900'
                    }`}>
                      Rollback: {proposal.rollbackCapability.feasible ? `Feasible (${proposal.rollbackCapability.estimatedHours}h)` : 'Not Feasible'}
                    </div>

                    {/* Action Buttons */}
                    {proposal.status === 'draft' && (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onApproveProposal(proposal);
                          }}
                          className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded text-sm font-semibold hover:bg-emerald-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRejectProposal(proposal);
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
            );
          })}
        </div>
      )}
    </div>
  );
};
