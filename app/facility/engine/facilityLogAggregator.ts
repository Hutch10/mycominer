'use client';

import { FacilityLogEntry } from './facilityTypes';

class FacilityLogAggregator {
  private logs: FacilityLogEntry[] = [];

  add(entry: FacilityLogEntry) {
    this.logs.push(entry);
    if (this.logs.length > 5000) this.logs.shift();
  }

  list(filter?: Partial<{ roomId: string; deviceId: string; category: FacilityLogEntry['category']; species: string; stage: string }>, limit = 200): FacilityLogEntry[] {
    let out = [...this.logs];
    if (filter?.roomId) out = out.filter((l) => l.roomId === filter.roomId);
    if (filter?.deviceId) out = out.filter((l) => l.deviceId === filter.deviceId);
    if (filter?.category) out = out.filter((l) => l.category === filter.category);
    return out.slice(-limit).reverse();
  }

  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const facilityLogAggregator = new FacilityLogAggregator();
