/**
 * ACTION ENGINE
 * Phase 53: Operator Action Center
 * 
 * Main orchestrator for action center operations.
 * Coordinates routing, task building, policy evaluation, and logging.
 */

import { ActionRouter } from './actionRouter';
import { ActionTaskBuilder } from './actionTaskBuilder';
import { ActionPolicyEngine } from './actionPolicyEngine';
import { ActionLog } from './actionLog';
import {
  ActionTask,
  ActionQuery,
  ActionResult,
  ActionGroup,
  ActionPolicyContext,
  ActionPolicyDecision,
  ActionStatistics,
  EngineInputs,
  ActionStatus,
  ActionSeverity,
} from './actionTypes';

// ============================================================================
// ACTION ENGINE
// ============================================================================

export class ActionEngine {
  private router: ActionRouter;
  private taskBuilder: ActionTaskBuilder;
  private policyEngine: ActionPolicyEngine;
  private actionLog: ActionLog;
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.router = new ActionRouter(tenantId);
    this.taskBuilder = new ActionTaskBuilder();
    this.policyEngine = new ActionPolicyEngine();
    this.actionLog = new ActionLog();
  }

  // ==========================================================================
  // MAIN QUERY EXECUTION
  // ==========================================================================

  /**
   * Execute task query
   * 
   * Process:
   * 1. Authorize query with policy engine
   * 2. Route tasks from all engines
   * 3. Filter by query parameters
   * 4. Merge duplicates (if enabled)
   * 5. Sort tasks
   * 6. Apply max limit
   * 7. Group tasks (if requested)
   * 8. Calculate summary
   * 9. Create result
   * 10. Log everything
   */
  async executeQuery(
    query: ActionQuery,
    context: ActionPolicyContext,
    inputs: EngineInputs
  ): Promise<ActionResult> {
    try {
      // Step 1: Authorize query
      const decision = this.policyEngine.authorizeQuery(query, context);
      if (!decision.authorized) {
        return this.createErrorResult(query, `Authorization failed: ${decision.reason}`);
      }

      // Step 2: Route tasks from all engines
      const tasks = await this.routeTasks(inputs, context);

      // Step 3: Filter tasks
      const filtered = this.filterTasks(tasks, query, decision);

      // Step 4: Merge duplicates (unless suppressed)
      const merged = query.options?.includeDismissed === false
        ? this.taskBuilder.mergeDuplicates(filtered)
        : filtered;

      // Step 5: Sort tasks
      const sorted = this.sortTasks(merged, query);

      // Step 6: Apply max limit
      const limited = query.options?.maxTasks
        ? sorted.slice(0, query.options.maxTasks)
        : sorted;

      // Step 7: Group tasks (if requested)
      const groups = query.options?.groupBy
        ? this.groupTasks(limited, query.options.groupBy, context)
        : undefined;

      // Step 8: Calculate summary
      const summary = this.calculateSummary(limited);

      // Step 9: Create result
      const result: ActionResult = {
        resultId: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        query,
        tasks: limited,
        groups,
        totalTasks: limited.length,
        newTasks: limited.filter(t => t.status === 'new').length,
        summary,
        metadata: {
          executedAt: new Date().toISOString(),
          decision,
        },
        success: true,
      };

      // Step 10: Log query and results
      this.actionLog.logQuery(query, result.totalTasks, true);
      for (const task of limited) {
        this.actionLog.logTask(task, context.performedBy, true);
      }
      if (groups) {
        for (const group of groups) {
          this.actionLog.logGroup(group, this.tenantId, context.performedBy, context.facilityId, true);
        }
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.actionLog.logError('query-execution', errorMessage, this.tenantId, context.performedBy, context.facilityId);
      return this.createErrorResult(query, errorMessage);
    }
  }

  // ==========================================================================
  // TASK ROUTING
  // ==========================================================================

  private async routeTasks(
    inputs: EngineInputs,
    context: ActionPolicyContext
  ): Promise<ActionTask[]> {
    const tasks = this.router.routeAll(inputs);

    // Log routing for each engine
    if (inputs.alerts) {
      this.actionLog.logRouting(
        'alert-center',
        this.router.routeFromAlertCenter(inputs.alerts).length,
        inputs.alerts.length - this.router.routeFromAlertCenter(inputs.alerts).length,
        this.tenantId,
        context.performedBy,
        context.facilityId
      );
    }

    if (inputs.auditFindings) {
      this.actionLog.logRouting(
        'auditor',
        this.router.routeFromAuditor(inputs.auditFindings).length,
        inputs.auditFindings.length - this.router.routeFromAuditor(inputs.auditFindings).length,
        this.tenantId,
        context.performedBy,
        context.facilityId
      );
    }

    if (inputs.integrityDrift) {
      this.actionLog.logRouting(
        'integrity-monitor',
        this.router.routeFromIntegrityMonitor(inputs.integrityDrift).length,
        inputs.integrityDrift.length - this.router.routeFromIntegrityMonitor(inputs.integrityDrift).length,
        this.tenantId,
        context.performedBy,
        context.facilityId
      );
    }

    return tasks;
  }

  // ==========================================================================
  // TASK FILTERING
  // ==========================================================================

  private filterTasks(
    tasks: ActionTask[],
    query: ActionQuery,
    decision: ActionPolicyDecision
  ): ActionTask[] {
    let filtered = [...tasks];

    // Filter by category
    if (query.categories && query.categories.length > 0) {
      filtered = filtered.filter(t => query.categories!.includes(t.category));
    }

    // Filter by severity
    if (query.severities && query.severities.length > 0) {
      filtered = filtered.filter(t => query.severities!.includes(t.severity));
    }

    // Filter by source
    if (query.sources && query.sources.length > 0) {
      filtered = filtered.filter(t => query.sources!.includes(t.source));
    }

    // Filter by status
    if (query.statuses && query.statuses.length > 0) {
      filtered = filtered.filter(t => query.statuses!.includes(t.status));
    }

    // Filter by entity
    if (query.entityId && query.entityType) {
      filtered = filtered.filter(t =>
        t.affectedEntities.some(
          e => e.entityId === query.entityId && e.entityType === query.entityType
        )
      );
    }

    // Filter by assignee
    if (query.assignedTo) {
      filtered = filtered.filter(t => t.assignedTo === query.assignedTo);
    }

    // Filter by date range
    if (query.dateRange) {
      const start = new Date(query.dateRange.startDate).getTime();
      const end = new Date(query.dateRange.endDate).getTime();
      filtered = filtered.filter(t => {
        const created = new Date(t.createdAt).getTime();
        return created >= start && created <= end;
      });
    }

    // Filter by facility (if specified in scope)
    if (query.scope.facilityId) {
      filtered = filtered.filter(t => t.scope.facilityId === query.scope.facilityId);
    }

    // Filter by room (if specified in scope)
    if (query.scope.roomId) {
      filtered = filtered.filter(t => t.scope.roomId === query.scope.roomId);
    }

    // Apply policy decision filters
    if (decision.deniedCategories && decision.deniedCategories.length > 0) {
      filtered = filtered.filter(t => !decision.deniedCategories!.includes(t.category));
    }

    if (decision.deniedSources && decision.deniedSources.length > 0) {
      filtered = filtered.filter(t => !decision.deniedSources!.includes(t.source));
    }

    // Filter resolved/dismissed unless explicitly requested
    if (!query.options?.includeResolved) {
      filtered = filtered.filter(t => t.status !== 'resolved');
    }

    if (!query.options?.includeDismissed) {
      filtered = filtered.filter(t => t.status !== 'dismissed');
    }

    return filtered;
  }

  // ==========================================================================
  // TASK SORTING
  // ==========================================================================

  private sortTasks(tasks: ActionTask[], query: ActionQuery): ActionTask[] {
    const sortBy = query.options?.sortBy || 'severity';
    const sortOrder = query.options?.sortOrder || 'desc';

    let sorted = [...tasks];

    if (sortBy === 'severity') {
      sorted = this.taskBuilder.sortTasks(sorted);
    } else if (sortBy === 'createdAt') {
      sorted.sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
      });
    } else if (sortBy === 'category') {
      sorted.sort((a, b) => {
        return sortOrder === 'asc'
          ? a.category.localeCompare(b.category)
          : b.category.localeCompare(a.category);
      });
    } else if (sortBy === 'status') {
      sorted.sort((a, b) => {
        return sortOrder === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      });
    }

    if (sortOrder === 'desc' && sortBy === 'severity') {
      // Already sorted descending by taskBuilder
      return sorted;
    }

    return sorted;
  }

  // ==========================================================================
  // TASK GROUPING
  // ==========================================================================

  private groupTasks(
    tasks: ActionTask[],
    groupBy: string,
    _context: ActionPolicyContext
  ): ActionGroup[] {
    let groups: ActionGroup[] = [];

    if (groupBy === 'category') {
      groups = this.taskBuilder.groupByCategory(tasks);
    } else if (groupBy === 'severity') {
      groups = this.taskBuilder.groupBySeverity(tasks);
    } else if (groupBy === 'entity') {
      groups = this.taskBuilder.groupByEntity(tasks);
    } else if (groupBy === 'source') {
      groups = this.taskBuilder.groupBySource(tasks);
    } else if (groupBy === 'status') {
      groups = this.taskBuilder.groupByStatus(tasks);
    }

    return groups;
  }

  // ==========================================================================
  // SUMMARY CALCULATION
  // ==========================================================================

  private calculateSummary(tasks: ActionTask[]): {
    byCategory: Record<string, number>;
    bySeverity: Record<ActionSeverity, number>;
    bySource: Record<string, number>;
    byStatus: Record<ActionStatus, number>;
    affectedEntities: { entityId: string; entityType: string; title: string; taskCount: number }[];
  } {
    const summary = {
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<ActionSeverity, number>,
      bySource: {} as Record<string, number>,
      byStatus: {} as Record<ActionStatus, number>,
      affectedEntities: [] as { entityId: string; entityType: string; title: string; taskCount: number }[],
    };

    const entityMap = new Map<string, { entityId: string; entityType: string; title: string; count: number }>();

    for (const task of tasks) {
      // Count by category
      summary.byCategory[task.category] = (summary.byCategory[task.category] || 0) + 1;

      // Count by severity
      summary.bySeverity[task.severity] = (summary.bySeverity[task.severity] || 0) + 1;

      // Count by source
      summary.bySource[task.source] = (summary.bySource[task.source] || 0) + 1;

      // Count by status
      summary.byStatus[task.status] = (summary.byStatus[task.status] || 0) + 1;

      // Count affected entities
      for (const entity of task.affectedEntities) {
        const key = `${entity.entityType}:${entity.entityId}`;
        if (entityMap.has(key)) {
          entityMap.get(key)!.count++;
        } else {
          entityMap.set(key, {
            entityId: entity.entityId,
            entityType: entity.entityType,
            title: entity.title,
            count: 1,
          });
        }
      }
    }

    // Convert entity map to array and sort by count
    summary.affectedEntities = Array.from(entityMap.values())
      .map(e => ({ ...e, taskCount: e.count }))
      .sort((a, b) => b.taskCount - a.taskCount);

    return summary;
  }

  // ==========================================================================
  // LIFECYCLE OPERATIONS
  // ==========================================================================

  /**
   * Acknowledge task
   */
  async acknowledgeTask(
    taskId: string,
    context: ActionPolicyContext
  ): Promise<{ success: boolean; task?: ActionTask; error?: string }> {
    try {
      // Find task
      const task = this.actionLog.getAllTasks().find(t => t.taskId === taskId);
      if (!task) {
        return { success: false, error: 'Task not found' };
      }

      // Authorize lifecycle change
      const decision = this.policyEngine.authorizeLifecycleChange(task, 'acknowledge', context);
      if (!decision.authorized) {
        return { success: false, error: decision.reason };
      }

      // Update task
      const oldStatus = task.status;
      task.status = 'acknowledged';
      task.acknowledgedAt = new Date().toISOString();
      task.acknowledgedBy = context.performedBy;

      // Log change
      this.actionLog.logLifecycleChange(
        taskId,
        oldStatus,
        'acknowledged',
        this.tenantId,
        context.performedBy,
        context.facilityId
      );

      return { success: true, task };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Assign task
   */
  async assignTask(
    taskId: string,
    assignedTo: string,
    context: ActionPolicyContext
  ): Promise<{ success: boolean; task?: ActionTask; error?: string }> {
    try {
      const task = this.actionLog.getAllTasks().find(t => t.taskId === taskId);
      if (!task) {
        return { success: false, error: 'Task not found' };
      }

      const decision = this.policyEngine.authorizeLifecycleChange(task, 'assign', context);
      if (!decision.authorized) {
        return { success: false, error: decision.reason };
      }

      const oldStatus = task.status;
      task.status = 'assigned';
      task.assignedTo = assignedTo;
      task.assignedAt = new Date().toISOString();

      this.actionLog.logLifecycleChange(
        taskId,
        oldStatus,
        'assigned',
        this.tenantId,
        context.performedBy,
        context.facilityId,
        `Assigned to ${assignedTo}`
      );

      return { success: true, task };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Resolve task
   */
  async resolveTask(
    taskId: string,
    context: ActionPolicyContext
  ): Promise<{ success: boolean; task?: ActionTask; error?: string }> {
    try {
      const task = this.actionLog.getAllTasks().find(t => t.taskId === taskId);
      if (!task) {
        return { success: false, error: 'Task not found' };
      }

      const decision = this.policyEngine.authorizeLifecycleChange(task, 'resolve', context);
      if (!decision.authorized) {
        return { success: false, error: decision.reason };
      }

      const oldStatus = task.status;
      task.status = 'resolved';
      task.resolvedAt = new Date().toISOString();
      task.resolvedBy = context.performedBy;

      this.actionLog.logLifecycleChange(
        taskId,
        oldStatus,
        'resolved',
        this.tenantId,
        context.performedBy,
        context.facilityId
      );

      return { success: true, task };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Dismiss task
   */
  async dismissTask(
    taskId: string,
    reason: string,
    context: ActionPolicyContext
  ): Promise<{ success: boolean; task?: ActionTask; error?: string }> {
    try {
      const task = this.actionLog.getAllTasks().find(t => t.taskId === taskId);
      if (!task) {
        return { success: false, error: 'Task not found' };
      }

      const decision = this.policyEngine.authorizeLifecycleChange(task, 'dismiss', context);
      if (!decision.authorized) {
        return { success: false, error: decision.reason };
      }

      const oldStatus = task.status;
      task.status = 'dismissed';
      task.dismissedAt = new Date().toISOString();
      task.dismissedBy = context.performedBy;
      task.dismissalReason = reason;

      this.actionLog.logLifecycleChange(
        taskId,
        oldStatus,
        'dismissed',
        this.tenantId,
        context.performedBy,
        context.facilityId,
        reason
      );

      return { success: true, task };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================

  private createErrorResult(query: ActionQuery, error: string): ActionResult {
    return {
      resultId: `result-error-${Date.now()}`,
      query,
      tasks: [],
      totalTasks: 0,
      newTasks: 0,
      summary: {
        byCategory: {} as Record<string, number>,
        bySeverity: {} as Record<ActionSeverity, number>,
        bySource: {} as Record<string, number>,
        byStatus: {} as Record<ActionStatus, number>,
        affectedEntities: [],
      },
      metadata: {
        executedAt: new Date().toISOString(),
      },
      success: false,
      error,
    };
  }

  // ==========================================================================
  // PUBLIC ACCESSORS
  // ==========================================================================

  getRouter(): ActionRouter {
    return this.router;
  }

  getTaskBuilder(): ActionTaskBuilder {
    return this.taskBuilder;
  }

  getPolicyEngine(): ActionPolicyEngine {
    return this.policyEngine;
  }

  getActionLog(): ActionLog {
    return this.actionLog;
  }

  getStatistics(): ActionStatistics {
    return this.actionLog.getStatistics();
  }

  getPolicyStatistics() {
    return this.policyEngine.getPolicyStatistics();
  }
}
