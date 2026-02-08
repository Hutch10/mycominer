'use client';

export type InsightSource = 'exchange' | 'facility-feedback' | 'research';
export type RefinementKind = 'knowledge-graph' | 'cluster-weights' | 'tag-relationships' | 'troubleshooting-patterns' | 'optimization-heuristics' | 'environmental-targets';

export interface ValidatedInsight {
  id: string;
  source: InsightSource;
  kind: RefinementKind;
  title: string;
  summary: string;
  confidence: number; // 0-1
  tags: string[];
  species?: string;
  stage?: string;
}

export interface RefinementProposal {
  id: string;
  kind: RefinementKind;
  title: string;
  description: string;
  rationale: string;
  expectedImpact: string;
  riskLevel: 'low' | 'medium' | 'high';
  sourceInsights: string[];
  status: 'proposed' | 'simulated' | 'audited' | 'approved' | 'rejected' | 'applied' | 'rolled-back';
}

export interface SimulationReport {
  id: string;
  proposalId: string;
  findings: string[];
  regressions: string[];
  metrics: Record<string, number>;
  summary: string;
}

export type SafetyDecision = 'allow' | 'warn' | 'block';

export interface SafetyCheckResult {
  proposalId: string;
  decision: SafetyDecision;
  issues: string[];
  policyNotes: string[];
  rationale: string[];
  rollbackPlan?: string;
  alternatives?: string[];
}

export interface RefinementLogEntry {
  id: string;
  timestamp: number;
  category: 'proposal' | 'simulation' | 'audit' | 'planner' | 'approval' | 'application' | 'rollback';
  message: string;
  context?: Record<string, any>;
}

export interface RefinementPlan {
  id: string;
  proposals: RefinementProposal[];
  impactSummary: string;
  riskLevel: 'low' | 'medium' | 'high';
  approvalsRequired: string[];
  status: 'draft' | 'ready' | 'approved' | 'rejected';
  rejectionReason?: string;
}
