// Phase 19: Workflow Plan Summary Component
// High-level summary of workflow plan with key metrics

'use client';

import React from 'react';
import { WorkflowPlan } from '@/app/workflow/workflowTypes';

interface WorkflowPlanSummaryProps {
  plan: WorkflowPlan;
  isDarkMode?: boolean;
}

export const WorkflowPlanSummary: React.FC<WorkflowPlanSummaryProps> = ({
  plan,
  isDarkMode = false,
}) => {
  const statusColors: Record<string, string> = {
    'draft': isDarkMode ? 'bg-gray-900/20 border-gray-700' : 'bg-gray-50 border-gray-300',
    'pending-approval': isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-300',
    'approved': isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-300',
    'rejected': isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-300',
    'active': isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-300',
    'completed': isDarkMode ? 'bg-emerald-900/20 border-emerald-700' : 'bg-emerald-50 border-emerald-300',
  };

  const statusBadgeColors: Record<string, string> = {
    'draft': 'bg-gray-600',
    'pending-approval': 'bg-yellow-600',
    'approved': 'bg-green-600',
    'rejected': 'bg-red-600',
    'active': 'bg-blue-600',
    'completed': 'bg-emerald-600',
  };

  return (
    <div
      className={`
        p-4 rounded border
        ${statusColors[plan.status]}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {plan.planId}
          </h3>
          <p className={`text-xs opacity-75 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Created {new Date(plan.createdAt).toLocaleString()}
          </p>
        </div>
        <span className={`px-3 py-1 rounded text-sm font-medium text-white ${statusBadgeColors[plan.status]}`}>
          {plan.status.toUpperCase()}
        </span>
      </div>

      <div className={`grid grid-cols-3 gap-3 mb-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700/30' : 'bg-white/50'}`}>
          <p className="text-xs opacity-75">Confidence</p>
          <p className="font-mono text-lg">{plan.overallConfidence.toFixed(0)}%</p>
        </div>
        <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700/30' : 'bg-white/50'}`}>
          <p className="text-xs opacity-75">Estimated Yield</p>
          <p className="font-mono text-lg">{plan.scheduleProposal.estimatedYieldKg}kg</p>
        </div>
        <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700/30' : 'bg-white/50'}`}>
          <p className="text-xs opacity-75">Duration</p>
          <p className="font-mono text-lg">{plan.scheduleProposal.totalDays}d</p>
        </div>
      </div>

      <div className={`p-3 rounded mb-4 text-xs ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
        <p className="font-semibold mb-1">Benefit Estimate</p>
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{plan.estimatedBenefit}</p>
      </div>

      {/* Grouped Workflows */}
      {plan.groupedWorkflows.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold mb-2 opacity-75">Workflow Phases ({plan.groupedWorkflows.length})</p>
          <div className="space-y-2">
            {plan.groupedWorkflows.map((wf, idx) => (
              <div
                key={idx}
                className={`p-2 rounded text-xs ${isDarkMode ? 'bg-gray-700/30' : 'bg-white/50'}`}
              >
                <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {wf.workflowName}
                </p>
                <div className={`grid grid-cols-2 gap-2 mt-1 text-xs opacity-75`}>
                  <span>
                    Duration: {wf.startDate} → {wf.endDate}
                  </span>
                  <span>Yield: {wf.estimatedYield.toFixed(1)}kg</span>
                  <span>Cost: ${wf.laborCost.toFixed(2)}</span>
                  <span>Tasks: {wf.tasks.length}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tradeoffs */}
      <div
        className={`p-3 rounded mb-4 text-xs space-y-2 ${
          isDarkMode ? 'bg-indigo-900/20 border border-indigo-700' : 'bg-indigo-50 border border-indigo-200'
        }`}
      >
        <p className="font-semibold">Tradeoff Analysis</p>
        <p className={isDarkMode ? 'text-indigo-200' : 'text-indigo-900'}>
          <strong>Labor vs Yield:</strong> {plan.tradeoffs.laborVsYield}
        </p>
        <p className={isDarkMode ? 'text-indigo-200' : 'text-indigo-900'}>
          <strong>Contamination Risk:</strong> {plan.tradeoffs.contaminationRisk}
        </p>
        <p className={isDarkMode ? 'text-indigo-200' : 'text-indigo-900'}>
          <strong>Equipment Use:</strong> {plan.tradeoffs.equipmentUtilization}
        </p>
      </div>

      {/* Approval Info */}
      {(plan as any).approvalBy && (
        <div
          className={`p-3 rounded text-xs ${
            isDarkMode ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'
          }`}
        >
          <p>
            <strong>Approved by:</strong> {(plan as any).approvalBy}
          </p>
          <p>
            <strong>Approved at:</strong>{' '}
            {(plan as any).approvedAt ? new Date((plan as any).approvedAt).toLocaleString() : 'unknown'}
          </p>
        </div>
      )}

      {(plan as any).rejectionReason && (
        <div
          className={`p-3 rounded text-xs ${
            isDarkMode ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'
          }`}
        >
          <p>
            <strong>Rejection reason:</strong> {(plan as any).rejectionReason}
          </p>
        </div>
      )}
    </div>
  );
};
