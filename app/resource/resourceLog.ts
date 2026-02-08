// Phase 20: Resource Log
// Full audit trail for resource operations (11 categories, 5000-entry cap)

'use client';

import { ResourceLogEntry } from '@/app/resource/resourceTypes';

// ============================================================================
// RESOURCE LOG
// ============================================================================

class ResourceLog {
  private entries: ResourceLogEntry[] = [];
  private maxEntries = 5000;
  private entryCounter = 0;

  /**
   * Add log entry
   */
  add(category: ResourceLogEntry['category'], message: string, context?: any): void {
    const entry: ResourceLogEntry = {
      entryId: `resource-log-${++this.entryCounter}`,
      timestamp: new Date().toISOString(),
      category,
      message,
      context,
    };

    this.entries.unshift(entry); // Newest first

    // Cap at max entries
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(0, this.maxEntries);
    }
  }

  /**
   * Get all log entries
   */
  list(): ResourceLogEntry[] {
    return [...this.entries];
  }

  /**
   * Get logs for specific allocation plan
   */
  getForAllocationPlan(planId: string): ResourceLogEntry[] {
    return this.entries.filter(
      entry => entry.context?.allocationPlanId === planId
    );
  }

  /**
   * Get logs for specific forecast
   */
  getForForecast(forecastId: string): ResourceLogEntry[] {
    return this.entries.filter(
      entry => entry.context?.forecastId === forecastId
    );
  }

  /**
   * Get logs by category
   */
  getByCategory(category: ResourceLogEntry['category']): ResourceLogEntry[] {
    return this.entries.filter(entry => entry.category === category);
  }

  /**
   * Export logs as JSON
   */
  export(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  /**
   * Clear all logs (use with caution)
   */
  clear(): void {
    this.entries = [];
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const resourceLog = new ResourceLog();
