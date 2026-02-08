/**
 * Submission Pipeline
 * 
 * Handles extension submissions with:
 * - Validation and schema checking
 * - Security scanning (SAST, dependency analysis)
 * - SBOM (Software Bill of Materials) ingestion
 * - Review workflow
 * - Automated and manual approval gates
 */

import {
  ExtensionSubmission,
  MarketplaceExtension,
  SecurityScan,
  SoftwareBillOfMaterials,
} from '../types';
import { marketplaceService } from './MarketplaceService';

export interface ValidationResult {
  valid: boolean;
  errors: { field: string; message: string }[];
  warnings: { field: string; message: string }[];
}

export class SubmissionPipeline {
  private submissions: Map<string, ExtensionSubmission> = new Map();

  /**
   * Submit extension for review
   */
  async submitExtension(submission: Omit<ExtensionSubmission, 'submittedAt' | 'reviewStatus'>): Promise<ExtensionSubmission> {
    // Validate submission
    const validation = await this.validateSubmission(submission);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const newSubmission: ExtensionSubmission = {
      ...submission,
      submittedAt: new Date(),
      reviewStatus: 'pending',
    };

    const submissionId = this.generateSubmissionId();
    this.submissions.set(submissionId, newSubmission);

    // Kick off automated checks
    await this.runAutomatedChecks(submissionId);

    await this.logEvent({
      type: 'submission-received',
      submissionId,
      extensionId: submission.extensionId,
      submittedBy: submission.submittedBy,
      timestamp: new Date(),
    });

    return newSubmission;
  }

  /**
   * Validate submission
   */
  private async validateSubmission(submission: any): Promise<ValidationResult> {
    const errors: { field: string; message: string }[] = [];
    const warnings: { field: string; message: string }[] = [];

    // Required fields
    if (!submission.version) {
      errors.push({ field: 'version', message: 'Version is required' });
    }

    if (!submission.package?.url) {
      errors.push({ field: 'package.url', message: 'Package URL is required' });
    }

    if (!submission.package?.checksum) {
      errors.push({ field: 'package.checksum', message: 'Package checksum is required' });
    }

    if (!submission.metadata?.name) {
      errors.push({ field: 'metadata.name', message: 'Extension name is required' });
    }

    if (!submission.metadata?.description) {
      errors.push({ field: 'metadata.description', message: 'Description is required' });
    }

    if (!submission.metadata?.type) {
      errors.push({ field: 'metadata.type', message: 'Extension type is required' });
    }

    // Version format validation
    if (submission.version && !/^\d+\.\d+\.\d+/.test(submission.version)) {
      warnings.push({ field: 'version', message: 'Version should follow semver format (x.y.z)' });
    }

    // Package size check
    if (submission.package?.size > 100 * 1024 * 1024) { // 100MB
      warnings.push({ field: 'package.size', message: 'Package size exceeds recommended 100MB' });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Run automated checks
   */
  private async runAutomatedChecks(submissionId: string): Promise<void> {
    const submission = this.submissions.get(submissionId);
    if (!submission) return;

    submission.reviewStatus = 'in-review';

    try {
      // Security scan
      const securityScan = await this.performSecurityScan(submission);
      
      // SBOM ingestion
      const sbom = await this.ingestSBOM(submission);
      
      // Update submission with scan results
      submission.metadata.security = securityScan;
      if (sbom) {
        submission.metadata.security.sbom = sbom;
      }

      // Auto-approve if security scan passes
      if (securityScan.status === 'passed') {
        submission.reviewStatus = 'approved';
        await this.approveSubmission(submissionId);
      } else if (securityScan.status === 'failed') {
        submission.reviewStatus = 'rejected';
        submission.reviewNotes = 'Security scan failed';
      }

      this.submissions.set(submissionId, submission);
    } catch (error) {
      console.error('[SubmissionPipeline] Automated checks failed:', error);
      submission.reviewStatus = 'pending';
    }
  }

  /**
   * Perform security scan
   */
  private async performSecurityScan(submission: ExtensionSubmission): Promise<SecurityScan> {
    // In production: integrate with security scanning tools
    // - SAST (Static Application Security Testing)
    // - Dependency vulnerability scanning
    // - License compliance checking
    // - Malware detection

    const findings: SecurityScan['findings'] = [];

    // Simulate findings
    const hasHighSeverity = Math.random() < 0.1;
    const hasMedium = Math.random() < 0.3;

    if (hasHighSeverity) {
      findings.push({
        severity: 'high',
        category: 'vulnerability',
        message: 'Potential security vulnerability detected in dependencies',
      });
    }

    if (hasMedium) {
      findings.push({
        severity: 'medium',
        category: 'code-quality',
        message: 'Code quality issues detected',
      });
    }

    const status = hasHighSeverity ? 'failed' : (hasMedium ? 'warning' : 'passed');

    return {
      scanDate: new Date(),
      status,
      findings,
      signatures: [],
    };
  }

  /**
   * Ingest SBOM (Software Bill of Materials)
   */
  private async ingestSBOM(submission: ExtensionSubmission): Promise<SoftwareBillOfMaterials | undefined> {
    // In production: extract SBOM from package or generate one
    // Supports CycloneDX and SPDX formats

    return {
      format: 'cyclonedx',
      version: '1.4',
      components: [
        {
          name: 'example-dependency',
          version: '1.0.0',
          license: 'MIT',
          vulnerabilities: 0,
        },
      ],
    };
  }

  /**
   * Approve submission
   */
  async approveSubmission(submissionId: string, reviewNotes?: string): Promise<void> {
    const submission = this.submissions.get(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    submission.reviewStatus = 'approved';
    submission.reviewNotes = reviewNotes;

    // Create or update marketplace extension
    if (submission.extensionId) {
      // Update existing extension
      await marketplaceService.updateExtension(submission.extensionId, {
        version: submission.version,
        ...submission.metadata,
        status: 'published',
      } as any);
    } else {
      // Create new extension
      await marketplaceService.registerExtension({
        ...submission.metadata,
        status: 'published',
      } as any);
    }

    await this.logEvent({
      type: 'submission-approved',
      submissionId,
      extensionId: submission.extensionId,
      timestamp: new Date(),
    });
  }

  /**
   * Reject submission
   */
  async rejectSubmission(submissionId: string, reason: string): Promise<void> {
    const submission = this.submissions.get(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    submission.reviewStatus = 'rejected';
    submission.reviewNotes = reason;

    await this.logEvent({
      type: 'submission-rejected',
      submissionId,
      extensionId: submission.extensionId,
      reason,
      timestamp: new Date(),
    });
  }

  /**
   * Get submission
   */
  async getSubmission(submissionId: string): Promise<ExtensionSubmission | null> {
    return this.submissions.get(submissionId) || null;
  }

  /**
   * List submissions by organization
   */
  async listSubmissions(organizationId: string): Promise<ExtensionSubmission[]> {
    return Array.from(this.submissions.values()).filter(
      sub => sub.submittedBy === organizationId
    );
  }

  /**
   * List pending submissions for review
   */
  async listPendingSubmissions(): Promise<ExtensionSubmission[]> {
    return Array.from(this.submissions.values()).filter(
      sub => sub.reviewStatus === 'pending' || sub.reviewStatus === 'in-review'
    );
  }

  /**
   * Generate unique submission ID
   */
  private generateSubmissionId(): string {
    return `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log event
   */
  private async logEvent(event: any): Promise<void> {
    console.log('[SubmissionPipeline]', event);
  }
}

// Singleton instance
export const submissionPipeline = new SubmissionPipeline();
