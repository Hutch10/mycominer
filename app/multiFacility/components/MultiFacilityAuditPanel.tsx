'use client';

import React, { useState } from 'react';
import { MultiFacilityAuditResult } from '../multiFacilityTypes';

interface MultiFacilityAuditPanelProps {
  auditResults: MultiFacilityAuditResult[];
}

export const MultiFacilityAuditPanel: React.FC<MultiFacilityAuditPanelProps> = ({
  auditResults,
}) => {
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);

  const decisionColor: Record<string, string> = {
    allow: 'bg-emerald-100 border-emerald-300 text-emerald-900',
    warn: 'bg-amber-100 border-amber-300 text-amber-900',
    block: 'bg-rose-100 border-rose-300 text-rose-900',
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Multi-Facility Audit Results</h3>
        <p className="text-sm text-gray-600">{auditResults.length} audit decision(s)</p>
      </div>

      {auditResults.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600 text-sm">No audits performed</p>
        </div>
      ) : (
        <div className="space-y-3">
          {auditResults.map((audit) => {
            const decision = audit.decision.toUpperCase();
            const isExpanded = expandedAuditId === audit.auditId;
            const color = decisionColor[audit.decision];

            return (
              <div
                key={audit.auditId}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${color}`}
                onClick={() =>
                  setExpandedAuditId(isExpanded ? null : audit.auditId)
                }
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${color}`}>
                        {decision}
                      </span>
                      <span className="text-xs text-gray-600">{audit.proposalId}</span>
                    </div>
                    <div className="text-sm">
                      <p className="text-xs text-gray-700">
                        Audit ID: <span className="font-mono font-semibold">{audit.auditId}</span>
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(audit.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl">{isExpanded ? '▼' : '▶'}</span>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-current border-opacity-20 space-y-4 text-sm">
                    {/* Check Results */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Safety Checks</h5>
                      <div className="space-y-1 text-xs">
                        <div className={`flex items-center gap-2 ${
                          audit.checks.allFacilitiesWIthinBudget
                            ? 'text-emerald-800'
                            : 'text-rose-800'
                        }`}>
                          <span>{audit.checks.allFacilitiesWIthinBudget ? '✓' : '✗'}</span>
                          <span>All facilities within budget</span>
                        </div>
                        <div className={`flex items-center gap-2 ${
                          audit.checks.noContaminationSpread
                            ? 'text-emerald-800'
                            : 'text-rose-800'
                        }`}>
                          <span>{audit.checks.noContaminationSpread ? '✓' : '✗'}</span>
                          <span>No contamination spread risk</span>
                        </div>
                        <div className={`flex items-center gap-2 ${
                          audit.checks.laborAvailabilityRespected
                            ? 'text-emerald-800'
                            : 'text-rose-800'
                        }`}>
                          <span>{audit.checks.laborAvailabilityRespected ? '✓' : '✗'}</span>
                          <span>Labor availability respected</span>
                        </div>
                        <div className={`flex items-center gap-2 ${
                          audit.checks.equipmentConstraintsRespected
                            ? 'text-emerald-800'
                            : 'text-rose-800'
                        }`}>
                          <span>{audit.checks.equipmentConstraintsRespected ? '✓' : '✗'}</span>
                          <span>Equipment constraints respected</span>
                        </div>
                        <div className={`flex items-center gap-2 ${
                          !audit.checks.regressionDetected
                            ? 'text-emerald-800'
                            : 'text-rose-800'
                        }`}>
                          <span>{!audit.checks.regressionDetected ? '✓' : '✗'}</span>
                          <span>No regression risk detected</span>
                        </div>
                        <div className={`flex items-center gap-2 ${
                          audit.checks.rollbackFeasible
                            ? 'text-emerald-800'
                            : 'text-rose-800'
                        }`}>
                          <span>{audit.checks.rollbackFeasible ? '✓' : '✗'}</span>
                          <span>Rollback is feasible</span>
                        </div>
                      </div>
                    </div>

                    {/* Per-Facility Risks */}
                    {audit.perFacilityRisks.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Per-Facility Risks</h5>
                        <div className="space-y-2">
                          {audit.perFacilityRisks.map((risk) => (
                            <div key={risk.facilityId} className="bg-white bg-opacity-50 rounded p-2">
                              <p className="font-semibold text-gray-900 text-xs">{risk.facilityId}</p>
                              <p className="text-xs text-gray-700">Risk Score: {risk.riskScore}/100</p>
                              {risk.rationale.length > 0 && (
                                <ul className="text-xs text-gray-700 list-disc list-inside mt-1">
                                  {risk.rationale.slice(0, 2).map((r, idx) => (
                                    <li key={idx}>{r}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Global Risks */}
                    {audit.globalRisks.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Global Risks</h5>
                        <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-700">
                          {audit.globalRisks.slice(0, 3).map((risk, idx) => (
                            <li key={idx}>{risk}</li>
                          ))}
                          {audit.globalRisks.length > 3 && (
                            <li>+{audit.globalRisks.length - 3} more risks</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {audit.recommendations.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Recommendations</h5>
                        <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-700">
                          {audit.recommendations.slice(0, 3).map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                          {audit.recommendations.length > 3 && (
                            <li>+{audit.recommendations.length - 3} more recommendations</li>
                          )}
                        </ul>
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
