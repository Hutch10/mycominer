/**
 * ACTION TASK BUILDER
 * Phase 53: Operator Action Center
 * 
 * Groups and organizes tasks by category, severity, entity, and source.
 * Provides deterministic task aggregation without generative AI.
 */

import {
  ActionTask,
  ActionGroup,
  ActionGroupType,
  ActionSeverity,
  ActionStatus,
  ActionReference,
} from './actionTypes';

// ============================================================================
// ACTION TASK BUILDER
// ============================================================================

export class ActionTaskBuilder {
  // ==========================================================================
  // GROUPING STRATEGIES
  // ==========================================================================

  /**
   * Group tasks by category
   */
  groupByCategory(tasks: ActionTask[]): ActionGroup[] {
    const grouped = new Map<string, ActionTask[]>();

    for (const task of tasks) {
      const key = task.category;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(task);
    }

    return Array.from(grouped.entries()).map(([key, tasks]) =>
      this.createGroup('category', key, tasks)
    );
  }

  /**
   * Group tasks by severity
   */
  groupBySeverity(tasks: ActionTask[]): ActionGroup[] {
    const grouped = new Map<ActionSeverity, ActionTask[]>();

    for (const task of tasks) {
      const key = task.severity;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(task);
    }

    return Array.from(grouped.entries()).map(([key, tasks]) =>
      this.createGroup('severity', key, tasks)
    );
  }

  /**
   * Group tasks by affected entity
   */
  groupByEntity(tasks: ActionTask[]): ActionGroup[] {
    const grouped = new Map<string, ActionTask[]>();

    for (const task of tasks) {
      for (const entity of task.affectedEntities) {
        const key = `${entity.entityType}:${entity.entityId}`;
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(task);
      }
    }

    return Array.from(grouped.entries()).map(([key, tasks]) =>
      this.createGroup('entity', key, tasks)
    );
  }

  /**
   * Group tasks by source engine
   */
  groupBySource(tasks: ActionTask[]): ActionGroup[] {
    const grouped = new Map<string, ActionTask[]>();

    for (const task of tasks) {
      const key = task.source;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(task);
    }

    return Array.from(grouped.entries()).map(([key, tasks]) =>
      this.createGroup('source', key, tasks)
    );
  }

  /**
   * Group tasks by status
   */
  groupByStatus(tasks: ActionTask[]): ActionGroup[] {
    const grouped = new Map<ActionStatus, ActionTask[]>();

    for (const task of tasks) {
      const key = task.status;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(task);
    }

    return Array.from(grouped.entries()).map(([key, tasks]) =>
      this.createGroup('status', key, tasks)
    );
  }

  // ==========================================================================
  // GROUP CREATION
  // ==========================================================================

  private createGroup(
    groupType: ActionGroupType,
    groupKey: string,
    tasks: ActionTask[]
  ): ActionGroup {
    // Sort tasks by severity and creation date
    const sortedTasks = this.sortTasks(tasks);

    // Collect all references
    const references = this.mergeReferences(sortedTasks);

    // Calculate summary
    const summary = this.calculateSummary(sortedTasks);

    return {
      groupId: `group-${groupType}-${groupKey}`,
      groupType,
      groupKey,
      tasks: sortedTasks,
      summary,
      references,
      metadata: {
        createdAt: new Date().toISOString(),
      },
    };
  }

  // ==========================================================================
  // DUPLICATE MERGING
  // ==========================================================================

  /**
   * Merge duplicate tasks (same title + category + entities)
   * Preserves ALL references from all duplicates
   */
  mergeDuplicates(tasks: ActionTask[]): ActionTask[] {
    const uniqueMap = new Map<string, ActionTask>();

    for (const task of tasks) {
      const key = this.getTaskKey(task);

      if (uniqueMap.has(key)) {
        // Merge references into existing task
        const existing = uniqueMap.get(key)!;
        existing.relatedReferences.push(...task.relatedReferences);
      } else {
        // Add new task
        uniqueMap.set(key, { ...task });
      }
    }

    return Array.from(uniqueMap.values());
  }

  private getTaskKey(task: ActionTask): string {
    const entities = task.affectedEntities
      .map(e => `${e.entityType}:${e.entityId}`)
      .sort()
      .join(',');
    return `${task.title}|${task.category}|${entities}`;
  }

  // ==========================================================================
  // SORTING
  // ==========================================================================

  /**
   * Sort tasks by severity (critical first), then by creation date (newest first)
   */
  sortTasks(tasks: ActionTask[]): ActionTask[] {
    return [...tasks].sort((a, b) => {
      // Sort by severity first
      const severityCompare = this.compareSeverity(a.severity, b.severity);
      if (severityCompare !== 0) return severityCompare;

      // Then by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  private compareSeverity(a: ActionSeverity, b: ActionSeverity): number {
    const order: Record<ActionSeverity, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
      info: 4,
    };
    return order[a] - order[b];
  }

  // ==========================================================================
  // SUMMARY CALCULATION
  // ==========================================================================

  private calculateSummary(tasks: ActionTask[]) {
    const summary = {
      totalTasks: tasks.length,
      newTasks: 0,
      acknowledgedTasks: 0,
      assignedTasks: 0,
      inProgressTasks: 0,
      resolvedTasks: 0,
      dismissedTasks: 0,
      bySeverity: {} as Record<ActionSeverity, number>,
      byCategory: {} as Record<string, number>,
    };

    for (const task of tasks) {
      // Count by status
      if (task.status === 'new') summary.newTasks++;
      if (task.status === 'acknowledged') summary.acknowledgedTasks++;
      if (task.status === 'assigned') summary.assignedTasks++;
      if (task.status === 'in-progress') summary.inProgressTasks++;
      if (task.status === 'resolved') summary.resolvedTasks++;
      if (task.status === 'dismissed') summary.dismissedTasks++;

      // Count by severity
      summary.bySeverity[task.severity] = (summary.bySeverity[task.severity] || 0) + 1;

      // Count by category
      summary.byCategory[task.category] = (summary.byCategory[task.category] || 0) + 1;
    }

    return summary;
  }

  // ==========================================================================
  // REFERENCE MERGING
  // ==========================================================================

  private mergeReferences(tasks: ActionTask[]): ActionReference[] {
    const uniqueRefs = new Map<string, ActionReference>();

    for (const task of tasks) {
      for (const ref of task.relatedReferences) {
        const key = ref.referenceId;
        if (!uniqueRefs.has(key)) {
          uniqueRefs.set(key, ref);
        }
      }
    }

    return Array.from(uniqueRefs.values());
  }

  // ==========================================================================
  // PRIORITY CALCULATION
  // ==========================================================================

  /**
   * Calculate priority score for task ordering
   * Higher score = higher priority
   */
  calculatePriority(task: ActionTask): number {
    let score = 0;

    // Severity contribution
    const severityScores: Record<ActionSeverity, number> = {
      critical: 100,
      high: 75,
      medium: 50,
      low: 25,
      info: 10,
    };
    score += severityScores[task.severity];

    // Age contribution (older tasks get higher priority)
    const ageHours = (Date.now() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60);
    score += Math.min(ageHours, 100); // Cap at 100 points for age

    // Category contribution
    const categoryPriority: Record<string, number> = {
      'audit-remediation': 20,
      'compliance-pack-issue': 20,
      'integrity-drift-remediation': 15,
      'governance-lineage-issue': 15,
      'alert-remediation': 10,
      'fabric-link-breakage': 5,
      'documentation-completeness': 5,
      'simulation-mismatch': 5,
    };
    score += categoryPriority[task.category] || 0;

    // Status penalty (deprioritize resolved/dismissed)
    if (task.status === 'resolved') score -= 500;
    if (task.status === 'dismissed') score -= 500;
    if (task.status === 'in-progress') score += 10;

    return score;
  }

  /**
   * Sort tasks by priority score
   */
  sortByPriority(tasks: ActionTask[]): ActionTask[] {
    return [...tasks].sort((a, b) => {
      const aPriority = this.calculatePriority(a);
      const bPriority = this.calculatePriority(b);
      return bPriority - aPriority; // Higher priority first
    });
  }

  // ==========================================================================
  // FILTERING
  // ==========================================================================

  /**
   * Filter tasks by assigned operator
   */
  filterByAssignee(tasks: ActionTask[], assignedTo: string): ActionTask[] {
    return tasks.filter(t => t.assignedTo === assignedTo);
  }

  /**
   * Filter tasks by facility
   */
  filterByFacility(tasks: ActionTask[], facilityId: string): ActionTask[] {
    return tasks.filter(t => t.scope.facilityId === facilityId);
  }

  /**
   * Filter tasks by room
   */
  filterByRoom(tasks: ActionTask[], roomId: string): ActionTask[] {
    return tasks.filter(t => t.scope.roomId === roomId);
  }

  /**
   * Filter tasks by date range
   */
  filterByDateRange(tasks: ActionTask[], startDate: string, endDate: string): ActionTask[] {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return tasks.filter(t => {
      const created = new Date(t.createdAt).getTime();
      return created >= start && created <= end;
    });
  }

  /**
   * Filter tasks requiring specific permissions
   */
  filterByPermissions(tasks: ActionTask[], userPermissions: string[]): ActionTask[] {
    return tasks.filter(t => {
      if (!t.remediation) return true;
      return t.remediation.requiredPermissions.every(p => userPermissions.includes(p));
    });
  }
}
