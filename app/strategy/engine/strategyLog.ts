'use client';

import { StrategyLogEntry } from '@/app/strategy/engine/strategyTypes';

class StrategyLog {
  private logs: StrategyLogEntry[] = [];

  add(entry: Omit<StrategyLogEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) {
    const full: StrategyLogEntry = {
      id: entry.id ?? `strat-log-${Date.now()}`,
      timestamp: entry.timestamp ?? Date.now(),
      category: entry.category,
      message: entry.message,
      context: entry.context,
    };
    this.logs.push(full);
    if (this.logs.length > 5000) this.logs.shift();
  }

  list(limit = 200): StrategyLogEntry[] {
    return this.logs.slice(-limit).reverse();
  }

  filterByCategory(category: StrategyLogEntry['category'], limit = 100): StrategyLogEntry[] {
    return this.logs.filter((log) => log.category === category).slice(-limit).reverse();
  }

  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  clear() {
    this.logs = [];
  }
}

export const strategyLog = new StrategyLog();
