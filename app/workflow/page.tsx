// Phase 19: Workflow Dashboard
// Interactive workflow generation, scheduling, conflict detection, and approval

'use client';

import React, { useState } from 'react';
import { DeveloperModeBanner } from '@/app/components/DeveloperModeBanner';
import { WorkflowTaskCard } from '@/app/workflow/components/WorkflowTaskCard';
import { ScheduleProposalPanel } from '@/app/workflow/components/ScheduleProposalPanel';
import { ConflictCheckPanel } from '@/app/workflow/components/ConflictCheckPanel';
import { WorkflowApprovalPanel } from '@/app/workflow/components/WorkflowApprovalPanel';
import { WorkflowHistoryViewer } from '@/app/workflow/components/WorkflowHistoryViewer';
import { GanttChartPanel } from '@/app/workflow/components/GanttChartPanel';
import { WorkflowPlanSummary } from '@/app/workflow/components/WorkflowPlanSummary';
import {
  workflowEngine,
} from '@/app/workflow/workflowEngine';
import {
  schedulingEngine,
} from '@/app/workflow/schedulingEngine';
import {
  conflictDetector,
} from '@/app/workflow/conflictDetector';
import {
  workflowPlanner,
} from '@/app/workflow/workflowPlanner';
import {
  workflowAuditor,
} from '@/app/workflow/workflowAuditor';
import { workflowLog } from '@/app/workflow/workflowLog';
import {
  WorkflowTask,
  ScheduleProposal,
  ConflictCheckResult,
  WorkflowPlan,
  WorkflowAuditResult,
  WorkflowRequest,
} from '@/app/workflow/workflowTypes';

type TabType = 'generate' | 'schedule' | 'conflicts' | 'plan' | 'approval' | 'gantt' | 'history';

export default function WorkflowDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('generate');
  const [showDevMode, setShowDevMode] = useState(false);

  // Workflow state
  const [request, setRequest] = useState<WorkflowRequest | null>(null);
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [schedule, setSchedule] = useState<ScheduleProposal | null>(null);
  const [conflicts, setConflicts] = useState<ConflictCheckResult | null>(null);
  const [plan, setPlan] = useState<WorkflowPlan | null>(null);
  const [audit, setAudit] = useState<WorkflowAuditResult | null>(null);
  const [historyEntries, setHistoryEntries] = useState(workflowLog.list());

  // Form state
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>(['oyster']);
  const [yieldTargets, setYieldTargets] = useState({ oyster: 10 });
  const [laborHours, setLaborHours] = useState(8);
  const [timeWindow, setTimeWindow] = useState(30);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Generate workflow tasks
  const handleGenerateWorkflow = () => {
    const newRequest: WorkflowRequest = {
      requestId: `req-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: 'user-submitted',
      facilityIds: ['facility-1'],
      speciesSelection: selectedSpecies as any,
      harvestTargets: selectedSpecies.map(s => ({
        species: s as any,
        targetYieldKg: yieldTargets[s as keyof typeof yieldTargets] || 10,
      })),
      constraintSet: {
        laborHoursAvailable: laborHours,
        equipmentAvailable: ['autoclave-1', 'incubator-1'],
        substrateLimitKg: 100,
        maxRoomTemperature: 28,
        minRoomTemperature: 10,
      },
      timeWindowDays: timeWindow,
      prioritizeYield: true,
      prioritizeContaminationMitigation: true,
      prioritizeLabor: false,
    };

    setRequest(newRequest);

    const newTasks = workflowEngine.generateWorkflowTasks(newRequest);
    const validationIssues = workflowEngine.validateTasks(newTasks, newRequest);

    setTasks(newTasks);

    workflowLog.add({
      entryId: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'workflow-generation',
      source: 'workflow-engine',
      dataType: 'proposal',
      data: { taskCount: newTasks.length, validationIssues },
      context: { requestId: newRequest.requestId },
      status: validationIssues.length === 0 ? 'success' : 'warning',
      message: `Generated ${newTasks.length} workflow tasks${validationIssues.length > 0 ? ` with ${validationIssues.length} validation issues` : ''}`,
    });

    setHistoryEntries(workflowLog.list());
    setActiveTab('schedule');
  };

  // Create schedule
  const handleCreateSchedule = () => {
    if (!request || tasks.length === 0) return;

    const newSchedule = schedulingEngine.createScheduleProposal(tasks, request, startDate);
    setSchedule(newSchedule);

    workflowLog.add({
      entryId: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'schedule-proposal',
      source: 'scheduling-engine',
      dataType: 'schedule',
      data: {
        proposalId: newSchedule.proposalId,
        totalDays: newSchedule.totalDays,
        estimatedYieldKg: newSchedule.estimatedYieldKg,
      },
      context: { requestId: request.requestId, proposalId: newSchedule.proposalId },
      status: 'success',
      message: `Created schedule proposal: ${newSchedule.totalDays} days, ${newSchedule.estimatedYieldKg}kg yield`,
    });

    setHistoryEntries(workflowLog.list());
    setActiveTab('conflicts');
  };

  // Check conflicts
  const handleCheckConflicts = () => {
    if (!schedule || !request || tasks.length === 0) return;

    const newConflicts = conflictDetector.checkConflicts(schedule.scheduledTasks, tasks, request);
    setConflicts(newConflicts);

    workflowLog.add({
      entryId: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'conflict-detection',
      source: 'conflict-detector',
      dataType: 'conflict',
      data: {
        resultId: newConflicts.resultId,
        decision: newConflicts.decision,
        conflictCount: newConflicts.conflicts.length,
      },
      context: { proposalId: schedule.proposalId, resultId: newConflicts.resultId },
      status: newConflicts.decision === 'block' ? 'failure' : newConflicts.decision === 'warn' ? 'warning' : 'success',
      message: `Conflict check: ${newConflicts.decision.toUpperCase()} (${newConflicts.conflicts.length} conflicts)`,
    });

    setHistoryEntries(workflowLog.list());
    setActiveTab('plan');
  };

  // Create plan
  const handleCreatePlan = () => {
    if (!schedule || !conflicts || !request || tasks.length === 0) return;

    const newPlan = workflowPlanner.createWorkflowPlan(schedule, conflicts, tasks, request);
    setPlan(newPlan);

    const newAudit = workflowAuditor.auditWorkflowPlan(newPlan, request);
    setAudit(newAudit);

    workflowLog.add({
      entryId: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'workflow-plan',
      source: 'workflow-planner',
      dataType: 'plan',
      data: {
        planId: newPlan.planId,
        confidence: newPlan.overallConfidence,
        workflows: newPlan.groupedWorkflows.length,
      },
      context: { planId: newPlan.planId },
      status: 'success',
      message: `Created workflow plan: ${newPlan.groupedWorkflows.length} workflows, ${newPlan.overallConfidence.toFixed(0)}% confidence`,
    });

    workflowLog.add({
      entryId: `log-${Date.now()}-audit`,
      timestamp: new Date().toISOString(),
      category: 'audit',
      source: 'workflow-auditor',
      dataType: 'audit',
      data: {
        auditId: newAudit.auditId,
        decision: newAudit.decision,
        validations: {
          timeline: newAudit.timelineValidation.isValid,
          substrate: newAudit.substrateValidation.isValid,
          facility: newAudit.facilityConstraintsValidation.isValid,
          labor: newAudit.laborValidation.isValid,
        },
      },
      context: { planId: newPlan.planId, auditId: newAudit.auditId },
      status: newAudit.decision === 'block' ? 'failure' : newAudit.decision === 'warn' ? 'warning' : 'success',
      message: `Audit completed: ${newAudit.decision.toUpperCase()}`,
    });

    setHistoryEntries(workflowLog.list());
    setActiveTab('approval');
  };

  // Approve plan
  const handleApprovePlan = (userId: string) => {
    if (!plan) return;

    const approvedPlan = workflowPlanner.approvePlan(plan, userId);
    setPlan(approvedPlan);

    workflowLog.add({
      entryId: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'approval',
      source: 'workflow-planner',
      dataType: 'approval',
      data: { planId: approvedPlan.planId, approvalBy: userId },
      context: { planId: approvedPlan.planId, userId },
      status: 'success',
      message: `Plan approved by ${userId}`,
    });

    setHistoryEntries(workflowLog.list());
  };

  // Reject plan
  const handleRejectPlan = (reason: string) => {
    if (!plan) return;

    const rejectedPlan = workflowPlanner.rejectPlan(plan, reason);
    setPlan(rejectedPlan);

    workflowLog.add({
      entryId: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'rejection',
      source: 'workflow-planner',
      dataType: 'approval',
      data: { planId: rejectedPlan.planId, reason },
      context: { planId: rejectedPlan.planId },
      status: 'warning',
      message: `Plan rejected: ${reason}`,
    });

    setHistoryEntries(workflowLog.list());
  };

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
      }`}
    >
      {/* Developer Mode Banner */}
      <DeveloperModeBanner />

      {/* Header */}
      <div
        className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Phase 19: Workflow & Scheduling Engine</h1>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Autonomous scheduling with conflict detection and approval workflows
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDevMode(!showDevMode)}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  showDevMode
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                {showDevMode ? 'Hide' : 'Show'} Dev Mode
              </button>
              <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              {isDarkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {(['generate', 'schedule', 'conflicts', 'plan', 'approval', 'gantt', 'history'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-4">
            <div
              className={`p-6 rounded border ${
                isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <h2 className="text-xl font-semibold mb-4">Generate Workflow Tasks</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Species (comma-separated)</label>
                  <input
                    type="text"
                    value={selectedSpecies.join(', ')}
                    onChange={(e) => setSelectedSpecies(e.target.value.split(',').map(s => s.trim()))}
                    className={`w-full px-3 py-2 rounded border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Time Window (days)</label>
                  <input
                    type="number"
                    value={timeWindow}
                    onChange={(e) => setTimeWindow(Number(e.target.value))}
                    min="1"
                    max="365"
                    className={`w-full px-3 py-2 rounded border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Labor Hours Available/Day</label>
                  <input
                    type="number"
                    value={laborHours}
                    onChange={(e) => setLaborHours(Number(e.target.value))}
                    min="1"
                    max="24"
                    className={`w-full px-3 py-2 rounded border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateWorkflow}
                className="w-full px-6 py-3 rounded font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
              >
                Generate Workflow (Step 1)
              </button>
            </div>

            {tasks.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                <h3 className="text-lg font-semibold">Generated Tasks ({tasks.length})</h3>
                {tasks.map((task) => (
                  <WorkflowTaskCard key={task.taskId} task={task} isDarkMode={isDarkMode} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div
                className={`p-6 rounded border ${
                  isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Please generate workflow tasks first
                </p>
              </div>
            ) : (
              <>
                <button
                  onClick={handleCreateSchedule}
                  className="px-6 py-3 rounded font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  Create Schedule (Step 2)
                </button>

                {schedule && (
                  <ScheduleProposalPanel proposal={schedule} isDarkMode={isDarkMode} />
                )}
              </>
            )}
          </div>
        )}

        {/* Conflicts Tab */}
        {activeTab === 'conflicts' && (
          <div className="space-y-4">
            {schedule === null ? (
              <div
                className={`p-6 rounded border ${
                  isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Please create a schedule first
                </p>
              </div>
            ) : (
              <>
                <button
                  onClick={handleCheckConflicts}
                  className="px-6 py-3 rounded font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  Check Conflicts (Step 3)
                </button>

                {conflicts && (
                  <ConflictCheckPanel result={conflicts} isDarkMode={isDarkMode} />
                )}
              </>
            )}
          </div>
        )}

        {/* Plan Tab */}
        {activeTab === 'plan' && (
          <div className="space-y-4">
            {conflicts === null ? (
              <div
                className={`p-6 rounded border ${
                  isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Please check for conflicts first
                </p>
              </div>
            ) : (
              <>
                <button
                  onClick={handleCreatePlan}
                  className="px-6 py-3 rounded font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  Create & Audit Plan (Step 4)
                </button>

                {plan && audit && (
                  <div className="grid grid-cols-1 gap-4">
                    <WorkflowPlanSummary plan={plan} isDarkMode={isDarkMode} />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Approval Tab */}
        {activeTab === 'approval' && (
          <div className="space-y-4">
            {plan === null || audit === null ? (
              <div
                className={`p-6 rounded border ${
                  isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Please create a plan first
                </p>
              </div>
            ) : (
              <WorkflowApprovalPanel
                plan={plan}
                auditResult={audit}
                isDarkMode={isDarkMode}
                onApprove={handleApprovePlan}
                onReject={handleRejectPlan}
              />
            )}
          </div>
        )}

        {/* Gantt Tab */}
        {activeTab === 'gantt' && (
          <div className="space-y-4">
            {schedule === null ? (
              <div
                className={`p-6 rounded border ${
                  isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Please create a schedule first
                </p>
              </div>
            ) : (
              <GanttChartPanel proposal={schedule} isDarkMode={isDarkMode} />
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <WorkflowHistoryViewer
            entries={historyEntries}
            isDarkMode={isDarkMode}
            onExport={() => {
              const data = workflowLog.export();
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `workflow-log-${Date.now()}.json`;
              a.click();
            }}
          />
        )}
      </div>
    </div>
  );
}
