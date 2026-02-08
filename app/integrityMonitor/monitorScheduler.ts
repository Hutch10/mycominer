/**
 * Phase 51: Continuous Integrity Monitor - Scheduler
 * 
 * Manages monitoring cycles at hourly, daily, and weekly intervals.
 */

import type {
  MonitorSchedule,
  MonitorFrequency,
  MonitorScope,
  MonitorCategory,
} from './monitorTypes';

// ============================================================================
// MONITOR SCHEDULER
// ============================================================================

export class MonitorScheduler {
  private tenantId: string;
  private schedules: Map<string, MonitorSchedule> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  // ==========================================================================
  // SCHEDULE MANAGEMENT
  // ==========================================================================

  /**
   * Create monitoring schedule
   */
  public createSchedule(
    frequency: MonitorFrequency,
    scope: MonitorScope,
    categories?: MonitorCategory[],
    createdBy: string = 'system'
  ): MonitorSchedule {
    const scheduleId = `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const schedule: MonitorSchedule = {
      scheduleId,
      frequency,
      categories,
      scope,
      enabled: true,
      nextRun: this.calculateNextRun(frequency),
      createdBy,
      createdAt: new Date().toISOString(),
    };

    this.schedules.set(scheduleId, schedule);
    
    if (frequency !== 'manual') {
      this.startSchedule(schedule);
    }

    return schedule;
  }

  /**
   * Update schedule
   */
  public updateSchedule(scheduleId: string, updates: Partial<MonitorSchedule>): MonitorSchedule | null {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) return null;

    const updated = { ...schedule, ...updates };
    this.schedules.set(scheduleId, updated);

    // Restart timer if frequency changed
    if (updates.frequency && updates.frequency !== schedule.frequency) {
      this.stopSchedule(scheduleId);
      if (updated.enabled && updated.frequency !== 'manual') {
        this.startSchedule(updated);
      }
    }

    return updated;
  }

  /**
   * Delete schedule
   */
  public deleteSchedule(scheduleId: string): boolean {
    this.stopSchedule(scheduleId);
    return this.schedules.delete(scheduleId);
  }

  /**
   * Enable schedule
   */
  public enableSchedule(scheduleId: string): boolean {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) return false;

    schedule.enabled = true;
    if (schedule.frequency !== 'manual') {
      this.startSchedule(schedule);
    }
    
    return true;
  }

  /**
   * Disable schedule
   */
  public disableSchedule(scheduleId: string): boolean {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) return false;

    schedule.enabled = false;
    this.stopSchedule(scheduleId);
    
    return true;
  }

  // ==========================================================================
  // SCHEDULE EXECUTION
  // ==========================================================================

  /**
   * Start schedule timer
   */
  private startSchedule(schedule: MonitorSchedule): void {
    if (this.timers.has(schedule.scheduleId)) {
      return; // Already running
    }

    const intervalMs = this.getIntervalMs(schedule.frequency);
    
    const timer = setInterval(() => {
      this.executeSchedule(schedule.scheduleId);
    }, intervalMs);

    this.timers.set(schedule.scheduleId, timer);
  }

  /**
   * Stop schedule timer
   */
  private stopSchedule(scheduleId: string): void {
    const timer = this.timers.get(scheduleId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(scheduleId);
    }
  }

  /**
   * Execute scheduled monitoring cycle
   */
  private async executeSchedule(scheduleId: string): Promise<void> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule || !schedule.enabled) return;

    try {
      // Update schedule
      schedule.lastRun = new Date().toISOString();
      schedule.nextRun = this.calculateNextRun(schedule.frequency);

      // Trigger monitoring cycle (handled by MonitorEngine)
      console.log(`Executing schedule ${scheduleId} at ${schedule.lastRun}`);
      
      // In production, this would emit an event or call MonitorEngine
      // For now, just log
    } catch (error) {
      console.error(`Error executing schedule ${scheduleId}:`, error);
    }
  }

  /**
   * Run schedule manually
   */
  public async runScheduleNow(scheduleId: string): Promise<void> {
    await this.executeSchedule(scheduleId);
  }

  // ==========================================================================
  // QUERY METHODS
  // ==========================================================================

  /**
   * Get schedule
   */
  public getSchedule(scheduleId: string): MonitorSchedule | null {
    return this.schedules.get(scheduleId) || null;
  }

  /**
   * Get all schedules
   */
  public getAllSchedules(): MonitorSchedule[] {
    return Array.from(this.schedules.values());
  }

  /**
   * Get enabled schedules
   */
  public getEnabledSchedules(): MonitorSchedule[] {
    return this.getAllSchedules().filter(s => s.enabled);
  }

  /**
   * Get schedules by frequency
   */
  public getSchedulesByFrequency(frequency: MonitorFrequency): MonitorSchedule[] {
    return this.getAllSchedules().filter(s => s.frequency === frequency);
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Calculate next run time
   */
  private calculateNextRun(frequency: MonitorFrequency): string {
    const now = new Date();
    let nextRun = new Date(now);

    switch (frequency) {
      case 'hourly':
        nextRun.setHours(now.getHours() + 1);
        nextRun.setMinutes(0);
        nextRun.setSeconds(0);
        break;
      case 'daily':
        nextRun.setDate(now.getDate() + 1);
        nextRun.setHours(0);
        nextRun.setMinutes(0);
        nextRun.setSeconds(0);
        break;
      case 'weekly':
        nextRun.setDate(now.getDate() + 7);
        nextRun.setHours(0);
        nextRun.setMinutes(0);
        nextRun.setSeconds(0);
        break;
      case 'manual':
        return 'manual';
    }

    return nextRun.toISOString();
  }

  /**
   * Get interval in milliseconds
   */
  private getIntervalMs(frequency: MonitorFrequency): number {
    switch (frequency) {
      case 'hourly':
        return 60 * 60 * 1000; // 1 hour
      case 'daily':
        return 24 * 60 * 60 * 1000; // 24 hours
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000; // 7 days
      default:
        return 0;
    }
  }

  /**
   * Cleanup - stop all timers
   */
  public cleanup(): void {
    for (const [scheduleId] of this.timers) {
      this.stopSchedule(scheduleId);
    }
    this.timers.clear();
  }
}
