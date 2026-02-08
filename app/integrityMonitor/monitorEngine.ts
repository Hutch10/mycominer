/**
 * Phase 51: Continuous Integrity Monitor - Main Engine
 * 
 * Orchestrator that coordinates rule evaluation, scheduling, and policy enforcement.
 */

import { MonitorRuleLibrary } from './monitorRuleLibrary';
import { MonitorEvaluator } from './monitorEvaluator';
import { MonitorPolicyEngine } from './monitorPolicyEngine';
import { MonitorScheduler } from './monitorScheduler';
import { MonitorLog } from './monitorLog';
import type {
  MonitorCheck,
  MonitorCycle,
  MonitorResult,
  MonitorAlert,
  MonitorRule,
  MonitorCategory,
  MonitorSeverity,
  MonitorPolicyContext,
  MonitorStatistics,
  MonitorFrequency,
} from './monitorTypes';

// ============================================================================
// MONITOR ENGINE
// ============================================================================

export class MonitorEngine {
  private tenantId: string;
  private ruleLibrary: MonitorRuleLibrary;
  private evaluator: MonitorEvaluator;
  private policyEngine: MonitorPolicyEngine;
  private scheduler: MonitorScheduler;
  private monitorLog: MonitorLog;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.ruleLibrary = new MonitorRuleLibrary(tenantId);
    this.evaluator = new MonitorEvaluator(tenantId);
    this.policyEngine = new MonitorPolicyEngine(tenantId);
    this.scheduler = new MonitorScheduler(tenantId);
    this.monitorLog = new MonitorLog(tenantId);
  }

  // ==========================================================================
  // MAIN MONITORING METHODS
  // ==========================================================================

  /**
   * Execute monitoring check
   */
  public async executeCheck(
    check: MonitorCheck,
    policyContext: MonitorPolicyContext,
    frequency: MonitorFrequency = 'manual'
  ): Promise<MonitorResult> {
    const startTime = Date.now();

    try {
      // Log check
      this.monitorLog.logCheck(check);

      // Authorize check
      const policyDecision = this.policyEngine.authorizeCheck(check, policyContext);

      if (policyDecision.decision === 'deny') {
        return this.createErrorResult(
          check,
          frequency,
          policyDecision.reason,
          startTime,
          policyContext.performedBy
        );
      }

      // Handle partial authorization
      if (policyDecision.decision === 'partial' && policyDecision.allowedCategories) {
        check = {
          ...check,
          categories: policyDecision.allowedCategories,
        };
      }

      // Get rules to evaluate
      const rules = this.getRulesForCheck(check);

      // Evaluate rules
      const allAlerts: MonitorAlert[] = [];
      const evaluatedEngines = new Set<string>();

      for (const rule of rules) {
        const ruleStartTime = Date.now();
        const alerts = await this.evaluator.evaluateRule(rule, check.scope);
        const ruleExecutionTime = Date.now() - ruleStartTime;

        // Log evaluation
        this.monitorLog.logEvaluation(rule, alerts.length === 0, ruleExecutionTime);

        // Log alerts
        for (const alert of alerts) {
          this.monitorLog.logAlert(alert);
          allAlerts.push(alert);
        }

        // Track engine
        if (rule.metadata.sourceEngine) {
          evaluatedEngines.add(rule.metadata.sourceEngine);
        }
      }

      // Apply filters
      const filteredAlerts = this.applyCheckFilters(allAlerts, check);

      // Sort alerts
      const sortedAlerts = this.sortAlerts(filteredAlerts, check);

      // Limit alerts
      const limitedAlerts = check.options?.maxAlerts
        ? sortedAlerts.slice(0, check.options.maxAlerts)
        : sortedAlerts;

      // Count new alerts (in production, compare with previous cycle)
      const newAlerts = limitedAlerts.filter(a => a.status === 'new').length;

      // Create cycle
      const completedAt = new Date().toISOString();
      const cycle: MonitorCycle = {
        cycleId: `cycle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        frequency,
        check,
        alerts: limitedAlerts,
        totalAlerts: allAlerts.length,
        newAlerts,
        summary: {
          alertsByCategory: this.countByCategory(allAlerts),
          alertsBySeverity: this.countBySeverity(allAlerts),
          affectedEntitiesCount: this.countAffectedEntities(allAlerts),
          rulesEvaluated: rules.length,
          rulesPassed: rules.length - this.countFailedRules(allAlerts, rules),
          rulesFailed: this.countFailedRules(allAlerts, rules),
        },
        metadata: {
          executionTime: Date.now() - startTime,
          evaluatedEngines: Array.from(evaluatedEngines),
          scope: check.scope,
          startedAt: new Date(startTime).toISOString(),
          completedAt,
        },
        performedBy: policyContext.performedBy,
      };

      // Log cycle
      this.monitorLog.logCycle(cycle);

      return {
        resultId: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        cycle,
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.monitorLog.logError(check.checkId, errorMessage, errorStack);

      return this.createErrorResult(
        check,
        frequency,
        errorMessage,
        startTime,
        policyContext.performedBy
      );
    }
  }

  // ==========================================================================
  // RULE SELECTION
  // ==========================================================================

  private getRulesForCheck(check: MonitorCheck): MonitorRule[] {
    let rules: MonitorRule[];

    // Check by rule ID
    if (check.ruleIds && check.ruleIds.length > 0) {
      rules = check.ruleIds
        .map(id => this.ruleLibrary.getRule(id))
        .filter((r): r is MonitorRule => r !== null);
    }
    // Check by category
    else if (check.categories && check.categories.length > 0) {
      rules = [];
      for (const category of check.categories) {
        rules.push(...this.ruleLibrary.getRulesByCategory(category));
      }
    }
    // All rules
    else {
      rules = this.ruleLibrary.getAllRules();
    }

    // Filter by severity if specified
    if (check.severities && check.severities.length > 0) {
      rules = rules.filter(r => check.severities!.includes(r.severity));
    }

    return rules;
  }

  // ==========================================================================
  // FILTERING AND SORTING
  // ==========================================================================

  private applyCheckFilters(alerts: MonitorAlert[], check: MonitorCheck): MonitorAlert[] {
    let filtered = [...alerts];

    // Filter by suppressed status
    if (!check.options?.includeSuppressed) {
      filtered = filtered.filter(a => a.status !== 'suppressed');
    }

    return filtered;
  }

  private sortAlerts(alerts: MonitorAlert[], check: MonitorCheck): MonitorAlert[] {
    const sortBy = check.options?.sortBy || 'severity';
    const sortOrder = check.options?.sortOrder || 'desc';

    const sorted = [...alerts].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'severity') {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
        comparison = severityOrder[a.severity] - severityOrder[b.severity];
      } else if (sortBy === 'detectedAt') {
        comparison = new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime();
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  private countByCategory(alerts: MonitorAlert[]): Record<MonitorCategory, number> {
    const counts: Record<MonitorCategory, number> = {
      'governance-drift': 0,
      'governance-lineage-breakage': 0,
      'workflow-sop-drift': 0,
      'documentation-completeness-drift': 0,
      'fabric-link-breakage': 0,
      'cross-engine-metadata-mismatch': 0,
      'health-drift': 0,
      'analytics-pattern-drift': 0,
      'compliance-pack-drift': 0,
    };

    for (const alert of alerts) {
      counts[alert.category]++;
    }

    return counts;
  }

  private countBySeverity(alerts: MonitorAlert[]): Record<MonitorSeverity, number> {
    const counts: Record<MonitorSeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };

    for (const alert of alerts) {
      counts[alert.severity]++;
    }

    return counts;
  }

  private countAffectedEntities(alerts: MonitorAlert[]): number {
    const entityIds = new Set<string>();

    for (const alert of alerts) {
      for (const entity of alert.affectedEntities) {
        entityIds.add(entity.entityId);
      }
    }

    return entityIds.size;
  }

  private countFailedRules(alerts: MonitorAlert[], rules: MonitorRule[]): number {
    const failedRuleIds = new Set<string>();

    for (const alert of alerts) {
      failedRuleIds.add(alert.rule.ruleId);
    }

    return failedRuleIds.size;
  }

  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================

  private createErrorResult(
    check: MonitorCheck,
    frequency: MonitorFrequency,
    errorMessage: string,
    startTime: number,
    performedBy: string
  ): MonitorResult {
    const cycle: MonitorCycle = {
      cycleId: `cycle-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      frequency,
      check,
      alerts: [],
      totalAlerts: 0,
      newAlerts: 0,
      summary: {
        alertsByCategory: {
          'governance-drift': 0,
          'governance-lineage-breakage': 0,
          'workflow-sop-drift': 0,
          'documentation-completeness-drift': 0,
          'fabric-link-breakage': 0,
          'cross-engine-metadata-mismatch': 0,
          'health-drift': 0,
          'analytics-pattern-drift': 0,
          'compliance-pack-drift': 0,
        },
        alertsBySeverity: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          info: 0,
        },
        affectedEntitiesCount: 0,
        rulesEvaluated: 0,
        rulesPassed: 0,
        rulesFailed: 0,
      },
      metadata: {
        executionTime: Date.now() - startTime,
        evaluatedEngines: [],
        scope: check.scope,
        startedAt: new Date(startTime).toISOString(),
        completedAt: new Date().toISOString(),
      },
      performedBy,
    };

    return {
      resultId: `result-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      cycle,
      success: false,
      error: errorMessage,
    };
  }

  // ==========================================================================
  // PUBLIC ACCESSORS
  // ==========================================================================

  public getRuleLibrary(): MonitorRuleLibrary {
    return this.ruleLibrary;
  }

  public getScheduler(): MonitorScheduler {
    return this.scheduler;
  }

  public getMonitorLog(): MonitorLog {
    return this.monitorLog;
  }

  public getStatistics(): MonitorStatistics {
    return this.monitorLog.getStatistics();
  }

  public getPolicyStatistics(): {
    totalDecisions: number;
    allowed: number;
    denied: number;
    partial: number;
  } {
    return this.policyEngine.getPolicyStatistics();
  }

  public cleanup(): void {
    this.scheduler.cleanup();
  }
}
