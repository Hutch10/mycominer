/**
 * Phase 44: System Governance - Governance Log
 * 
 * Complete audit trail for all governance operations.
 * Logs permission checks, role changes, policy pack assignments, and decisions.
 */

import {
  GovernanceLogEntry,
  GovernanceDecision,
  GovernanceAction,
  GovernanceSubject,
  GovernanceResource
} from './governanceTypes';

// ============================================================================
// GOVERNANCE LOG CLASS
// ============================================================================

export class GovernanceLog {
  private log: GovernanceLogEntry[] = [];
  private maxEntries: number = 100000;

  /**
   * Log a governance decision
   */
  logDecision(decision: GovernanceDecision): void {
    const entry: GovernanceLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      subjectId: decision.subjectId,
      action: decision.action,
      resourceName: decision.resourceName,
      allowed: decision.allowed,
      matchedRoles: decision.matchedRoles,
      rationale: decision.rationale,
      references: decision.references
    };

    this.log.push(entry);
    this.enforceMaxEntries();
  }

  /**
   * Log a permission check
   */
  logPermissionCheck(
    subjectId: string,
    action: GovernanceAction,
    resourceName: string,
    allowed: boolean,
    reason: string
  ): void {
    const entry: GovernanceLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      subjectId,
      action,
      resourceName,
      allowed,
      rationale: reason
    };

    this.log.push(entry);
    this.enforceMaxEntries();
  }

  /**
   * Log a role change
   */
  logRoleChange(
    subjectId: string,
    changeType: 'assigned' | 'removed',
    roleId: string,
    reason: string
  ): void {
    const entry: GovernanceLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      subjectId,
      action: 'tenant:manage-roles',
      resourceName: `role:${roleId}`,
      allowed: true,
      rationale: `Role ${changeType}: ${reason}`
    };

    this.log.push(entry);
    this.enforceMaxEntries();
  }

  /**
   * Log a policy pack assignment
   */
  logPolicyPackAssignment(
    subjectId: string,
    policyPackId: string,
    assigned: boolean,
    reason: string
  ): void {
    const entry: GovernanceLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      subjectId,
      action: 'governance:manage-policy-packs',
      resourceName: `policy-pack:${policyPackId}`,
      allowed: true,
      rationale: assigned ? `Policy pack assigned: ${reason}` : `Policy pack removed: ${reason}`
    };

    this.log.push(entry);
    this.enforceMaxEntries();
  }

  /**
   * Get all log entries
   */
  getAllEntries(): GovernanceLogEntry[] {
    return [...this.log];
  }

  /**
   * Get recent log entries
   */
  getRecentEntries(count: number): GovernanceLogEntry[] {
    return this.log.slice(-count);
  }

  /**
   * Get entries by subject
   */
  getEntriesBySubject(subjectId: string): GovernanceLogEntry[] {
    return this.log.filter(e => e.subjectId === subjectId);
  }

  /**
   * Get entries by action
   */
  getEntriesByAction(action: GovernanceAction): GovernanceLogEntry[] {
    return this.log.filter(e => e.action === action);
  }

  /**
   * Get entries by resource
   */
  getEntriesByResource(resourceName: string): GovernanceLogEntry[] {
    return this.log.filter(e => e.resourceName === resourceName);
  }

  /**
   * Get denied entries
   */
  getDeniedEntries(): GovernanceLogEntry[] {
    return this.log.filter(e => !e.allowed);
  }

  /**
   * Get entries in time range
   */
  getEntriesInRange(startTime: Date, endTime: Date): GovernanceLogEntry[] {
    const startStr = startTime.toISOString();
    const endStr = endTime.toISOString();
    return this.log.filter(e => e.timestamp >= startStr && e.timestamp <= endStr);
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalEntries: number;
    totalAllowed: number;
    totalDenied: number;
    allowRate: number;
    denyRate: number;
    topSubjects: { subjectId: string; count: number }[];
    topActions: { action: GovernanceAction; count: number }[];
    topDeniedActions: { action: GovernanceAction; count: number }[];
  } {
    const totalEntries = this.log.length;
    const totalAllowed = this.log.filter(e => e.allowed).length;
    const totalDenied = this.log.filter(e => !e.allowed).length;

    // Count by subject
    const subjectCounts: Record<string, number> = {};
    for (const entry of this.log) {
      subjectCounts[entry.subjectId] = (subjectCounts[entry.subjectId] || 0) + 1;
    }
    const topSubjects = Object.entries(subjectCounts)
      .map(([subjectId, count]) => ({ subjectId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Count by action
    const actionCounts: Partial<Record<GovernanceAction, number>> = {};\n    for (const entry of this.log) {
      const action = entry.action as GovernanceAction;
      if (action) {
        actionCounts[action] = (actionCounts[action] || 0) + 1;
      }
    }
    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action: action as GovernanceAction, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Count denied by action
    const deniedActionCounts: Partial<Record<GovernanceAction, number>> = {};
    for (const entry of this.log.filter(e => !e.allowed)) {
      const action = entry.action as GovernanceAction;
      if (action) {
        deniedActionCounts[action] = (deniedActionCounts[action] || 0) + 1;
      }
    }
    const topDeniedActions = Object.entries(deniedActionCounts)
      .map(([action, count]) => ({ action: action as GovernanceAction, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEntries,
      totalAllowed,
      totalDenied,
      allowRate: totalEntries > 0 ? totalAllowed / totalEntries : 0,
      denyRate: totalEntries > 0 ? totalDenied / totalEntries : 0,
      topSubjects,
      topActions,
      topDeniedActions
    };
  }

  /**
   * Export log to JSON
   */
  exportToJSON(): string {
    return JSON.stringify(this.log, null, 2);
  }

  /**
   * Import log from JSON
   */
  importFromJSON(json: string): void {
    const imported = JSON.parse(json) as GovernanceLogEntry[];
    this.log = imported;
    this.enforceMaxEntries();
  }

  /**
   * Clear log
   */
  clear(): void {
    this.log = [];
  }

  /**
   * Clear old entries
   */
  clearOldEntries(olderThan: Date): void {
    const cutoff = olderThan.toISOString();
    this.log = this.log.filter(e => e.timestamp >= cutoff);
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  private enforceMaxEntries(): void {
    if (this.log.length > this.maxEntries) {
      this.log = this.log.slice(-this.maxEntries);
    }
  }
}

// ============================================================================
// GOVERNANCE LOG UTILITIES
// ============================================================================

/**
 * Format log entry for display
 */
export function formatLogEntry(entry: GovernanceLogEntry): string {
  const timestamp = new Date(entry.timestamp).toLocaleString();
  const status = entry.allowed ? '✓ ALLOWED' : '✗ DENIED';
  return `[${timestamp}] ${status} - ${entry.subjectId} → ${entry.action} on ${entry.resourceName}`;
}

/**
 * Group entries by day
 */
export function groupEntriesByDay(entries: GovernanceLogEntry[]): Record<string, GovernanceLogEntry[]> {
  const grouped: Record<string, GovernanceLogEntry[]> = {};

  for (const entry of entries) {
    const day = entry.timestamp.split('T')[0];
    if (!grouped[day]) {
      grouped[day] = [];
    }
    grouped[day].push(entry);
  }

  return grouped;
}

/**
 * Calculate trend
 */
export function calculateTrend(entries: GovernanceLogEntry[], metric: 'allow' | 'deny'): {
  daily: { date: string; count: number }[];
  trend: 'increasing' | 'decreasing' | 'stable';
} {
  const byDay = groupEntriesByDay(entries);
  const daily = Object.entries(byDay).map(([date, dayEntries]) => ({
    date,
    count: dayEntries.filter(e => metric === 'allow' ? e.allowed : !e.allowed).length
  })).sort((a, b) => a.date.localeCompare(b.date));

  // Calculate trend
  if (daily.length < 2) {
    return { daily, trend: 'stable' };
  }

  const recent = daily.slice(-7);
  const older = daily.slice(-14, -7);

  if (older.length === 0) {
    return { daily, trend: 'stable' };
  }

  const recentAvg = recent.reduce((sum, d) => sum + d.count, 0) / recent.length;
  const olderAvg = older.reduce((sum, d) => sum + d.count, 0) / older.length;

  const trend = recentAvg > olderAvg * 1.1 ? 'increasing' 
    : recentAvg < olderAvg * 0.9 ? 'decreasing' 
    : 'stable';

  return { daily, trend };
}
