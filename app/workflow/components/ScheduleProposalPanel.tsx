// Phase 19: Schedule Proposal Panel Component
// Displays schedule proposal with task timeline and metrics

'use client';

import React from 'react';
import { ScheduleProposal } from '@/app/workflow/workflowTypes';

interface ScheduleProposalPanelProps {
  proposal: ScheduleProposal;
  isDarkMode?: boolean;
}

export const ScheduleProposalPanel: React.FC<ScheduleProposalPanelProps> = ({
  proposal,
  isDarkMode = false,
}) => {
  const confidenceColor =
    proposal.confidence >= 80
      ? 'text-green-600'
      : proposal.confidence >= 60
      ? 'text-yellow-600'
      : 'text-red-600';

  return (
    <div
      className={`
        p-4 rounded border
        ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Schedule Proposal {proposal.proposalId}
        </h3>
        <span className={`text-sm font-medium ${confidenceColor}`}>
          Confidence: {proposal.confidence.toFixed(0)}%
        </span>
      </div>

      <div className={`grid grid-cols-2 gap-4 mb-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        <div>
          <p className="text-xs font-semibold opacity-75">Duration</p>
          <p className="text-lg font-mono">{proposal.totalDays} days</p>
        </div>
        <div>
          <p className="text-xs font-semibold opacity-75">Estimated Yield</p>
          <p className="text-lg font-mono">{proposal.estimatedYieldKg}kg</p>
        </div>
        <div>
          <p className="text-xs font-semibold opacity-75">Total Labor Hours</p>
          <p className="text-lg font-mono">{proposal.totalLaborHours.toFixed(1)}h</p>
        </div>
        <div>
          <p className="text-xs font-semibold opacity-75">Scheduled Tasks</p>
          <p className="text-lg font-mono">{proposal.scheduledTasks.length}</p>
        </div>
      </div>

      <div className={`mb-4 p-3 rounded text-xs ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
        <p className="font-semibold mb-1 opacity-75">Rationale</p>
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{proposal.rationale}</p>
      </div>

      {Object.keys(proposal.equipmentUtilization).length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold mb-2 opacity-75">Equipment Utilization</p>
          <div className="space-y-2">
            {Object.entries(proposal.equipmentUtilization).map(([equipment, utilization]) => (
              <div key={equipment} className="flex items-center gap-2">
                <span className="text-xs flex-1">{equipment}</span>
                <div
                  className={`h-2 flex-grow rounded ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`h-2 rounded ${
                      utilization > 90
                        ? 'bg-red-600'
                        : utilization > 70
                        ? 'bg-yellow-600'
                        : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(100, utilization)}%` }}
                  />
                </div>
                <span className="text-xs font-mono">{utilization}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {proposal.riskFactors.length > 0 && (
        <div className={`p-3 rounded text-xs ${isDarkMode ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-300'}`}>
          <p className="font-semibold mb-1">Risk Factors ({proposal.riskFactors.length})</p>
          <ul className={`list-disc pl-4 space-y-1 ${isDarkMode ? 'text-yellow-200' : 'text-yellow-900'}`}>
            {proposal.riskFactors.map((factor, idx) => (
              <li key={idx}>{factor}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={`text-xs opacity-50 mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Created: {new Date(proposal.createdAt).toLocaleString()}
      </div>
    </div>
  );
};
