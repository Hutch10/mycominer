/**
 * Phase 61: Archive Engine
 * 
 * Main orchestration engine for archival operations.
 * Coordinates store, policy, and logging components.
 * 
 * NO GENERATIVE AI • DETERMINISTIC ONLY • COMPLETE TRACEABILITY
 */

import { ArchiveStore } from './archiveStore';
import { ArchivePolicyEngine } from './archivePolicyEngine';
import { ArchiveLog } from './archiveLog';
import {
  ArchiveQuery,
  ArchiveResult,
  ArchivePolicyContext,
  ArchiveItem,
  ArchiveRetentionPolicy
} from './archiveTypes';

export class ArchiveEngine {
  private store: ArchiveStore;
  private policyEngine: ArchivePolicyEngine;
  private log: ArchiveLog;
  private retentionPolicies: Map<string, ArchiveRetentionPolicy> = new Map();

  constructor(
    store: ArchiveStore,
    policyEngine: ArchivePolicyEngine,
    log: ArchiveLog
  ) {
    this.store = store;
    this.policyEngine = policyEngine;
    this.log = log;

    // Initialize default retention policies
    this.initializeDefaultPolicies();
  }

  /**
   * Archive Item
   * Create new archive from source engine data
   */
  async archiveItem(
    query: ArchiveQuery,
    policyContext: ArchivePolicyContext
  ): Promise<ArchiveResult> {
    const startTime = Date.now();

    try {
      // Step 1: Validate query
      if (query.queryType !== 'create' || !query.createData) {
        return this.createErrorResult(
          query,
          'INVALID_QUERY',
          'Archive creation requires queryType=create with createData',
          startTime
        );
      }

      // Step 2: Evaluate policy
      const policyDecision = this.policyEngine.evaluateArchivePolicy(query, policyContext);
      this.log.logPolicyDecision(
        query.queryId,
        query.queryType,
        {
          tenantId: policyContext.userTenantId,
          facilityId: query.filters?.facilityId,
          federationId: policyContext.userFederationId
        },
        policyDecision.allowed,
        policyDecision.reason,
        policyDecision.violations,
        policyDecision.warnings,
        policyContext.userId
      );

      if (!policyDecision.allowed) {
        this.log.logError(
          query.queryId,
          'POLICY_VIOLATION',
          policyDecision.reason,
          { violations: policyDecision.violations },
          policyContext.userTenantId,
          policyContext.userId
        );
        return this.createErrorResult(query, 'POLICY_VIOLATION', policyDecision.reason, startTime);
      }

      // Step 3: Get retention policy
      const retentionPolicy = this.retentionPolicies.get(query.createData.retentionPolicyId);
      if (!retentionPolicy || !retentionPolicy.active) {
        return this.createErrorResult(
          query,
          'INVALID_RETENTION_POLICY',
          `Retention policy ${query.createData.retentionPolicyId} not found or inactive`,
          startTime
        );
      }

      // Step 4: Create archive in store
      const scope = {
        tenantId: policyContext.userTenantId,
        facilityId: query.filters?.facilityId,
        roomId: query.filters?.roomId,
        federationId: policyContext.userFederationId
      };

      const archive = this.store.createArchive(
        query.createData.category,
        scope,
        {
          originalId: query.createData.originalId,
          originalType: query.createData.originalType,
          data: query.createData.data,
          format: query.createData.format
        },
        query.createData.metadata,
        {
          policyId: retentionPolicy.policyId,
          policyName: retentionPolicy.policyName,
          retentionDays: retentionPolicy.retentionDays
        },
        query.createData.references || {},
        policyContext.userId
      );

      // Step 5: Log archive creation
      this.log.logArchiveCreated(
        archive.archiveId,
        archive.category,
        archive.version,
        archive.content.originalId,
        archive.content.originalType,
        archive.content.sizeBytes,
        archive.retention.retentionDays,
        archive.retention.expiresAt,
        archive.scope.tenantId,
        archive.scope.facilityId,
        archive.archivedBy
      );

      // Step 6: Return result
      const executionTimeMs = Date.now() - startTime;
      return {
        resultId: `result-${Date.now()}`,
        query,
        success: true,
        item: archive,
        metadata: {
          executedAt: new Date().toISOString(),
          executionTimeMs,
          itemsReturned: 1
        }
      };

    } catch (error: any) {
      this.log.logError(
        query.queryId,
        'ARCHIVE_ERROR',
        error.message,
        { stack: error.stack },
        policyContext.userTenantId,
        policyContext.userId
      );
      return this.createErrorResult(query, 'ARCHIVE_ERROR', error.message, startTime);
    }
  }

  /**
   * Retrieve Archive
   * Get specific archive by ID
   */
  async retrieveArchive(
    query: ArchiveQuery,
    policyContext: ArchivePolicyContext
  ): Promise<ArchiveResult> {
    const startTime = Date.now();

    try {
      // Step 1: Validate query
      if (query.queryType !== 'retrieve' || !query.filters?.archiveIds || query.filters.archiveIds.length === 0) {
        return this.createErrorResult(
          query,
          'INVALID_QUERY',
          'Archive retrieval requires queryType=retrieve with archiveIds filter',
          startTime
        );
      }

      const archiveId = query.filters.archiveIds[0];

      // Step 2: Get archive from store
      const archive = this.store.getArchive(archiveId);
      if (!archive) {
        return this.createErrorResult(
          query,
          'ARCHIVE_NOT_FOUND',
          `Archive ${archiveId} not found`,
          startTime
        );
      }

      // Step 3: Check visibility
      const canView = this.policyEngine.evaluateArchiveVisibility(archive, policyContext);
      if (!canView) {
        this.log.logError(
          query.queryId,
          'ACCESS_DENIED',
          'User does not have permission to view this archive',
          { archiveId },
          archive.scope.tenantId,
          policyContext.userId
        );
        return this.createErrorResult(
          query,
          'ACCESS_DENIED',
          'You do not have permission to view this archive',
          startTime
        );
      }

      // Step 4: Log retrieval
      this.log.logArchiveRetrieved(
        archive.archiveId,
        archive.category,
        archive.version,
        'direct',
        archive.scope.tenantId,
        policyContext.userId
      );

      // Step 5: Return result
      const executionTimeMs = Date.now() - startTime;
      return {
        resultId: `result-${Date.now()}`,
        query,
        success: true,
        item: archive,
        metadata: {
          executedAt: new Date().toISOString(),
          executionTimeMs,
          itemsReturned: 1
        }
      };

    } catch (error: any) {
      this.log.logError(
        query.queryId,
        'RETRIEVAL_ERROR',
        error.message,
        { stack: error.stack },
        policyContext.userTenantId,
        policyContext.userId
      );
      return this.createErrorResult(query, 'RETRIEVAL_ERROR', error.message, startTime);
    }
  }

  /**
   * List Archives
   * Search archives with filters
   */
  async listArchives(
    query: ArchiveQuery,
    policyContext: ArchivePolicyContext
  ): Promise<ArchiveResult> {
    const startTime = Date.now();

    try {
      // Step 1: Evaluate policy
      const policyDecision = this.policyEngine.evaluateArchivePolicy(query, policyContext);
      this.log.logPolicyDecision(
        query.queryId,
        query.queryType,
        {
          tenantId: query.filters?.tenantId || policyContext.userTenantId,
          facilityId: query.filters?.facilityId,
          federationId: query.filters?.federationId
        },
        policyDecision.allowed,
        policyDecision.reason,
        policyDecision.violations,
        policyDecision.warnings,
        policyContext.userId
      );

      if (!policyDecision.allowed) {
        return this.createErrorResult(query, 'POLICY_VIOLATION', policyDecision.reason, startTime);
      }

      // Step 2: Apply default filters
      const filters = {
        ...query.filters,
        tenantId: query.filters?.tenantId || policyContext.userTenantId
      };

      // Step 3: Get archives from store
      const archives = this.store.listArchives(filters);

      // Step 4: Filter by visibility
      const visibleArchives = archives.filter(archive =>
        this.policyEngine.evaluateArchiveVisibility(archive, policyContext)
      );

      // Step 5: Log retrieval
      visibleArchives.forEach(archive => {
        this.log.logArchiveRetrieved(
          archive.archiveId,
          archive.category,
          archive.version,
          'search',
          archive.scope.tenantId,
          policyContext.userId
        );
      });

      // Step 6: Return result
      const executionTimeMs = Date.now() - startTime;
      return {
        resultId: `result-${Date.now()}`,
        query,
        success: true,
        items: visibleArchives,
        metadata: {
          executedAt: new Date().toISOString(),
          executionTimeMs,
          itemsReturned: visibleArchives.length,
          totalMatching: archives.length
        }
      };

    } catch (error: any) {
      this.log.logError(
        query.queryId,
        'LIST_ERROR',
        error.message,
        { stack: error.stack },
        policyContext.userTenantId,
        policyContext.userId
      );
      return this.createErrorResult(query, 'LIST_ERROR', error.message, startTime);
    }
  }

  /**
   * Get Version History
   * Retrieve all versions of an archive
   */
  getVersionHistory(originalId: string): ArchiveResult {
    const startTime = Date.now();

    try {
      const versions = this.store.getVersions(originalId);

      const executionTimeMs = Date.now() - startTime;
      return {
        resultId: `result-${Date.now()}`,
        query: {
          queryId: `version-query-${Date.now()}`,
          queryType: 'versions',
          description: `Version history for ${originalId}`,
          requestedBy: 'system',
          requestedAt: new Date().toISOString()
        },
        success: true,
        versions,
        metadata: {
          executedAt: new Date().toISOString(),
          executionTimeMs,
          itemsReturned: versions.length
        }
      };

    } catch (error: any) {
      return this.createErrorResult(
        {
          queryId: `version-query-${Date.now()}`,
          queryType: 'versions',
          description: `Version history for ${originalId}`,
          requestedBy: 'system',
          requestedAt: new Date().toISOString()
        },
        'VERSION_ERROR',
        error.message,
        startTime
      );
    }
  }

  /**
   * Evaluate Retention
   * Check which archives are expired
   */
  evaluateRetention(): ArchiveResult {
    const startTime = Date.now();

    try {
      const retentionStatus = this.store.evaluateRetention();

      const executionTimeMs = Date.now() - startTime;
      return {
        resultId: `result-${Date.now()}`,
        query: {
          queryId: `retention-query-${Date.now()}`,
          queryType: 'retention-check',
          description: 'Evaluate retention status of all archives',
          requestedBy: 'system',
          requestedAt: new Date().toISOString()
        },
        success: true,
        retentionStatus,
        metadata: {
          executedAt: new Date().toISOString(),
          executionTimeMs,
          itemsReturned: retentionStatus.evaluated
        }
      };

    } catch (error: any) {
      return this.createErrorResult(
        {
          queryId: `retention-query-${Date.now()}`,
          queryType: 'retention-check',
          description: 'Evaluate retention status',
          requestedBy: 'system',
          requestedAt: new Date().toISOString()
        },
        'RETENTION_ERROR',
        error.message,
        startTime
      );
    }
  }

  /**
   * Apply Retention
   * Soft delete expired archives
   */
  applyRetention(policyContext: ArchivePolicyContext): number {
    // Get all archives
    const allArchives = this.store.getAllArchives();
    const now = new Date().getTime();
    let deletedCount = 0;

    for (const archive of allArchives) {
      // Skip if already deleted or on legal hold
      if (archive.softDeleted || archive.retention.legalHold) {
        continue;
      }

      // Check if expired
      const expiresAt = new Date(archive.retention.expiresAt).getTime();
      if (expiresAt <= now) {
        const success = this.store.updateRetentionStatus(
          archive.archiveId,
          'soft-delete',
          'Retention period expired',
          policyContext.userId
        );

        if (success) {
          this.log.logRetentionAction(
            archive.archiveId,
            archive.category,
            'expiry',
            'Retention period expired',
            'active',
            'deleted',
            archive.scope.tenantId,
            policyContext.userId
          );
          deletedCount++;
        }
      }
    }

    return deletedCount;
  }

  /**
   * Apply Legal Hold
   * Prevent deletion of archive
   */
  applyLegalHold(
    archiveId: string,
    reason: string,
    policyContext: ArchivePolicyContext
  ): boolean {
    const archive = this.store.getArchive(archiveId);
    if (!archive) {
      return false;
    }

    const success = this.store.applyLegalHold(archiveId, reason, policyContext.userId);
    if (success) {
      this.log.logRetentionAction(
        archiveId,
        archive.category,
        'legal-hold',
        reason,
        'active',
        'legal-hold',
        archive.scope.tenantId,
        policyContext.userId
      );
    }

    return success;
  }

  /**
   * Remove Legal Hold
   * Allow deletion of archive
   */
  removeLegalHold(archiveId: string, policyContext: ArchivePolicyContext): boolean {
    const archive = this.store.getArchive(archiveId);
    if (!archive) {
      return false;
    }

    const success = this.store.removeLegalHold(archiveId);
    if (success) {
      this.log.logRetentionAction(
        archiveId,
        archive.category,
        'restored',
        'Legal hold removed',
        'legal-hold',
        'active',
        archive.scope.tenantId,
        policyContext.userId
      );
    }

    return success;
  }

  /**
   * Get Log
   * Access log instance
   */
  getLog(): ArchiveLog {
    return this.log;
  }

  /**
   * Get Statistics
   * Get archive statistics
   */
  getStatistics() {
    const storeStats = this.store.getStatistics();
    const logStats = this.log.getStatistics(storeStats);
    return { ...storeStats, logStats };
  }

  /**
   * Get Retention Policies
   * Get all retention policies
   */
  getRetentionPolicies(): ArchiveRetentionPolicy[] {
    return Array.from(this.retentionPolicies.values());
  }

  /**
   * Create Error Result
   * Generate error result
   */
  private createErrorResult(
    query: ArchiveQuery,
    errorCode: string,
    message: string,
    startTime: number
  ): ArchiveResult {
    const executionTimeMs = Date.now() - startTime;
    return {
      resultId: `result-${Date.now()}`,
      query,
      success: false,
      error: message,
      metadata: {
        executedAt: new Date().toISOString(),
        executionTimeMs,
        itemsReturned: 0
      }
    };
  }

  /**
   * Initialize Default Policies
   * Create standard retention policies for each category
   */
  private initializeDefaultPolicies(): void {
    const policies: ArchiveRetentionPolicy[] = [
      {
        policyId: 'policy-reports-365',
        policyName: 'Reports - 1 Year',
        category: 'reports',
        retentionDays: 365,
        description: 'Standard retention for reports',
        autoDelete: false,
        requiresApproval: true,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
        active: true
      },
      {
        policyId: 'policy-exports-90',
        policyName: 'Export Bundles - 90 Days',
        category: 'export-bundles',
        retentionDays: 90,
        description: 'Standard retention for export bundles',
        autoDelete: true,
        requiresApproval: false,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
        active: true
      },
      {
        policyId: 'policy-compliance-2555',
        policyName: 'Compliance Packs - 7 Years',
        category: 'compliance-packs',
        retentionDays: 2555,  // 7 years
        description: 'Legal retention for compliance documents',
        autoDelete: false,
        requiresApproval: true,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
        active: true
      },
      {
        policyId: 'policy-insights-180',
        policyName: 'Executive Insights - 6 Months',
        category: 'executive-insights',
        retentionDays: 180,
        description: 'Standard retention for executive insights',
        autoDelete: false,
        requiresApproval: true,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
        active: true
      },
      {
        policyId: 'policy-capacity-365',
        policyName: 'Capacity Projections - 1 Year',
        category: 'capacity-projections',
        retentionDays: 365,
        description: 'Standard retention for capacity forecasts',
        autoDelete: true,
        requiresApproval: false,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
        active: true
      },
      {
        policyId: 'policy-schedules-90',
        policyName: 'Schedules - 90 Days',
        category: 'schedules',
        retentionDays: 90,
        description: 'Standard retention for schedules',
        autoDelete: true,
        requiresApproval: false,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
        active: true
      },
      {
        policyId: 'policy-performance-180',
        policyName: 'Performance Snapshots - 6 Months',
        category: 'performance-snapshots',
        retentionDays: 180,
        description: 'Standard retention for performance metrics',
        autoDelete: true,
        requiresApproval: false,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
        active: true
      },
      {
        policyId: 'policy-audit-1825',
        policyName: 'Audit Logs - 5 Years',
        category: 'audit-logs',
        retentionDays: 1825,  // 5 years
        description: 'Legal retention for audit logs',
        autoDelete: false,
        requiresApproval: true,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
        active: true
      },
      {
        policyId: 'policy-drift-365',
        policyName: 'Drift Logs - 1 Year',
        category: 'drift-logs',
        retentionDays: 365,
        description: 'Standard retention for drift logs',
        autoDelete: true,
        requiresApproval: false,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
        active: true
      },
      {
        policyId: 'policy-alerts-180',
        policyName: 'Alert Snapshots - 6 Months',
        category: 'alert-snapshots',
        retentionDays: 180,
        description: 'Standard retention for alert snapshots',
        autoDelete: true,
        requiresApproval: false,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
        active: true
      },
      {
        policyId: 'policy-tasks-180',
        policyName: 'Task Snapshots - 6 Months',
        category: 'task-snapshots',
        retentionDays: 180,
        description: 'Standard retention for task snapshots',
        autoDelete: true,
        requiresApproval: false,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
        active: true
      }
    ];

    policies.forEach(policy => {
      this.retentionPolicies.set(policy.policyId, policy);
    });
  }
}
