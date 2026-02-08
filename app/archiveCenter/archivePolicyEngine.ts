/**
 * Phase 61: Archive Policy Engine
 * 
 * Enforces access control, tenant isolation, and compliance policies for archives.
 * 
 * NO GENERATIVE AI • DETERMINISTIC ONLY • STRICT POLICY ENFORCEMENT
 */

import {
  ArchiveQuery,
  ArchivePolicyContext,
  ArchivePolicyDecision,
  ArchivePolicyAudit,
  ArchiveItem
} from './archiveTypes';

export class ArchivePolicyEngine {
  /**
   * Evaluate Archive Policy
   * Check if user can perform archive operation
   */
  evaluateArchivePolicy(
    query: ArchiveQuery,
    context: ArchivePolicyContext
  ): ArchivePolicyDecision {
    const violations: string[] = [];
    const warnings: string[] = [];
    const restrictions: string[] = [];

    // Rule 1: Tenant Isolation
    // Users can only access archives from their tenant unless granted cross-tenant permission
    if (query.filters?.tenantId && query.filters.tenantId !== context.userTenantId) {
      if (!this.hasPermission(context, 'archive:cross-tenant') &&
          !this.hasPermission(context, 'archive:federation-admin')) {
        violations.push('Cross-tenant archive access denied');
      }
    }

    // Rule 2: Federation Access
    // Federation-level access requires admin permission or federation membership
    if (query.filters?.federationId) {
      const hasFederationAdmin = this.hasPermission(context, 'archive:federation-admin');
      const isFederationMember = context.userFederationId === query.filters.federationId;
      const hasExplicitPermission = this.hasPermission(context, `archive:federation:${query.filters.federationId}`);

      if (!hasFederationAdmin && !isFederationMember && !hasExplicitPermission) {
        violations.push('Federation archive access denied');
      }
    }

    // Rule 3: Archive Permissions (Category-Specific)
    // Certain categories require specific roles or permissions
    if (query.filters?.categories) {
      for (const category of query.filters.categories) {
        if (category === 'compliance-packs' || category === 'audit-logs') {
          // Compliance and audit require auditor/compliance-officer role
          if (context.role !== 'auditor' && 
              context.role !== 'compliance-officer' &&
              context.role !== 'executive' &&
              context.role !== 'admin' &&
              !this.hasPermission(context, 'archive:compliance-access')) {
            violations.push(`Category '${category}' requires auditor, compliance-officer, executive, or admin role`);
          }
        }

        if (category === 'executive-insights') {
          // Executive insights require executive role
          if (!this.hasExecutivePermission(context)) {
            violations.push(`Category 'executive-insights' requires executive permissions`);
          }
        }
      }
    }

    // Rule 4: Retention Compliance
    // Creating archives requires valid retention policy
    if (query.queryType === 'create' && query.createData) {
      if (!query.createData.retentionPolicyId) {
        violations.push('Archive creation requires valid retention policy');
      }
    }

    // Rule 5: Legal Hold Enforcement
    // Only admins and compliance officers can manage legal holds
    if (query.filters?.onlyLegalHold) {
      if (context.role !== 'admin' && 
          context.role !== 'compliance-officer' &&
          !this.hasPermission(context, 'archive:legal-hold-access')) {
        violations.push('Legal hold archives require admin or compliance-officer role');
      }
    }

    // Rule 6: Reference Visibility
    // Users can only access archives they have permission to view in source engines
    if (query.filters?.referenceIds) {
      // Add restriction notice (actual validation would require source engine checks)
      restrictions.push('Archive access limited to items visible in source engines');
    }

    // Additional: Deleted archives
    if (query.filters?.includeDeleted) {
      if (!this.hasPermission(context, 'archive:view-deleted')) {
        violations.push('Viewing deleted archives requires archive:view-deleted permission');
      }
    }

    // Determine if allowed
    const allowed = violations.length === 0;
    const reason = allowed
      ? 'Archive policy evaluation passed'
      : `Archive policy violations: ${violations.join('; ')}`;

    return {
      allowed,
      reason,
      violations,
      warnings,
      restrictions
    };
  }

  /**
   * Evaluate Archive Visibility
   * Check if user can view a specific archive item
   */
  evaluateArchiveVisibility(
    archive: ArchiveItem,
    context: ArchivePolicyContext
  ): boolean {
    // Check tenant access
    if (archive.scope.tenantId !== context.userTenantId) {
      if (!this.hasPermission(context, 'archive:cross-tenant') &&
          !this.hasPermission(context, 'archive:federation-admin')) {
        return false;
      }
    }

    // Check federation access
    if (archive.scope.federationId) {
      const hasFederationAdmin = this.hasPermission(context, 'archive:federation-admin');
      const isFederationMember = context.userFederationId === archive.scope.federationId;
      if (!hasFederationAdmin && !isFederationMember) {
        return false;
      }
    }

    // Check category-specific permissions
    if (archive.category === 'compliance-packs' || archive.category === 'audit-logs') {
      if (context.role !== 'auditor' && 
          context.role !== 'compliance-officer' &&
          context.role !== 'executive' &&
          context.role !== 'admin' &&
          !this.hasPermission(context, 'archive:compliance-access')) {
        return false;
      }
    }

    if (archive.category === 'executive-insights') {
      if (!this.hasExecutivePermission(context)) {
        return false;
      }
    }

    // Check soft deleted
    if (archive.softDeleted) {
      if (!this.hasPermission(context, 'archive:view-deleted')) {
        return false;
      }
    }

    return true;
  }

  /**
   * Create Audit Entry
   * Generate audit record for policy decision
   */
  createAuditEntry(
    query: ArchiveQuery,
    context: ArchivePolicyContext,
    decision: ArchivePolicyDecision
  ): ArchivePolicyAudit {
    return {
      auditId: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: context.userId,
      userRole: context.role,
      tenantId: context.userTenantId,
      queryId: query.queryId,
      queryDescription: query.description,
      queryType: query.queryType,
      queryScope: {
        tenantId: query.filters?.tenantId,
        facilityId: query.filters?.facilityId,
        federationId: query.filters?.federationId,
        categories: query.filters?.categories
      },
      decision,
      policyVersion: '1.0.0'
    };
  }

  /**
   * Has Permission
   * Check if user has specific permission
   */
  private hasPermission(context: ArchivePolicyContext, permission: string): boolean {
    return context.permissions.includes(permission);
  }

  /**
   * Has Executive Permission
   * Check if user has executive-level permissions
   */
  private hasExecutivePermission(context: ArchivePolicyContext): boolean {
    return context.role === 'executive' ||
           context.role === 'admin' ||
           this.hasPermission(context, 'archive:executive-view');
  }
}
