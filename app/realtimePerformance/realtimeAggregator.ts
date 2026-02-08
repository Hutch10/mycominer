/**
 * REAL-TIME AGGREGATOR
 * Phase 55: Real-Time Performance Monitoring
 * 
 * Compute live metrics from real-time event streams:
 * - Current workload per operator
 * - Active tasks by category/severity
 * - SLA countdown timers
 * - Real-time alert response latency
 * - Live remediation timelines
 * - Cross-engine performance deltas
 * 
 * NO GENERATIVE AI. NO PREDICTIONS.
 * All metrics computed from real event data.
 */

import {
  RealTimeEvent,
  RealTimeMetric,
  RealTimeMetricCategory,
  RealTimeStreamState,
} from './realtimeTypes';

// ============================================================================
// REAL-TIME AGGREGATOR
// ============================================================================

export class RealTimeAggregator {
  // ==========================================================================
  // LIVE WORKLOAD METRICS
  // ==========================================================================

  /**
   * Compute current workload per operator
   */
  computeLiveWorkload(
    streamState: RealTimeStreamState,
    operatorId?: string
  ): RealTimeMetric {
    const workloadData = operatorId
      ? streamState.workloadState.filter(w => w.operatorId === operatorId)
      : streamState.workloadState;

    const totalActiveTasks = workloadData.reduce((sum, w) => sum + w.activeTasks, 0);
    const totalOperators = workloadData.length;

    return {
      metricId: `live-workload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'live-workload',
      name: operatorId ? `Live Workload - ${operatorId}` : 'Live Workload - All Operators',
      value: totalActiveTasks,
      unit: 'tasks',
      scope: streamState.scope,
      computedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 60000).toISOString(), // Valid for 1 minute
      breakdown: {
        byOperator: Object.fromEntries(
          workloadData.map(w => [w.operatorId, w.activeTasks])
        ),
        bySeverity: {
          critical: workloadData.reduce((sum, w) => sum + w.criticalTasks, 0),
          high: workloadData.reduce((sum, w) => sum + w.highTasks, 0),
          medium: workloadData.reduce((sum, w) => sum + w.mediumTasks, 0),
          low: workloadData.reduce((sum, w) => sum + w.lowTasks, 0),
        },
      },
      metadata: {
        sampleSize: totalOperators,
        dataSource: ['task-lifecycle-events'],
        confidenceLevel: 'high',
      },
    };
  }

  // ==========================================================================
  // ACTIVE TASKS METRICS
  // ==========================================================================

  /**
   * Compute active tasks by category/severity
   */
  computeActiveTasks(streamState: RealTimeStreamState): RealTimeMetric {
    const taskEvents = streamState.recentEvents.filter(
      e => e.category === 'task-lifecycle'
    );

    const activeTaskIds = new Set<string>();
    const tasksByCategory: Record<string, number> = {};
    const tasksBySeverity: Record<string, number> = {};

    // Track task lifecycle
    for (const event of taskEvents) {
      if (event.eventType === 'created' || event.eventType === 'assigned' || event.eventType === 'in-progress') {
        activeTaskIds.add(event.entityId);
        
        // Update category count
        const category = (event.metadata.category as string) || 'unknown';
        tasksByCategory[category] = (tasksByCategory[category] || 0) + 1;
        
        // Update severity count
        tasksBySeverity[event.severity] = (tasksBySeverity[event.severity] || 0) + 1;
      } else if (event.eventType === 'resolved' || event.eventType === 'dismissed') {
        activeTaskIds.delete(event.entityId);
      }
    }

    return {
      metricId: `active-tasks-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'active-tasks',
      name: 'Active Tasks',
      value: activeTaskIds.size,
      unit: 'tasks',
      scope: streamState.scope,
      computedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30000).toISOString(), // Valid for 30 seconds
      breakdown: {
        byCategory: tasksByCategory,
        bySeverity: tasksBySeverity,
      },
      metadata: {
        sampleSize: taskEvents.length,
        dataSource: ['task-lifecycle-events'],
        confidenceLevel: 'high',
      },
    };
  }

  // ==========================================================================
  // SLA COUNTDOWN METRICS
  // ==========================================================================

  /**
   * Compute SLA countdown timers
   */
  computeSLACountdown(streamState: RealTimeStreamState): RealTimeMetric {
    const countdowns = streamState.slaCountdowns;
    
    const breachCount = countdowns.filter(c => c.status === 'breach').length;
    const warningCount = countdowns.filter(c => c.status === 'warning').length;
    const okCount = countdowns.filter(c => c.status === 'ok').length;

    const bySeverity: Record<string, number> = {};
    for (const countdown of countdowns) {
      bySeverity[countdown.severity] = (bySeverity[countdown.severity] || 0) + 1;
    }

    return {
      metricId: `sla-countdown-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'sla-countdown',
      name: 'SLA Countdown Timers',
      value: countdowns.length,
      unit: 'timers',
      scope: streamState.scope,
      computedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 10000).toISOString(), // Valid for 10 seconds
      breakdown: {
        byStatus: {
          breach: breachCount,
          warning: warningCount,
          ok: okCount,
        },
        bySeverity,
      },
      metadata: {
        sampleSize: countdowns.length,
        dataSource: ['task-lifecycle-events', 'alert-lifecycle-events'],
        confidenceLevel: 'high',
      },
    };
  }

  // ==========================================================================
  // RESPONSE LATENCY METRICS
  // ==========================================================================

  /**
   * Compute real-time alert response latency
   */
  computeResponseLatency(streamState: RealTimeStreamState): RealTimeMetric {
    const alertEvents = streamState.recentEvents.filter(
      e => e.category === 'alert-lifecycle'
    );

    // Track alert lifecycle
    const alertLifecycles = new Map<string, { detected: string; acknowledged?: string }>();
    
    for (const event of alertEvents) {
      if (event.eventType === 'detected') {
        alertLifecycles.set(event.entityId, { detected: event.timestamp });
      } else if (event.eventType === 'acknowledged') {
        const lifecycle = alertLifecycles.get(event.entityId);
        if (lifecycle) {
          lifecycle.acknowledged = event.timestamp;
        }
      }
    }

    // Calculate response times
    const responseTimes: number[] = [];
    for (const [alertId, lifecycle] of alertLifecycles) {
      if (lifecycle.acknowledged) {
        const responseTimeMs = new Date(lifecycle.acknowledged).getTime() - new Date(lifecycle.detected).getTime();
        responseTimes.push(responseTimeMs);
      }
    }

    const avgResponseTimeMs = responseTimes.length > 0
      ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
      : 0;

    const avgResponseTimeMinutes = avgResponseTimeMs / (1000 * 60);

    return {
      metricId: `response-latency-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'response-latency',
      name: 'Alert Response Latency',
      value: avgResponseTimeMinutes,
      unit: 'minutes',
      scope: streamState.scope,
      computedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 60000).toISOString(), // Valid for 1 minute
      metadata: {
        sampleSize: alertLifecycles.size,
        dataSource: ['alert-lifecycle-events'],
        confidenceLevel: responseTimes.length >= 5 ? 'high' : responseTimes.length >= 2 ? 'medium' : 'low',
      },
    };
  }

  // ==========================================================================
  // REMEDIATION TIMELINE METRICS
  // ==========================================================================

  /**
   * Compute live remediation timelines
   */
  computeRemediationTimeline(streamState: RealTimeStreamState): RealTimeMetric {
    const remediationCategories = [
      'audit-finding',
      'drift-detection',
      'governance-lineage',
      'documentation-drift',
      'simulation-mismatch',
    ];

    const activeRemediations: Record<string, number> = {};
    const completedRemediations: Record<string, number> = {};

    for (const category of remediationCategories) {
      const categoryEvents = streamState.recentEvents.filter(e => e.category === category);
      
      const active = new Set<string>();
      const completed = new Set<string>();

      for (const event of categoryEvents) {
        if (event.eventType.includes('detected') || event.eventType.includes('created')) {
          active.add(event.entityId);
        } else if (event.eventType.includes('resolved') || event.eventType.includes('completed') || event.eventType.includes('remediated')) {
          active.delete(event.entityId);
          completed.add(event.entityId);
        }
      }

      activeRemediations[category] = active.size;
      completedRemediations[category] = completed.size;
    }

    const totalActive = Object.values(activeRemediations).reduce((sum, count) => sum + count, 0);

    return {
      metricId: `remediation-timeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'remediation-timeline',
      name: 'Active Remediation Timelines',
      value: totalActive,
      unit: 'remediations',
      scope: streamState.scope,
      computedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30000).toISOString(), // Valid for 30 seconds
      breakdown: {
        byCategory: activeRemediations,
        byStatus: {
          active: totalActive,
          completed: Object.values(completedRemediations).reduce((sum, count) => sum + count, 0),
        },
      },
      metadata: {
        sampleSize: streamState.recentEvents.filter(e => remediationCategories.includes(e.category)).length,
        dataSource: remediationCategories,
        confidenceLevel: 'high',
      },
    };
  }

  // ==========================================================================
  // CROSS-ENGINE PERFORMANCE METRICS
  // ==========================================================================

  /**
   * Compute cross-engine performance deltas
   */
  computeCrossEnginePerformance(streamState: RealTimeStreamState): RealTimeMetric {
    const engines = [
      'action-center',
      'alert-center',
      'auditor',
      'integrity-monitor',
      'governance-history',
      'documentation-engine',
      'simulation-mode',
      'operator-analytics',
    ];

    const eventsByEngine: Record<string, number> = {};
    const performanceSignals: Record<string, number> = {};

    for (const event of streamState.recentEvents) {
      const engine = event.metadata.sourceSystem as string;
      eventsByEngine[engine] = (eventsByEngine[engine] || 0) + 1;

      if (event.category === 'performance-signal') {
        performanceSignals[engine] = (performanceSignals[engine] || 0) + 1;
      }
    }

    // Calculate performance delta (events in last minute vs previous minute)
    const now = Date.now();
    const lastMinute = streamState.recentEvents.filter(
      e => new Date(e.timestamp).getTime() > now - 60000
    );
    const previousMinute = streamState.recentEvents.filter(
      e => {
        const time = new Date(e.timestamp).getTime();
        return time > now - 120000 && time <= now - 60000;
      }
    );

    const delta = lastMinute.length - previousMinute.length;
    const deltaPercentage = previousMinute.length > 0
      ? ((delta / previousMinute.length) * 100)
      : 0;

    return {
      metricId: `cross-engine-performance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'cross-engine-performance',
      name: 'Cross-Engine Performance',
      value: streamState.rollingMetrics.eventsPerMinute,
      unit: 'events/min',
      scope: streamState.scope,
      computedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 60000).toISOString(), // Valid for 1 minute
      trend: {
        direction: delta > 0 ? 'increasing' : delta < 0 ? 'decreasing' : 'stable',
        changeRate: deltaPercentage,
        previousValue: previousMinute.length,
      },
      metadata: {
        sampleSize: streamState.recentEvents.length,
        dataSource: engines,
        confidenceLevel: 'high',
      },
    };
  }

  // ==========================================================================
  // WORKLOAD DELTA METRICS
  // ==========================================================================

  /**
   * Compute workload changes
   */
  computeWorkloadDelta(
    streamState: RealTimeStreamState,
    previousState?: RealTimeStreamState
  ): RealTimeMetric {
    const currentWorkload = streamState.workloadState.reduce(
      (sum, w) => sum + w.activeTasks,
      0
    );

    let previousWorkload = 0;
    if (previousState) {
      previousWorkload = previousState.workloadState.reduce(
        (sum, w) => sum + w.activeTasks,
        0
      );
    }

    const delta = currentWorkload - previousWorkload;
    const deltaPercentage = previousWorkload > 0
      ? ((delta / previousWorkload) * 100)
      : 0;

    return {
      metricId: `workload-delta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'workload-delta',
      name: 'Workload Change',
      value: delta,
      unit: 'tasks',
      scope: streamState.scope,
      computedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30000).toISOString(), // Valid for 30 seconds
      trend: {
        direction: delta > 0 ? 'increasing' : delta < 0 ? 'decreasing' : 'stable',
        changeRate: deltaPercentage,
        previousValue: previousWorkload,
      },
      metadata: {
        sampleSize: streamState.workloadState.length,
        dataSource: ['task-lifecycle-events'],
        confidenceLevel: previousState ? 'high' : 'medium',
      },
    };
  }

  // ==========================================================================
  // TREND SIGNAL METRICS
  // ==========================================================================

  /**
   * Compute performance trend signals
   */
  computeTrendSignal(streamState: RealTimeStreamState): RealTimeMetric {
    // Analyze events over last 5 minutes in 1-minute buckets
    const now = Date.now();
    const buckets: number[] = [];

    for (let i = 0; i < 5; i++) {
      const bucketStart = now - (i + 1) * 60000;
      const bucketEnd = now - i * 60000;
      const bucketEvents = streamState.recentEvents.filter(e => {
        const time = new Date(e.timestamp).getTime();
        return time >= bucketStart && time < bucketEnd;
      });
      buckets.unshift(bucketEvents.length);
    }

    // Calculate trend direction
    const firstBucket = buckets[0] || 0;
    const lastBucket = buckets[buckets.length - 1] || 0;
    const delta = lastBucket - firstBucket;
    const deltaPercentage = firstBucket > 0 ? ((delta / firstBucket) * 100) : 0;

    let direction: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(deltaPercentage) < 10) {
      direction = 'stable';
    } else if (delta > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }

    return {
      metricId: `trend-signal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'trend-signal',
      name: 'Performance Trend',
      value: streamState.rollingMetrics.eventsPerMinute,
      unit: 'events/min',
      scope: streamState.scope,
      computedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 60000).toISOString(), // Valid for 1 minute
      trend: {
        direction,
        changeRate: deltaPercentage,
        previousValue: firstBucket,
      },
      metadata: {
        sampleSize: buckets.reduce((sum, count) => sum + count, 0),
        dataSource: ['all-event-categories'],
        confidenceLevel: buckets.reduce((sum, count) => sum + count, 0) >= 10 ? 'high' : 'medium',
      },
    };
  }

  // ==========================================================================
  // BATCH METRIC COMPUTATION
  // ==========================================================================

  /**
   * Compute all requested metrics
   */
  computeMetrics(
    streamState: RealTimeStreamState,
    categories: RealTimeMetricCategory[],
    previousState?: RealTimeStreamState
  ): RealTimeMetric[] {
    const metrics: RealTimeMetric[] = [];

    for (const category of categories) {
      switch (category) {
        case 'live-workload':
          metrics.push(this.computeLiveWorkload(streamState));
          break;
        case 'active-tasks':
          metrics.push(this.computeActiveTasks(streamState));
          break;
        case 'sla-countdown':
          metrics.push(this.computeSLACountdown(streamState));
          break;
        case 'response-latency':
          metrics.push(this.computeResponseLatency(streamState));
          break;
        case 'remediation-timeline':
          metrics.push(this.computeRemediationTimeline(streamState));
          break;
        case 'cross-engine-performance':
          metrics.push(this.computeCrossEnginePerformance(streamState));
          break;
        case 'workload-delta':
          metrics.push(this.computeWorkloadDelta(streamState, previousState));
          break;
        case 'trend-signal':
          metrics.push(this.computeTrendSignal(streamState));
          break;
      }
    }

    return metrics;
  }
}
