/**
 * ORCHESTRATION ENGINE
 * Phase 57: Workload Orchestration & Scheduling Engine
 * 
 * Main orchestrator. Query → Schedule → Policy → Log.
 * 
 * NO GENERATIVE AI. NO PREDICTIONS.
 */

import {
  OrchestrationQuery,
  OrchestrationResult,
  OrchestrationSchedule,
  TaskInput,
  AlertInput,
  OperatorAvailability,
  CapacityWindowInput,
  OrchestrationPolicyContext,
} from './orchestrationTypes';
import { OrchestrationScheduler } from './orchestrationScheduler';
import { OrchestrationPolicyEngine } from './orchestrationPolicyEngine';
import { OrchestrationLog } from './orchestrationLog';

// ============================================================================
// ORCHESTRATION ENGINE
// ============================================================================

export class OrchestrationEngine {
  private scheduler: OrchestrationScheduler;
  private policyEngine: OrchestrationPolicyEngine;
  private log: OrchestrationLog;

  constructor() {
    this.scheduler = new OrchestrationScheduler();
    this.policyEngine = new OrchestrationPolicyEngine();
    this.log = new OrchestrationLog();
  }

  // ==========================================================================
  // MAIN ORCHESTRATION METHOD
  // ==========================================================================

  /**
   * Execute orchestration query
   * 
   * NO GENERATIVE AI. Deterministic schedule from real tasks, alerts, metrics.
   */
  executeQuery(
    query: OrchestrationQuery,
    context: OrchestrationPolicyContext,
    data: {
      tasks: TaskInput[];
      alerts: AlertInput[];
      operators: OperatorAvailability[];
      capacityWindows: CapacityWindowInput[];
    },
  ): OrchestrationResult {
    const computeStart = Date.now();

    try {
      // Step 1: Evaluate policy
      const policyDecision = this.policyEngine.evaluateQueryPolicy(query, context);
      this.log.logPolicyDecision({
        queryId: query.queryId,
        scope: query.scope,
        allowed: policyDecision.allowed,
        reason: policyDecision.reason,
        violations: policyDecision.violations,
        warnings: policyDecision.warnings,
      });

      if (!policyDecision.allowed) {
        return {
          resultId: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          query,
          schedule: this.createEmptySchedule(query),
          summary: {
            totalSlots: 0,
            totalConflicts: 0,
            criticalConflicts: 0,
            totalRecommendations: 0,
            averageCapacityUtilization: 0,
            slaRiskScore: 0,
          },
          references: {
            tasksScheduled: [],
            alertsScheduled: [],
            capacityProjectionsUsed: [],
            metricsUsed: [],
            realTimeSignalsUsed: [],
          },
          metadata: {
            computedAt: new Date().toISOString(),
            computationTimeMs: Date.now() - computeStart,
            dataSourcesQueried: ['policy-engine'],
          },
          success: false,
          error: `Policy violation: ${policyDecision.reason}`,
        };
      }

      // Step 2: Filter data by policy
      const filteredData = this.filterDataByPolicy(data, query, policyDecision.restrictions);

      // Step 3: Generate schedule
      const schedule = this.scheduler.generateSchedule(
        filteredData.tasks,
        filteredData.alerts,
        filteredData.operators,
        filteredData.capacityWindows,
        query.timeRange,
        query.scope,
        query.options || {},
      );

      // Step 4: Log schedule generation
      this.log.logScheduleGenerated({
        schedule,
        slotsGenerated: schedule.slots.length,
        conflictsDetected: schedule.conflicts.length,
      });

      // Step 5: Log conflicts
      for (const conflict of schedule.conflicts) {
        this.log.logConflictDetected({
          conflict,
        });
      }

      // Step 6: Log recommendations
      for (const recommendation of schedule.recommendations) {
        this.log.logRecommendationGenerated({
          recommendation,
        });
      }

      // Step 7: Create result
      const result: OrchestrationResult = {
        resultId: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        query,
        schedule,
        summary: {
          totalSlots: schedule.slots.length,
          totalConflicts: schedule.conflicts.length,
          criticalConflicts: schedule.conflicts.filter(c => c.severity === 'critical').length,
          totalRecommendations: schedule.recommendations.length,
          averageCapacityUtilization:
            schedule.slots.length > 0
              ? schedule.slots.reduce((sum, s) => sum + s.capacityUtilization, 0) / schedule.slots.length
              : 0,
          slaRiskScore: this.calculateSLARiskScore(schedule),
        },
        references: {
          tasksScheduled: filteredData.tasks.map(t => t.taskId),
          alertsScheduled: filteredData.alerts.map(a => a.alertId),
          capacityProjectionsUsed: filteredData.capacityWindows.map(w => w.windowId),
          metricsUsed: [],
          realTimeSignalsUsed: [],
        },
        metadata: {
          computedAt: new Date().toISOString(),
          computationTimeMs: Date.now() - computeStart,
          dataSourcesQueried: ['tasks', 'alerts', 'operators', 'capacity-windows', 'policy-engine'],
        },
        success: true,
      };

      return result;
    } catch (error) {
      this.log.logError({
        scope: query.scope,
        errorCode: 'ORCHESTRATION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: { query, error },
      });

      return {
        resultId: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        query,
        schedule: this.createEmptySchedule(query),
        summary: {
          totalSlots: 0,
          totalConflicts: 0,
          criticalConflicts: 0,
          totalRecommendations: 0,
          averageCapacityUtilization: 0,
          slaRiskScore: 0,
        },
        references: {
          tasksScheduled: [],
          alertsScheduled: [],
          capacityProjectionsUsed: [],
          metricsUsed: [],
          realTimeSignalsUsed: [],
        },
        metadata: {
          computedAt: new Date().toISOString(),
          computationTimeMs: Date.now() - computeStart,
          dataSourcesQueried: ['error'],
        },
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private filterDataByPolicy(
    data: {
      tasks: TaskInput[];
      alerts: AlertInput[];
      operators: OperatorAvailability[];
      capacityWindows: CapacityWindowInput[];
    },
    query: OrchestrationQuery,
    restrictions: string[],
  ): typeof data {
    // Filter by category restrictions
    const allowedCategories = query.categories || [];
    const restrictedCategories = restrictions
      .filter(r => r.startsWith('category:'))
      .map(r => r.replace('category:', ''));

    const filteredCategories = allowedCategories.filter(c => !restrictedCategories.includes(c));

    // Filter tasks
    const filteredTasks = data.tasks.filter(t => {
      // Tenant match
      if (t.scope.tenantId !== query.scope.tenantId) return false;

      // Category match
      if (filteredCategories.length > 0 && !filteredCategories.includes('task-scheduling')) return false;

      // Priority match
      if (query.priorities && query.priorities.length > 0 && !query.priorities.includes(t.priority)) return false;

      return true;
    });

    // Filter alerts
    const filteredAlerts = data.alerts.filter(a => {
      // Tenant match
      if (a.scope.tenantId !== query.scope.tenantId) return false;

      // Category match
      if (filteredCategories.length > 0 && !filteredCategories.includes('alert-follow-up')) return false;

      // Priority match (map severity to priority)
      if (query.priorities && query.priorities.length > 0 && !query.priorities.includes(a.severity as any)) return false;

      return true;
    });

    // Filter operators
    const filteredOperators = data.operators.filter(o => {
      // Tenant match
      if (o.scope.tenantId !== query.scope.tenantId) return false;

      // Operator ID match
      if (query.operatorIds && query.operatorIds.length > 0 && !query.operatorIds.includes(o.operatorId)) return false;

      return true;
    });

    // Filter capacity windows
    const filteredCapacityWindows = data.capacityWindows.filter(w => {
      // Tenant match
      if (w.scope.tenantId !== query.scope.tenantId) return false;

      // Time range overlap
      if (w.windowEnd < query.timeRange.start || w.windowStart > query.timeRange.end) return false;

      return true;
    });

    return {
      tasks: filteredTasks,
      alerts: filteredAlerts,
      operators: filteredOperators,
      capacityWindows: filteredCapacityWindows,
    };
  }

  private createEmptySchedule(query: OrchestrationQuery): OrchestrationSchedule {
    const startTime = new Date(query.timeRange.start);
    const endTime = new Date(query.timeRange.end);
    const durationHours = (endTime.getTime() - startTime.getTime()) / 3600000;
    
    return {
      scheduleId: `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      scope: query.scope,
      timeRange: {
        start: query.timeRange.start,
        end: query.timeRange.end,
        durationHours,
      },
      slots: [],
      conflicts: [],
      recommendations: [],
      operatorSummary: [],
      categorySummary: {
        'task-scheduling': { totalSlots: 0, totalWorkMinutes: 0, criticalCount: 0, highCount: 0 },
        'alert-follow-up': { totalSlots: 0, totalWorkMinutes: 0, criticalCount: 0, highCount: 0 },
        'audit-remediation': { totalSlots: 0, totalWorkMinutes: 0, criticalCount: 0, highCount: 0 },
        'drift-remediation': { totalSlots: 0, totalWorkMinutes: 0, criticalCount: 0, highCount: 0 },
        'governance-issue': { totalSlots: 0, totalWorkMinutes: 0, criticalCount: 0, highCount: 0 },
        'documentation-completeness': { totalSlots: 0, totalWorkMinutes: 0, criticalCount: 0, highCount: 0 },
        'simulation-mismatch': { totalSlots: 0, totalWorkMinutes: 0, criticalCount: 0, highCount: 0 },
        'capacity-aligned-workload': { totalSlots: 0, totalWorkMinutes: 0, criticalCount: 0, highCount: 0 },
      },
      generatedAt: new Date().toISOString(),
      generatedBy: query.requestedBy,
      validUntil: new Date(Date.now() + 3600000).toISOString(),
    };
  }

  private calculateSLARiskScore(schedule: OrchestrationSchedule): number {
    const slaSlots = schedule.slots.filter(s => s.slaDeadline);
    if (slaSlots.length === 0) return 0;

    const atRiskSlots = slaSlots.filter(s => s.slaBuffer && s.slaBuffer < 60);
    const breachedSlots = slaSlots.filter(s => s.slaBuffer && s.slaBuffer < 0);

    const riskScore = ((atRiskSlots.length * 50 + breachedSlots.length * 100) / slaSlots.length);
    return Math.min(riskScore, 100);
  }

  // ==========================================================================
  // LOG ACCESS METHODS
  // ==========================================================================

  getLog(): OrchestrationLog {
    return this.log;
  }

  getStatistics() {
    return this.log.getStatistics();
  }
}
