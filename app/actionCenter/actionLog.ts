/**
 * ACTION LOG
 * Phase 53: Operator Action Center
 * 
 * Complete audit trail for all action center operations.
 * Stores tasks, groups, routing events, policy decisions, lifecycle changes.
 * Supports filtering, statistics, and export.
 */

import {
  ActionTask,
  ActionQuery,
  ActionGroup,
  ActionLogEntry,
  ActionLogEntryType,
  TaskLogEntry,
  QueryLogEntry,
  GroupLogEntry,
  RoutingLogEntry,
  LifecycleChangeLogEntry,
  ErrorLogEntry,
  ActionStatistics,
  ActionSeverity,
  ActionStatus,
  ActionSource,
} from './actionTypes';

// ============================================================================
// ACTION LOG
// ============================================================================

export class ActionLog {
  private log: ActionLogEntry[] = [];

  // ==========================================================================
  // LOGGING METHODS
  // ==========================================================================

  /**
   * Log a task
   */
  logTask(
    task: ActionTask,
    performedBy: string,
    success: boolean = true,
    error?: string
  ): void {
    const entry: TaskLogEntry = {
      entryId: `log-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'task',
      timestamp: new Date().toISOString(),
      tenantId: task.scope.tenantId,
      facilityId: task.scope.facilityId,
      performedBy,
      success,
      error,
      task,
    };

    this.log.push(entry);
  }

  /**
   * Log a query
   */
  logQuery(
    query: ActionQuery,
    resultCount: number,
    success: boolean = true,
    error?: string
  ): void {
    const entry: QueryLogEntry = {
      entryId: `log-query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'query',
      timestamp: new Date().toISOString(),
      tenantId: query.scope.tenantId,
      facilityId: query.scope.facilityId,
      performedBy: query.triggeredBy,
      success,
      error,
      query,
      resultCount,
    };

    this.log.push(entry);
  }

  /**
   * Log a group
   */
  logGroup(
    group: ActionGroup,
    tenantId: string,
    performedBy: string,
    facilityId?: string,
    success: boolean = true,
    error?: string
  ): void {
    const entry: GroupLogEntry = {
      entryId: `log-group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'group',
      timestamp: new Date().toISOString(),
      tenantId,
      facilityId,
      performedBy,
      success,
      error,
      group,
    };

    this.log.push(entry);
  }

  /**
   * Log routing event
   */
  logRouting(
    sourceEngine: ActionSource,
    tasksRouted: number,
    tasksFiltered: number,
    tenantId: string,
    performedBy: string,
    facilityId?: string,
    success: boolean = true,
    error?: string
  ): void {
    const entry: RoutingLogEntry = {
      entryId: `log-routing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'routing',
      timestamp: new Date().toISOString(),
      tenantId,
      facilityId,
      performedBy,
      success,
      error,
      sourceEngine,
      tasksRouted,
      tasksFiltered,
    };

    this.log.push(entry);
  }

  /**
   * Log lifecycle change
   */
  logLifecycleChange(
    taskId: string,
    oldStatus: ActionStatus,
    newStatus: ActionStatus,
    tenantId: string,
    performedBy: string,
    facilityId?: string,
    reason?: string,
    success: boolean = true,
    error?: string
  ): void {
    const entry: LifecycleChangeLogEntry = {
      entryId: `log-lifecycle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'lifecycle-change',
      timestamp: new Date().toISOString(),
      tenantId,
      facilityId,
      performedBy,
      success,
      error,
      taskId,
      oldStatus,
      newStatus,
      reason,
    };

    this.log.push(entry);
  }

  /**
   * Log error
   */
  logError(
    errorType: string,
    errorMessage: string,
    tenantId: string,
    performedBy: string,
    facilityId?: string,
    stackTrace?: string
  ): void {
    const entry: ErrorLogEntry = {
      entryId: `log-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'error',
      timestamp: new Date().toISOString(),
      tenantId,
      facilityId,
      performedBy,
      success: false,
      errorType,
      errorMessage,
      stackTrace,
    };

    this.log.push(entry);
  }

  // ==========================================================================
  // QUERY METHODS
  // ==========================================================================

  /**
   * Get all log entries
   */
  getAllEntries(): ActionLogEntry[] {
    return [...this.log];
  }

  /**
   * Get entries by type
   */
  getEntriesByType(type: ActionLogEntryType): ActionLogEntry[] {
    return this.log.filter(e => e.entryType === type);
  }

  /**
   * Get entries in date range
   */
  getEntriesInRange(startDate: string, endDate: string): ActionLogEntry[] {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return this.log.filter(e => {
      const timestamp = new Date(e.timestamp).getTime();
      return timestamp >= start && timestamp <= end;
    });
  }

  /**
   * Get entries by performer
   */
  getEntriesByPerformer(performedBy: string): ActionLogEntry[] {
    return this.log.filter(e => e.performedBy === performedBy);
  }

  /**
   * Get entries by tenant
   */
  getEntriesByTenant(tenantId: string): ActionLogEntry[] {
    return this.log.filter(e => e.tenantId === tenantId);
  }

  /**
   * Get recent entries
   */
  getRecentEntries(count: number = 100): ActionLogEntry[] {
    return this.log.slice(-count);
  }

  // ==========================================================================
  // TASK QUERIES
  // ==========================================================================

  /**
   * Get all tasks from log
   */
  getAllTasks(): ActionTask[] {
    return this.log
      .filter(e => e.entryType === 'task')
      .map(e => (e as TaskLogEntry).task);
  }

  /**
   * Get tasks by category
   */
  getTasksByCategory(category: string): ActionTask[] {
    return this.getAllTasks().filter(t => t.category === category);
  }

  /**
   * Get tasks by severity
   */
  getTasksBySeverity(severity: ActionSeverity): ActionTask[] {
    return this.getAllTasks().filter(t => t.severity === severity);
  }

  /**
   * Get tasks by source
   */
  getTasksBySource(source: ActionSource): ActionTask[] {
    return this.getAllTasks().filter(t => t.source === source);
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: ActionStatus): ActionTask[] {
    return this.getAllTasks().filter(t => t.status === status);
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get comprehensive statistics
   */
  getStatistics(): ActionStatistics {
    const tasks = this.getAllTasks();

    const stats: ActionStatistics = {
      totalTasks: tasks.length,
      newTasks: 0,
      acknowledgedTasks: 0,
      assignedTasks: 0,
      inProgressTasks: 0,
      resolvedTasks: 0,
      dismissedTasks: 0,
      byCategory: {},
      bySeverity: {} as Record<ActionSeverity, number>,
      bySource: {} as Record<string, number>,
      byStatus: {} as Record<ActionStatus, number>,
      trends: {
        tasksCreatedToday: 0,
        tasksResolvedToday: 0,
        tasksCreatedThisWeek: 0,
        tasksResolvedThisWeek: 0,
        averageResolutionTimeHours: 0,
      },
      mostCommonCategory: '',
      mostCommonSeverity: 'info',
      mostCommonSource: '',
    };

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;
    const resolutionTimes: number[] = [];

    for (const task of tasks) {
      // Count by status
      if (task.status === 'new') stats.newTasks++;
      if (task.status === 'acknowledged') stats.acknowledgedTasks++;
      if (task.status === 'assigned') stats.assignedTasks++;
      if (task.status === 'in-progress') stats.inProgressTasks++;
      if (task.status === 'resolved') stats.resolvedTasks++;
      if (task.status === 'dismissed') stats.dismissedTasks++;

      // Count by category
      stats.byCategory[task.category] = (stats.byCategory[task.category] || 0) + 1;

      // Count by severity
      stats.bySeverity[task.severity] = (stats.bySeverity[task.severity] || 0) + 1;

      // Count by source
      stats.bySource[task.source] = (stats.bySource[task.source] || 0) + 1;

      // Count by status
      stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1;

      // Trends
      const createdTime = new Date(task.createdAt).getTime();
      if (now - createdTime <= oneDayMs) {
        stats.trends.tasksCreatedToday++;
      }
      if (now - createdTime <= oneWeekMs) {
        stats.trends.tasksCreatedThisWeek++;
      }

      if (task.resolvedAt) {
        const resolvedTime = new Date(task.resolvedAt).getTime();
        if (now - resolvedTime <= oneDayMs) {
          stats.trends.tasksResolvedToday++;
        }
        if (now - resolvedTime <= oneWeekMs) {
          stats.trends.tasksResolvedThisWeek++;
        }

        // Calculate resolution time
        const resolutionTimeMs = resolvedTime - createdTime;
        resolutionTimes.push(resolutionTimeMs / (1000 * 60 * 60)); // Convert to hours
      }
    }

    // Average resolution time
    if (resolutionTimes.length > 0) {
      stats.trends.averageResolutionTimeHours =
        resolutionTimes.reduce((sum, t) => sum + t, 0) / resolutionTimes.length;
    }

    // Most common values
    stats.mostCommonCategory = this.findMostCommon(stats.byCategory);
    stats.mostCommonSeverity = this.findMostCommon(stats.bySeverity) as ActionSeverity;
    stats.mostCommonSource = this.findMostCommon(stats.bySource);

    return stats;
  }

  private findMostCommon(distribution: Record<string, number>): string {
    let maxKey = '';
    let maxCount = 0;

    for (const [key, count] of Object.entries(distribution)) {
      const countNum = count as number;
      if (countNum > maxCount) {
        maxCount = countNum;
        maxKey = key;
      }
    }

    return maxKey;
  }

  // ==========================================================================
  // EXPORT
  // ==========================================================================

  /**
   * Export log with filters
   */
  exportLog(options?: {
    startDate?: string;
    endDate?: string;
    entryTypes?: ActionLogEntryType[];
    performedBy?: string;
    tenantId?: string;
    successOnly?: boolean;
    failureOnly?: boolean;
  }): {
    entries: ActionLogEntry[];
    exportedAt: string;
    filters: typeof options;
  } {
    let entries = [...this.log];

    // Apply filters
    if (options?.startDate && options?.endDate) {
      entries = this.getEntriesInRange(options.startDate, options.endDate);
    }

    if (options?.entryTypes) {
      entries = entries.filter(e => options.entryTypes!.includes(e.entryType));
    }

    if (options?.performedBy) {
      entries = entries.filter(e => e.performedBy === options.performedBy);
    }

    if (options?.tenantId) {
      entries = entries.filter(e => e.tenantId === options.tenantId);
    }

    if (options?.successOnly) {
      entries = entries.filter(e => e.success);
    }

    if (options?.failureOnly) {
      entries = entries.filter(e => !e.success);
    }

    return {
      entries,
      exportedAt: new Date().toISOString(),
      filters: options,
    };
  }

  // ==========================================================================
  // MAINTENANCE
  // ==========================================================================

  /**
   * Clear old entries (older than specified days)
   */
  clearOldEntries(daysToKeep: number = 90): number {
    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    const originalLength = this.log.length;

    this.log = this.log.filter(e => {
      return new Date(e.timestamp).getTime() >= cutoffTime;
    });

    return originalLength - this.log.length;
  }

  /**
   * Clear all entries
   */
  clearAll(): void {
    this.log = [];
  }

  /**
   * Get log size
   */
  getLogSize(): number {
    return this.log.length;
  }
}
