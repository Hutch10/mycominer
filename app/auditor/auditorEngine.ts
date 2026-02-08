/**
 * Phase 50: Autonomous System Auditor - Main Engine
 * 
 * Orchestrator that coordinates rule evaluation, policy enforcement, and audit logging.
 * Performs deterministic, read-only compliance audits across all system engines.
 */

import { AuditorRuleLibrary } from './auditorRuleLibrary';
import { AuditorEvaluator } from './auditorEvaluator';
import { AuditorPolicyEngine } from './auditorPolicyEngine';
import { AuditorLog } from './auditorLog';
import type {
  AuditQuery,
  AuditResult,
  AuditFinding,
  AuditRule,
  AuditCategory,
  AuditSeverity,
  AuditPolicyContext,
  AuditPolicyDecision,
  AuditStatistics,
} from './auditorTypes';

// ============================================================================
// AUDITOR ENGINE
// ============================================================================

export class AuditorEngine {
  private tenantId: string;
  private ruleLibrary: AuditorRuleLibrary;
  private evaluator: AuditorEvaluator;
  private policyEngine: AuditorPolicyEngine;
  private auditLog: AuditorLog;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.ruleLibrary = new AuditorRuleLibrary(tenantId);
    this.evaluator = new AuditorEvaluator(tenantId);
    this.policyEngine = new AuditorPolicyEngine(tenantId);
    this.auditLog = new AuditorLog(tenantId);
  }

  // ==========================================================================
  // MAIN AUDIT METHOD
  // ==========================================================================

  /**
   * Execute audit query
   */
  public async executeAudit(
    query: AuditQuery,
    policyContext: AuditPolicyContext
  ): Promise<AuditResult> {
    const startTime = Date.now();

    try {
      // Log query
      this.auditLog.logQuery(query);

      // Authorize audit
      const policyDecision = this.policyEngine.authorizeAudit(query, policyContext);

      if (policyDecision.decision === 'deny') {
        return this.createErrorResult(
          query,
          policyDecision.reason,
          startTime,
          policyContext.performedBy
        );
      }

      // Handle partial authorization (some categories allowed)
      if (policyDecision.decision === 'partial' && policyDecision.allowedCategories) {
        query = {
          ...query,
          categories: policyDecision.allowedCategories,
        };
      }

      // Get rules to evaluate
      const rules = this.getRulesForQuery(query);

      // Evaluate rules
      const allFindings: AuditFinding[] = [];
      const evaluatedEngines = new Set<string>();

      for (const rule of rules) {
        const ruleStartTime = Date.now();
        const findings = await this.evaluator.evaluateRule(rule, query.scope);
        const ruleExecutionTime = Date.now() - ruleStartTime;

        // Log evaluation
        this.auditLog.logEvaluation(rule, findings.length === 0, ruleExecutionTime);

        // Log findings
        for (const finding of findings) {
          this.auditLog.logFinding(finding);
          allFindings.push(finding);
        }

        // Track engine
        if (rule.metadata.sourceEngine) {
          evaluatedEngines.add(rule.metadata.sourceEngine);
        }
      }

      // Apply query filters
      const filteredFindings = this.applyQueryFilters(allFindings, query);

      // Sort findings
      const sortedFindings = this.sortFindings(filteredFindings, query);

      // Limit findings
      const limitedFindings = query.options?.maxFindings
        ? sortedFindings.slice(0, query.options.maxFindings)
        : sortedFindings;

      // Create result
      const result: AuditResult = {
        resultId: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        query,
        findings: limitedFindings,
        totalFindings: allFindings.length,
        summary: {
          findingsByCategory: this.countByCategory(allFindings),
          findingsBySeverity: this.countBySeverity(allFindings),
          affectedEntitiesCount: this.countAffectedEntities(allFindings),
          rulesEvaluated: rules.length,
          rulesPassed: rules.length - this.countFailedRules(allFindings, rules),
          rulesFailed: this.countFailedRules(allFindings, rules),
        },
        metadata: {
          executionTime: Date.now() - startTime,
          evaluatedEngines: Array.from(evaluatedEngines),
          scope: query.scope,
          generatedAt: new Date().toISOString(),
        },
        performedBy: policyContext.performedBy,
      };

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.auditLog.logError(query.queryId, errorMessage, errorStack);

      return this.createErrorResult(
        query,
        errorMessage,
        startTime,
        policyContext.performedBy
      );
    }
  }

  // ==========================================================================
  // RULE SELECTION
  // ==========================================================================

  /**
   * Get rules for query
   */
  private getRulesForQuery(query: AuditQuery): AuditRule[] {
    let rules: AuditRule[];

    // Query by rule ID
    if (query.queryType === 'rule' && query.ruleIds && query.ruleIds.length > 0) {
      rules = query.ruleIds
        .map(id => this.ruleLibrary.getRule(id))
        .filter((r): r is AuditRule => r !== null);
    }
    // Query by category
    else if (query.categories && query.categories.length > 0) {
      rules = [];
      for (const category of query.categories) {
        rules.push(...this.ruleLibrary.getRulesByCategory(category));
      }
    }
    // All rules
    else {
      rules = this.ruleLibrary.getAllRules();
    }

    // Filter by severity if specified
    if (query.severities && query.severities.length > 0) {
      rules = rules.filter(r => query.severities!.includes(r.severity));
    }

    return rules;
  }

  // ==========================================================================
  // FILTERING AND SORTING
  // ==========================================================================

  /**
   * Apply query filters
   */
  private applyQueryFilters(findings: AuditFinding[], query: AuditQuery): AuditFinding[] {
    let filtered = [...findings];

    // Filter by resolved status
    if (!query.options?.includeResolved) {
      filtered = filtered.filter(f => f.status !== 'resolved');
    }

    // Filter by false positive status
    if (!query.options?.includeFalsePositives) {
      filtered = filtered.filter(f => f.status !== 'false-positive');
    }

    // Filter by entity
    if (query.entityIds && query.entityIds.length > 0) {
      filtered = filtered.filter(f =>
        f.affectedEntities.some(e => query.entityIds!.includes(e.entityId))
      );
    }

    return filtered;
  }

  /**
   * Sort findings
   */
  private sortFindings(findings: AuditFinding[], query: AuditQuery): AuditFinding[] {
    const sortBy = query.options?.sortBy || 'severity';
    const sortOrder = query.options?.sortOrder || 'desc';

    const sorted = [...findings].sort((a, b) => {
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

  /**
   * Count findings by category
   */
  private countByCategory(findings: AuditFinding[]): Record<AuditCategory, number> {
    const counts: Record<AuditCategory, number> = {
      'workflow-sop-alignment': 0,
      'governance-correctness': 0,
      'governance-lineage': 0,
      'health-drift-validation': 0,
      'analytics-consistency': 0,
      'documentation-completeness': 0,
      'fabric-integrity': 0,
      'cross-engine-consistency': 0,
      'compliance-pack-validation': 0,
    };

    for (const finding of findings) {
      counts[finding.category]++;
    }

    return counts;
  }

  /**
   * Count findings by severity
   */
  private countBySeverity(findings: AuditFinding[]): Record<AuditSeverity, number> {
    const counts: Record<AuditSeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };

    for (const finding of findings) {
      counts[finding.severity]++;
    }

    return counts;
  }

  /**
   * Count affected entities
   */
  private countAffectedEntities(findings: AuditFinding[]): number {
    const entityIds = new Set<string>();

    for (const finding of findings) {
      for (const entity of finding.affectedEntities) {
        entityIds.add(entity.entityId);
      }
    }

    return entityIds.size;
  }

  /**
   * Count failed rules
   */
  private countFailedRules(findings: AuditFinding[], rules: AuditRule[]): number {
    const failedRuleIds = new Set<string>();

    for (const finding of findings) {
      failedRuleIds.add(finding.rule.ruleId);
    }

    return failedRuleIds.size;
  }

  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================

  /**
   * Create error result
   */
  private createErrorResult(
    query: AuditQuery,
    errorMessage: string,
    startTime: number,
    performedBy: string
  ): AuditResult {
    return {
      resultId: `result-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      query,
      findings: [],
      totalFindings: 0,
      summary: {
        findingsByCategory: {
          'workflow-sop-alignment': 0,
          'governance-correctness': 0,
          'governance-lineage': 0,
          'health-drift-validation': 0,
          'analytics-consistency': 0,
          'documentation-completeness': 0,
          'fabric-integrity': 0,
          'cross-engine-consistency': 0,
          'compliance-pack-validation': 0,
        },
        findingsBySeverity: {
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
        scope: query.scope,
        generatedAt: new Date().toISOString(),
      },
      performedBy,
    };
  }

  // ==========================================================================
  // PUBLIC ACCESSORS
  // ==========================================================================

  /**
   * Get rule library
   */
  public getRuleLibrary(): AuditorRuleLibrary {
    return this.ruleLibrary;
  }

  /**
   * Get audit log
   */
  public getAuditLog(): AuditorLog {
    return this.auditLog;
  }

  /**
   * Get audit statistics
   */
  public getStatistics(): AuditStatistics {
    return this.auditLog.getStatistics();
  }

  /**
   * Get policy statistics
   */
  public getPolicyStatistics(): {
    totalDecisions: number;
    allowed: number;
    denied: number;
    partial: number;
  } {
    return this.policyEngine.getPolicyStatistics();
  }
}
