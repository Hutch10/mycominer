'use client';

import { StrategyAudit } from '@/app/strategy/engine/strategyTypes';

export default function StrategyApprovalPanel({
  audit,
  onApprove,
  onReject,
}: {
  audit: StrategyAudit;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const decisionColors: Record<StrategyAudit['decision'], string> = {
    allow: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    warn: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    block: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  };

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold">Audit Result</h4>
        <span className={`px-3 py-1 text-sm rounded font-medium ${decisionColors[audit.decision]}`}>
          {audit.decision.toUpperCase()}
        </span>
      </div>

      <div className="mb-3">
        <p className="font-medium text-sm mb-2">Rationale:</p>
        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
          {audit.rationale.map((r, idx) => (
            <li key={idx}>{r}</li>
          ))}
        </ul>
      </div>

      {audit.constraintViolations.length > 0 && (
        <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded">
          <p className="font-medium text-red-800 dark:text-red-200 text-sm mb-1">Constraint Violations:</p>
          <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
            {audit.constraintViolations.map((violation, idx) => (
              <li key={idx}>{violation}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
        <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">Environmental Checks:</p>
        <div className="text-blue-700 dark:text-blue-300 space-y-0.5">
          <p>✓ Species Limits: {audit.environmentalChecks.speciesLimitCompliant ? '✅ Compliant' : '❌ Violated'}</p>
          <p>✓ Contamination Risk: {audit.environmentalChecks.contaminationRiskAcceptable ? '✅ Acceptable' : '❌ High'}</p>
          <p>✓ Energy Budget: {audit.environmentalChecks.energyBudgetRespected ? '✅ Respected' : '❌ Exceeded'}</p>
          {audit.environmentalChecks.schedulingConflicts.length > 0 && (
            <p>✓ Scheduling: ⚠️ {audit.environmentalChecks.schedulingConflicts.length} conflicts</p>
          )}
        </div>
      </div>

      {audit.recommendations.length > 0 && (
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
          <p className="font-medium text-blue-800 dark:text-blue-200 text-sm mb-1">Recommendations:</p>
          <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
            {audit.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {audit.rollbackPlan && (
        <div className="mb-3 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
          <p className="font-medium mb-1">Rollback Plan:</p>
          <p className="text-gray-700 dark:text-gray-300">{audit.rollbackPlan}</p>
        </div>
      )}

      {audit.decision === 'allow' && (
        <div className="flex gap-2">
          {onApprove && (
            <button onClick={onApprove} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded">
              Approve Proposal
            </button>
          )}
          {onReject && (
            <button onClick={onReject} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 rounded">
              Reject Anyway
            </button>
          )}
        </div>
      )}
    </div>
  );
}
