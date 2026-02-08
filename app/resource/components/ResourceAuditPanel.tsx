// Phase 20: Resource Audit Panel Component
// Displays audit results with validation gates

'use client';

import { ResourceAuditResult } from '@/app/resource/resourceTypes';

interface ResourceAuditPanelProps {
  audit: ResourceAuditResult | null;
}

export function ResourceAuditPanel({ audit }: ResourceAuditPanelProps) {
  if (!audit) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No audit results yet
      </div>
    );
  }

  const decisionColors = {
    allow: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    warn: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    block: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  const gates = [
    { key: 'inventorySufficiency', label: 'Inventory Sufficiency' },
    { key: 'equipmentAvailability', label: 'Equipment Availability' },
    { key: 'energyBudget', label: 'Energy Budget' },
    { key: 'contaminationRisk', label: 'Contamination Risk' },
    { key: 'schedulingAlignment', label: 'Scheduling Alignment' },
    { key: 'regressionDetection', label: 'Regression Detection' },
  ];

  const passedGates = gates.filter(
    g => audit.validationGates[g.key as keyof typeof audit.validationGates]
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Resource Allocation Audit
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Audit ID: {audit.auditId} • Plan ID: {audit.allocationPlanId}
          </div>
        </div>

        <span className={`px-4 py-2 rounded-full text-sm font-medium ${decisionColors[audit.decision]}`}>
          {audit.decision.toUpperCase()}
        </span>
      </div>

      {/* Validation Gates */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Validation Gates ({passedGates}/{gates.length} Passed)
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {gates.map(gate => {
            const passed = audit.validationGates[gate.key as keyof typeof audit.validationGates];

            return (
              <div
                key={gate.key}
                className={`p-3 rounded-lg border-2 ${
                  passed
                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                    : 'border-red-500 bg-red-50 dark:bg-red-950'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {passed ? '✓' : '✗'}
                  </span>
                  <span className={`text-sm font-medium ${
                    passed
                      ? 'text-green-800 dark:text-green-300'
                      : 'text-red-800 dark:text-red-300'
                  }`}>
                    {gate.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Errors */}
      {audit.errors.length > 0 && (
        <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-950">
          <h3 className="text-lg font-medium text-red-900 dark:text-red-300 mb-3">
            🚫 Errors ({audit.errors.length})
          </h3>

          <div className="space-y-2">
            {audit.errors.map((error, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-sm text-red-800 dark:text-red-400"
              >
                <span className="font-bold">{idx + 1}.</span>
                <span>{error}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {audit.warnings.length > 0 && (
        <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950">
          <h3 className="text-lg font-medium text-yellow-900 dark:text-yellow-300 mb-3">
            ⚠️ Warnings ({audit.warnings.length})
          </h3>

          <div className="space-y-2">
            {audit.warnings.map((warning, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-400"
              >
                <span className="font-bold">{idx + 1}.</span>
                <span>{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rollback Steps */}
      {audit.rollbackSteps.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            🔄 Rollback Steps (If Needed)
          </h3>

          <ol className="space-y-2">
            {audit.rollbackSteps.map((step, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
              >
                <span className="flex items-center justify-center w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full text-xs font-bold">
                  {idx + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Summary */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Audit Summary
        </h3>

        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <div>• Decision: <strong>{audit.decision.toUpperCase()}</strong></div>
          <div>• Validation Gates Passed: <strong>{passedGates}/{gates.length}</strong></div>
          <div>• Errors: <strong>{audit.errors.length}</strong></div>
          <div>• Warnings: <strong>{audit.warnings.length}</strong></div>
          <div>• Created: <strong>{new Date(audit.createdAt).toLocaleString()}</strong></div>
        </div>

        {audit.decision === 'allow' && (
          <div className="mt-3 text-sm text-green-700 dark:text-green-400">
            ✓ This allocation plan is safe to approve and execute.
          </div>
        )}

        {audit.decision === 'warn' && (
          <div className="mt-3 text-sm text-yellow-700 dark:text-yellow-400">
            ⚠️ This allocation plan has warnings. Review carefully before approval.
          </div>
        )}

        {audit.decision === 'block' && (
          <div className="mt-3 text-sm text-red-700 dark:text-red-400">
            🚫 This allocation plan should NOT be approved. Critical issues detected.
          </div>
        )}
      </div>
    </div>
  );
}
