'use client';

import { RefinementLogEntry } from './refinementTypes';

class RefinementLog {
  private logs: RefinementLogEntry[] = [];

  add(entry: Omit<RefinementLogEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) {
    const full: RefinementLogEntry = {
      id: entry.id ?? `ref-log-${Date.now()}`,
      timestamp: entry.timestamp ?? Date.now(),
      category: entry.category,
      message: entry.message,
      context: entry.context,
    };
    this.logs.push(full);
    if (this.logs.length > 5000) this.logs.shift();
  }

  list(limit = 200): RefinementLogEntry[] {
    return this.logs.slice(-limit).reverse();
  }

  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const refinementLog = new RefinementLog();
