/**
 * Phase 45: Governance History - Governance History Log
 * 
 * Stores all governance changes, lineage queries, and diff computations
 * with tenant/facility scope. Supports filtering, export, and integration
 * with Compliance and Health engines.
 */

import {
  GovernanceChange,
  GovernanceChangeType,
  GovernanceHistoryLogEntry,
  GovernanceHistoryQuery,
  AuditTrail
} from './governanceHistoryTypes';

// ============================================================================
// GOVERNANCE HISTORY LOG CLASS
// ============================================================================

export class GovernanceHistoryLog {
  private entries: GovernanceHistoryLogEntry[] = [];
  private changes: GovernanceChange[] = [];
  private tenantId: string;
  private facilityId?: string;

  constructor(tenantId: string, facilityId?: string) {
    this.tenantId = tenantId;
    this.facilityId = facilityId;
  }

  /**
   * Log a governance change
   */
  logChange(
    changeType: GovernanceChangeType,
    entityId: string,
    entityType: 'role' | 'permission' | 'policyPack' | 'governance',
    performedBy: string,
    rationale: string,
    before: any,
    after: any,
    diff?: any,
    approvedBy?: string,
    relatedChanges?: string[]
  ): GovernanceChange {
    const change: GovernanceChange = {
      id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      changeType,
      entityId,
      entityType,
      tenantId: this.tenantId,
      facilityId: this.facilityId,
      performedBy,
      approvedBy,
      rationale,
      before,
      after,
      diff,
      relatedChanges: relatedChanges || [],
      metadata: {
        userAgent: 'governance-history-system',
        source: 'governanceHistoryLog'
      }
    };

    this.changes.push(change);
    
    // Also log as an entry
    this.logEntry(
      'change_logged',
      {
        changeId: change.id,
        changeType,
        entityId,
        entityType
      },
      { tenantId: this.tenantId, facilityId: this.facilityId },
      performedBy
    );

    return change;
  }

  /**
   * Log a history entry (query, export, etc.)
   */
  logEntry(
    action: 'query_executed' | 'export_generated' | 'change_logged' | 'lineage_traced' | 'diff_computed',
    details: any,
    scope: { tenantId: string; facilityId?: string },
    performedBy: string
  ): void {
    const entry: GovernanceHistoryLogEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      scope,
      performedBy
    };

    this.entries.push(entry);
  }

  /**
   * Get all changes
   */
  getAllChanges(): GovernanceChange[] {
    return [...this.changes];
  }

  /**
   * Get changes by type
   */
  getChangesByType(changeType: GovernanceChangeType): GovernanceChange[] {
    return this.changes.filter(c => c.changeType === changeType);
  }

  /**
   * Get changes by entity
   */
  getChangesByEntity(entityId: string, entityType?: 'role' | 'permission' | 'policyPack' | 'governance'): GovernanceChange[] {
    return this.changes.filter(c => 
      c.entityId === entityId && (!entityType || c.entityType === entityType)
    );
  }

  /**
   * Get changes in time range
   */
  getChangesInRange(startTime: Date, endTime: Date): GovernanceChange[] {
    const startStr = startTime.toISOString();
    const endStr = endTime.toISOString();
    
    return this.changes.filter(c => c.timestamp >= startStr && c.timestamp <= endStr);
  }

  /**
   * Get changes by performer
   */
  getChangesByPerformer(performedBy: string): GovernanceChange[] {
    return this.changes.filter(c => c.performedBy === performedBy);
  }

  /**
   * Get changes by approver
   */
  getChangesByApprover(approvedBy: string): GovernanceChange[] {
    return this.changes.filter(c => c.approvedBy === approvedBy);
  }

  /**
   * Get changes requiring approval
   */
  getUnapprovedChanges(): GovernanceChange[] {
    return this.changes.filter(c => !c.approvedBy && this.requiresApproval(c.changeType));
  }

  /**
   * Get related changes
   */
  getRelatedChanges(changeId: string): GovernanceChange[] {
    const change = this.changes.find(c => c.id === changeId);
    if (!change) {
      return [];
    }

    const relatedIds = new Set(change.relatedChanges);
    return this.changes.filter(c => relatedIds.has(c.id));
  }

  /**
   * Get all entries
   */
  getAllEntries(): GovernanceHistoryLogEntry[] {
    return [...this.entries];
  }

  /**
   * Get entries by action
   */
  getEntriesByAction(action: GovernanceHistoryLogEntry['action']): GovernanceHistoryLogEntry[] {
    return this.entries.filter(e => e.action === action);
  }

  /**
   * Get entries in time range
   */
  getEntriesInRange(startTime: Date, endTime: Date): GovernanceHistoryLogEntry[] {
    const startStr = startTime.toISOString();
    const endStr = endTime.toISOString();
    
    return this.entries.filter(e => e.timestamp >= startStr && e.timestamp <= endStr);
  }

  /**
   * Generate audit trail
   */
  generateAuditTrail(
    entityId: string,
    entityType: 'role' | 'permission' | 'policyPack' | 'governance',
    startTime?: Date,
    endTime?: Date
  ): AuditTrail {
    let changes = this.getChangesByEntity(entityId, entityType);

    if (startTime) {
      const startStr = startTime.toISOString();
      changes = changes.filter(c => c.timestamp >= startStr);
    }

    if (endTime) {
      const endStr = endTime.toISOString();
      changes = changes.filter(c => c.timestamp <= endStr);
    }

    // Sort by timestamp
    changes.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    const trail: AuditTrail = {
      entityId,
      entityType,
      tenantId: this.tenantId,
      facilityId: this.facilityId,
      startTime: startTime?.toISOString() || changes[0]?.timestamp || new Date().toISOString(),
      endTime: endTime?.toISOString() || changes[changes.length - 1]?.timestamp || new Date().toISOString(),
      changes,
      totalChanges: changes.length,
      performers: Array.from(new Set(changes.map(c => c.performedBy))),
      approvers: Array.from(new Set(changes.map(c => c.approvedBy).filter(Boolean) as string[])),
      changeTypes: Array.from(new Set(changes.map(c => c.changeType)))
    };

    // Log the audit trail generation
    this.logEntry(
      'export_generated',
      {
        entityId,
        entityType,
        changesIncluded: changes.length,
        timeRange: `${trail.startTime} to ${trail.endTime}`
      },
      { tenantId: this.tenantId, facilityId: this.facilityId },
      'system'
    );

    return trail;
  }

  /**
   * Export changes to JSON
   */
  exportChanges(
    filters?: {
      entityId?: string;
      entityType?: 'role' | 'permission' | 'policyPack' | 'governance';
      changeType?: GovernanceChangeType;
      startTime?: Date;
      endTime?: Date;
      performedBy?: string;
    }
  ): string {
    let changes = [...this.changes];

    if (filters) {
      if (filters.entityId) {
        changes = changes.filter(c => c.entityId === filters.entityId);
      }
      if (filters.entityType) {
        changes = changes.filter(c => c.entityType === filters.entityType);
      }
      if (filters.changeType) {
        changes = changes.filter(c => c.changeType === filters.changeType);
      }
      if (filters.startTime) {
        const startStr = filters.startTime.toISOString();
        changes = changes.filter(c => c.timestamp >= startStr);
      }
      if (filters.endTime) {
        const endStr = filters.endTime.toISOString();
        changes = changes.filter(c => c.timestamp <= endStr);
      }
      if (filters.performedBy) {
        changes = changes.filter(c => c.performedBy === filters.performedBy);
      }
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      tenantId: this.tenantId,
      facilityId: this.facilityId,
      filters,
      totalChanges: changes.length,
      changes
    };

    // Log the export
    this.logEntry(
      'export_generated',
      {
        changesExported: changes.length,
        filters
      },
      { tenantId: this.tenantId, facilityId: this.facilityId },
      'system'
    );

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import changes from JSON
   */
  importChanges(json: string, performedBy: string): number {
    const data = JSON.parse(json);
    const importedChanges = data.changes as GovernanceChange[];
    
    for (const change of importedChanges) {
      // Check if change already exists
      if (!this.changes.some(c => c.id === change.id)) {
        this.changes.push(change);
      }
    }

    // Log the import
    this.logEntry(
      'change_logged',
      {
        changesImported: importedChanges.length,
        source: 'import'
      },
      { tenantId: this.tenantId, facilityId: this.facilityId },
      performedBy
    );

    return importedChanges.length;
  }

  /**
   * Clear old entries (for maintenance)
   */
  clearOldEntries(olderThan: Date): number {
    const timestampStr = olderThan.toISOString();
    const initialCount = this.entries.length;
    
    this.entries = this.entries.filter(e => e.timestamp > timestampStr);
    
    return initialCount - this.entries.length;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalChanges: number;
    totalEntries: number;
    changesByType: Record<GovernanceChangeType, number>;
    changesByEntity: Record<string, number>;
    topPerformers: Array<{ performer: string; count: number }>;
  } {
    const changesByType = {} as Record<GovernanceChangeType, number>;
    const changesByEntity = {} as Record<string, number>;
    const performerCounts = new Map<string, number>();

    for (const change of this.changes) {
      changesByType[change.changeType] = (changesByType[change.changeType] || 0) + 1;
      changesByEntity[change.entityType] = (changesByEntity[change.entityType] || 0) + 1;
      performerCounts.set(change.performedBy, (performerCounts.get(change.performedBy) || 0) + 1);
    }

    const topPerformers = Array.from(performerCounts.entries())
      .map(([performer, count]) => ({ performer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalChanges: this.changes.length,
      totalEntries: this.entries.length,
      changesByType,
      changesByEntity,
      topPerformers
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private requiresApproval(changeType: GovernanceChangeType): boolean {
    const approvalRequired: GovernanceChangeType[] = [
      'roleCreated',
      'roleDeactivated',
      'scopeExpanded',
      'policyPackAssigned',
      'policyPackRevoked',
      'governanceDecisionOverride'
    ];
    
    return approvalRequired.includes(changeType);
  }
}

// ============================================================================
// LOG UTILITIES
// ============================================================================

/**
 * Format audit trail for display
 */
export function formatAuditTrail(trail: AuditTrail): string {
  let output = `Audit Trail: ${trail.entityType} ${trail.entityId}\n`;
  output += `Time Range: ${trail.startTime} to ${trail.endTime}\n`;
  output += `Total Changes: ${trail.totalChanges}\n`;
  output += `Performers: ${trail.performers.join(', ')}\n`;
  output += `Approvers: ${trail.approvers.join(', ')}\n`;
  output += `Change Types: ${trail.changeTypes.join(', ')}\n\n`;

  output += `Changes:\n`;
  for (const change of trail.changes) {
    output += `  [${change.timestamp}] ${change.changeType}\n`;
    output += `    Performed by: ${change.performedBy}\n`;
    if (change.approvedBy) {
      output += `    Approved by: ${change.approvedBy}\n`;
    }
    output += `    Rationale: ${change.rationale}\n\n`;
  }

  return output;
}

/**
 * Get change summary
 */
export function getChangeSummary(change: GovernanceChange): string {
  return `[${change.changeType}] ${change.entityType} ${change.entityId} by ${change.performedBy} at ${change.timestamp}`;
}

/**
 * Check if change is critical
 */
export function isCriticalChange(change: GovernanceChange): boolean {
  const criticalTypes: GovernanceChangeType[] = [
    'roleDeactivated',
    'permissionRemoved',
    'scopeRestricted',
    'policyPackRevoked',
    'governanceDecisionOverride'
  ];
  
  return criticalTypes.includes(change.changeType);
}
