// @ts-nocheck
// Developer Mode Pipeline Helpers
// Collapsed multi-step flows for friction reduction

'use client';

import { devMode } from '@/app/config/developerMode';
import { strategyEngine } from '@/app/strategy/engine/strategyEngine';
import { strategyAuditor } from '@/app/strategy/engine/strategyAuditor';
import { strategyLog } from '@/app/strategy/engine/strategyLog';
import { workflowEngine } from '@/app/workflow/workflowEngine';
import { schedulingEngine } from '@/app/workflow/schedulingEngine';
import { conflictDetector } from '@/app/workflow/conflictDetector';
import { workflowPlanner } from '@/app/workflow/workflowPlanner';
import { workflowAuditor } from '@/app/workflow/workflowAuditor';
import { workflowLog } from '@/app/workflow/workflowLog';
import { resourceEngine } from '@/app/resource/resourceEngine';
import { allocationEngine } from '@/app/resource/allocationEngine';
import { forecastingEngine } from '@/app/resource/forecastingEngine';
import { resourceAuditor } from '@/app/resource/resourceAuditor';
import { resourceLog } from '@/app/resource/resourceLog';
import type { StrategyPlan } from '@/app/strategy/engine/strategyTypes';
import type { WorkflowPlan, WorkflowTask } from '@/app/workflow/workflowTypes';
import type { AllocationPlan, ForecastReport, ResourceRequirement } from '@/app/resource/resourceTypes';

// ============================================================================
// PIPELINE RESULT TYPES
// ============================================================================

export interface StrategyPipelineResult {
  plan: StrategyPlan;
  autoApproved: boolean;
  skippedSteps: string[];
  summary: {
    confidence: number;
    riskLevel: string;
    autoApprovalReason?: string;
    timesSaved: string;
  };
}

export interface WorkflowPipelineResult {
  plan: WorkflowPlan;
  tasks: WorkflowTask[];
  autoApproved: boolean;
  skippedSteps: string[];
  summary: {
    confidence: number;
    conflictCount: number;
    autoApprovalReason?: string;
    timesSaved: string;
  };
}

export interface ResourcePipelineResult {
  allocation: AllocationPlan;
  forecast: ForecastReport | null;
  autoApproved: boolean;
  skippedSteps: string[];
  summary: {
    confidence: number;
    shortageCount: number;
    autoApprovalReason?: string;
    timesSaved: string;
  };
}

// ============================================================================
// STRATEGY PIPELINE
// ============================================================================

export function runStrategyPipelineDev(params: {
  species: string;
  targetYieldKg: number;
  timeWindowDays: number;
  optimizationGoal: 'yield' | 'cost' | 'contamination-minimization' | 'labor-efficiency';
  facilityIds: string[];
}): StrategyPipelineResult {
  const config = devMode.getConfig();
  const skippedSteps: string[] = [];
  const startTime = Date.now();

  // 1. Generate strategy
  const plan = strategyEngine.generateStrategy(
    params.species,
    params.targetYieldKg,
    params.timeWindowDays,
    params.optimizationGoal,
    params.facilityIds
  );

  strategyLog.add('strategy-generation', `Generated strategy plan: ${plan.planId}`, {
    planId: plan.planId,
    developerMode: config.enabled,
  });

  // 2. Skip or run audit
  let autoApproved = false;
  let autoApprovalReason: string | undefined;

  if (config.enabled && config.skipOptionalAudits) {
    // Quick check: if high confidence and no red flags, auto-approve
    const canAutoApprove = devMode.canAutoApprove({
      decision: 'allow',
      confidence: plan.confidence,
      riskLevel: plan.riskLevel as any,
      hasConflicts: false,
      hasErrors: false,
    });

    if (canAutoApprove) {
      // Auto-approve without full audit
      const approved = strategyEngine.approvePlan(plan.planId, 'auto-dev-mode');
      Object.assign(plan, approved);
      autoApproved = true;
      autoApprovalReason = `Auto-approved: confidence ${plan.confidence}%, risk ${plan.riskLevel}`;
      skippedSteps.push('Full audit (minimal checks only)');

      strategyLog.add('approval', `Strategy auto-approved in dev mode: ${plan.planId}`, {
        planId: plan.planId,
        autoApproved: true,
        confidence: plan.confidence,
        riskLevel: plan.riskLevel,
      });
    }
  }

  const endTime = Date.now();
  const timeSaved = autoApproved ? '~2-3 clicks' : 'none';

  return {
    plan,
    autoApproved,
    skippedSteps,
    summary: {
      confidence: plan.confidence,
      riskLevel: plan.riskLevel,
      autoApprovalReason,
      timesSaved: timeSaved,
    },
  };
}

// ============================================================================
// WORKFLOW PIPELINE
// ============================================================================

export function runWorkflowPipelineDev(params: {
  species: string;
  targetYieldKg: number;
  facilityId: string;
  roomIds: string[];
}): WorkflowPipelineResult {
  const config = devMode.getConfig();
  const skippedSteps: string[] = [];
  const startTime = Date.now();

  // 1. Generate workflow tasks
  const tasks = workflowEngine.generateWorkflowTasks(
    params.species as any,
    params.targetYieldKg,
    params.facilityId,
    params.roomIds
  );

  workflowLog.add('workflow-generation', `Generated ${tasks.length} workflow tasks`, {
    taskCount: tasks.length,
    species: params.species,
    developerMode: config.enabled,
  });

  // 2. Create schedule
  const schedule = schedulingEngine.createScheduleProposal(tasks);

  workflowLog.add('schedule-proposal', `Created schedule: ${schedule.scheduleId}`, {
    scheduleId: schedule.scheduleId,
    totalDays: schedule.totalDays,
  });

  // 3. Check conflicts
  const conflicts = conflictDetector.checkConflicts(tasks, schedule);

  workflowLog.add('conflict-detection', `Conflict check: ${conflicts.decision}`, {
    decision: conflicts.decision,
    conflictCount: conflicts.conflicts.length,
  });

  // 4. Create workflow plan
  const plan = workflowPlanner.createWorkflowPlan(schedule, conflicts, tasks);

  workflowLog.add('workflow-plan', `Created workflow plan: ${plan.planId}`, {
    planId: plan.planId,
    confidence: plan.overallConfidence,
  });

  // 5. Auto-approve if safe
  let autoApproved = false;
  let autoApprovalReason: string | undefined;

  if (config.enabled && config.skipOptionalAudits) {
    const canAutoApprove = devMode.canAutoApprove({
      decision: conflicts.decision,
      confidence: plan.overallConfidence,
      hasConflicts: conflicts.conflicts.length > 0,
      hasErrors: conflicts.decision === 'block',
    });

    if (canAutoApprove) {
      // Skip full audit, auto-approve
      const approved = workflowPlanner.approvePlan(plan.planId, 'auto-dev-mode');
      Object.assign(plan, approved);
      autoApproved = true;
      autoApprovalReason = `Auto-approved: ${conflicts.decision}, confidence ${plan.overallConfidence}%`;
      skippedSteps.push('Full workflow audit');

      workflowLog.add('approval', `Workflow auto-approved in dev mode: ${plan.planId}`, {
        planId: plan.planId,
        autoApproved: true,
        confidence: plan.overallConfidence,
        decision: conflicts.decision,
      });
    }
  }

  const timeSaved = autoApproved ? '~3-4 clicks' : 'none';

  return {
    plan,
    tasks,
    autoApproved,
    skippedSteps,
    summary: {
      confidence: plan.overallConfidence,
      conflictCount: conflicts.conflicts.length,
      autoApprovalReason,
      timesSaved: timeSaved,
    },
  };
}

// ============================================================================
// RESOURCE PIPELINE
// ============================================================================

export function runResourcePipelineDev(params: {
  workflowPlan: WorkflowPlan;
  species: string;
  targetYieldKg: number;
  timeWindowDays: number;
  energyBudgetKwh: number;
}): ResourcePipelineResult {
  const config = devMode.getConfig();
  const skippedSteps: string[] = [];
  const startTime = Date.now();

  // 1. Generate resource requirements (simplified mock for now)
  const mockRequirements: ResourceRequirement[] = [
    {
      requirementId: 'req-1',
      category: 'substrate-material',
      resourceName: `${params.species}-substrate`,
      quantityNeeded: params.targetYieldKg * 2,
      unit: 'kg',
      priority: 'high',
      neededBy: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
      rationale: `Substrate for ${params.targetYieldKg}kg ${params.species} production`,
    },
  ];

  resourceLog.add('requirement-generation', `Generated ${mockRequirements.length} requirements`, {
    workflowPlanId: params.workflowPlan.planId,
    requirementCount: mockRequirements.length,
    developerMode: config.enabled,
  });

  // 2. Create allocation plan
  const inventory = []; // Would get from inventoryManager in real implementation
  const allocation = allocationEngine.createAllocationPlan(
    mockRequirements,
    inventory,
    params.workflowPlan.planId
  );

  resourceLog.add('allocation-creation', `Created allocation: ${allocation.planId}`, {
    allocationPlanId: allocation.planId,
    confidence: allocation.confidence,
  });

  // 3. Optional: Generate forecast
  let forecast: ForecastReport | null = null;
  if (!config.skipSimulations) {
    forecast = forecastingEngine.generateForecastReport(
      mockRequirements,
      inventory,
      params.energyBudgetKwh,
      [],
      params.timeWindowDays,
      params.workflowPlan.planId
    );
  } else {
    skippedSteps.push('Resource forecasting');
  }

  // 4. Auto-approve if safe
  let autoApproved = false;
  let autoApprovalReason: string | undefined;

  if (config.enabled && config.skipOptionalAudits) {
    const hasShortages = allocation.unmetRequirements.length > 0;
    const canAutoApprove = devMode.canAutoApprove({
      decision: hasShortages ? 'warn' : 'allow',
      confidence: allocation.confidence,
      hasConflicts: allocation.conflicts.length > 0,
      hasErrors: false,
    });

    if (canAutoApprove) {
      const approved = allocationEngine.approvePlan(allocation, 'auto-dev-mode');
      Object.assign(allocation, approved);
      autoApproved = true;
      autoApprovalReason = `Auto-approved: confidence ${allocation.confidence}%, ${allocation.unmetRequirements.length} unmet requirements`;
      skippedSteps.push('Full resource audit');

      resourceLog.add('approval', `Allocation auto-approved in dev mode: ${allocation.planId}`, {
        allocationPlanId: allocation.planId,
        autoApproved: true,
        confidence: allocation.confidence,
      });
    }
  }

  const timeSaved = autoApproved ? '~2-3 clicks' : 'none';

  return {
    allocation,
    forecast,
    autoApproved,
    skippedSteps,
    summary: {
      confidence: allocation.confidence,
      shortageCount: allocation.unmetRequirements.length,
      autoApprovalReason,
      timesSaved: timeSaved,
    },
  };
}
