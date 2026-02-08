'use client';

import { SimulationLogEntry } from '@/app/simulation/engine/simulationTypes';

class SimulationLog {
  private logs: SimulationLogEntry[] = [];

  add(entry: Omit<SimulationLogEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) {
    const full: SimulationLogEntry = {
      id: entry.id ?? `sim-log-${Date.now()}`,
      timestamp: entry.timestamp ?? Date.now(),
      category: entry.category,
      message: entry.message,
      context: entry.context,
    };
    this.logs.push(full);
    if (this.logs.length > 5000) this.logs.shift();
  }

  list(limit = 200): SimulationLogEntry[] {
    return this.logs.slice(-limit).reverse();
  }

  filterByCategory(category: SimulationLogEntry['category'], limit = 100): SimulationLogEntry[] {
    return this.logs.filter((log) => log.category === category).slice(-limit).reverse();
  }

  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  clear() {
    this.logs = [];
  }
}

export const simulationLog = new SimulationLog();
