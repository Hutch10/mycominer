/**
 * Workflow Scheduler
 *
 * Schedules workflow runs and persists them atomically when Supabase is configured.
 */

import type { ExecuteRequest } from './schemas';
import { db } from '../db';
import type { AuditContext } from '../db/auditContext';

export interface ScheduleResult {
  runId: string;
  workflowId: string;
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelling' | 'cancelled';
  scheduledAt: string;
}

export async function scheduleRun(
  orgId: string,
  request: ExecuteRequest,
  audit: AuditContext
): Promise<ScheduleResult> {
  const run = await db.scheduleRunWithLog(
    orgId,
    {
      workflowId: request.workflowId,
      input: request.input,
      runId: request.runId,
    },
    audit
  );

  return {
    runId: run.id,
    workflowId: run.workflowId,
    status: run.status as ScheduleResult['status'],
    scheduledAt: run.scheduledAt,
  };
}

export async function getRunStatus(orgId: string, runId: string): Promise<ScheduleResult | null> {
  const run = await db.findWorkflowRunById(orgId, runId);
  if (!run) return null;

  return {
    runId: run.id,
    workflowId: run.workflowId,
    status: run.status as ScheduleResult['status'],
    scheduledAt: run.scheduledAt,
  };
}
