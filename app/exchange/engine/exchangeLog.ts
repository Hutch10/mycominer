'use client';

import { ExchangeLogEntry } from './exchangeTypes';

class ExchangeLog {
  private logs: ExchangeLogEntry[] = [];

  add(entry: Omit<ExchangeLogEntry, 'id'> & { id?: string }) {
    const full: ExchangeLogEntry = {
      id: entry.id ?? `log-${Date.now()}`,
      timestamp: entry.timestamp ?? Date.now(),
      category: entry.category,
      message: entry.message,
      context: entry.context,
    };
    this.logs.push(full);
    if (this.logs.length > 5000) this.logs.shift();
  }

  list(limit = 200): ExchangeLogEntry[] {
    return this.logs.slice(-limit).reverse();
  }

  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const exchangeLog = new ExchangeLog();
