/**
 * Phase 43: System Health - Drift Detector
 * 
 * Detects configuration drift by comparing current state against approved baselines.
 * Supports: SOPs, workflows, resources, facilities, sandbox scenarios, forecast metadata.
 * All operations are read-only and deterministic.
 */

import {
  DriftFinding,
  DriftDiff,
  HealthReference,
  HealthBaseline,
  HealthSeverity
} from './healthTypes';

// ============================================================================
// DRIFT DETECTOR CLASS
// ============================================================================

export class DriftDetector {
  private tenantId: string;
  private facilityId?: string;
  private baselines: Map<string, HealthBaseline> = new Map();

  constructor(tenantId: string, facilityId?: string) {
    this.tenantId = tenantId;
    this.facilityId = facilityId;
  }

  /**
   * Load baselines for comparison
   */
  loadBaselines(baselines: HealthBaseline[]): void {
    baselines.forEach(baseline => {
      const key = this.getBaselineKey(baseline.baselineType, baseline.assetId);
      this.baselines.set(key, baseline);
    });
  }

  /**
   * Detect drift in SOP definitions
   */
  detectSOPDrift(currentSOPs: unknown[]): DriftFinding[] {
    const findings: DriftFinding[] = [];

    for (const sop of currentSOPs) {
      const sopData = sop as Record<string, unknown>;
      const sopId = String(sopData.id);
      const baseline = this.baselines.get(this.getBaselineKey('sop', sopId));

      if (!baseline) {
        // No baseline = cannot detect drift
        continue;
      }

      const drift = this.compareObjects(baseline.snapshot, sopData);
      if (drift.length > 0) {
        findings.push(this.createDriftFinding(
          'sop',
          sopId,
          String(sopData.name || sopId),
          baseline,
          sopData,
          drift
        ));
      }
    }

    return findings;
  }

  /**
   * Detect drift in workflow templates
   */
  detectWorkflowDrift(currentWorkflows: unknown[]): DriftFinding[] {
    const findings: DriftFinding[] = [];

    for (const workflow of currentWorkflows) {
      const wfData = workflow as Record<string, unknown>;
      const wfId = String(wfData.id);
      const baseline = this.baselines.get(this.getBaselineKey('workflow', wfId));

      if (!baseline) {
        continue;
      }

      const drift = this.compareObjects(baseline.snapshot, wfData);
      if (drift.length > 0) {
        findings.push(this.createDriftFinding(
          'workflow',
          wfId,
          String(wfData.name || wfId),
          baseline,
          wfData,
          drift
        ));
      }
    }

    return findings;
  }

  /**
   * Detect drift in resource metadata
   */
  detectResourceDrift(currentResources: unknown[]): DriftFinding[] {
    const findings: DriftFinding[] = [];

    for (const resource of currentResources) {
      const resData = resource as Record<string, unknown>;
      const resId = String(resData.id);
      const baseline = this.baselines.get(this.getBaselineKey('resource', resId));

      if (!baseline) {
        continue;
      }

      const drift = this.compareObjects(baseline.snapshot, resData);
      if (drift.length > 0) {
        findings.push(this.createDriftFinding(
          'resource',
          resId,
          String(resData.name || resId),
          baseline,
          resData,
          drift
        ));
      }
    }

    return findings;
  }

  /**
   * Detect drift in facility configuration
   */
  detectFacilityDrift(currentFacilities: unknown[]): DriftFinding[] {
    const findings: DriftFinding[] = [];

    for (const facility of currentFacilities) {
      const facData = facility as Record<string, unknown>;
      const facId = String(facData.id);
      const baseline = this.baselines.get(this.getBaselineKey('facility', facId));

      if (!baseline) {
        continue;
      }

      const drift = this.compareObjects(baseline.snapshot, facData);
      if (drift.length > 0) {
        findings.push(this.createDriftFinding(
          'facility',
          facId,
          String(facData.name || facId),
          baseline,
          facData,
          drift
        ));
      }
    }

    return findings;
  }

  /**
   * Detect drift in sandbox scenarios
   */
  detectSandboxDrift(currentScenarios: unknown[]): DriftFinding[] {
    const findings: DriftFinding[] = [];

    for (const scenario of currentScenarios) {
      const scData = scenario as Record<string, unknown>;
      const scId = String(scData.id);
      const baseline = this.baselines.get(this.getBaselineKey('sandbox-scenario', scId));

      if (!baseline) {
        continue;
      }

      const drift = this.compareObjects(baseline.snapshot, scData);
      if (drift.length > 0) {
        findings.push(this.createDriftFinding(
          'sandbox-scenario',
          scId,
          String(scData.name || scId),
          baseline,
          scData,
          drift
        ));
      }
    }

    return findings;
  }

  /**
   * Detect drift in forecast metadata
   */
  detectForecastMetadataDrift(currentForecasts: unknown[]): DriftFinding[] {
    const findings: DriftFinding[] = [];

    for (const forecast of currentForecasts) {
      const fcData = forecast as Record<string, unknown>;
      const fcId = String(fcData.id);
      const baseline = this.baselines.get(this.getBaselineKey('forecast-metadata', fcId));

      if (!baseline) {
        continue;
      }

      const drift = this.compareObjects(baseline.snapshot, fcData);
      if (drift.length > 0) {
        findings.push(this.createDriftFinding(
          'forecast-metadata',
          fcId,
          String(fcData.name || fcId),
          baseline,
          fcData,
          drift
        ));
      }
    }

    return findings;
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  /**
   * Compare two objects and return differences
   */
  private compareObjects(baseline: Record<string, unknown>, current: Record<string, unknown>): DriftDiff[] {
    const diffs: DriftDiff[] = [];
    const allKeys = new Set([...Object.keys(baseline), ...Object.keys(current)]);

    for (const key of allKeys) {
      // Skip internal/dynamic fields
      if (this.shouldSkipField(key)) {
        continue;
      }

      const baselineValue = baseline[key];
      const currentValue = current[key];

      if (baselineValue === undefined && currentValue !== undefined) {
        diffs.push({
          field: key,
          baselineValue: undefined,
          currentValue,
          changeType: 'added'
        });
      } else if (baselineValue !== undefined && currentValue === undefined) {
        diffs.push({
          field: key,
          baselineValue,
          currentValue: undefined,
          changeType: 'removed'
        });
      } else if (!this.valuesEqual(baselineValue, currentValue)) {
        diffs.push({
          field: key,
          baselineValue,
          currentValue,
          changeType: 'modified'
        });
      }
    }

    return diffs;
  }

  /**
   * Check if two values are equal (deep comparison for objects/arrays)
   */
  private valuesEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (typeof a !== typeof b) return false;

    if (typeof a === 'object' && typeof b === 'object') {
      return JSON.stringify(a) === JSON.stringify(b);
    }

    return false;
  }

  /**
   * Skip fields that should not trigger drift detection
   */
  private shouldSkipField(field: string): boolean {
    const skipFields = [
      'lastModified',
      'lastModifiedBy',
      'lastAccessed',
      'viewCount',
      'createdAt',
      'updatedAt',
      'timestamp',
      '_internal',
      '__metadata'
    ];

    return skipFields.includes(field) || field.startsWith('_');
  }

  /**
   * Create a drift finding
   */
  private createDriftFinding(
    assetType: DriftFinding['assetType'],
    assetId: string,
    assetName: string,
    baseline: HealthBaseline,
    current: Record<string, unknown>,
    diffs: DriftDiff[]
  ): DriftFinding {
    const severity = this.calculateDriftSeverity(assetType, diffs);
    const driftType = this.determineDriftType(diffs);

    return {
      id: `drift-${assetType}-${assetId}-${Date.now()}`,
      category: 'configuration-drift',
      severity,
      timestamp: new Date().toISOString(),
      tenantId: this.tenantId,
      facilityId: this.facilityId,
      assetType,
      assetId,
      assetName,
      driftType,
      fieldsDrifted: diffs.map(d => d.field),
      baseline: baseline.snapshot,
      current,
      diff: diffs,
      lastKnownGoodTimestamp: baseline.timestamp,
      rationale: this.generateDriftRationale(assetType, driftType, diffs),
      references: this.generateDriftReferences(assetType, assetId, assetName)
    };
  }

  /**
   * Calculate drift severity based on asset type and changed fields
   */
  private calculateDriftSeverity(
    assetType: DriftFinding['assetType'],
    diffs: DriftDiff[]
  ): HealthSeverity {
    // Critical fields that should trigger high/critical severity
    const criticalFields = ['status', 'enabled', 'active', 'approved', 'compliant'];
    const highPriorityFields = ['steps', 'stages', 'phases', 'parameters', 'configuration'];

    const hasCriticalChange = diffs.some(d => criticalFields.includes(d.field));
    const hasHighPriorityChange = diffs.some(d => highPriorityFields.includes(d.field));

    if (hasCriticalChange) {
      return 'critical';
    }

    if (hasHighPriorityChange || assetType === 'sop' || assetType === 'facility') {
      return 'high';
    }

    if (diffs.length > 5) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Determine drift type
   */
  private determineDriftType(diffs: DriftDiff[]): DriftFinding['driftType'] {
    const hasAdded = diffs.some(d => d.changeType === 'added');
    const hasRemoved = diffs.some(d => d.changeType === 'removed');
    const hasModified = diffs.some(d => d.changeType === 'modified');

    if (hasModified || (hasAdded && hasRemoved)) {
      return 'modified';
    }

    if (hasAdded) {
      return 'added';
    }

    if (hasRemoved) {
      return 'removed';
    }

    return 'version-mismatch';
  }

  /**
   * Generate drift rationale
   */
  private generateDriftRationale(
    assetType: string,
    driftType: string,
    diffs: DriftDiff[]
  ): string {
    const fieldCount = diffs.length;
    const fieldList = diffs.slice(0, 3).map(d => d.field).join(', ');
    const more = fieldCount > 3 ? ` and ${fieldCount - 3} more` : '';

    return `Configuration drift detected in ${assetType}. Type: ${driftType}. Fields changed: ${fieldList}${more}.`;
  }

  /**
   * Generate drift references
   */
  private generateDriftReferences(
    assetType: string,
    assetId: string,
    assetName: string
  ): HealthReference[] {
    const refs: HealthReference[] = [];

    if (assetType === 'sop') {
      refs.push({ type: 'sop', id: assetId, name: assetName });
    } else if (assetType === 'workflow') {
      refs.push({ type: 'workflow', id: assetId, name: assetName });
    } else if (assetType === 'resource') {
      refs.push({ type: 'resource', id: assetId, name: assetName });
    } else if (assetType === 'facility') {
      refs.push({ type: 'facility', id: assetId, name: assetName });
    } else if (assetType === 'sandbox-scenario') {
      refs.push({ type: 'sandbox-scenario', id: assetId, name: assetName });
    } else if (assetType === 'forecast-metadata') {
      refs.push({ type: 'forecast', id: assetId, name: assetName });
    }

    return refs;
  }

  /**
   * Get baseline key
   */
  private getBaselineKey(baselineType: string, assetId: string): string {
    return `${baselineType}:${assetId}`;
  }
}

// ============================================================================
// BASELINE UTILITIES
// ============================================================================

/**
 * Create a baseline snapshot from current state
 */
export function createBaseline(
  tenantId: string,
  baselineType: HealthBaseline['baselineType'],
  asset: Record<string, unknown>,
  createdBy: string,
  facilityId?: string
): HealthBaseline {
  return {
    id: `baseline-${baselineType}-${asset.id}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    tenantId,
    facilityId,
    baselineType,
    assetId: String(asset.id),
    assetName: String(asset.name || asset.id),
    snapshot: { ...asset },
    createdBy,
    approved: false,
    version: String(asset.version || '1.0.0')
  };
}

/**
 * Approve a baseline
 */
export function approveBaseline(
  baseline: HealthBaseline,
  approvedBy: string
): HealthBaseline {
  return {
    ...baseline,
    approved: true,
    approvedBy,
    approvalTimestamp: new Date().toISOString()
  };
}

/**
 * Get all baselines for a tenant/facility
 */
export function filterBaselines(
  baselines: HealthBaseline[],
  tenantId: string,
  facilityId?: string,
  approved?: boolean
): HealthBaseline[] {
  return baselines.filter(b => {
    if (b.tenantId !== tenantId) return false;
    if (facilityId && b.facilityId !== facilityId) return false;
    if (approved !== undefined && b.approved !== approved) return false;
    return true;
  });
}
