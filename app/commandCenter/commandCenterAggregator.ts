import {
  CommandCenterState,
  CommandCenterIngestInput,
  SystemHealthSnapshot,
  FacilityHealthSnapshot,
  Alert,
  KPI,
  RecommendedAction,
  UpcomingTask,
  HealthStatus,
  AlertSeverity,
} from './commandCenterTypes';
import { commandCenterLog } from './commandCenterLog';

class CommandCenterAggregator {
  /**
   * Aggregate all phase outputs into a unified Command Center state
   * Pure aggregation - no new business logic
   */
  aggregate(input: CommandCenterIngestInput): CommandCenterState {
    const stateId = `cc-state-${Date.now()}`;
    const generatedAt = new Date().toISOString();

    // Log aggregation event
    commandCenterLog.add({
      entryId: `cc-log-${Date.now()}`,
      timestamp: generatedAt,
      category: 'aggregation',
      message: `Aggregating system state from ${this.countSources(input)} sources`,
      context: {},
      details: {
        strategyProposals: input.strategyProposals?.length || 0,
        workflowPlans: input.workflowPlans?.length || 0,
        optimizationProposals: input.optimizationProposals?.length || 0,
      },
    });

    // Generate facility health snapshots
    const facilityHealth = this.generateFacilityHealth(input);

    // Generate system health snapshot
    const systemHealth = this.generateSystemHealth(input, facilityHealth);

    // Generate alerts
    const alerts = this.generateAlerts(input, facilityHealth);

    // Generate KPIs
    const kpis = this.generateKPIs(input, facilityHealth);

    // Generate recommended actions
    const recommendedActions = this.generateRecommendedActions(input);

    // Generate upcoming tasks
    const upcomingTasks = this.generateUpcomingTasks(input);

    return {
      stateId,
      generatedAt,
      systemHealth,
      facilityHealth,
      alerts,
      kpis,
      recommendedActions,
      upcomingTasks,
      aggregationSources: {
        strategyProposals: input.strategyProposals?.length || 0,
        workflowPlans: input.workflowPlans?.length || 0,
        resourceAllocations: input.resourceSnapshots?.length || 0,
        executionPlans: input.executionStatus?.length || 0,
        optimizationProposals: input.optimizationProposals?.length || 0,
        multiFacilityInsights: input.multiFacilityState?.globalInsights?.length || 0,
      },
      dataFreshness: {
        strategy: generatedAt,
        workflow: generatedAt,
        resources: generatedAt,
        execution: generatedAt,
        optimization: generatedAt,
        multiFacility: generatedAt,
      },
    };
  }

  /**
   * Generate facility health snapshots from multi-facility and execution data
   */
  private generateFacilityHealth(input: CommandCenterIngestInput): FacilityHealthSnapshot[] {
    const facilities = input.multiFacilityState?.facilities || [];

    return facilities.map((facility) => {
      const loadSnapshot = input.multiFacilityState?.loadSnapshots?.find(
        (s) => s.facilityId === facility.facilityId
      );
      const riskSnapshot = input.multiFacilityState?.riskSnapshots?.find(
        (s) => s.facilityId === facility.facilityId
      );
      const executionStatus = input.executionStatus?.find(
        (s) => s.facilityId === facility.facilityId
      );
      const telemetry = input.telemetry?.find((t) => t.facilityId === facility.facilityId);

      const loadPercent = loadSnapshot?.currentLoadPercent || 0;
      const contaminationRisk = riskSnapshot?.contaminationRiskScore || 0;
      const energyUsageKwh = telemetry?.energyKwh || 0;
      const energyBudgetPercent = (energyUsageKwh / facility.energyBudgetKwh) * 100;

      // Determine health status
      let status: HealthStatus = 'healthy';
      const alertMessages: string[] = [];

      if (contaminationRisk > 70 || energyBudgetPercent > 90 || loadPercent > 85) {
        status = 'critical';
        if (contaminationRisk > 70) alertMessages.push('High contamination risk');
        if (energyBudgetPercent > 90) alertMessages.push('Energy budget exceeded');
        if (loadPercent > 85) alertMessages.push('Near capacity');
      } else if (contaminationRisk > 50 || energyBudgetPercent > 75 || loadPercent > 70) {
        status = 'warning';
        if (contaminationRisk > 50) alertMessages.push('Elevated contamination risk');
        if (energyBudgetPercent > 75) alertMessages.push('Energy usage high');
        if (loadPercent > 70) alertMessages.push('High utilization');
      }

      return {
        facilityId: facility.facilityId,
        facilityName: facility.name,
        status,
        loadPercent,
        contaminationRisk,
        energyUsageKwh,
        energyBudgetPercent: Math.round(energyBudgetPercent),
        activeSpecies: [], // Would be populated from load snapshot
        activeBatches: 0, // Would be populated from execution
        pendingTasks: executionStatus?.activeTasks || 0,
        alerts: alertMessages,
        lastUpdate: telemetry?.timestamp || new Date().toISOString(),
      };
    });
  }

  /**
   * Generate system-wide health snapshot
   */
  private generateSystemHealth(
    input: CommandCenterIngestInput,
    facilityHealth: FacilityHealthSnapshot[]
  ): SystemHealthSnapshot {
    const snapshotId = `sys-health-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Count facilities by status
    const criticalFacilities = facilityHealth.filter((f) => f.status === 'critical').length;
    const warningFacilities = facilityHealth.filter((f) => f.status === 'warning').length;
    const healthyFacilities = facilityHealth.filter((f) => f.status === 'healthy').length;

    // Determine overall system status
    let overallStatus: HealthStatus = 'healthy';
    if (criticalFacilities > 0) {
      overallStatus = 'critical';
    } else if (warningFacilities > 0) {
      overallStatus = 'warning';
    }

    // Aggregate KPIs
    const totalEnergyUsageKwh = facilityHealth.reduce((sum, f) => sum + f.energyUsageKwh, 0);
    const totalEnergyBudget = (input.multiFacilityState?.facilities || []).reduce(
      (sum, f) => sum + f.energyBudgetKwh,
      0
    );
    const energyBudgetUtilization =
      totalEnergyBudget > 0 ? (totalEnergyUsageKwh / totalEnergyBudget) * 100 : 0;

    const averageContaminationRisk =
      facilityHealth.length > 0
        ? facilityHealth.reduce((sum, f) => sum + f.contaminationRisk, 0) / facilityHealth.length
        : 0;

    const averageLoadPercent =
      facilityHealth.length > 0
        ? facilityHealth.reduce((sum, f) => sum + f.loadPercent, 0) / facilityHealth.length
        : 0;

    const pendingProposals =
      (input.strategyProposals?.filter((p) => p.status === 'draft').length || 0) +
      (input.optimizationProposals?.filter((p) => p.status === 'draft').length || 0);

    const approvedProposals =
      (input.strategyProposals?.filter((p) => p.status === 'approved').length || 0) +
      (input.optimizationProposals?.filter((p) => p.status === 'approved').length || 0);

    const executingTasks =
      input.executionStatus?.reduce((sum, e) => sum + e.activeTasks, 0) || 0;

    return {
      snapshotId,
      timestamp,
      overallStatus,
      systemUptime: '99.8%', // Mock - would come from monitoring
      activeAlerts: 0, // Will be set after alerts are generated
      criticalAlerts: 0,
      totalFacilities: facilityHealth.length,
      healthyFacilities,
      facilitiesAtRisk: warningFacilities + criticalFacilities,
      globalKPIs: {
        totalEnergyUsageKwh: Math.round(totalEnergyUsageKwh),
        energyBudgetUtilization: Math.round(energyBudgetUtilization),
        totalYieldKg: 0, // Would be calculated from execution history
        averageContaminationRisk: Math.round(averageContaminationRisk),
        averageLoadPercent: Math.round(averageLoadPercent),
        pendingProposals,
        approvedProposals,
        executingTasks,
      },
      confidence: 85,
    };
  }

  /**
   * Generate alerts from facility health and multi-facility insights
   */
  private generateAlerts(
    input: CommandCenterIngestInput,
    facilityHealth: FacilityHealthSnapshot[]
  ): Alert[] {
    const alerts: Alert[] = [];

    // Facility-level alerts
    facilityHealth.forEach((facility) => {
      // Critical contamination alert
      if (facility.contaminationRisk > 70) {
        alerts.push({
          alertId: `alert-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          severity: 'critical',
          category: 'contamination',
          facilityId: facility.facilityId,
          title: `Critical Contamination Risk: ${facility.facilityName}`,
          description: `Contamination risk at ${facility.contaminationRisk}% (threshold: 70%)`,
          source: 'multi-facility-engine',
          actionRequired: true,
          suggestedAction: 'Implement contamination isolation protocols immediately',
          acknowledged: false,
        });
      }

      // Energy budget alert
      if (facility.energyBudgetPercent > 90) {
        alerts.push({
          alertId: `alert-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          severity: 'critical',
          category: 'energy',
          facilityId: facility.facilityId,
          title: `Energy Budget Exceeded: ${facility.facilityName}`,
          description: `Using ${facility.energyBudgetPercent}% of energy budget`,
          source: 'resource-engine',
          actionRequired: true,
          suggestedAction: 'Reduce energy-intensive operations or request budget increase',
          acknowledged: false,
        });
      }

      // High load alert
      if (facility.loadPercent > 85) {
        alerts.push({
          alertId: `alert-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          severity: 'warning',
          category: 'resource',
          facilityId: facility.facilityId,
          title: `Near Capacity: ${facility.facilityName}`,
          description: `Facility at ${facility.loadPercent}% utilization`,
          source: 'multi-facility-engine',
          actionRequired: true,
          suggestedAction: 'Defer non-critical batches or redistribute to other facilities',
          acknowledged: false,
        });
      }
    });

    // Multi-facility insight alerts
    input.multiFacilityState?.globalInsights?.forEach((insight) => {
      let severity: AlertSeverity = 'info';
      if (insight.severity === 'warning') severity = 'warning';
      if (insight.severity === 'critical') severity = 'critical';

      alerts.push({
        alertId: `alert-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        severity,
        category: 'system',
        title: `Global Insight: ${insight.type}`,
        description: `Multi-facility pattern detected across ${insight.affectedFacilities.length} facilities`,
        source: 'multi-facility-engine',
        actionRequired: severity !== 'info',
        acknowledged: false,
      });
    });

    // Log alerts
    alerts.forEach((alert) => {
      if (alert.severity === 'critical' || alert.severity === 'warning') {
        commandCenterLog.add({
          entryId: `cc-log-${Date.now()}-${Math.random()}`,
          timestamp: alert.timestamp,
          category: 'alert-generated',
          message: `${alert.severity.toUpperCase()}: ${alert.title}`,
          context: {
            alertId: alert.alertId,
            facilityId: alert.facilityId,
          },
          details: { severity: alert.severity, category: alert.category },
        });
      }
    });

    return alerts;
  }

  /**
   * Generate KPIs from aggregated data
   */
  private generateKPIs(
    input: CommandCenterIngestInput,
    facilityHealth: FacilityHealthSnapshot[]
  ): KPI[] {
    const kpis: KPI[] = [];
    const now = new Date().toISOString();

    // Energy KPI
    const totalEnergy = facilityHealth.reduce((sum, f) => sum + f.energyUsageKwh, 0);
    const energyBudget = (input.multiFacilityState?.facilities || []).reduce(
      (sum, f) => sum + f.energyBudgetKwh,
      0
    );
    const energyUtilization = (totalEnergy / energyBudget) * 100;

    kpis.push({
      kpiId: 'kpi-energy',
      name: 'Energy Utilization',
      category: 'energy',
      currentValue: Math.round(energyUtilization),
      unit: '%',
      target: 80,
      threshold: { warning: 85, critical: 95 },
      trend: 'stable',
      trendPercent: 0,
      status: energyUtilization > 95 ? 'critical' : energyUtilization > 85 ? 'warning' : 'healthy',
      lastUpdate: now,
    });

    // Contamination Risk KPI
    const avgContaminationRisk =
      facilityHealth.length > 0
        ? facilityHealth.reduce((sum, f) => sum + f.contaminationRisk, 0) / facilityHealth.length
        : 0;

    kpis.push({
      kpiId: 'kpi-contamination',
      name: 'Average Contamination Risk',
      category: 'contamination',
      currentValue: Math.round(avgContaminationRisk),
      unit: 'score',
      target: 30,
      threshold: { warning: 50, critical: 70 },
      trend: 'stable',
      trendPercent: 0,
      status:
        avgContaminationRisk > 70 ? 'critical' : avgContaminationRisk > 50 ? 'warning' : 'healthy',
      lastUpdate: now,
    });

    // Load/Utilization KPI
    const avgLoad =
      facilityHealth.length > 0
        ? facilityHealth.reduce((sum, f) => sum + f.loadPercent, 0) / facilityHealth.length
        : 0;

    kpis.push({
      kpiId: 'kpi-load',
      name: 'System Load',
      category: 'efficiency',
      currentValue: Math.round(avgLoad),
      unit: '%',
      target: 70,
      threshold: { warning: 80, critical: 90 },
      trend: 'stable',
      trendPercent: 0,
      status: avgLoad > 90 ? 'critical' : avgLoad > 80 ? 'warning' : 'healthy',
      lastUpdate: now,
    });

    // Execution Efficiency KPI
    const totalCompleted =
      input.executionStatus?.reduce((sum, e) => sum + e.completedToday, 0) || 0;
    const totalFailed = input.executionStatus?.reduce((sum, e) => sum + e.failedToday, 0) || 0;
    const successRate = totalCompleted > 0 ? (totalCompleted / (totalCompleted + totalFailed)) * 100 : 100;

    kpis.push({
      kpiId: 'kpi-execution',
      name: 'Execution Success Rate',
      category: 'efficiency',
      currentValue: Math.round(successRate),
      unit: '%',
      target: 95,
      threshold: { warning: 85, critical: 75 },
      trend: 'stable',
      trendPercent: 0,
      status: successRate < 75 ? 'critical' : successRate < 85 ? 'warning' : 'healthy',
      lastUpdate: now,
    });

    return kpis;
  }

  /**
   * Generate recommended actions from proposals across all engines
   */
  private generateRecommendedActions(input: CommandCenterIngestInput): RecommendedAction[] {
    const actions: RecommendedAction[] = [];

    // Strategy proposals
    input.strategyProposals
      ?.filter((p) => p.status === 'draft')
      .forEach((proposal) => {
        actions.push({
          actionId: `action-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          priority: proposal.confidence > 80 ? 'high' : proposal.confidence > 60 ? 'medium' : 'low',
          source: 'strategy-engine',
          sourceProposalId: proposal.proposalId,
          title: `Review ${proposal.category} Strategy`,
          description: `Strategy proposal pending approval`,
          rationale: `Confidence: ${proposal.confidence}%`,
          affectedFacilities: proposal.affectedFacilities,
          estimatedImpact: {},
          implementationEffort: 'medium',
          requiresApproval: true,
          status: 'pending',
        });
      });

    // Optimization proposals
    input.optimizationProposals
      ?.filter((p) => p.status === 'draft')
      .forEach((proposal) => {
        actions.push({
          actionId: `action-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          priority: proposal.confidence > 80 ? 'high' : 'medium',
          source: 'optimization-engine',
          sourceProposalId: proposal.proposalId,
          title: `${proposal.category.replace(/-/g, ' ').toUpperCase()} Optimization`,
          description: `Optimization opportunity identified`,
          rationale: `Confidence: ${proposal.confidence}%`,
          affectedFacilities: proposal.affectedFacilities,
          estimatedImpact: {
            energyReduction: proposal.expectedBenefit.globalEnergyReduction,
            yieldIncrease: proposal.expectedBenefit.globalYieldIncrease,
            costSaving: proposal.expectedBenefit.globalCostSaving,
          },
          implementationEffort: 'medium',
          requiresApproval: true,
          status: 'pending',
        });
      });

    return actions.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate upcoming tasks from workflow schedules
   */
  private generateUpcomingTasks(input: CommandCenterIngestInput): UpcomingTask[] {
    const tasks: UpcomingTask[] = [];

    input.workflowPlans?.forEach((plan) => {
      plan.scheduledTasks?.slice(0, 5).forEach((task) => {
        tasks.push({
          taskId: task.taskId,
          facilityId: plan.facilityId,
          title: task.title,
          description: `Scheduled workflow task`,
          scheduledStart: task.scheduledStartTime,
          estimatedDurationHours: Math.round(task.estimatedDurationMinutes / 60),
          priority: task.priority === 'high' ? 'high' : task.priority === 'medium' ? 'medium' : 'low',
          status: task.status as any,
          dependencies: task.dependencies,
          resources: {
            laborHours: Math.round(task.estimatedDurationMinutes / 60),
            equipment: [],
          },
          source: plan.planId,
        });
      });
    });

    // Sort by scheduled start time
    return tasks.sort(
      (a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime()
    );
  }

  private countSources(input: CommandCenterIngestInput): number {
    let count = 0;
    if (input.strategyProposals?.length) count++;
    if (input.workflowPlans?.length) count++;
    if (input.resourceSnapshots?.length) count++;
    if (input.executionStatus?.length) count++;
    if (input.optimizationProposals?.length) count++;
    if (input.multiFacilityState) count++;
    return count;
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alert: Alert, userId: string): Alert {
    const acknowledged = {
      ...alert,
      acknowledged: true,
      acknowledgedBy: userId,
      acknowledgedAt: new Date().toISOString(),
    };

    commandCenterLog.add({
      entryId: `cc-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'alert-acknowledged',
      message: `Alert acknowledged: ${alert.title}`,
      context: {
        alertId: alert.alertId,
        userId,
      },
    });

    return acknowledged;
  }

  /**
   * Approve a recommended action
   */
  approveAction(action: RecommendedAction, userId: string): RecommendedAction {
    const approved = {
      ...action,
      status: 'approved' as const,
      approvedBy: userId,
      approvedAt: new Date().toISOString(),
    };

    commandCenterLog.add({
      entryId: `cc-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'action-approved',
      message: `Action approved: ${action.title}`,
      context: {
        actionId: action.actionId,
        userId,
      },
    });

    return approved;
  }

  /**
   * Reject a recommended action
   */
  rejectAction(action: RecommendedAction, userId: string, reason: string): RecommendedAction {
    const rejected = {
      ...action,
      status: 'rejected' as const,
    };

    commandCenterLog.add({
      entryId: `cc-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'action-rejected',
      message: `Action rejected: ${reason}`,
      context: {
        actionId: action.actionId,
        userId,
      },
    });

    return rejected;
  }
}

export const commandCenterAggregator = new CommandCenterAggregator();
