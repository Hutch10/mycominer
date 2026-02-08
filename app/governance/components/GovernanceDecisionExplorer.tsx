/**
 * Phase 44: System Governance - Governance Decision Explorer Component
 * 
 * Browse and analyze governance decisions with drill-down capability.
 */

'use client';

import React from 'react';
import { GovernanceDecision } from '../governanceTypes';

interface GovernanceDecisionExplorerProps {
  decisions: GovernanceDecision[];
  selectedDecisionId: string | null;
  onSelectDecision: (decisionId: string) => void;
  onExplainDecision?: (decisionId: string) => void;
}

export function GovernanceDecisionExplorer({
  decisions,
  selectedDecisionId,
  onSelectDecision,
  onExplainDecision
}: GovernanceDecisionExplorerProps) {
  const selectedDecision = decisions.find(d => d.id === selectedDecisionId);
  const allowedDecisions = decisions.filter(d => d.allowed);
  const deniedDecisions = decisions.filter(d => !d.allowed);

  // Group by action
  const actionGroups: Record<string, GovernanceDecision[]> = {};
  for (const decision of decisions) {
    if (!actionGroups[decision.action]) {
      actionGroups[decision.action] = [];
    }
    actionGroups[decision.action].push(decision);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Governance Decisions</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>{allowedDecisions.length} allowed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>{deniedDecisions.length} denied</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border border-gray-200 rounded bg-white p-4">
          <div className="text-sm text-gray-600">Total Decisions</div>
          <div className="text-2xl font-bold mt-1">{decisions.length}</div>
        </div>
        <div className="border border-green-200 rounded bg-green-50 p-4">
          <div className="text-sm text-green-700">Allowed</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{allowedDecisions.length}</div>
        </div>
        <div className="border border-red-200 rounded bg-red-50 p-4">
          <div className="text-sm text-red-700">Denied</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{deniedDecisions.length}</div>
        </div>
        <div className="border border-gray-200 rounded bg-white p-4">
          <div className="text-sm text-gray-600">Allow Rate</div>
          <div className="text-2xl font-bold mt-1">
            {decisions.length > 0 ? ((allowedDecisions.length / decisions.length) * 100).toFixed(0) : 0}%
          </div>
        </div>
      </div>

      {/* Decision List */}
      <div className="border border-gray-200 rounded bg-white divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {decisions.slice().reverse().map(decision => (
          <button
            key={decision.id}
            onClick={() => onSelectDecision(decision.id)}
            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
              selectedDecisionId === decision.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${decision.allowed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium text-sm">{decision.action}</span>
                  <span className="text-xs text-gray-500">on {decision.resourceName}</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">Subject: {decision.subjectId}</div>
                <div className="text-xs text-gray-500 mt-1 line-clamp-1">{decision.rationale}</div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(decision.timestamp).toLocaleTimeString()}
              </div>
            </div>

            {decision.matchedRoles && decision.matchedRoles.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {decision.matchedRoles.map(roleId => (
                  <span key={roleId} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    {roleId}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Selected Decision Details */}
      {selectedDecision && (
        <div className="border border-gray-200 rounded bg-white p-4 mt-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${selectedDecision.allowed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                Decision Details
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(selectedDecision.timestamp).toLocaleString()}
              </p>
            </div>
            {onExplainDecision && (
              <button
                onClick={() => onExplainDecision(selectedDecision.id)}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Explain This Decision
              </button>
            )}
          </div>

          {/* Decision Info */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Subject ID:</span>{' '}
                <span className="font-mono text-xs">{selectedDecision.subjectId}</span>
              </div>
              <div>
                <span className="text-gray-600">Action:</span>{' '}
                <span className="font-medium">{selectedDecision.action}</span>
              </div>
              <div>
                <span className="text-gray-600">Resource:</span>{' '}
                <span className="font-medium">{selectedDecision.resourceName}</span>
              </div>
              <div>
                <span className="text-gray-600">Result:</span>{' '}
                <span className={`font-medium ${selectedDecision.allowed ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedDecision.allowed ? 'ALLOWED' : 'DENIED'}
                </span>
              </div>
              {selectedDecision.evaluationTimeMs !== undefined && (
                <div>
                  <span className="text-gray-600">Evaluation Time:</span>{' '}
                  <span className="font-medium">{selectedDecision.evaluationTimeMs}ms</span>
                </div>
              )}
            </div>

            {/* Rationale */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Rationale</div>
              <div className="bg-gray-50 rounded p-3 text-sm text-gray-700">
                {selectedDecision.rationale}
              </div>
            </div>

            {/* Matched Roles */}
            {selectedDecision.matchedRoles && selectedDecision.matchedRoles.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Matched Roles</div>
                <div className="flex flex-wrap gap-2">
                  {selectedDecision.matchedRoles.map(roleId => (
                    <span key={roleId} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                      {roleId}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* References */}
            {selectedDecision.references && selectedDecision.references.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">References</div>
                <div className="space-y-1">
                  {selectedDecision.references.map((ref, idx) => (
                    <div key={idx} className="text-sm text-gray-600 font-mono text-xs bg-gray-50 px-2 py-1 rounded">
                      {ref}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
