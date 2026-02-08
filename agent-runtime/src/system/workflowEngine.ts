/**
 * Workflow Engine - Manages workflow execution state
 */

export interface WorkflowStep {
  id: string;
  name: string;
  type?: 'action' | 'decision' | 'parallel' | 'loop';
  action?: string;
  parameters?: Record<string, any>;
  dependencies?: string[];
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
  };
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  input?: any;
  output?: any;
  error?: string;
  startTime?: string;
  endTime?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  version?: string;
  createdAt?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  steps: WorkflowStep[];
  currentStepIndex: number;
  context: Record<string, any>;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

class WorkflowEngine {
  private executions: Map<string, WorkflowExecution> = new Map();
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private sessionExecutions: Map<string, string[]> = new Map();
  private maxExecutions: number = 500;

  /**
   * Register a workflow definition
   */
  registerWorkflow(definition: WorkflowDefinition): void {
    this.workflows.set(definition.id, definition);
  }

  /**
   * Start workflow execution
   */
  async executeWorkflow(
    workflowId: string,
    sessionId: string,
    inputs: Record<string, any> = {}
  ): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const execution: WorkflowExecution = {
      id: executionId,
      workflowName: workflow.name,
      status: 'running',
      steps: (workflow.steps || []).map(step => ({
        ...step,
        status: 'pending' as const,
      })),
      currentStepIndex: 0,
      context: inputs,
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
    };

    this.executions.set(executionId, execution);

    // Track session executions
    if (!this.sessionExecutions.has(sessionId)) {
      this.sessionExecutions.set(sessionId, []);
    }
    this.sessionExecutions.get(sessionId)!.push(executionId);

    return execution;
  }

  /**
   * Get executions for a specific session
   */
  getSessionExecutions(sessionId: string): WorkflowExecution[] {
    const executionIds = this.sessionExecutions.get(sessionId) || [];
    return executionIds
      .map(id => this.executions.get(id))
      .filter((exec): exec is WorkflowExecution => exec !== undefined);
  }

  createExecution(workflowName: string, steps: Omit<WorkflowStep, 'status' | 'startTime' | 'endTime'>[]): string {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const execution: WorkflowExecution = {
      id: executionId,
      workflowName,
      status: 'pending',
      steps: steps.map(step => ({
        ...step,
        status: 'pending' as const,
      })),
      currentStepIndex: 0,
      context: {},
      createdAt: new Date().toISOString(),
    };

    this.executions.set(executionId, execution);

    // Trim old executions
    if (this.executions.size > this.maxExecutions) {
      const sortedExecutions = Array.from(this.executions.entries())
        .sort((a, b) => new Date(a[1].createdAt).getTime() - new Date(b[1].createdAt).getTime());
      
      const toRemove = sortedExecutions.slice(0, sortedExecutions.length - this.maxExecutions);
      toRemove.forEach(([id]) => this.executions.delete(id));
    }

    return executionId;
  }

  startExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'pending') return false;

    execution.status = 'running';
    execution.startedAt = new Date().toISOString();
    return true;
  }

  startStep(executionId: string, stepId: string): boolean {
    const execution = this.executions.get(executionId);
    if (!execution) return false;

    const step = execution.steps.find(s => s.id === stepId);
    if (!step || step.status !== 'pending') return false;

    step.status = 'running';
    step.startTime = new Date().toISOString();
    return true;
  }

  completeStep(executionId: string, stepId: string, output?: any): boolean {
    const execution = this.executions.get(executionId);
    if (!execution) return false;

    const step = execution.steps.find(s => s.id === stepId);
    if (!step || step.status !== 'running') return false;

    step.status = 'completed';
    step.output = output;
    step.endTime = new Date().toISOString();

    // Move to next step
    const stepIndex = execution.steps.findIndex(s => s.id === stepId);
    if (stepIndex >= 0) {
      execution.currentStepIndex = stepIndex + 1;
    }

    // Check if all steps are complete
    const allComplete = execution.steps.every(s => 
      s.status === 'completed' || s.status === 'skipped'
    );

    if (allComplete) {
      execution.status = 'completed';
      execution.completedAt = new Date().toISOString();
    }

    return true;
  }

  failStep(executionId: string, stepId: string, error: string): boolean {
    const execution = this.executions.get(executionId);
    if (!execution) return false;

    const step = execution.steps.find(s => s.id === stepId);
    if (!step) return false;

    step.status = 'failed';
    step.error = error;
    step.endTime = new Date().toISOString();

    execution.status = 'failed';
    execution.error = error;
    execution.completedAt = new Date().toISOString();

    return true;
  }

  skipStep(executionId: string, stepId: string): boolean {
    const execution = this.executions.get(executionId);
    if (!execution) return false;

    const step = execution.steps.find(s => s.id === stepId);
    if (!step || step.status !== 'pending') return false;

    step.status = 'skipped';
    step.endTime = new Date().toISOString();

    return true;
  }

  pauseExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'running') return false;

    execution.status = 'paused';
    return true;
  }

  resumeExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'paused') return false;

    execution.status = 'running';
    return true;
  }

  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  getExecutionsByWorkflow(workflowName: string): WorkflowExecution[] {
    return Array.from(this.executions.values())
      .filter(e => e.workflowName === workflowName);
  }

  getExecutionsByStatus(status: WorkflowExecution['status']): WorkflowExecution[] {
    return Array.from(this.executions.values())
      .filter(e => e.status === status);
  }

  updateContext(executionId: string, key: string, value: any): boolean {
    const execution = this.executions.get(executionId);
    if (!execution) return false;

    execution.context[key] = value;
    return true;
  }

  getContext(executionId: string): Record<string, any> | undefined {
    const execution = this.executions.get(executionId);
    return execution?.context;
  }

  deleteExecution(executionId: string): boolean {
    return this.executions.delete(executionId);
  }

  getStats() {
    const statusCounts = {
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      paused: 0,
    };

    let totalSteps = 0;
    let completedSteps = 0;

    for (const execution of this.executions.values()) {
      statusCounts[execution.status]++;
      totalSteps += execution.steps.length;
      completedSteps += execution.steps.filter(s => s.status === 'completed').length;
    }

    return {
      totalExecutions: this.executions.size,
      ...statusCounts,
      totalSteps,
      completedSteps,
      completionRate: totalSteps > 0 ? completedSteps / totalSteps : 0,
    };
  }
}

const workflowEngine = new WorkflowEngine();
export default workflowEngine;
