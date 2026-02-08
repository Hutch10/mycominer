// Phase 21: Execution Monitor
// Observes telemetry, pauses on deviations, and emits execution status reports

'use client';

import {
  ExecutionPlan,
  ExecutionStatusReport,
  ExecutionStepStatus,
  TelemetrySnapshot,
} from '@/app/execution/executionTypes';
import { safetyGate } from '@/app/execution/safetyGate';
import { executionLog } from '@/app/execution/executionLog';

class ExecutionMonitor {
  updateStepStatus(
    plan: ExecutionPlan,
    stepId: string,
    status: ExecutionStepStatus,
    telemetry?: TelemetrySnapshot
  ): ExecutionPlan {
    const step = plan.steps.find(s => s.stepId === stepId);
    if (!step) return plan;

    // Always run safety gate before allowing state changes to running/completed
    if (status === 'running' || status === 'completed') {
      const gate = safetyGate.evaluateStep(step, telemetry);
      executionLog.add({
        entryId: `exec-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        category: 'safety-gate',
        message: `Safety gate for ${stepId}: ${gate.decision}`,
        context: { planId: plan.planId, stepId },
        details: gate,
      });

      if (gate.decision === 'block') {
        return { ...plan, status: 'paused' };
      }
      if (gate.decision === 'warn' && status === 'running') {
        // Warn transitions force pause until manual approval
        return { ...plan, status: 'paused' };
      }
    }

    const updatedSteps = plan.steps.map(s => s.stepId === stepId ? { ...s, status } : s);
    return { ...plan, steps: updatedSteps };
  }

  monitorPlan(plan: ExecutionPlan, telemetry?: TelemetrySnapshot): { plan: ExecutionPlan; report: ExecutionStatusReport } {
    const gateResults = safetyGate.evaluatePlan(plan.steps, telemetry);
    const shouldPause = gateResults.some(r => r.decision === 'block' || r.decision === 'warn');

    const updatedPlan: ExecutionPlan = {
      ...plan,
      status: shouldPause ? 'paused' : plan.status,
    };

    if (shouldPause) {
      executionLog.add({
        entryId: `exec-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        category: 'monitor',
        message: 'Execution paused due to telemetry deviations',
        context: { planId: plan.planId },
        details: gateResults,
      });
    }

    const report: ExecutionStatusReport = {
      reportId: `status-${Date.now()}`,
      planId: plan.planId,
      timestamp: new Date().toISOString(),
      stepStatuses: plan.steps.map(step => ({
        stepId: step.stepId,
        status: step.status,
        lastUpdated: new Date().toISOString(),
      })),
      telemetryDeviations: gateResults
        .filter(r => r.decision !== 'allow')
        .map(r => ({
          metric: 'safety-gate',
          currentValue: 1,
          baseline: 0,
          deviation: 1,
          severity: r.decision === 'block' ? 'critical' : 'warning',
        })),
      actionsTaken: shouldPause ? ['Paused execution, awaiting operator review'] : ['Monitoring continues'],
      pausedReason: shouldPause ? 'Telemetry deviation or safety gate warning' : undefined,
    };

    executionLog.add({
      entryId: `exec-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      category: 'monitor',
      message: 'Execution status report generated',
      context: { planId: plan.planId, reportId: report.reportId },
    });

    return { plan: updatedPlan, report };
  }
}

export const executionMonitor = new ExecutionMonitor();
