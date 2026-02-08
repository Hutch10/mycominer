// Phase 21: Execution Log
// Unified execution audit trail with version history and alerts

'use client';

import { ExecutionLogEntry, ExecutionLogCategory } from '@/app/execution/executionTypes';

class ExecutionLog {
  private entries: ExecutionLogEntry[] = [];
  private readonly MAX_ENTRIES = 5000;

  add(entry: ExecutionLogEntry): void {
    this.entries.push(entry);
    if (this.entries.length > this.MAX_ENTRIES) {
      this.entries = this.entries.slice(-this.MAX_ENTRIES);
    }
  }

  list(category?: ExecutionLogCategory): ExecutionLogEntry[] {
    if (!category) return [...this.entries];
    return this.entries.filter(e => e.category === category);
  }

  getRecent(count: number = 20): ExecutionLogEntry[] {
    return this.entries.slice(-count);
  }

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

  clear(): void {
    this.entries = [];
  }
}

export const executionLog = new ExecutionLog();
