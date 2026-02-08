/**
 * Export Builder
 * Phase 60: Enterprise Export Hub & External Compliance Distribution Center
 * 
 * Assembles deterministic export bundles from operational data (Phases 50-59).
 * 
 * CONSTRAINTS:
 * - All content derived from real engine outputs
 * - NO generative AI or synthetic data
 * - Deterministic bundle assembly
 * - Scope-based filtering (tenant, facility)
 */

import {
  ExportQuery,
  ExportBundle,
  ExportContentSection,
  ExportContentItem,
  ExportReferences,
  ExportMetadata,
  ExportDataInput,
  ExportCategory,
} from './exportTypes';

export class ExportBuilder {
  /**
   * Build export bundle
   * 
   * Main entry point for bundle assembly.
   */
  buildExportBundle(
    query: ExportQuery,
    data: ExportDataInput,
    startTime: number
  ): ExportBundle {
    const bundleId = `export-bundle-${Date.now()}`;
    const exportId = query.queryId;
    
    // Filter data by scope
    const filteredData = this.filterByScope(data, query.scope);
    
    // Build sections based on category
    const sections = this.buildSections(query.category, filteredData, query);
    
    // Assemble references
    const references = this.assembleReferences(filteredData);
    
    // Generate metadata
    const metadata = this.generateMetadata(
      query,
      sections,
      references,
      startTime
    );
    
    // Generate title and description
    const { title, description } = this.generateTitleAndDescription(
      query.category,
      query.scope
    );
    
    return {
      bundleId,
      exportId,
      title,
      description,
      category: query.category,
      format: query.format,
      scope: query.scope,
      timeRange: query.timeRange || this.getDefaultTimeRange(),
      sections,
      references,
      metadata,
    };
  }
  
  /**
   * Build sections based on category
   */
  private buildSections(
    category: ExportCategory,
    data: ExportDataInput,
    query: ExportQuery
  ): ExportContentSection[] {
    switch (category) {
      case 'compliance-pack':
        return this.buildCompliancePackSections(data, query);
      case 'executive-summary':
        return this.buildExecutiveSummarySections(data, query);
      case 'operational-snapshot':
        return this.buildOperationalSnapshotSections(data, query);
      case 'audit-findings':
        return this.buildAuditFindingsSections(data, query);
      case 'drift-logs':
        return this.buildDriftLogsSections(data, query);
      case 'alert-logs':
        return this.buildAlertLogsSections(data, query);
      case 'task-logs':
        return this.buildTaskLogsSections(data, query);
      case 'operator-analytics':
        return this.buildOperatorAnalyticsSections(data, query);
      case 'real-time-metrics':
        return this.buildRealTimeMetricsSections(data, query);
      case 'capacity-forecasts':
        return this.buildCapacityForecastsSections(data, query);
      case 'schedules':
        return this.buildSchedulesSections(data, query);
      case 'insights':
        return this.buildInsightsSections(data, query);
      case 'reports':
        return this.buildReportsSections(data, query);
      case 'full-operational':
        return this.buildFullOperationalSections(data, query);
      default:
        return [];
    }
  }
  
  /**
   * Build compliance pack sections
   * 
   * Includes: audit findings, drift logs, SLA compliance, documentation
   */
  private buildCompliancePackSections(
    data: ExportDataInput,
    query: ExportQuery
  ): ExportContentSection[] {
    const sections: ExportContentSection[] = [];
    
    // Section 1: Audit Findings
    if (data.auditFindings && data.auditFindings.length > 0) {
      const items: ExportContentItem[] = data.auditFindings.map(finding => ({
        itemId: finding.auditFindingId,
        itemType: 'audit-finding',
        timestamp: finding.foundAt,
        data: finding,
        references: [],
      }));
      
      sections.push({
        sectionId: 'compliance-audit-findings',
        title: 'Audit Findings',
        description: 'Audit findings and compliance issues',
        dataSource: 'Phase 50: Audit & Governance Engine',
        summary: `Total findings: ${data.auditFindings.length}. Critical: ${data.auditFindings.filter(f => f.severity === 'critical').length}. Resolved: ${data.auditFindings.filter(f => f.status === 'resolved').length}.`,
        items,
        itemCount: items.length,
        generatedAt: new Date().toISOString(),
      });
    }
    
    // Section 2: Drift Events
    if (data.driftEvents && data.driftEvents.length > 0) {
      const items: ExportContentItem[] = data.driftEvents.map(drift => ({
        itemId: drift.driftId,
        itemType: 'drift-event',
        timestamp: drift.detectedAt,
        data: drift,
        references: [],
      }));
      
      const criticalDrifts = data.driftEvents.filter(d => d.severity >= 80).length;
      
      sections.push({
        sectionId: 'compliance-drift-events',
        title: 'Environmental Drift Events',
        description: 'Environmental integrity monitoring and drift detection',
        dataSource: 'Phase 51: Drift Detection Engine',
        summary: `Total drift events: ${data.driftEvents.length}. Critical (severity ≥80): ${criticalDrifts}. Average severity: ${(data.driftEvents.reduce((sum, d) => sum + d.severity, 0) / data.driftEvents.length).toFixed(1)}.`,
        items,
        itemCount: items.length,
        generatedAt: new Date().toISOString(),
      });
    }
    
    // Section 3: SLA Compliance (from tasks and alerts)
    const slaItems: ExportContentItem[] = [];
    
    if (data.tasks && data.tasks.length > 0) {
      const tasksWithSLA = data.tasks.filter(t => t.slaDeadline);
      tasksWithSLA.forEach(task => {
        slaItems.push({
          itemId: task.taskId,
          itemType: 'task-sla',
          timestamp: task.createdAt,
          data: {
            ...task,
            slaStatus: this.calculateSLAStatus(task.completedAt, task.slaDeadline),
          },
          references: [],
        });
      });
    }
    
    if (data.alerts && data.alerts.length > 0) {
      const alertsWithSLA = data.alerts.filter(a => a.slaDeadline);
      alertsWithSLA.forEach(alert => {
        slaItems.push({
          itemId: alert.alertId,
          itemType: 'alert-sla',
          timestamp: alert.createdAt,
          data: {
            ...alert,
            slaStatus: this.calculateSLAStatus(alert.resolvedAt, alert.slaDeadline),
          },
          references: [],
        });
      });
    }
    
    if (slaItems.length > 0) {
      const metCount = slaItems.filter(item => item.data.slaStatus === 'met').length;
      const breachedCount = slaItems.filter(item => item.data.slaStatus === 'breached').length;
      const complianceRate = ((metCount / slaItems.length) * 100).toFixed(1);
      
      sections.push({
        sectionId: 'compliance-sla',
        title: 'SLA Compliance',
        description: 'Service Level Agreement compliance tracking',
        dataSource: 'Phase 52: Alerts, Phase 53: Tasks',
        summary: `Total SLA items: ${slaItems.length}. Met: ${metCount}. Breached: ${breachedCount}. Compliance rate: ${complianceRate}%.`,
        items: slaItems,
        itemCount: slaItems.length,
        generatedAt: new Date().toISOString(),
      });
    }
    
    return sections;
  }
  
  /**
   * Build executive summary sections
   */
  private buildExecutiveSummarySections(
    data: ExportDataInput,
    query: ExportQuery
  ): ExportContentSection[] {
    const sections: ExportContentSection[] = [];
    
    // Section 1: Executive Insights (Phase 58)
    if (data.insights && data.insights.length > 0) {
      const items: ExportContentItem[] = data.insights.map(insight => ({
        itemId: insight.insightId,
        itemType: 'executive-insight',
        timestamp: insight.timestamp,
        data: insight,
        references: [],
      }));
      
      sections.push({
        sectionId: 'executive-insights',
        title: 'Executive Insights',
        description: 'Strategic insights and executive-level analysis',
        dataSource: 'Phase 58: Executive Insights & Enterprise Reporting Center',
        summary: `${data.insights.length} insights generated. Critical: ${data.insights.filter(i => i.severity === 'critical').length}.`,
        items,
        itemCount: items.length,
        generatedAt: new Date().toISOString(),
      });
    }
    
    // Section 2: Enterprise Reports (Phase 59)
    if (data.reports && data.reports.length > 0) {
      const items: ExportContentItem[] = data.reports.map(report => ({
        itemId: report.reportId,
        itemType: 'enterprise-report',
        timestamp: report.generatedAt,
        data: report,
        references: [],
      }));
      
      sections.push({
        sectionId: 'enterprise-reports',
        title: 'Enterprise Reports',
        description: 'Comprehensive enterprise reporting and analytics',
        dataSource: 'Phase 59: Enterprise Reporting & Compliance Pack Generator',
        summary: `${data.reports.length} reports available.`,
        items,
        itemCount: items.length,
        generatedAt: new Date().toISOString(),
      });
    }
    
    return sections;
  }
  
  /**
   * Build operational snapshot sections
   */
  private buildOperationalSnapshotSections(
    data: ExportDataInput,
    query: ExportQuery
  ): ExportContentSection[] {
    const sections: ExportContentSection[] = [];
    
    // Include: tasks, alerts, schedules, capacity projections
    
    // Tasks
    if (data.tasks && data.tasks.length > 0) {
      sections.push(this.createTaskSection(data.tasks));
    }
    
    // Alerts
    if (data.alerts && data.alerts.length > 0) {
      sections.push(this.createAlertSection(data.alerts));
    }
    
    // Schedules
    if (data.schedules && data.schedules.length > 0) {
      sections.push(this.createScheduleSection(data.schedules));
    }
    
    // Capacity Projections
    if (data.capacityProjections && data.capacityProjections.length > 0) {
      sections.push(this.createCapacitySection(data.capacityProjections));
    }
    
    return sections;
  }
  
  /**
   * Build audit findings sections
   */
  private buildAuditFindingsSections(
    data: ExportDataInput,
    query: ExportQuery
  ): ExportContentSection[] {
    if (!data.auditFindings || data.auditFindings.length === 0) {
      return [];
    }
    
    const items: ExportContentItem[] = data.auditFindings.map(finding => ({
      itemId: finding.auditFindingId,
      itemType: 'audit-finding',
      timestamp: finding.foundAt,
      data: finding,
      references: [],
    }));
    
    return [{
      sectionId: 'audit-findings',
      title: 'Audit Findings',
      description: 'Complete audit findings log',
      dataSource: 'Phase 50: Audit & Governance Engine',
      summary: `${data.auditFindings.length} findings. Critical: ${data.auditFindings.filter(f => f.severity === 'critical').length}.`,
      items,
      itemCount: items.length,
      generatedAt: new Date().toISOString(),
    }];
  }
  
  /**
   * Build drift logs sections
   */
  private buildDriftLogsSections(
    data: ExportDataInput,
    query: ExportQuery
  ): ExportContentSection[] {
    if (!data.driftEvents || data.driftEvents.length === 0) {
      return [];
    }
    
    const items: ExportContentItem[] = data.driftEvents.map(drift => ({
      itemId: drift.driftId,
      itemType: 'drift-event',
      timestamp: drift.detectedAt,
      data: drift,
      references: [],
    }));
    
    return [{
      sectionId: 'drift-logs',
      title: 'Drift Event Logs',
      description: 'Environmental drift detection log',
      dataSource: 'Phase 51: Drift Detection Engine',
      summary: `${data.driftEvents.length} drift events. Average severity: ${(data.driftEvents.reduce((sum, d) => sum + d.severity, 0) / data.driftEvents.length).toFixed(1)}.`,
      items,
      itemCount: items.length,
      generatedAt: new Date().toISOString(),
    }];
  }
  
  /**
   * Build alert logs sections
   */
  private buildAlertLogsSections(
    data: ExportDataInput,
    query: ExportQuery
  ): ExportContentSection[] {
    if (!data.alerts || data.alerts.length === 0) {
      return [];
    }
    
    return [this.createAlertSection(data.alerts)];
  }
  
  /**
   * Build task logs sections
   */
  private buildTaskLogsSections(
    data: ExportDataInput,
    query: ExportQuery
  ): ExportContentSection[] {
    if (!data.tasks || data.tasks.length === 0) {
      return [];
    }
    
    return [this.createTaskSection(data.tasks)];
  }
  
  /**
   * Build operator analytics sections
   */
  private buildOperatorAnalyticsSections(
    data: ExportDataInput,
    query: ExportQuery
  ): ExportContentSection[] {
    if (!data.operatorMetrics || data.operatorMetrics.length === 0) {
      return [];
    }
    
    const items: ExportContentItem[] = data.operatorMetrics.map(metric => ({
      itemId: metric.metricId,
      itemType: 'operator-metric',
      timestamp: metric.timestamp,
      data: metric,
      references: [],
    }));
    
    const avgUtilization = (data.operatorMetrics.reduce((sum, m) => sum + m.utilizationRate, 0) / data.operatorMetrics.length).toFixed(1);
    const avgCompletion = (data.operatorMetrics.reduce((sum, m) => sum + m.taskCompletionRate, 0) / data.operatorMetrics.length).toFixed(1);
    
    return [{
      sectionId: 'operator-analytics',
      title: 'Operator Performance Analytics',
      description: 'Workforce performance metrics and analytics',
      dataSource: 'Phase 54: Operator & Team Performance Engine',
      summary: `${data.operatorMetrics.length} operator metrics. Average utilization: ${avgUtilization}%. Average completion rate: ${avgCompletion}%.`,
      items,
      itemCount: items.length,
      generatedAt: new Date().toISOString(),
    }];
  }
  
  /**
   * Build real-time metrics sections
   */
  private buildRealTimeMetricsSections(
    data: ExportDataInput,
    query: ExportQuery
  ): ExportContentSection[] {
    if (!data.realTimeSignals || data.realTimeSignals.length === 0) {
      return [];
    }
    
    const items: ExportContentItem[] = data.realTimeSignals.map(signal => ({
      itemId: signal.signalId,
      itemType: 'real-time-signal',
      timestamp: signal.timestamp,
      data: signal,
      references: [],
    }));
    
    return [{
      sectionId: 'real-time-metrics',
      title: 'Real-Time Telemetry Metrics',
      description: 'Real-time environmental and operational signals',
      dataSource: 'Phase 55: Real-Time Telemetry & Signal Processing',
      summary: `${data.realTimeSignals.length} real-time signals captured.`,
      items,
      itemCount: items.length,
      generatedAt: new Date().toISOString(),
    }];
  }
  
  /**
   * Build capacity forecasts sections
   */
  private buildCapacityForecastsSections(
    data: ExportDataInput,
    query: ExportQuery
  ): ExportContentSection[] {
    if (!data.capacityProjections || data.capacityProjections.length === 0) {
      return [];
    }
    
    return [this.createCapacitySection(data.capacityProjections)];
  }
  
  /**
   * Build schedules sections
   */
  private buildSchedulesSections(
    data: ExportDataInput,
    query: ExportQuery
  ): ExportContentSection[] {
    if (!data.schedules || data.schedules.length === 0) {
      return [];
    }
    
    return [this.createScheduleSection(data.schedules)];
  }
  
  /**
   * Build insights sections
   */
  private buildInsightsSections(
    data: ExportDataInput,
    query: ExportQuery
  ): ExportContentSection[] {
    if (!data.insights || data.insights.length === 0) {
      return [];
    }
    
    const items: ExportContentItem[] = data.insights.map(insight => ({
      itemId: insight.insightId,
      itemType: 'insight',
      timestamp: insight.timestamp,
      data: insight,
      references: [],
    }));
    
    return [{
      sectionId: 'insights',
      title: 'Executive Insights',
      description: 'Strategic insights and executive-level analysis',
      dataSource: 'Phase 58: Executive Insights & Enterprise Reporting Center',
      summary: `${data.insights.length} insights. Critical: ${data.insights.filter(i => i.severity === 'critical').length}.`,
      items,
      itemCount: items.length,
      generatedAt: new Date().toISOString(),
    }];
  }
  
  /**
   * Build reports sections
   */
  private buildReportsSections(
    data: ExportDataInput,
    query: ExportQuery
  ): ExportContentSection[] {
    if (!data.reports || data.reports.length === 0) {
      return [];
    }
    
    const items: ExportContentItem[] = data.reports.map(report => ({
      itemId: report.reportId,
      itemType: 'report',
      timestamp: report.generatedAt,
      data: report,
      references: [],
    }));
    
    return [{
      sectionId: 'reports',
      title: 'Enterprise Reports',
      description: 'Comprehensive enterprise reporting',
      dataSource: 'Phase 59: Enterprise Reporting & Compliance Pack Generator',
      summary: `${data.reports.length} reports generated.`,
      items,
      itemCount: items.length,
      generatedAt: new Date().toISOString(),
    }];
  }
  
  /**
   * Build full operational sections
   */
  private buildFullOperationalSections(
    data: ExportDataInput,
    query: ExportQuery
  ): ExportContentSection[] {
    const sections: ExportContentSection[] = [];
    
    // Include everything from all phases
    if (data.auditFindings && data.auditFindings.length > 0) {
      sections.push(...this.buildAuditFindingsSections(data, query));
    }
    if (data.driftEvents && data.driftEvents.length > 0) {
      sections.push(...this.buildDriftLogsSections(data, query));
    }
    if (data.alerts && data.alerts.length > 0) {
      sections.push(...this.buildAlertLogsSections(data, query));
    }
    if (data.tasks && data.tasks.length > 0) {
      sections.push(...this.buildTaskLogsSections(data, query));
    }
    if (data.operatorMetrics && data.operatorMetrics.length > 0) {
      sections.push(...this.buildOperatorAnalyticsSections(data, query));
    }
    if (data.realTimeSignals && data.realTimeSignals.length > 0) {
      sections.push(...this.buildRealTimeMetricsSections(data, query));
    }
    if (data.capacityProjections && data.capacityProjections.length > 0) {
      sections.push(...this.buildCapacityForecastsSections(data, query));
    }
    if (data.schedules && data.schedules.length > 0) {
      sections.push(...this.buildSchedulesSections(data, query));
    }
    if (data.insights && data.insights.length > 0) {
      sections.push(...this.buildInsightsSections(data, query));
    }
    if (data.reports && data.reports.length > 0) {
      sections.push(...this.buildReportsSections(data, query));
    }
    
    return sections;
  }
  
  // ========================================================================
  // HELPER METHODS: Create individual sections
  // ========================================================================
  
  private createTaskSection(tasks: any[]): ExportContentSection {
    const items: ExportContentItem[] = tasks.map(task => ({
      itemId: task.taskId,
      itemType: 'task',
      timestamp: task.createdAt,
      data: task,
      references: [],
    }));
    
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const completionRate = ((completedCount / tasks.length) * 100).toFixed(1);
    
    return {
      sectionId: 'task-logs',
      title: 'Task Logs',
      description: 'Task and workflow execution log',
      dataSource: 'Phase 53: Task & Workflow Engine',
      summary: `${tasks.length} tasks. Completed: ${completedCount} (${completionRate}%).`,
      items,
      itemCount: items.length,
      generatedAt: new Date().toISOString(),
    };
  }
  
  private createAlertSection(alerts: any[]): ExportContentSection {
    const items: ExportContentItem[] = alerts.map(alert => ({
      itemId: alert.alertId,
      itemType: 'alert',
      timestamp: alert.createdAt,
      data: alert,
      references: [],
    }));
    
    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    const resolvedCount = alerts.filter(a => a.status === 'resolved').length;
    
    return {
      sectionId: 'alert-logs',
      title: 'Alert Logs',
      description: 'Alert and notification log',
      dataSource: 'Phase 52: Alert & Notification Engine',
      summary: `${alerts.length} alerts. Critical: ${criticalCount}. Resolved: ${resolvedCount}.`,
      items,
      itemCount: items.length,
      generatedAt: new Date().toISOString(),
    };
  }
  
  private createScheduleSection(schedules: any[]): ExportContentSection {
    const items: ExportContentItem[] = schedules.map(schedule => ({
      itemId: schedule.scheduleId,
      itemType: 'schedule',
      timestamp: schedule.timestamp,
      data: schedule,
      references: [],
    }));
    
    const totalSlots = schedules.reduce((sum, s) => sum + s.totalSlots, 0);
    const totalConflicts = schedules.reduce((sum, s) => sum + s.totalConflicts, 0);
    
    return {
      sectionId: 'schedules',
      title: 'Workload Schedules',
      description: 'Workload orchestration and scheduling',
      dataSource: 'Phase 57: Workload Orchestration & Scheduling Engine',
      summary: `${schedules.length} schedules. Total slots: ${totalSlots}. Conflicts: ${totalConflicts}.`,
      items,
      itemCount: items.length,
      generatedAt: new Date().toISOString(),
    };
  }
  
  private createCapacitySection(projections: any[]): ExportContentSection {
    const items: ExportContentItem[] = projections.map(projection => ({
      itemId: projection.projectionId,
      itemType: 'capacity-projection',
      timestamp: projection.windowStart,
      data: projection,
      references: [],
    }));
    
    const avgCapacity = (projections.reduce((sum, p) => sum + p.projectedCapacity, 0) / projections.length).toFixed(1);
    const highRiskCount = projections.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length;
    
    return {
      sectionId: 'capacity-forecasts',
      title: 'Capacity Forecasts',
      description: 'Capacity forecasting and resource planning',
      dataSource: 'Phase 56: Capacity Forecasting & Resource Planning',
      summary: `${projections.length} projections. Average capacity: ${avgCapacity}. High risk windows: ${highRiskCount}.`,
      items,
      itemCount: items.length,
      generatedAt: new Date().toISOString(),
    };
  }
  
  // ========================================================================
  // HELPER METHODS: Utilities
  // ========================================================================
  
  /**
   * Filter data by scope (tenant, facility)
   */
  private filterByScope(
    data: ExportDataInput,
    scope: { tenantId?: string; facilityId?: string; federationId?: string }
  ): ExportDataInput {
    const filtered: ExportDataInput = {};
    
    // Filter audit findings
    if (data.auditFindings) {
      filtered.auditFindings = data.auditFindings.filter(item => {
        if (scope.tenantId && item.tenantId !== scope.tenantId) return false;
        if (scope.facilityId && item.facilityId !== scope.facilityId) return false;
        return true;
      });
    }
    
    // Filter drift events
    if (data.driftEvents) {
      filtered.driftEvents = data.driftEvents.filter(item => {
        if (scope.tenantId && item.tenantId !== scope.tenantId) return false;
        if (scope.facilityId && item.facilityId !== scope.facilityId) return false;
        return true;
      });
    }
    
    // Filter alerts
    if (data.alerts) {
      filtered.alerts = data.alerts.filter(item => {
        if (scope.tenantId && item.tenantId !== scope.tenantId) return false;
        if (scope.facilityId && item.facilityId !== scope.facilityId) return false;
        return true;
      });
    }
    
    // Filter tasks
    if (data.tasks) {
      filtered.tasks = data.tasks.filter(item => {
        if (scope.tenantId && item.tenantId !== scope.tenantId) return false;
        if (scope.facilityId && item.facilityId !== scope.facilityId) return false;
        return true;
      });
    }
    
    // Filter operator metrics
    if (data.operatorMetrics) {
      filtered.operatorMetrics = data.operatorMetrics.filter(item => {
        if (scope.tenantId && item.tenantId !== scope.tenantId) return false;
        if (scope.facilityId && item.facilityId !== scope.facilityId) return false;
        return true;
      });
    }
    
    // Filter real-time signals
    if (data.realTimeSignals) {
      filtered.realTimeSignals = data.realTimeSignals.filter(item => {
        if (scope.tenantId && item.tenantId !== scope.tenantId) return false;
        if (scope.facilityId && item.facilityId !== scope.facilityId) return false;
        return true;
      });
    }
    
    // Filter capacity projections
    if (data.capacityProjections) {
      filtered.capacityProjections = data.capacityProjections.filter(item => {
        if (scope.tenantId && item.tenantId !== scope.tenantId) return false;
        if (scope.facilityId && item.facilityId !== scope.facilityId) return false;
        return true;
      });
    }
    
    // Filter schedules
    if (data.schedules) {
      filtered.schedules = data.schedules.filter(item => {
        if (scope.tenantId && item.tenantId !== scope.tenantId) return false;
        if (scope.facilityId && item.facilityId !== scope.facilityId) return false;
        return true;
      });
    }
    
    // Filter insights
    if (data.insights) {
      filtered.insights = data.insights.filter(item => {
        if (scope.tenantId && item.tenantId !== scope.tenantId) return false;
        return true;
      });
    }
    
    // Filter reports
    if (data.reports) {
      filtered.reports = data.reports.filter(item => {
        if (scope.tenantId && item.tenantId !== scope.tenantId) return false;
        if (scope.facilityId && item.facilityId !== scope.facilityId) return false;
        return true;
      });
    }
    
    return filtered;
  }
  
  /**
   * Assemble references from data
   */
  private assembleReferences(data: ExportDataInput): ExportReferences {
    return {
      auditFindingIds: data.auditFindings?.map(f => f.auditFindingId) || [],
      driftEventIds: data.driftEvents?.map(d => d.driftId) || [],
      alertIds: data.alerts?.map(a => a.alertId) || [],
      taskIds: data.tasks?.map(t => t.taskId) || [],
      operatorMetricIds: data.operatorMetrics?.map(m => m.metricId) || [],
      realTimeSignalIds: data.realTimeSignals?.map(s => s.signalId) || [],
      capacityProjectionIds: data.capacityProjections?.map(p => p.projectionId) || [],
      scheduleIds: data.schedules?.map(s => s.scheduleId) || [],
      insightIds: data.insights?.map(i => i.insightId) || [],
      reportIds: data.reports?.map(r => r.reportId) || [],
    };
  }
  
  /**
   * Generate metadata
   */
  private generateMetadata(
    query: ExportQuery,
    sections: ExportContentSection[],
    references: ExportReferences,
    startTime: number
  ): ExportMetadata {
    const totalItems = sections.reduce((sum, s) => sum + s.itemCount, 0);
    const dataSourcesUsed = Array.from(new Set(sections.map(s => s.dataSource)));
    
    // Estimate size (rough approximation)
    const estimatedSizeBytes = this.estimateSize(sections);
    
    return {
      generatedAt: new Date().toISOString(),
      generatedBy: query.requestedBy,
      format: query.format,
      totalSections: sections.length,
      totalItems,
      estimatedSizeBytes,
      dataSourcesUsed,
      timeRange: query.timeRange || this.getDefaultTimeRange(),
      computationTimeMs: Date.now() - startTime,
      compressed: false,
    };
  }
  
  /**
   * Estimate size in bytes
   */
  private estimateSize(sections: ExportContentSection[]): number {
    // Rough estimate: 500 bytes per item + 200 bytes per section
    const totalItems = sections.reduce((sum, s) => sum + s.itemCount, 0);
    return (totalItems * 500) + (sections.length * 200);
  }
  
  /**
   * Generate title and description
   */
  private generateTitleAndDescription(
    category: ExportCategory,
    scope: { tenantId?: string; facilityId?: string; federationId?: string }
  ): { title: string; description: string } {
    const categoryNames: Record<ExportCategory, string> = {
      'compliance-pack': 'Compliance Pack',
      'executive-summary': 'Executive Summary',
      'operational-snapshot': 'Operational Snapshot',
      'audit-findings': 'Audit Findings',
      'drift-logs': 'Drift Event Logs',
      'alert-logs': 'Alert Logs',
      'task-logs': 'Task Logs',
      'operator-analytics': 'Operator Analytics',
      'real-time-metrics': 'Real-Time Metrics',
      'capacity-forecasts': 'Capacity Forecasts',
      'schedules': 'Workload Schedules',
      'insights': 'Executive Insights',
      'reports': 'Enterprise Reports',
      'full-operational': 'Full Operational Export',
    };
    
    let title = categoryNames[category] || 'Export Bundle';
    
    if (scope.facilityId) {
      title += ` - Facility ${scope.facilityId}`;
    } else if (scope.tenantId) {
      title += ` - Tenant ${scope.tenantId}`;
    } else if (scope.federationId) {
      title += ` - Federation ${scope.federationId}`;
    }
    
    const description = `Deterministic export of ${categoryNames[category].toLowerCase()} from operational engines (Phases 50-59).`;
    
    return { title, description };
  }
  
  /**
   * Get default time range (last 30 days)
   */
  private getDefaultTimeRange(): { start: string; end: string } {
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  }
  
  /**
   * Calculate SLA status
   */
  private calculateSLAStatus(
    completedAt: string | undefined,
    slaDeadline: string | undefined
  ): 'met' | 'breached' | 'at-risk' | 'unknown' {
    if (!slaDeadline) return 'unknown';
    
    const deadlineTime = new Date(slaDeadline).getTime();
    
    if (completedAt) {
      const completedTime = new Date(completedAt).getTime();
      return completedTime <= deadlineTime ? 'met' : 'breached';
    }
    
    // Not completed yet
    const now = Date.now();
    const timeToDeadline = deadlineTime - now;
    const oneHour = 60 * 60 * 1000;
    
    if (timeToDeadline < 0) return 'breached';
    if (timeToDeadline < oneHour) return 'at-risk';
    
    return 'unknown';
  }
}
