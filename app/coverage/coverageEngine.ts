/**
 * Phase 48: Global Coverage Sweep & Missing Systems Detector
 * 
 * COVERAGE ENGINE
 * 
 * Main orchestrator that:
 * - Runs phase inventory
 * - Detects gaps across all phases
 * - Assembles coverage results
 * - Logs all operations
 * - Generates statistics
 * 
 * CRITICAL CONSTRAINTS:
 * - Read-only operations only
 * - No modifications to any phase
 * - All findings derived from real phase data
 * - Complete audit trail
 */

import {
  CoverageQuery,
  CoverageResult,
  CoverageSummary,
  CoverageGap,
  CoverageStatistics,
  IntegrationMatrix,
  PhaseRecord,
  PhaseNumber,
  CoverageGapCategory,
  CoverageGapSeverity,
  CompletenessScore
} from './coverageTypes';
import { PhaseInventory } from './phaseInventory';
import { GapDetector } from './gapDetector';
import { CoverageLog } from './coverageLog';

export class CoverageEngine {
  private phaseInventory: PhaseInventory;
  private gapDetector: GapDetector;
  private log: CoverageLog;
  private defaultTenantId: string;

  constructor(defaultTenantId: string = 'global') {
    this.defaultTenantId = defaultTenantId;
    this.phaseInventory = new PhaseInventory();
    this.gapDetector = new GapDetector(this.phaseInventory);
    this.log = new CoverageLog();
  }

  /**
   * Execute coverage query
   */
  async executeCoverageQuery(
    query: CoverageQuery,
    performer: string
  ): Promise<CoverageResult> {
    const startTime = Date.now();

    try {
      // Detect gaps based on query type
      let gaps: CoverageGap[] = [];

      switch (query.queryType) {
        case 'list-all-gaps':
          gaps = this.gapDetector.detectAllGaps(query.scope);
          break;

        case 'list-gaps-by-category':
          if (query.filters.category) {
            gaps = this.gapDetector.detectGapsByCategory(query.filters.category, query.scope);
          }
          break;

        case 'list-gaps-by-phase':
          if (query.filters.phase) {
            gaps = this.gapDetector.detectGapsForPhase(query.filters.phase, query.scope);
          }
          break;

        case 'list-gaps-by-severity':
          if (query.filters.severity) {
            gaps = this.gapDetector.detectGapsBySeverity(query.filters.severity, query.scope);
          }
          break;

        case 'list-missing-integrations':
          gaps = this.gapDetector.detectGapsByCategory('missing-integration', query.scope);
          break;

        case 'list-phase-completeness':
        case 'list-engine-coverage':
          gaps = this.gapDetector.detectAllGaps(query.scope);
          break;
      }

      // Apply filters
      gaps = this.applyFilters(gaps, query.filters);

      // Sort gaps
      gaps = this.sortGaps(gaps, query.options?.sortBy || 'severity');

      // Limit results
      if (query.options?.limit) {
        gaps = gaps.slice(0, query.options.limit);
      }

      // Generate summary
      const summary = this.generateSummary(gaps);

      // Get phase inventory if requested
      const phaseInventory = query.options?.includePhaseInventory
        ? this.phaseInventory.getAllPhases()
        : undefined;

      // Get integration matrix if requested
      const integrationMatrix = query.options?.includeIntegrationMatrix
        ? this.generateIntegrationMatrix()
        : undefined;

      // Generate metadata
      const gapsByCategory = gaps.reduce((acc, gap) => {
        acc[gap.category] = (acc[gap.category] || 0) + 1;
        return acc;
      }, {} as Record<CoverageGapCategory, number>);

      const gapsBySeverity = gaps.reduce((acc, gap) => {
        acc[gap.severity] = (acc[gap.severity] || 0) + 1;
        return acc;
      }, {} as Record<CoverageGapSeverity, number>);

      const phasesAnalyzed = [...new Set(gaps.flatMap(g => g.affectedPhases))];
      const enginesAnalyzed = [...new Set(gaps.flatMap(g => g.affectedEngines))];

      const executionTimeMs = Date.now() - startTime;

      // Build result
      const result: CoverageResult = {
        title: this.generateTitle(query),
        description: this.generateDescription(query),
        summary,
        gaps,
        phaseInventory,
        integrationMatrix,
        metadata: {
          queryType: query.queryType,
          scope: query.scope,
          executedAt: new Date().toISOString(),
          executedBy: performer,
          totalGapsDetected: gaps.length,
          gapsByCategory: gapsByCategory as any,
          gapsBySeverity: gapsBySeverity as any,
          phasesAnalyzed: phasesAnalyzed as PhaseNumber[],
          enginesAnalyzed
        },
        executionTimeMs
      };

      // Log successful query
      this.log.logQuery(query, result, performer, true);
      this.log.logGapDetection(gaps, performer, query.scope);

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Log failed query
      this.log.logQuery(query, null, performer, false, errorMessage);
      this.log.logError(errorMessage, { query }, performer, query.scope);

      throw error;
    }
  }

  /**
   * Get phase inventory
   */
  getPhaseInventory(): PhaseRecord[] {
    return this.phaseInventory.getAllPhases();
  }

  /**
   * Get specific phase
   */
  getPhase(phaseNumber: PhaseNumber): PhaseRecord | undefined {
    return this.phaseInventory.getPhase(phaseNumber);
  }

  /**
   * Get completeness score for phase
   */
  getCompletenessScore(phaseNumber: PhaseNumber): CompletenessScore | null {
    const phase = this.phaseInventory.getPhase(phaseNumber);
    if (!phase) return null;

    const breakdown = {
      engineComplete: phase.engines.length > 0,
      uiComplete: phase.uiComponents.length > 0,
      integrationComplete: phase.integrations.length > 0,
      policyComplete: phase.hasPolicies,
      documentationComplete: phase.hasDocumentation,
      lineageComplete: phase.hasLineage || !this.requiresLineage(phase),
      healthComplete: this.hasHealthIntegration(phase),
      fabricComplete: phase.hasFabricLinks || phase.phaseNumber < 34,
      governanceComplete: phase.hasPolicies || phase.phaseNumber === 44 || phase.phaseNumber === 45
    };

    const scores = Object.values(breakdown).map(v => v ? 1 : 0);
    const score = Math.round((scores.reduce((a: number, b: number) => a + b, 0) / scores.length) * 100);

    const missingComponents: string[] = [];
    if (!breakdown.engineComplete) missingComponents.push('Core engine');
    if (!breakdown.uiComplete) missingComponents.push('UI components');
    if (!breakdown.integrationComplete) missingComponents.push('Integrations');
    if (!breakdown.policyComplete) missingComponents.push('Policies');
    if (!breakdown.documentationComplete) missingComponents.push('Documentation');
    if (!breakdown.lineageComplete) missingComponents.push('Lineage tracking');
    if (!breakdown.healthComplete) missingComponents.push('Health checks');
    if (!breakdown.fabricComplete) missingComponents.push('Fabric links');
    if (!breakdown.governanceComplete) missingComponents.push('Governance coverage');

    const recommendations: string[] = [];
    if (missingComponents.length > 0) {
      recommendations.push(`Complete missing components: ${missingComponents.join(', ')}`);
    }
    if (score < 70) {
      recommendations.push('Phase requires significant work to meet architectural standards');
    }

    return {
      phase: phaseNumber,
      score,
      breakdown,
      missingComponents,
      recommendations
    };
  }

  /**
   * Get statistics
   */
  getStatistics(): CoverageStatistics {
    const phases = this.phaseInventory.getAllPhases();
    const allGaps = this.gapDetector.detectAllGaps({ scope: 'global' });

    const gapsByCategory = allGaps.reduce((acc, gap) => {
      acc[gap.category] = (acc[gap.category] || 0) + 1;
      return acc;
    }, {} as Record<CoverageGapCategory, number>);

    const gapsBySeverity = allGaps.reduce((acc, gap) => {
      acc[gap.severity] = (acc[gap.severity] || 0) + 1;
      return acc;
    }, {} as Record<CoverageGapSeverity, number>);

    const gapsByPhase = allGaps.reduce((acc, gap) => {
      gap.affectedPhases.forEach(phase => {
        acc[phase] = (acc[phase] || 0) + 1;
      });
      return acc;
    }, {} as Record<PhaseNumber, number>);

    const phaseCompletenessScores = phases.reduce((acc, phase) => {
      const score = this.getCompletenessScore(phase.phaseNumber);
      if (score) {
        acc[phase.phaseNumber] = score.score;
      }
      return acc;
    }, {} as Record<PhaseNumber, number>);

    const overallSystemCompleteness = Object.values(phaseCompletenessScores).reduce((a, b) => a + b, 0) / phases.length;

    const mostCommonCategory = Object.entries(gapsByCategory).sort((a, b) => b[1] - a[1])[0];
    const mostAffectedPhaseEntry = Object.entries(gapsByPhase).sort((a, b) => b[1] - a[1])[0];

    const queryStats = this.log.getQueryStatistics();

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentEntries = this.log.getEntriesInRange(yesterday, now);
    const queriesLast24h = recentEntries.filter(e => e.type === 'coverage-query').length;

    const criticalGapsUnresolved = allGaps.filter(g => g.severity === 'critical').length;

    return {
      totalQueriesExecuted: queryStats.totalQueries,
      totalGapsDetected: allGaps.length,
      gapsByCategory: gapsByCategory as any,
      gapsBySeverity: gapsBySeverity as any,
      gapsByPhase: gapsByPhase as any,
      mostCommonGapCategory: (mostCommonCategory?.[0] || 'missing-ui-layer') as CoverageGapCategory,
      mostAffectedPhase: mostAffectedPhaseEntry ? parseInt(mostAffectedPhaseEntry[0]) as PhaseNumber : 32,
      averageExecutionTimeMs: queryStats.averageExecutionTimeMs,
      phaseCompletenessScores: phaseCompletenessScores as any,
      overallSystemCompleteness: Math.round(overallSystemCompleteness),
      queriesLast24h,
      criticalGapsUnresolved
    };
  }

  /**
   * Get log
   */
  getLog(): CoverageLog {
    return this.log;
  }

  /**
   * Export log
   */
  exportLog(filters?: any): string {
    return this.log.exportLog(filters);
  }

  // PRIVATE HELPER METHODS

  private applyFilters(gaps: CoverageGap[], filters: any): CoverageGap[] {
    let filtered = gaps;

    if (filters.category) {
      filtered = filtered.filter(g => g.category === filters.category);
    }

    if (filters.severity) {
      filtered = filtered.filter(g => g.severity === filters.severity);
    }

    if (filters.phase) {
      filtered = filtered.filter(g => g.affectedPhases.includes(filters.phase));
    }

    if (filters.engine) {
      filtered = filtered.filter(g => g.affectedEngines.includes(filters.engine));
    }

    return filtered;
  }

  private sortGaps(gaps: CoverageGap[], sortBy: 'severity' | 'phase' | 'category'): CoverageGap[] {
    const severityOrder: Record<CoverageGapSeverity, number> = {
      'critical': 0,
      'high': 1,
      'medium': 2,
      'low': 3,
      'info': 4
    };

    return gaps.sort((a, b) => {
      if (sortBy === 'severity') {
        return severityOrder[a.severity] - severityOrder[b.severity];
      } else if (sortBy === 'phase') {
        return a.affectedPhases[0] - b.affectedPhases[0];
      } else {
        return a.category.localeCompare(b.category);
      }
    });
  }

  private generateSummary(gaps: CoverageGap[]): CoverageSummary {
    const phases = this.phaseInventory.getAllPhases();

    const completedPhases = phases.filter(p => p.status === 'complete').length;
    const partialPhases = phases.filter(p => p.status === 'partial').length;
    const incompletePhases = phases.filter(p => p.status === 'incomplete').length;

    const totalEngines = this.phaseInventory.getAllEngines().length;
    const totalUIComponents = this.phaseInventory.getAllUIComponents().length;
    const totalIntegrations = this.phaseInventory.getAllIntegrations().length;

    const criticalGaps = gaps.filter(g => g.severity === 'critical').length;
    const highGaps = gaps.filter(g => g.severity === 'high').length;
    const mediumGaps = gaps.filter(g => g.severity === 'medium').length;
    const lowGaps = gaps.filter(g => g.severity === 'low').length;
    const infoGaps = gaps.filter(g => g.severity === 'info').length;

    const completenessScores = phases.map(p => this.getCompletenessScore(p.phaseNumber)?.score || 0);
    const overallCompleteness = Math.round(completenessScores.reduce((a, b) => a + b, 0) / completenessScores.length);

    return {
      totalPhases: phases.length,
      completedPhases,
      partialPhases,
      incompletePhases,
      totalEngines,
      totalUIComponents,
      totalIntegrations,
      totalGaps: gaps.length,
      criticalGaps,
      highGaps,
      mediumGaps,
      lowGaps,
      infoGaps,
      overallCompleteness
    };
  }

  private generateIntegrationMatrix(): IntegrationMatrix {
    const phases = this.phaseInventory.getAllPhases().map(p => p.phaseNumber);
    const integrations = this.phaseInventory.getAllIntegrations();

    const missingIntegrations: any[] = [];
    // This would be populated by more sophisticated logic

    return {
      phases,
      integrations,
      missingIntegrations
    };
  }

  private generateTitle(query: CoverageQuery): string {
    const titles: Record<string, string> = {
      'list-all-gaps': 'All Coverage Gaps',
      'list-gaps-by-category': `Coverage Gaps: ${query.filters.category || 'All Categories'}`,
      'list-gaps-by-phase': `Coverage Gaps: Phase ${query.filters.phase}`,
      'list-gaps-by-severity': `Coverage Gaps: ${query.filters.severity} Severity`,
      'list-missing-integrations': 'Missing Integrations',
      'list-phase-completeness': 'Phase Completeness Report',
      'list-engine-coverage': 'Engine Coverage Report'
    };
    return titles[query.queryType] || 'Coverage Report';
  }

  private generateDescription(query: CoverageQuery): string {
    return `Coverage analysis for ${query.scope.scope} scope. Query executed at ${new Date().toISOString()}.`;
  }

  private requiresLineage(phase: PhaseRecord): boolean {
    const requiresLineageTypes = ['governance', 'governanceHistory', 'health', 'compliance'];
    return phase.engines.some(e => requiresLineageTypes.includes(e.engineType));
  }

  private hasHealthIntegration(phase: PhaseRecord): boolean {
    if (phase.phaseNumber === 43) return true;
    const integrations = this.phaseInventory.getAllIntegrations();
    return integrations.some(i =>
      (i.sourcePhase === 43 && i.targetPhase === phase.phaseNumber) ||
      (i.sourcePhase === phase.phaseNumber && i.targetPhase === 43)
    );
  }
}
