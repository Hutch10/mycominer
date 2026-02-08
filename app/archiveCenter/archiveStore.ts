/**
 * Phase 61: Archive Store
 * 
 * Storage and retrieval engine for archived items.
 * Supports versioning, soft deletion, and retention management.
 * 
 * NO GENERATIVE AI • DETERMINISTIC ONLY • READ-ONLY FROM SOURCE ENGINES
 */

import {
  ArchiveItem,
  ArchiveCategory,
  ArchiveVersion,
  ArchiveQuery,
  ArchiveStatistics
} from './archiveTypes';

export class ArchiveStore {
  private archives: Map<string, ArchiveItem> = new Map();
  private versionHistory: Map<string, ArchiveVersion[]> = new Map();

  /**
   * Create Archive
   * Persist a new archive item or new version of existing item
   */
  createArchive(
    category: ArchiveCategory,
    scope: { tenantId: string; facilityId?: string; roomId?: string; federationId?: string },
    content: { originalId: string; originalType: string; data: Record<string, any>; format?: string },
    metadata: {
      title: string;
      description?: string;
      tags: string[];
      sourcePhase: string;
      sourceEngine: string;
      originalTimestamp: string;
    },
    retention: {
      policyId: string;
      policyName: string;
      retentionDays: number;
    },
    references: any,
    archivedBy: string
  ): ArchiveItem {
    // Check for existing archive with same originalId to determine version
    const existingArchives = Array.from(this.archives.values()).filter(
      a => a.content.originalId === content.originalId && 
           a.category === category &&
           a.scope.tenantId === scope.tenantId
    );

    const version = existingArchives.length > 0
      ? Math.max(...existingArchives.map(a => a.version)) + 1
      : 1;

    const archiveId = `archive-${category}-${content.originalId}-v${version}-${Date.now()}`;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + retention.retentionDays * 24 * 60 * 60 * 1000).toISOString();

    const sizeBytes = JSON.stringify(content.data).length;

    const archive: ArchiveItem = {
      archiveId,
      category,
      version,
      scope,
      content: {
        originalId: content.originalId,
        originalType: content.originalType,
        data: content.data,
        format: content.format,
        sizeBytes
      },
      metadata: {
        ...metadata,
        dataQuality: {
          complete: true,
          validated: true,
          checksumMD5: this.calculateChecksum(content.data)
        },
        accessCount: 0
      },
      retention: {
        policyId: retention.policyId,
        policyName: retention.policyName,
        retentionDays: retention.retentionDays,
        expiresAt,
        legalHold: false
      },
      references,
      createdAt: now,
      archivedAt: now,
      archivedBy,
      softDeleted: false
    };

    this.archives.set(archiveId, archive);

    // Add version to history
    const versionEntry: ArchiveVersion = {
      versionId: `${archiveId}-version`,
      archiveId,
      version,
      archivedAt: now,
      archivedBy,
      contentSizeBytes: sizeBytes,
      metadata: {
        title: metadata.title,
        tags: metadata.tags
      }
    };

    const existingVersions = this.versionHistory.get(content.originalId) || [];
    this.versionHistory.set(content.originalId, [...existingVersions, versionEntry]);

    return archive;
  }

  /**
   * Get Archive by ID
   * Retrieve a specific archive item
   */
  getArchive(archiveId: string): ArchiveItem | null {
    const archive = this.archives.get(archiveId);
    if (!archive || archive.softDeleted) {
      return null;
    }

    // Update access tracking
    archive.metadata.accessCount++;
    archive.metadata.lastAccessedAt = new Date().toISOString();

    return archive;
  }

  /**
   * List Archives
   * Retrieve archives matching filters
   */
  listArchives(filters: {
    archiveIds?: string[];
    categories?: ArchiveCategory[];
    tenantId?: string;
    facilityId?: string;
    roomId?: string;
    federationId?: string;
    timeRange?: { start: string; end: string };
    referenceIds?: { type: string; ids: string[] };
    includeDeleted?: boolean;
    onlyLegalHold?: boolean;
  }): ArchiveItem[] {
    let results = Array.from(this.archives.values());

    // Filter by archiveIds
    if (filters.archiveIds && filters.archiveIds.length > 0) {
      results = results.filter(a => filters.archiveIds!.includes(a.archiveId));
    }

    // Filter by categories
    if (filters.categories && filters.categories.length > 0) {
      results = results.filter(a => filters.categories!.includes(a.category));
    }

    // Filter by tenant
    if (filters.tenantId) {
      results = results.filter(a => a.scope.tenantId === filters.tenantId);
    }

    // Filter by facility
    if (filters.facilityId) {
      results = results.filter(a => a.scope.facilityId === filters.facilityId);
    }

    // Filter by room
    if (filters.roomId) {
      results = results.filter(a => a.scope.roomId === filters.roomId);
    }

    // Filter by federation
    if (filters.federationId) {
      results = results.filter(a => a.scope.federationId === filters.federationId);
    }

    // Filter by time range
    if (filters.timeRange) {
      const start = new Date(filters.timeRange.start).getTime();
      const end = new Date(filters.timeRange.end).getTime();
      results = results.filter(a => {
        const archivedAt = new Date(a.archivedAt).getTime();
        return archivedAt >= start && archivedAt <= end;
      });
    }

    // Filter by reference IDs
    if (filters.referenceIds) {
      const { type, ids } = filters.referenceIds;
      results = results.filter(a => {
        const refs = a.references as any;
        const fieldName = type;
        return refs[fieldName] && refs[fieldName].some((id: string) => ids.includes(id));
      });
    }

    // Filter soft deleted
    if (!filters.includeDeleted) {
      results = results.filter(a => !a.softDeleted);
    }

    // Filter legal hold
    if (filters.onlyLegalHold) {
      results = results.filter(a => a.retention.legalHold);
    }

    // Sort by archivedAt descending (newest first)
    results.sort((a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime());

    return results;
  }

  /**
   * Get Versions
   * Retrieve version history for an original item
   */
  getVersions(originalId: string): ArchiveVersion[] {
    return this.versionHistory.get(originalId) || [];
  }

  /**
   * Update Retention Status
   * Soft delete an archive (mark as deleted without removing)
   */
  updateRetentionStatus(
    archiveId: string,
    action: 'soft-delete' | 'restore',
    reason: string,
    performedBy: string
  ): boolean {
    const archive = this.archives.get(archiveId);
    if (!archive) {
      return false;
    }

    if (action === 'soft-delete') {
      // Cannot delete if legal hold
      if (archive.retention.legalHold) {
        return false;
      }

      archive.softDeleted = true;
      archive.deletedAt = new Date().toISOString();
      archive.deletedBy = performedBy;
      archive.deletedReason = reason;
    } else if (action === 'restore') {
      archive.softDeleted = false;
      archive.deletedAt = undefined;
      archive.deletedBy = undefined;
      archive.deletedReason = undefined;
    }

    return true;
  }

  /**
   * Apply Legal Hold
   * Prevent deletion of archive for legal/compliance reasons
   */
  applyLegalHold(
    archiveId: string,
    reason: string,
    appliedBy: string
  ): boolean {
    const archive = this.archives.get(archiveId);
    if (!archive) {
      return false;
    }

    archive.retention.legalHold = true;
    archive.retention.legalHoldReason = reason;
    archive.retention.legalHoldBy = appliedBy;
    archive.retention.legalHoldAt = new Date().toISOString();

    return true;
  }

  /**
   * Remove Legal Hold
   * Allow deletion of archive after legal hold lifted
   */
  removeLegalHold(archiveId: string): boolean {
    const archive = this.archives.get(archiveId);
    if (!archive) {
      return false;
    }

    archive.retention.legalHold = false;
    archive.retention.legalHoldReason = undefined;
    archive.retention.legalHoldBy = undefined;
    archive.retention.legalHoldAt = undefined;

    return true;
  }

  /**
   * Evaluate Retention
   * Check which archives are expired and eligible for deletion
   */
  evaluateRetention(): {
    evaluated: number;
    expired: number;
    active: number;
    legalHold: number;
  } {
    const now = new Date().getTime();
    let evaluated = 0;
    let expired = 0;
    let active = 0;
    let legalHold = 0;

    for (const archive of this.archives.values()) {
      if (archive.softDeleted) continue;

      evaluated++;

      if (archive.retention.legalHold) {
        legalHold++;
        continue;
      }

      const expiresAt = new Date(archive.retention.expiresAt).getTime();
      if (expiresAt <= now) {
        expired++;
      } else {
        active++;
      }
    }

    return { evaluated, expired, active, legalHold };
  }

  /**
   * Get Statistics
   * Calculate aggregate statistics about archives
   */
  getStatistics(): ArchiveStatistics {
    const archives = Array.from(this.archives.values());
    const activeArchives = archives.filter(a => !a.softDeleted);

    // Count retrievals from access counts
    const totalRetrievals = activeArchives.reduce((sum, a) => sum + a.metadata.accessCount, 0);

    // Total size
    const totalSizeBytes = activeArchives.reduce((sum, a) => sum + a.content.sizeBytes, 0);

    // By category
    const byCategory: Record<ArchiveCategory, number> = {
      'reports': 0,
      'export-bundles': 0,
      'compliance-packs': 0,
      'executive-insights': 0,
      'capacity-projections': 0,
      'schedules': 0,
      'performance-snapshots': 0,
      'audit-logs': 0,
      'drift-logs': 0,
      'alert-snapshots': 0,
      'task-snapshots': 0
    };
    activeArchives.forEach(a => {
      byCategory[a.category]++;
    });

    // By tenant
    const byTenant: Record<string, number> = {};
    activeArchives.forEach(a => {
      byTenant[a.scope.tenantId] = (byTenant[a.scope.tenantId] || 0) + 1;
    });

    // By retention status
    const now = new Date().getTime();
    const thirtyDaysFromNow = now + (30 * 24 * 60 * 60 * 1000);

    const byRetentionStatus = {
      active: 0,
      expiring: 0,
      expired: 0,
      legalHold: 0,
      deleted: 0
    };

    activeArchives.forEach(a => {
      if (a.retention.legalHold) {
        byRetentionStatus.legalHold++;
      } else {
        const expiresAt = new Date(a.retention.expiresAt).getTime();
        if (expiresAt <= now) {
          byRetentionStatus.expired++;
        } else if (expiresAt <= thirtyDaysFromNow) {
          byRetentionStatus.expiring++;
        } else {
          byRetentionStatus.active++;
        }
      }
    });

    byRetentionStatus.deleted = archives.filter(a => a.softDeleted).length;

    // Averages
    const averageSizeBytes = activeArchives.length > 0 
      ? totalSizeBytes / activeArchives.length 
      : 0;

    const totalRetentionDays = activeArchives.reduce((sum, a) => sum + a.retention.retentionDays, 0);
    const averageRetentionDays = activeArchives.length > 0
      ? totalRetentionDays / activeArchives.length
      : 0;

    // Trends (24h comparison)
    const now24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const archives24hAgo = activeArchives.filter(a => a.archivedAt < now24h);
    const newArchives = activeArchives.length - archives24hAgo.length;
    const archivesChange = this.calculateTrendChange(activeArchives.length, archives24hAgo.length);

    // Retrieval trend (simplified - based on recent access)
    const recentAccess = activeArchives.filter(
      a => a.metadata.lastAccessedAt && a.metadata.lastAccessedAt > now24h
    ).length;
    const retrievalsChange = recentAccess > 0 ? `+${recentAccess}` : 'N/A';

    // Storage trend
    const size24hAgo = archives24hAgo.reduce((sum, a) => sum + a.content.sizeBytes, 0);
    const storageChange = this.calculateTrendChange(totalSizeBytes, size24hAgo);

    return {
      totalArchives: activeArchives.length,
      totalRetrievals,
      totalSizeBytes,
      byCategory,
      byTenant,
      byRetentionStatus,
      averageSizeBytes,
      averageRetentionDays,
      trends: {
        archivesChange,
        retrievalsChange,
        storageChange
      }
    };
  }

  /**
   * Calculate Checksum
   * Generate MD5-like checksum for data validation
   */
  private calculateChecksum(data: Record<string, any>): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Calculate Trend Change
   * Calculate percentage change between current and previous values
   */
  private calculateTrendChange(current: number, previous: number): string {
    if (previous === 0) return current > 0 ? '+100%' : 'N/A';
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  }

  /**
   * Get All Archives (for testing/export)
   */
  getAllArchives(): ArchiveItem[] {
    return Array.from(this.archives.values());
  }

  /**
   * Clear All Archives (for testing)
   */
  clearAllArchives(): void {
    this.archives.clear();
    this.versionHistory.clear();
  }

  /**
   * Get Archive Count
   */
  getArchiveCount(): number {
    return this.archives.size;
  }
}
