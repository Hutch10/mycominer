/**
 * Phase 52: Unified Alerting & Notification Center — Alert Aggregator
 * 
 * Groups alerts by category, severity, entity, or engine.
 * Merges duplicates and builds AlertGroup objects.
 */

import type {
  Alert,
  AlertCategory,
  AlertSeverity,
  AlertSource,
  AlertGroup,
  AlertReference,
  AlertEvidence,
} from './alertTypes';

// ============================================================================
// ALERT AGGREGATOR
// ============================================================================

export class AlertAggregator {
  /**
   * Group alerts by category.
   */
  groupByCategory(alerts: Alert[]): AlertGroup[] {
    const grouped = new Map<AlertCategory, Alert[]>();

    for (const alert of alerts) {
      const existing = grouped.get(alert.category) || [];
      existing.push(alert);
      grouped.set(alert.category, existing);
    }

    const groups: AlertGroup[] = [];
    for (const [category, categoryAlerts] of grouped.entries()) {
      groups.push(this.createGroup('category', category, categoryAlerts));
    }

    return groups;
  }

  /**
   * Group alerts by severity.
   */
  groupBySeverity(alerts: Alert[]): AlertGroup[] {
    const grouped = new Map<AlertSeverity, Alert[]>();

    for (const alert of alerts) {
      const existing = grouped.get(alert.severity) || [];
      existing.push(alert);
      grouped.set(alert.severity, existing);
    }

    const groups: AlertGroup[] = [];
    for (const [severity, severityAlerts] of grouped.entries()) {
      groups.push(this.createGroup('severity', severity, severityAlerts));
    }

    return groups;
  }

  /**
   * Group alerts by affected entity.
   */
  groupByEntity(alerts: Alert[]): AlertGroup[] {
    const grouped = new Map<string, Alert[]>();

    for (const alert of alerts) {
      for (const entity of alert.affectedEntities) {
        const key = `${entity.entityType}:${entity.entityId}`;
        const existing = grouped.get(key) || [];
        existing.push(alert);
        grouped.set(key, existing);
      }
    }

    const groups: AlertGroup[] = [];
    for (const [entityKey, entityAlerts] of grouped.entries()) {
      groups.push(this.createGroup('entity', entityKey, entityAlerts));
    }

    return groups;
  }

  /**
   * Group alerts by source engine.
   */
  groupByEngine(alerts: Alert[]): AlertGroup[] {
    const grouped = new Map<AlertSource, Alert[]>();

    for (const alert of alerts) {
      const existing = grouped.get(alert.source) || [];
      existing.push(alert);
      grouped.set(alert.source, existing);
    }

    const groups: AlertGroup[] = [];
    for (const [source, sourceAlerts] of grouped.entries()) {
      groups.push(this.createGroup('engine', source, sourceAlerts));
    }

    return groups;
  }

  /**
   * Merge duplicate alerts based on title, category, and affected entities.
   */
  mergeDuplicates(alerts: Alert[]): Alert[] {
    const uniqueMap = new Map<string, Alert>();

    for (const alert of alerts) {
      const key = this.generateDuplicateKey(alert);
      const existing = uniqueMap.get(key);

      if (existing) {
        // Merge evidence and references
        const mergedEvidence = this.mergeEvidence(existing.evidence || [], alert.evidence || []);
        const mergedReferences = this.mergeReferences(
          existing.relatedReferences,
          alert.relatedReferences
        );

        uniqueMap.set(key, {
          ...existing,
          evidence: mergedEvidence,
          relatedReferences: mergedReferences,
          metadata: {
            ...existing.metadata,
            tags: Array.from(new Set([...(existing.metadata.tags || []), ...(alert.metadata.tags || [])])),
          },
        });
      } else {
        uniqueMap.set(key, alert);
      }
    }

    return Array.from(uniqueMap.values());
  }

  /**
   * Sort alerts deterministically.
   */
  sortAlerts(
    alerts: Alert[],
    sortBy: 'severity' | 'detectedAt' | 'category' | 'source',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Alert[] {
    const sorted = [...alerts];

    sorted.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'severity') {
        comparison = this.compareSeverity(a.severity, b.severity);
      } else if (sortBy === 'detectedAt') {
        comparison = new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime();
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (sortBy === 'source') {
        comparison = a.source.localeCompare(b.source);
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Create an AlertGroup from alerts.
   */
  private createGroup(
    groupType: 'category' | 'severity' | 'entity' | 'engine' | 'custom',
    groupKey: string,
    alerts: Alert[]
  ): AlertGroup {
    const newAlerts = alerts.filter(a => a.status === 'new');

    // Merge all evidence
    const allEvidence: AlertEvidence[] = [];
    for (const alert of alerts) {
      if (alert.evidence) {
        allEvidence.push(...alert.evidence);
      }
    }

    // Merge all references
    const allReferences: AlertReference[] = [];
    const referenceMap = new Map<string, AlertReference>();
    for (const alert of alerts) {
      for (const ref of [...alert.affectedEntities, ...alert.relatedReferences]) {
        referenceMap.set(ref.referenceId, ref);
      }
    }
    allReferences.push(...referenceMap.values());

    // Count affected entities
    const affectedEntitiesSet = new Set<string>();
    for (const alert of alerts) {
      for (const entity of alert.affectedEntities) {
        affectedEntitiesSet.add(`${entity.entityType}:${entity.entityId}`);
      }
    }

    // Count by category and severity
    const alertsByCategory: Record<AlertCategory, number> = {} as any;
    const alertsBySeverity: Record<AlertSeverity, number> = {} as any;

    for (const alert of alerts) {
      alertsByCategory[alert.category] = (alertsByCategory[alert.category] || 0) + 1;
      alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;
    }

    return {
      groupId: `group-${groupType}-${groupKey}-${Date.now()}`,
      groupType,
      groupKey,
      alerts,
      summary: {
        totalAlerts: alerts.length,
        newAlerts: newAlerts.length,
        alertsByCategory,
        alertsBySeverity,
        affectedEntitiesCount: affectedEntitiesSet.size,
      },
      evidence: allEvidence,
      references: allReferences,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        groupedBy: 'system',
      },
    };
  }

  /**
   * Generate duplicate detection key.
   */
  private generateDuplicateKey(alert: Alert): string {
    const entityKeys = alert.affectedEntities
      .map(e => `${e.entityType}:${e.entityId}`)
      .sort()
      .join(',');
    return `${alert.category}:${alert.title}:${entityKeys}`;
  }

  /**
   * Merge evidence arrays.
   */
  private mergeEvidence(existing: AlertEvidence[], incoming: AlertEvidence[]): AlertEvidence[] {
    const merged = [...existing];
    const fieldMap = new Map<string, AlertEvidence>();

    for (const ev of existing) {
      fieldMap.set(ev.field, ev);
    }

    for (const ev of incoming) {
      if (!fieldMap.has(ev.field)) {
        merged.push(ev);
      }
    }

    return merged;
  }

  /**
   * Merge reference arrays.
   */
  private mergeReferences(existing: AlertReference[], incoming: AlertReference[]): AlertReference[] {
    const merged = [...existing];
    const refMap = new Map<string, AlertReference>();

    for (const ref of existing) {
      refMap.set(ref.referenceId, ref);
    }

    for (const ref of incoming) {
      if (!refMap.has(ref.referenceId)) {
        merged.push(ref);
      }
    }

    return merged;
  }

  /**
   * Compare severity levels (critical > high > medium > low > info).
   */
  private compareSeverity(a: AlertSeverity, b: AlertSeverity): number {
    const order: AlertSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];
    return order.indexOf(a) - order.indexOf(b);
  }
}
