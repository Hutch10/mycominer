/**
 * REAL-TIME PERFORMANCE MONITORING - PUBLIC API
 * Phase 55: Real-Time Performance Monitoring
 * 
 * Exports for real-time monitoring system.
 */

// Types
export type {
  RealTimeEvent,
  RealTimeEventCategory,
  TaskLifecycleEventType,
  AlertLifecycleEventType,
  AuditFindingEventType,
  DriftDetectionEventType,
  GovernanceLineageEventType,
  DocumentationDriftEventType,
  SimulationMismatchEventType,
  PerformanceSignalEventType,
  RealTimeMetric,
  RealTimeMetricCategory,
  RealTimeStreamState,
  RealTimeQuery,
  RealTimeResult,
  RealTimeReference,
  RealTimeLogEntry,
  EventReceivedLogEntry,
  MetricComputedLogEntry,
  PolicyDecisionLogEntry,
  StreamStateUpdateLogEntry,
  ErrorLogEntry,
  RealTimeStatistics,
  RealTimePolicyContext,
  RealTimePolicyDecision,
  EventSourceConfig,
  EventSubscription,
  RealTimeSLAThresholds,
} from './realtimeTypes';

// Classes
export { RealTimeEngine } from './realtimeEngine';
export { RealTimeStream } from './realtimeStream';
export { RealTimeAggregator } from './realtimeAggregator';
export { RealTimePolicyEngine } from './realtimePolicyEngine';
export { RealTimeLog } from './realtimeLog';
