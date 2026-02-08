// Developer Mode Configuration
// Global settings for friction reduction across all engines

'use client';

export interface DeveloperModeConfig {
  enabled: boolean;
  logLevel: 'minimal' | 'normal' | 'verbose';
  autoApproveThresholds: {
    strategyConfidence: number; // min confidence to auto-approve strategy plans
    workflowConfidence: number; // min confidence to auto-approve workflow plans
    resourceConfidence: number; // min confidence to auto-approve resource allocations
    riskLevel: 'low' | 'medium' | 'high'; // max risk level to auto-approve
  };
  skipOptionalAudits: boolean; // skip audits when no conflicts/issues detected
  skipSimulations: boolean; // skip refinement simulations unless explicitly requested
  collapseMultiStepFlows: boolean; // run full pipelines in single call
  preserveFullLogs: boolean; // keep full logs for export even if display is minimal
}

// Default configuration
const DEFAULT_CONFIG: DeveloperModeConfig = {
  enabled: false,
  logLevel: 'normal',
  autoApproveThresholds: {
    strategyConfidence: 75,
    workflowConfidence: 75,
    resourceConfidence: 70,
    riskLevel: 'medium',
  },
  skipOptionalAudits: false,
  skipSimulations: false,
  collapseMultiStepFlows: false,
  preserveFullLogs: true,
};

// Singleton configuration manager
class DeveloperModeManager {
  private config: DeveloperModeConfig = DEFAULT_CONFIG;

  /**
   * Get current configuration
   */
  getConfig(): DeveloperModeConfig {
    return { ...this.config };
  }

  /**
   * Enable developer mode with optional overrides
   */
  enable(overrides?: Partial<DeveloperModeConfig>) {
    this.config = {
      ...DEFAULT_CONFIG,
      enabled: true,
      skipOptionalAudits: true,
      skipSimulations: true,
      collapseMultiStepFlows: true,
      logLevel: 'minimal',
      ...overrides,
    };
  }

  /**
   * Disable developer mode
   */
  disable() {
    this.config = DEFAULT_CONFIG;
  }

  /**
   * Update specific config values
   */
  updateConfig(updates: Partial<DeveloperModeConfig>) {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Check if auto-approval is allowed
   */
  canAutoApprove(params: {
    decision: 'allow' | 'warn' | 'block';
    confidence: number;
    riskLevel?: 'low' | 'medium' | 'high';
    hasConflicts?: boolean;
    hasErrors?: boolean;
  }): boolean {
    if (!this.config.enabled) return false;

    // Never auto-approve BLOCK decisions
    if (params.decision === 'block') return false;

    // Never auto-approve if errors exist
    if (params.hasErrors) return false;

    // Never auto-approve if conflicts exist (safety boundary)
    if (params.hasConflicts) return false;

    // Check risk level
    const riskLevel = params.riskLevel || 'low';
    const maxRisk = this.config.autoApproveThresholds.riskLevel;
    const riskOrder: Record<string, number> = { low: 1, medium: 2, high: 3 };
    if (riskOrder[riskLevel] > riskOrder[maxRisk]) return false;

    // For ALLOW decisions, auto-approve if above confidence threshold
    if (params.decision === 'allow') {
      return params.confidence >= this.getMinConfidenceForContext('workflow');
    }

    // For WARN decisions, only auto-approve low-medium risk
    if (params.decision === 'warn') {
      return riskLevel !== 'high' && params.confidence >= this.getMinConfidenceForContext('workflow');
    }

    return false;
  }

  /**
   * Get minimum confidence for a given context
   */
  private getMinConfidenceForContext(context: string): number {
    if (context.includes('strategy')) return this.config.autoApproveThresholds.strategyConfidence;
    if (context.includes('workflow')) return this.config.autoApproveThresholds.workflowConfidence;
    if (context.includes('resource')) return this.config.autoApproveThresholds.resourceConfidence;
    return 75; // default
  }

  /**
   * Check if logging should be minimal
   */
  shouldLogMinimal(): boolean {
    return this.config.enabled && this.config.logLevel === 'minimal';
  }

  /**
   * Check if category should be logged in minimal mode
   */
  shouldLogCategory(category: string): boolean {
    if (!this.shouldLogMinimal()) return true;

    // In minimal mode, only log important categories
    const criticalCategories = [
      'warning',
      'error',
      'block',
      'rejection',
      'conflict',
      'shortage',
      'failure',
      'audit',
    ];

    return criticalCategories.some(critical => category.toLowerCase().includes(critical));
  }

  /**
   * Get auto-approval summary
   */
  getAutoApprovalSummary(): {
    enabled: boolean;
    strategyThreshold: number;
    workflowThreshold: number;
    resourceThreshold: number;
    maxRisk: string;
  } {
    return {
      enabled: this.config.enabled,
      strategyThreshold: this.config.autoApproveThresholds.strategyConfidence,
      workflowThreshold: this.config.autoApproveThresholds.workflowConfidence,
      resourceThreshold: this.config.autoApproveThresholds.resourceConfidence,
      maxRisk: this.config.autoApproveThresholds.riskLevel,
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const devMode = new DeveloperModeManager();
