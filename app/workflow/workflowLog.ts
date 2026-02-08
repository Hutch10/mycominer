// Phase 19: Workflow Log
// Stores workflow proposals, schedules, audits, approvals with full version history

'use client';

import { WorkflowLogEntry, WorkflowLogCategory } from '@/app/workflow/workflowTypes';

// ============================================================================
// WORKFLOW LOG
// ============================================================================

class WorkflowLog {
  private entries: WorkflowLogEntry[] = [];
  private readonly MAX_ENTRIES = 5000;

  /**
   * Add entry to log
   */
  add(entry: WorkflowLogEntry): void {
    this.entries.push(entry);
    if (this.entries.length > this.MAX_ENTRIES) {
      this.entries = this.entries.slice(-this.MAX_ENTRIES);
    }
  }

  /**
   * List all entries with optional category filter
   */
  list(category?: WorkflowLogCategory): WorkflowLogEntry[] {
    if (!category) {
      return [...this.entries];
    }
    return this.entries.filter(e => e.category === category);
  }

  /**
   * Get entry by ID
   */
  get(entryId: string): WorkflowLogEntry | undefined {
    return this.entries.find(e => e.entryId === entryId);
  }

  /**
   * Get entries for a specific plan
   */
  getForPlan(planId: string): WorkflowLogEntry[] {
    return this.entries.filter(e => e.context.planId === planId);
  }

  /**
   * Get entries by status
   */
  getByStatus(status: 'success' | 'failure' | 'warning'): WorkflowLogEntry[] {
    return this.entries.filter(e => e.status === status);
  }

  /**
   * Get recent entries
   */
  getRecent(count: number = 20): WorkflowLogEntry[] {
    return this.entries.slice(-count);
  }

  /**
   * Export log as JSON
   */
  export(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        totalEntries: this.entries.length,
        entries: this.entries,
      },
      null,
      2
    );
  }

  /**
   * Clear log (admin only)
   */
  clear(): void {
    this.entries = [];
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const categories = new Map<WorkflowLogCategory, number>();
    const statuses = new Map<string, number>();

    for (const entry of this.entries) {
      categories.set(entry.category, (categories.get(entry.category) || 0) + 1);
      statuses.set(entry.status, (statuses.get(entry.status) || 0) + 1);
    }

    return {
      totalEntries: this.entries.length,
      byCategory: Object.fromEntries(categories),
      byStatus: Object.fromEntries(statuses),
      oldestEntry: this.entries[0]?.timestamp,
      newestEntry: this.entries[this.entries.length - 1]?.timestamp,
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const workflowLog = new WorkflowLog();
