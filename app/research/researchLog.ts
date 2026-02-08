// Phase 26: Research Log
// Stores experiment proposals, comparisons, insights, and research reports

import { ResearchLogEntry, ResearchLogCategory } from './researchTypes';

class ResearchLog {
  private entries: ResearchLogEntry[] = [];
  private readonly MAX_ENTRIES = 5000;

  add(entry: ResearchLogEntry): void {
    this.entries.push(entry);
    if (this.entries.length > this.MAX_ENTRIES) {
      this.entries = this.entries.slice(-this.MAX_ENTRIES);
    }
  }

  list(category?: ResearchLogCategory): ResearchLogEntry[] {
    if (!category) return [...this.entries];
    return this.entries.filter((e) => e.category === category);
  }

  getRecent(count: number = 20): ResearchLogEntry[] {
    return this.entries.slice(-count);
  }

  getForExperiment(experimentId: string): ResearchLogEntry[] {
    return this.entries.filter((e) => e.context.experimentId === experimentId);
  }

  getForFacility(facilityId: string): ResearchLogEntry[] {
    return this.entries.filter((e) => e.context.facilityId === facilityId);
  }

  export(): ResearchLogEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
  }
}

export const researchLog = new ResearchLog();
