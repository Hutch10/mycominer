'use client';

import { HardwareLogEntry } from './hardwareTypes';

class HardwareLogger {
  private key = 'hardware-action-log';
  private logs: HardwareLogEntry[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem(this.key);
        if (stored) this.logs = JSON.parse(stored);
      } catch (e) {
        console.warn('Unable to load hardware logs', e);
      }
    }
  }

  logAction(entry: Omit<HardwareLogEntry, 'id' | 'timestamp'>) {
    const full: HardwareLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      timestamp: Date.now(),
      ...entry,
    };
    this.logs.push(full);
    if (this.logs.length > 2000) this.logs.shift();
    this.persist();
    return full;
  }

  list(limit = 200): HardwareLogEntry[] {
    return this.logs.slice(-limit);
  }

  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  clear() {
    this.logs = [];
    this.persist();
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(this.key, JSON.stringify(this.logs));
    } catch (e) {
      console.warn('Unable to persist hardware logs', e);
    }
  }
}

export const hardwareLogger = new HardwareLogger();
