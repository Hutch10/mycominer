'use client';

import { useEffect, useMemo, useState } from 'react';
import { executionEngine } from '@/app/execution/executionEngine';
import { executionPlanner } from '@/app/execution/executionPlanner';
import { safetyGate } from '@/app/execution/safetyGate';
import { executionMonitor } from '@/app/execution/executionMonitor';
import { rollbackEngine } from '@/app/execution/rollbackEngine';
import { executionLog } from '@/app/execution/executionLog';
import {
  ExecutionPlan,
  ExecutionStatusReport,
  RollbackPlan,
  SafetyGateResult,
  TelemetrySnapshot,
} from '@/app/execution/executionTypes';
import { ExecutionStepCard } from '@/app/execution/components/ExecutionStepCard';
import { ExecutionPlanPanel } from '@/app/execution/components/ExecutionPlanPanel';
import { SafetyGatePanel } from '@/app/execution/components/SafetyGatePanel';
import { ExecutionMonitorPanel } from '@/app/execution/components/ExecutionMonitorPanel';
import { RollbackPanel } from '@/app/execution/components/RollbackPanel';
import { ExecutionHistoryViewer } from '@/app/execution/components/ExecutionHistoryViewer';
import { WorkflowPlan } from '@/app/workflow/workflowTypes';
import { StrategyPlan } from '@/app/strategy/engine/strategyTypes';
import { AllocationPlan } from '@/app/resource/resourceTypes';

export function ExecutionDashboard() {
  const [plan, setPlan] = useState<ExecutionPlan | null>(null);
  const [safetyResults, setSafetyResults] = useState<SafetyGateResult[]>([]);
  const [report, setReport] = useState<ExecutionStatusReport | null>(null);
  const [rollbackPlan, setRollbackPlan] = useState<RollbackPlan | undefined>();
  const [logs, setLogs] = useState(executionLog.getRecent(20));

  const telemetry: TelemetrySnapshot = useMemo(() => ({
    timestamp: new Date().toISOString(),
    temperatureC: 24,
    humidityPercent: 88,
    co2Ppm: 1800,
    contaminationRiskScore: 72,
    equipmentLoadPercent: 78,
    laborUtilizationPercent: 65,
    regressionsDetected: [],
  }), []);

  const mockWorkflowPlan: WorkflowPlan = useMemo(() => ({
    planId: 'wf-plan-demo',
    createdAt: new Date().toISOString(),
    scheduleProposal: {
      proposalId: 'sched-1',
      createdAt: new Date().toISOString(),
      scheduledTasks: [
        {
          taskId: 'task-1',
          type: 'inoculation',
          scheduledStart: new Date().toISOString(),
          scheduledEnd: new Date(Date.now() + 3600000).toISOString(),
          room: 'room-1',
          species: 'oyster',
          assignedLabor: 2,
          assignedEquipment: ['autoclave-1'],
          sequenceOrder: 1,
        },
        {
          taskId: 'task-2',
          type: 'fruiting-transition',
          scheduledStart: new Date(Date.now() + 7200000).toISOString(),
          scheduledEnd: new Date(Date.now() + 10800000).toISOString(),
          room: 'room-1',
          species: 'oyster',
          assignedLabor: 1,
          assignedEquipment: ['misting-system-1'],
          sequenceOrder: 2,
        },
      ],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      totalDays: 7,
      estimatedYieldKg: 120,
      totalLaborHours: 30,
      equipmentUtilization: { 'autoclave-1': 70 },
      rationale: 'Demo workflow schedule',
      confidence: 82,
      riskFactors: ['contamination-control'],
    },
    groupedWorkflows: [
      {
        workflowName: 'oyster-batch-a',
        tasks: ['task-1', 'task-2'],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        estimatedYield: 120,
        laborCost: 600,
      },
    ],
    priorityLevels: { 'task-1': 1, 'task-2': 2 },
    tradeoffs: {
      laborVsYield: 'Balanced for minimal overtime',
      contaminationRisk: 'HEPA and alcohol enforced',
      equipmentUtilization: 'Autoclave at 70% utilization',
    },
    overallConfidence: 82,
    estimatedBenefit: 'Meets weekly oyster target',
    status: 'approved',
  }), []);

  const mockStrategyPlan: StrategyPlan = useMemo(() => ({
    id: 'strategy-demo',
    name: 'Energy and yield tune-up',
    description: 'Optimize misting schedule and light cycle',
    proposals: [
      {
        id: 'proposal-1',
        type: 'energy',
        title: 'Optimize misting cycles',
        description: 'Shorten misting windows during low humidity stability',
        source: 'telemetry-analysis',
        rationale: 'Reduce over-saturation risks',
        expectedBenefit: '5% energy reduction',
        affectedSystems: ['misting', 'hvac'],
        confidenceScore: 76,
        riskLevel: 'medium',
        implementationSteps: ['Tighten misting interval to 15 min per hour'],
        status: 'approved',
      },
    ],
    priorityOrder: ['proposal-1'],
    impactSummary: {
      estimatedEnergyReduction: 5,
      estimatedYieldIncrease: 2,
      contaminationRiskReduction: 3,
    },
    tradeoffs: ['Slightly drier surface risk'],
    overallConfidence: 78,
    approvalsRequired: ['operations-lead'],
    status: 'approved',
  }), []);

  const mockAllocationPlan: AllocationPlan = useMemo(() => ({
    planId: 'alloc-demo',
    createdAt: new Date().toISOString(),
    workflowPlanId: 'wf-plan-demo',
    requirements: [],
    allocations: [
      {
        allocationId: 'alloc-1',
        requirementId: 'req-1',
        category: 'substrate-material',
        resourceName: 'hardwood-sawdust',
        itemId: 'item-1',
        quantityRequested: 100,
        quantityAllocated: 100,
        unit: 'kg',
        allocationDate: new Date().toISOString(),
        status: 'allocated',
      },
    ],
    totalCost: 1200,
    unmetRequirements: [],
    conflicts: [],
    conflictingAllocations: [],
    confidence: 88,
    status: 'approved',
  }), []);

  useEffect(() => {
    const steps = executionEngine.ingest({
      workflowPlan: mockWorkflowPlan,
      strategyPlan: mockStrategyPlan,
      allocationPlan: mockAllocationPlan,
    });
    const planDraft = executionPlanner.sequenceSteps(steps);
    setPlan(planDraft);
    setSafetyResults(safetyGate.evaluatePlan(planDraft.steps, telemetry));
    setLogs(executionLog.getRecent(20));
  }, [mockWorkflowPlan, mockStrategyPlan, mockAllocationPlan, telemetry]);

  const handleApprovePlan = () => {
    if (!plan) return;
    const approved = executionPlanner.approvePlan(plan, 'ops-lead');
    setPlan(approved);
    setLogs(executionLog.getRecent(20));
  };

  const handleMonitor = () => {
    if (!plan) return;
    const { plan: monitoredPlan, report } = executionMonitor.monitorPlan(plan, telemetry);
    setPlan(monitoredPlan);
    setReport(report);
    setSafetyResults(safetyGate.evaluatePlan(monitoredPlan.steps, telemetry));
    setLogs(executionLog.getRecent(20));

    if (monitoredPlan.status === 'paused') {
      const rollback = rollbackEngine.generate(monitoredPlan, monitoredPlan.steps[0].stepId, 'Telemetry deviation');
      setRollbackPlan(rollback);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-300">Execution & Monitoring Engine</div>
            <h1 className="text-2xl font-bold">Deterministic, safety-first execution</h1>
            <p className="text-sm text-slate-200 mt-1">Plans stay proposals until explicitly approved. Safety gates run before every step.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleMonitor} className="px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 shadow">
              Run safety monitor
            </button>
          </div>
        </div>
      </div>

      {plan && (
        <ExecutionPlanPanel
          plan={plan}
          onApprove={handleApprovePlan}
          onReject={() => setPlan({ ...plan, status: 'rejected' })}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plan?.steps.map(step => (
              <ExecutionStepCard key={step.stepId} step={step} />
            ))}
          </div>

          <SafetyGatePanel results={safetyResults} />

          {report && <ExecutionMonitorPanel report={report} />}
        </div>

        <div className="space-y-4">
          <RollbackPanel rollbackPlan={rollbackPlan} />
          <ExecutionHistoryViewer entries={logs} />
        </div>
      </div>
    </div>
  );
}
