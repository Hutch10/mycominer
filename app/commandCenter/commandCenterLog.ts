import { CommandCenterLogEntry, CommandCenterLogCategory } from './commandCenterTypes';

class CommandCenterLog {
  private entries: CommandCenterLogEntry[] = [];
  private maxEntries = 5000;

  add(entry: CommandCenterLogEntry): void {
    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
  }

  list(category?: CommandCenterLogCategory): CommandCenterLogEntry[] {
    if (!category) return [...this.entries];
    return this.entries.filter((e) => e.category === category);
  }

  getRecent(count: number = 20): CommandCenterLogEntry[] {
    return this.entries.slice(-count).reverse();
  }

  getForAlert(alertId: string): CommandCenterLogEntry[] {
    return this.entries.filter((e) => e.context.alertId === alertId);
  }

  getForAction(actionId: string): CommandCenterLogEntry[] {
    return this.entries.filter((e) => e.context.actionId === actionId);
  }

  getForFacility(facilityId: string): CommandCenterLogEntry[] {
    return this.entries.filter((e) => e.context.facilityId === facilityId);
  }

  export(): CommandCenterLogEntry[] {
    return JSON.parse(JSON.stringify(this.entries));
  }

  clear(): void {
    this.entries = [];
  }
}

export const commandCenterLog = new CommandCenterLog();
