// Phase 22: Optimization Log
// Unified audit trail for optimization proposals, reports, and decisions

'use client';

import { OptimizationLogEntry, OptimizationLogCategory } from '@/app/optimization/optimizationTypes';

class OptimizationLog {
  private entries: OptimizationLogEntry[] = [];
  private readonly MAX_ENTRIES = 5000;

  add(entry: OptimizationLogEntry): void {
    this.entries.push(entry);
    if (this.entries.length > this.MAX_ENTRIES) {
      this.entries = this.entries.slice(-this.MAX_ENTRIES);
    }
  }

  list(category?: OptimizationLogCategory): OptimizationLogEntry[] {
    if (!category) return [...this.entries];
    return this.entries.filter(e => e.category === category);
  }

  getRecent(count: number = 20): OptimizationLogEntry[] {
    return this.entries.slice(-count);
  }

  getForProposal(proposalId: string): OptimizationLogEntry[] {
    return this.entries.filter(e => e.context.proposalId === proposalId);
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

export const optimizationLog = new OptimizationLog();
