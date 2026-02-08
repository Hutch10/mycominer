/**
 * Phase 43: System Health, Drift Detection & Integrity Monitoring
 * MAIN EXPORTS
 * 
 * Central export file for easy imports across the application.
 */

// Types
export * from './healthTypes';

// Core Modules
export { DriftDetector, createBaseline, approveBaseline, filterBaselines } from './driftDetector';
export { IntegrityScanner } from './integrityScanner';
export { HealthPolicyEngine, createHealthPolicy, createPolicyRule } from './healthPolicyEngine';
export { HealthLog, createLogFilter, aggregateByCategory } from './healthLog';
export { HealthEngine, createHealthQuery } from './healthEngine';
export type { SystemData } from './healthEngine';

// UI Components
export { HealthQueryPanel } from './components/HealthQueryPanel';
export { DriftFindingList } from './components/DriftFindingList';
export { IntegrityFindingList } from './components/IntegrityFindingList';
export { HealthFindingDetailPanel } from './components/HealthFindingDetailPanel';
export { HealthHistoryViewer } from './components/HealthHistoryViewer';
