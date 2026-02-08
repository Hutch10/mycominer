/**
 * Policy Engine - Pre/Post message validation
 */

export type PolicySeverity = 'info' | 'warning' | 'error' | 'critical';

export interface PolicyCheckResult {
  passed: boolean;
  policy: string;
  reason?: string;
  severity: PolicySeverity;
  metadata?: Record<string, any>;
}

export interface PolicyValidationResult {
  passed: boolean;
  checks: PolicyCheckResult[];
  timestamp: string;
  summary: string;
  failedPolicies: string[];
  criticalFailures: number;
  errorFailures: number;
  warningFailures: number;
}

interface PolicyConfig {
  maxMessageLength: number;
  minMessageLength: number;
  minResponseLength: number;
  maxResponseLength: number;
}

class PolicyEngine {
  private config: PolicyConfig = {
    maxMessageLength: 5000,
    minMessageLength: 2,
    minResponseLength: 5,
    maxResponseLength: 10000,
  };

  preMessageCheck(message: string, context?: Record<string, any>): PolicyValidationResult {
    const checks: PolicyCheckResult[] = [];
    const timestamp = new Date().toISOString();

    // Length check
    if (message.length < this.config.minMessageLength) {
      checks.push({
        passed: false,
        policy: 'min_message_length',
        reason: `Message too short (${message.length} < ${this.config.minMessageLength})`,
        severity: 'error',
      });
    } else {
      checks.push({ passed: true, policy: 'min_message_length', severity: 'info' });
    }

    if (message.length > this.config.maxMessageLength) {
      checks.push({
        passed: false,
        policy: 'max_message_length',
        reason: `Message too long (${message.length} > ${this.config.maxMessageLength})`,
        severity: 'error',
      });
    } else {
      checks.push({ passed: true, policy: 'max_message_length', severity: 'info' });
    }

    // Content safety (basic)
    const hasUnsafeContent = /(\bexploit\b|\bhack\b|\bmalicious\b)/i.test(message);
    if (hasUnsafeContent) {
      checks.push({
        passed: false,
        policy: 'content_safety',
        reason: 'Message contains potentially unsafe content',
        severity: 'warning',
      });
    } else {
      checks.push({ passed: true, policy: 'content_safety', severity: 'info' });
    }

    const passed = checks.every(c => c.passed || c.severity === 'warning' || c.severity === 'info');
    const failedPolicies = checks.filter(c => !c.passed).map(c => c.policy);
    const criticalFailures = checks.filter(c => !c.passed && c.severity === 'critical').length;
    const errorFailures = checks.filter(c => !c.passed && c.severity === 'error').length;
    const warningFailures = checks.filter(c => !c.passed && c.severity === 'warning').length;

    return {
      passed,
      checks,
      timestamp,
      summary: passed ? 'All pre-message checks passed' : `Failed ${failedPolicies.length} policy checks`,
      failedPolicies,
      criticalFailures,
      errorFailures,
      warningFailures,
    };
  }

  postMessageCheck(response: string, context?: Record<string, any>): PolicyValidationResult {
    const checks: PolicyCheckResult[] = [];
    const timestamp = new Date().toISOString();

    // Response length check
    if (response.length < this.config.minResponseLength) {
      checks.push({
        passed: false,
        policy: 'min_response_length',
        reason: `Response too short (${response.length} < ${this.config.minResponseLength})`,
        severity: 'warning',
      });
    } else {
      checks.push({ passed: true, policy: 'min_response_length', severity: 'info' });
    }

    if (response.length > this.config.maxResponseLength) {
      checks.push({
        passed: false,
        policy: 'max_response_length',
        reason: `Response too long (${response.length} > ${this.config.maxResponseLength})`,
        severity: 'warning',
      });
    } else {
      checks.push({ passed: true, policy: 'max_response_length', severity: 'info' });
    }

    // Quality check (basic)
    const hasSubstance = response.trim().length > 10 && !/^(ok|yes|no|maybe)$/i.test(response.trim());
    if (!hasSubstance) {
      checks.push({
        passed: false,
        policy: 'response_quality',
        reason: 'Response lacks substance',
        severity: 'warning',
      });
    } else {
      checks.push({ passed: true, policy: 'response_quality', severity: 'info' });
    }

    const passed = checks.every(c => c.passed || c.severity === 'warning' || c.severity === 'info');
    const failedPolicies = checks.filter(c => !c.passed).map(c => c.policy);
    const criticalFailures = checks.filter(c => !c.passed && c.severity === 'critical').length;
    const errorFailures = checks.filter(c => !c.passed && c.severity === 'error').length;
    const warningFailures = checks.filter(c => !c.passed && c.severity === 'warning').length;

    return {
      passed,
      checks,
      timestamp,
      summary: passed ? 'All post-message checks passed' : `Failed ${failedPolicies.length} policy checks`,
      failedPolicies,
      criticalFailures,
      errorFailures,
      warningFailures,
    };
  }

  updateConfig(newConfig: Partial<PolicyConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): PolicyConfig {
    return { ...this.config };
  }
}

const policyEngine = new PolicyEngine();
export default policyEngine;
