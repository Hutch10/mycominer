import { MultiFacilityLogEntry, MultiFacilityLogCategory } from './multiFacilityTypes';

class MultiFacilityLog {
  private entries: MultiFacilityLogEntry[] = [];
  private maxEntries = 5000;

  add(entry: MultiFacilityLogEntry): void {
    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
  }

  list(category?: MultiFacilityLogCategory): MultiFacilityLogEntry[] {
    if (!category) return [...this.entries];
    return this.entries.filter((e) => e.category === category);
  }

  getRecent(count: number = 20): MultiFacilityLogEntry[] {
    return this.entries.slice(-count).reverse();
  }

  getForProposal(proposalId: string): MultiFacilityLogEntry[] {
    return this.entries.filter((e) => e.context.proposalId === proposalId);
  }

  getForFacility(facilityId: string): MultiFacilityLogEntry[] {
    return this.entries.filter((e) => e.context.affectedFacilities?.includes(facilityId));
  }

  export(): MultiFacilityLogEntry[] {
    return JSON.parse(JSON.stringify(this.entries));
  }

  clear(): void {
    this.entries = [];
  }
}

export const multiFacilityLog = new MultiFacilityLog();
