/**
 * Workflow Orchestration Schemas
 * 
 * Schema validators for workflow creation and execution.
 */

import { z } from 'zod';

/**
 * Workflow creation schema
 */
export const WorkflowSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  steps: z.array(z.object({
    id: z.string(),
    type: z.string(),
    config: z.record(z.any()).optional(),
  })),
  enabled: z.boolean().default(true),
});

export type Workflow = z.infer<typeof WorkflowSchema>;

/**
 * Workflow execution request schema
 */
export const ExecuteRequestSchema = z.object({
  workflowId: z.string(),
  input: z.record(z.any()).optional(),
  runId: z.string().optional(),
});

export type ExecuteRequest = z.infer<typeof ExecuteRequestSchema>;
