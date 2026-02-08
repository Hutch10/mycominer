/**
 * Phase 50: Autonomous System Auditor - Public API
 * 
 * Exports all types, classes, and utilities for the audit system.
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Core types
  AuditSeverity,
  AuditCategory,
  AuditScope,
  
  // Rules
  AuditRule,
  
  // References
  AuditReference,
  
  // Findings
  AuditFinding,
  
  // Queries
  AuditQuery,
  
  // Results
  AuditResult,
  
  // Bundles
  AuditBundle,
  
  // Logging
  AuditLogEntry,
  AuditStatistics,
  
  // Policy
  AuditPolicyContext,
  AuditPolicyDecision,
} from './auditorTypes';

// ============================================================================
// CLASSES
// ============================================================================

export { AuditorRuleLibrary } from './auditorRuleLibrary';
export { AuditorEvaluator } from './auditorEvaluator';
export { AuditorPolicyEngine } from './auditorPolicyEngine';
export { AuditorLog } from './auditorLog';
export { AuditorEngine } from './auditorEngine';
