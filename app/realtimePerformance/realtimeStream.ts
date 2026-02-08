/**
 * REAL-TIME STREAM
 * Phase 55: Real-Time Performance Monitoring
 * 
 * Event subscription, normalization, and stream state management.
 * Maintains last 1000 events, rolling metrics, SLA countdowns.
 * 
 * NO GENERATIVE AI. NO PREDICTIONS. NO SYNTHETIC EVENTS.
 */

import {
  RealTimeEvent,
  RealTimeEventCategory,
  RealTimeStreamState,
  EventSubscription,
  EventSourceConfig,
  RealTimeSLAThresholds,
} from './realtimeTypes';

// ============================================================================
// REAL-TIME STREAM
// ============================================================================

export class RealTimeStream {
  private streamStates: Map<string, RealTimeStreamState> = new Map();
  private subscriptions: Map<string, EventSubscription> = new Map();
  private eventSources: Map<string, EventSourceConfig> = new Map();
  private eventBuffer: RealTimeEvent[] = [];
  private maxBufferSize = 1000;
  
  private slaThresholds: RealTimeSLAThresholds = {
    bySeverity: {
      critical: 4,
      high: 24,
      medium: 72,
      low: 168,
      info: 720,
    },
  };

  constructor() {
    this.initializeEventSources();
  }

  // ==========================================================================
  // EVENT SOURCE INITIALIZATION
  // ==========================================================================

  private initializeEventSources(): void {
    // Phase 53: Action Center
    this.registerEventSource({
      sourceId: 'action-center',
      sourceName: 'Action Center',
      sourcePhase: 53,
      enabled: true,
      eventCategories: ['task-lifecycle'],
    });

    // Phase 52: Alert Center
    this.registerEventSource({
      sourceId: 'alert-center',
      sourceName: 'Alert Center',
      sourcePhase: 52,
      enabled: true,
      eventCategories: ['alert-lifecycle'],
    });

    // Phase 50: Auditor
    this.registerEventSource({
      sourceId: 'auditor',
      sourceName: 'Auditor',
      sourcePhase: 50,
      enabled: true,
      eventCategories: ['audit-finding'],
    });

    // Phase 51: Integrity Monitor
    this.registerEventSource({
      sourceId: 'integrity-monitor',
      sourceName: 'Integrity Monitor',
      sourcePhase: 51,
      enabled: true,
      eventCategories: ['drift-detection'],
    });

    // Phase 45: Governance History
    this.registerEventSource({
      sourceId: 'governance-history',
      sourceName: 'Governance History',
      sourcePhase: 45,
      enabled: true,
      eventCategories: ['governance-lineage'],
    });

    // Phase 47: Documentation Engine
    this.registerEventSource({
      sourceId: 'documentation-engine',
      sourceName: 'Documentation Engine',
      sourcePhase: 47,
      enabled: true,
      eventCategories: ['documentation-drift'],
    });

    // Phase 49: Simulation Mode
    this.registerEventSource({
      sourceId: 'simulation-mode',
      sourceName: 'Simulation Mode',
      sourcePhase: 49,
      enabled: true,
      eventCategories: ['simulation-mismatch'],
    });

    // Phase 54: Operator Analytics
    this.registerEventSource({
      sourceId: 'operator-analytics',
      sourceName: 'Operator Analytics',
      sourcePhase: 54,
      enabled: true,
      eventCategories: ['performance-signal'],
    });
  }

  // ==========================================================================
  // EVENT SOURCE MANAGEMENT
  // ==========================================================================

  registerEventSource(config: EventSourceConfig): void {
    this.eventSources.set(config.sourceId, config);
  }

  getEventSource(sourceId: string): EventSourceConfig | undefined {
    return this.eventSources.get(sourceId);
  }

  getAllEventSources(): EventSourceConfig[] {
    return Array.from(this.eventSources.values());
  }

  // ==========================================================================
  // EVENT INGESTION
  // ==========================================================================

  /**
   * Ingest a real-time event
   */
  ingestEvent(event: RealTimeEvent): void {
    // Add to buffer
    this.eventBuffer.push(event);

    // Maintain buffer size
    if (this.eventBuffer.length > this.maxBufferSize) {
      this.eventBuffer.shift();
    }

    // Update stream state
    this.updateStreamState(event);

    // Notify subscribers
    this.notifySubscribers(event);
  }

  /**
   * Batch ingest events
   */
  ingestEvents(events: RealTimeEvent[]): void {
    for (const event of events) {
      this.ingestEvent(event);
    }
  }

  // ==========================================================================
  // STREAM STATE MANAGEMENT
  // ==========================================================================

  private updateStreamState(event: RealTimeEvent): void {
    const stateKey = this.getStateKey(event.scope);
    let state = this.streamStates.get(stateKey);

    if (!state) {
      state = this.createStreamState(event.scope);
      this.streamStates.set(stateKey, state);
    }

    // Add event to recent events
    state.recentEvents.push(event);
    if (state.recentEvents.length > state.maxEventBufferSize) {
      state.recentEvents.shift();
    }

    // Update rolling metrics
    state.rollingMetrics.totalEventsReceived++;
    state.rollingMetrics.eventsByCategory[event.category] =
      (state.rollingMetrics.eventsByCategory[event.category] || 0) + 1;
    state.rollingMetrics.eventsBySeverity[event.severity] =
      (state.rollingMetrics.eventsBySeverity[event.severity] || 0) + 1;

    // Update events per minute
    const recentMinute = state.recentEvents.filter(
      e => new Date(e.timestamp).getTime() > Date.now() - 60000
    );
    state.rollingMetrics.eventsPerMinute = recentMinute.length;

    // Update SLA countdowns
    this.updateSLACountdowns(state, event);

    // Update workload state
    this.updateWorkloadState(state, event);

    // Update stream health
    state.streamHealth.lastEventReceived = event.timestamp;
    state.streamHealth.eventLag = Date.now() - new Date(event.timestamp).getTime();

    // Update metadata
    state.lastUpdated = new Date().toISOString();
  }

  private createStreamState(scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  }): RealTimeStreamState {
    return {
      stateId: `state-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      scope,
      recentEvents: [],
      maxEventBufferSize: 1000,
      rollingMetrics: {
        totalEventsReceived: 0,
        eventsPerMinute: 0,
        eventsByCategory: {} as Record<RealTimeEventCategory, number>,
        eventsBySeverity: {},
      },
      slaCountdowns: [],
      workloadState: [],
      streamHealth: {
        isActive: true,
        lastEventReceived: new Date().toISOString(),
        eventLag: 0,
        missedEvents: 0,
      },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
  }

  private getStateKey(scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  }): string {
    return `${scope.tenantId}-${scope.facilityId || 'all'}-${scope.federationId || 'none'}`;
  }

  // ==========================================================================
  // SLA COUNTDOWN MANAGEMENT
  // ==========================================================================

  private updateSLACountdowns(state: RealTimeStreamState, event: RealTimeEvent): void {
    // Add new SLA countdown for tasks and alerts
    if (event.category === 'task-lifecycle' && event.eventType === 'created') {
      const thresholdHours = this.slaThresholds.bySeverity[event.severity];
      state.slaCountdowns.push({
        entityId: event.entityId,
        entityType: event.entityType,
        severity: event.severity,
        startTime: event.timestamp,
        slaThresholdHours: thresholdHours,
        timeRemainingHours: thresholdHours,
        status: 'ok',
      });
    }

    if (event.category === 'alert-lifecycle' && event.eventType === 'detected') {
      const thresholdHours = this.slaThresholds.bySeverity[event.severity];
      state.slaCountdowns.push({
        entityId: event.entityId,
        entityType: event.entityType,
        severity: event.severity,
        startTime: event.timestamp,
        slaThresholdHours: thresholdHours,
        timeRemainingHours: thresholdHours,
        status: 'ok',
      });
    }

    // Remove resolved/dismissed countdowns
    if (
      (event.category === 'task-lifecycle' && (event.eventType === 'resolved' || event.eventType === 'dismissed')) ||
      (event.category === 'alert-lifecycle' && (event.eventType === 'resolved' || event.eventType === 'dismissed'))
    ) {
      state.slaCountdowns = state.slaCountdowns.filter(
        countdown => countdown.entityId !== event.entityId
      );
    }

    // Update time remaining and status for all active countdowns
    const now = Date.now();
    for (const countdown of state.slaCountdowns) {
      const elapsedMs = now - new Date(countdown.startTime).getTime();
      const elapsedHours = elapsedMs / (1000 * 60 * 60);
      countdown.timeRemainingHours = countdown.slaThresholdHours - elapsedHours;

      if (countdown.timeRemainingHours < 0) {
        countdown.status = 'breach';
      } else if (countdown.timeRemainingHours < countdown.slaThresholdHours * 0.2) {
        countdown.status = 'warning';
      } else {
        countdown.status = 'ok';
      }
    }
  }

  // ==========================================================================
  // WORKLOAD STATE MANAGEMENT
  // ==========================================================================

  private updateWorkloadState(state: RealTimeStreamState, event: RealTimeEvent): void {
    if (event.category !== 'task-lifecycle') return;
    if (!event.operatorId) return;

    // Find or create operator workload entry
    let workload = state.workloadState.find(w => w.operatorId === event.operatorId);
    if (!workload) {
      workload = {
        operatorId: event.operatorId!,
        operatorName: event.operatorName || event.operatorId!,
        activeTasks: 0,
        criticalTasks: 0,
        highTasks: 0,
        mediumTasks: 0,
        lowTasks: 0,
        lastUpdated: event.timestamp,
      };
      state.workloadState.push(workload);
    }

    // Update active task counts
    if (event.eventType === 'assigned' || event.eventType === 'in-progress') {
      workload.activeTasks++;
      switch (event.severity) {
        case 'critical':
          workload.criticalTasks++;
          break;
        case 'high':
          workload.highTasks++;
          break;
        case 'medium':
          workload.mediumTasks++;
          break;
        case 'low':
          workload.lowTasks++;
          break;
      }
    }

    if (event.eventType === 'resolved' || event.eventType === 'dismissed') {
      workload.activeTasks = Math.max(0, workload.activeTasks - 1);
      switch (event.severity) {
        case 'critical':
          workload.criticalTasks = Math.max(0, workload.criticalTasks - 1);
          break;
        case 'high':
          workload.highTasks = Math.max(0, workload.highTasks - 1);
          break;
        case 'medium':
          workload.mediumTasks = Math.max(0, workload.mediumTasks - 1);
          break;
        case 'low':
          workload.lowTasks = Math.max(0, workload.lowTasks - 1);
          break;
      }
    }

    workload.lastUpdated = event.timestamp;
  }

  // ==========================================================================
  // SUBSCRIPTION MANAGEMENT
  // ==========================================================================

  /**
   * Subscribe to real-time events
   */
  subscribe(subscription: Omit<EventSubscription, 'subscriptionId' | 'createdAt'>): string {
    const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullSubscription: EventSubscription = {
      ...subscription,
      subscriptionId,
      createdAt: new Date().toISOString(),
    };
    this.subscriptions.set(subscriptionId, fullSubscription);
    return subscriptionId;
  }

  /**
   * Unsubscribe from real-time events
   */
  unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
  }

  /**
   * Notify subscribers of new events
   */
  private notifySubscribers(event: RealTimeEvent): void {
    for (const subscription of this.subscriptions.values()) {
      // Check scope match
      if (subscription.scope.tenantId !== event.scope.tenantId) continue;
      if (subscription.scope.facilityId && subscription.scope.facilityId !== event.scope.facilityId) continue;
      if (subscription.scope.federationId && subscription.scope.federationId !== event.scope.federationId) continue;

      // Check category match
      if (!subscription.categories.includes(event.category)) continue;

      // Notify
      try {
        subscription.callback(event);
        subscription.lastEventReceived = event.timestamp;
      } catch (error) {
        console.error(`Error notifying subscriber ${subscription.subscriptionId}:`, error);
      }
    }
  }

  // ==========================================================================
  // STREAM STATE QUERIES
  // ==========================================================================

  getStreamState(scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  }): RealTimeStreamState | undefined {
    const stateKey = this.getStateKey(scope);
    return this.streamStates.get(stateKey);
  }

  getAllStreamStates(): RealTimeStreamState[] {
    return Array.from(this.streamStates.values());
  }

  getRecentEvents(
    scope: {
      tenantId: string;
      facilityId?: string;
      federationId?: string;
    },
    limit?: number
  ): RealTimeEvent[] {
    const state = this.getStreamState(scope);
    if (!state) return [];
    
    const events = [...state.recentEvents].reverse();
    return limit ? events.slice(0, limit) : events;
  }

  getSLACountdowns(scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  }): RealTimeStreamState['slaCountdowns'] {
    const state = this.getStreamState(scope);
    return state ? state.slaCountdowns : [];
  }

  getWorkloadState(scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  }): RealTimeStreamState['workloadState'] {
    const state = this.getStreamState(scope);
    return state ? state.workloadState : [];
  }

  // ==========================================================================
  // SLA CONFIGURATION
  // ==========================================================================

  setSLAThresholds(thresholds: RealTimeSLAThresholds): void {
    this.slaThresholds = thresholds;
  }

  getSLAThresholds(): RealTimeSLAThresholds {
    return { ...this.slaThresholds };
  }
}
