// Phase 19: Workflow Approval Panel Component
// Handles workflow plan approval/rejection with rationale

'use client';

import React, { useState } from 'react';
import { WorkflowPlan, WorkflowAuditResult } from '@/app/workflow/workflowTypes';

interface WorkflowApprovalPanelProps {
  plan: WorkflowPlan;
  auditResult: WorkflowAuditResult;
  isDarkMode?: boolean;
  onApprove?: (userId: string) => void;
  onReject?: (reason: string) => void;
}

export const WorkflowApprovalPanel: React.FC<WorkflowApprovalPanelProps> = ({
  plan,
  auditResult,
  isDarkMode = false,
  onApprove,
  onReject,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [userId, setUserId] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const isApproved = plan.status === 'approved';
  const isRejected = plan.status === 'rejected';

  const decisionColors: Record<string, string> = {
    allow: isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-300',
    warn: isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-300',
    block: isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-300',
  };

  return (
    <div
      className={`
        p-4 rounded border
        ${decisionColors[auditResult.decision]}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Workflow Plan Review & Approval
        </h3>
        {isApproved && (
          <span className="px-3 py-1 rounded text-sm font-medium bg-green-600 text-white">
            ✓ APPROVED
          </span>
        )}
        {isRejected && (
          <span className="px-3 py-1 rounded text-sm font-medium bg-red-600 text-white">
            ✗ REJECTED
          </span>
        )}
      </div>

      <div className={`grid grid-cols-2 gap-4 mb-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        <div>
          <p className="text-xs font-semibold opacity-75">Plan ID</p>
          <p className="font-mono text-xs">{plan.planId}</p>
        </div>
        <div>
          <p className="text-xs font-semibold opacity-75">Confidence</p>
          <p className="text-lg font-mono">{plan.overallConfidence.toFixed(0)}%</p>
        </div>
        <div>
          <p className="text-xs font-semibold opacity-75">Estimated Yield</p>
          <p className="font-mono text-xs">{plan.scheduleProposal.estimatedYieldKg}kg</p>
        </div>
        <div>
          <p className="text-xs font-semibold opacity-75">Duration</p>
          <p className="font-mono text-xs">{plan.scheduleProposal.totalDays} days</p>
        </div>
      </div>

      <div className={`p-3 rounded mb-4 text-xs ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
        <p className="font-semibold mb-1">Audit Decision: {auditResult.decision.toUpperCase()}</p>
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{auditResult.rationale}</p>
      </div>

      {/* Validation Summary */}
      <div className="mb-4 space-y-2">
        <p className="text-xs font-semibold opacity-75">Validation Results</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div
            className={`p-2 rounded ${
              auditResult.timelineValidation.isValid
                ? isDarkMode
                  ? 'bg-green-900/20'
                  : 'bg-green-50'
                : isDarkMode
                ? 'bg-red-900/20'
                : 'bg-red-50'
            }`}
          >
            <span className={auditResult.timelineValidation.isValid ? 'text-green-600' : 'text-red-600'}>
              {auditResult.timelineValidation.isValid ? '✓' : '✗'} Species Timelines
            </span>
          </div>
          <div
            className={`p-2 rounded ${
              auditResult.substrateValidation.isValid
                ? isDarkMode
                  ? 'bg-green-900/20'
                  : 'bg-green-50'
                : isDarkMode
                ? 'bg-red-900/20'
                : 'bg-red-50'
            }`}
          >
            <span className={auditResult.substrateValidation.isValid ? 'text-green-600' : 'text-red-600'}>
              {auditResult.substrateValidation.isValid ? '✓' : '✗'} Substrate Cycles
            </span>
          </div>
          <div
            className={`p-2 rounded ${
              auditResult.facilityConstraintsValidation.isValid
                ? isDarkMode
                  ? 'bg-green-900/20'
                  : 'bg-green-50'
                : isDarkMode
                ? 'bg-red-900/20'
                : 'bg-red-50'
            }`}
          >
            <span className={auditResult.facilityConstraintsValidation.isValid ? 'text-green-600' : 'text-red-600'}>
              {auditResult.facilityConstraintsValidation.isValid ? '✓' : '✗'} Facility Constraints
            </span>
          </div>
          <div
            className={`p-2 rounded ${
              auditResult.laborValidation.isValid
                ? isDarkMode
                  ? 'bg-green-900/20'
                  : 'bg-green-50'
                : isDarkMode
                ? 'bg-red-900/20'
                : 'bg-red-50'
            }`}
          >
            <span className={auditResult.laborValidation.isValid ? 'text-green-600' : 'text-red-600'}>
              {auditResult.laborValidation.isValid ? '✓' : '✗'} Labor Hours
            </span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {auditResult.recommendations.length > 0 && (
        <div
          className={`p-3 rounded mb-4 text-xs ${
            isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
          }`}
        >
          <p className="font-semibold mb-2">Recommendations</p>
          <ul className={`space-y-1 list-disc pl-4 ${isDarkMode ? 'text-blue-200' : 'text-blue-900'}`}>
            {auditResult.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Approval Controls */}
      {!isApproved && !isRejected && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="User ID or Name"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className={`flex-1 px-3 py-2 rounded text-sm ${
                isDarkMode
                  ? 'bg-gray-700 border border-gray-600 text-gray-100'
                  : 'bg-white border border-gray-300'
              }`}
            />
            <button
              onClick={() => onApprove?.(userId || 'unknown')}
              disabled={!userId}
              className="px-4 py-2 rounded text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => setShowRejectForm(!showRejectForm)}
              className="px-4 py-2 rounded text-sm font-medium bg-red-600 text-white hover:bg-red-700"
            >
              Reject
            </button>
          </div>

          {showRejectForm && (
            <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
              <textarea
                placeholder="Rejection reason (required)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className={`w-full px-3 py-2 rounded text-sm mb-2 ${
                  isDarkMode ? 'bg-gray-800 border border-gray-600 text-gray-100' : 'bg-white border border-gray-300'
                }`}
                rows={3}
              />
              <button
                onClick={() => {
                  onReject?.(rejectionReason || 'No reason provided');
                  setShowRejectForm(false);
                  setRejectionReason('');
                }}
                disabled={!rejectionReason}
                className="px-3 py-2 rounded text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 w-full"
              >
                Confirm Rejection
              </button>
            </div>
          )}
        </div>
      )}

      {isApproved && (
        <div className={`p-3 rounded ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
          <p className="text-xs">
            <strong>Approved by:</strong>{' '}
            {(plan as any).approvalBy || 'unknown'}
          </p>
          <p className="text-xs">
            <strong>Approved at:</strong>{' '}
            {(plan as any).approvedAt ? new Date((plan as any).approvedAt).toLocaleString() : 'unknown'}
          </p>
        </div>
      )}

      {isRejected && (
        <div className={`p-3 rounded ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
          <p className="text-xs">
            <strong>Rejection reason:</strong> {(plan as any).rejectionReason}
          </p>
        </div>
      )}
    </div>
  );
};
