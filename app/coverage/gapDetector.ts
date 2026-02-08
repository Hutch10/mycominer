/**
 * Phase 48: Global Coverage Sweep & Missing Systems Detector
 * 
 * GAP DETECTOR
 * 
 * This module compares the phase inventory against required architectural
 * layers and detects missing components, incomplete integrations, and
 * structural gaps across all phases.
 * 
 * DETECTION CATEGORIES:
 * - missing-engine: Core engine not implemented
 * - missing-ui-layer: Dashboard or UI components missing
 * - missing-integration: Expected cross-engine integration not present
 * - missing-policy: Policy enforcement layer missing
 * - missing-documentation: Documentation files incomplete
 * - missing-lineage: Lineage tracking not implemented
 * - missing-health-checks: Health monitoring not integrated
 * - missing-fabric-links: Fabric mesh links not established
 * - missing-governance-coverage: Governance policies not applied
 */

import {
  PhaseRecord,
  PhaseNumber,
  CoverageGap,
  CoverageGapCategory,
  CoverageGapSeverity,
  CoverageReference,
  CoverageScopeContext,
  ArchitecturalRequirement,
  IntegrationRecord
} from './coverageTypes';
import { PhaseInventory } from './phaseInventory';

export class GapDetector {
  private phaseInventory: PhaseInventory;
  private architecturalRequirements: ArchitecturalRequirement[];

  constructor(phaseInventory: PhaseInventory) {
    this.phaseInventory = phaseInventory;
    this.architecturalRequirements = this.defineArchitecturalRequirements();
  }

  /**
   * Detect all gaps across all phases
   */
  detectAllGaps(scope: CoverageScopeContext): CoverageGap[] {
    const gaps: CoverageGap[] = [];

    const phases = this.phaseInventory.getAllPhases();

    for (const phase of phases) {
      gaps.push(...this.detectPhaseGaps(phase, scope));
    }

    // Detect cross-phase integration gaps
    gaps.push(...this.detectIntegrationGaps(scope));

    // Detect fabric link gaps
    gaps.push(...this.detectFabricLinkGaps(scope));

    // Detect health check gaps
    gaps.push(...this.detectHealthCheckGaps(scope));

    // Detect governance coverage gaps
    gaps.push(...this.detectGovernanceCoverageGaps(scope));

    return gaps;
  }

  /**
   * Detect gaps for a specific phase
   */
  detectPhaseGaps(phase: PhaseRecord, scope: CoverageScopeContext): CoverageGap[] {
    const gaps: CoverageGap[] = [];

    // Check UI layer
    if (!phase.uiComponents || phase.uiComponents.length === 0) {
      gaps.push(this.createGap(
        'missing-ui-layer',
        'high',
        `Phase ${phase.phaseNumber} Missing UI Components`,
        `Phase ${phase.phaseNumber} (${phase.phaseName}) has no UI components for operator interaction`,
        [phase.phaseNumber],
        phase.engines.map(e => e.engineName),
        scope,
        [`Create dashboard component for ${phase.phaseName}`, 'Add interactive panels', 'Integrate with existing engines'],
        `Expected at least one dashboard component, found ${phase.uiComponents.length}`
      ));
    }

    // Check log
    if (!phase.hasLog) {
      gaps.push(this.createGap(
        'missing-policy',
        'high',
        `Phase ${phase.phaseNumber} Missing Audit Log`,
        `Phase ${phase.phaseNumber} (${phase.phaseName}) has no audit logging for compliance`,
        [phase.phaseNumber],
        phase.engines.map(e => e.engineName),
        scope,
        [`Add log module to ${phase.phaseName}`, 'Implement audit trail', 'Track all operations'],
        `Expected log module, found none`
      ));
    }

    // Check policies
    if (!phase.hasPolicies) {
      gaps.push(this.createGap(
        'missing-policy',
        'medium',
        `Phase ${phase.phaseNumber} Missing Policy Layer`,
        `Phase ${phase.phaseNumber} (${phase.phaseName}) has no policy enforcement layer`,
        [phase.phaseNumber],
        phase.engines.map(e => e.engineName),
        scope,
        [`Define policies for ${phase.phaseName}`, 'Implement policy engine', 'Integrate with governance (Phase 44)'],
        `Expected policy enforcement, found none`
      ));
    }

    // Check lineage (required for engines that modify data)
    const requiresLineage = ['governance', 'governanceHistory', 'health', 'compliance'];
    if (phase.engines.some(e => requiresLineage.includes(e.engineType)) && !phase.hasLineage) {
      gaps.push(this.createGap(
        'missing-lineage',
        'medium',
        `Phase ${phase.phaseNumber} Missing Lineage Tracking`,
        `Phase ${phase.phaseNumber} (${phase.phaseName}) requires lineage tracking but it is not implemented`,
        [phase.phaseNumber],
        phase.engines.map(e => e.engineName),
        scope,
        [`Add lineage tracking to ${phase.phaseName}`, 'Integrate with Governance History (Phase 45)', 'Track all changes'],
        `Expected lineage module, found none`
      ));
    }

    // Check fabric links (required for all engines after Phase 46)
    if (phase.phaseNumber > 46 && !phase.hasFabricLinks) {
      gaps.push(this.createGap(
        'missing-fabric-links',
        'low',
        `Phase ${phase.phaseNumber} Missing Fabric Links`,
        `Phase ${phase.phaseNumber} (${phase.phaseName}) is not integrated with Data Fabric (Phase 46)`,
        [phase.phaseNumber],
        phase.engines.map(e => e.engineName),
        scope,
        [`Link ${phase.phaseName} to Fabric`, 'Create fabric nodes for entities', 'Establish cross-engine edges'],
        `Expected fabric integration, found none`
      ));
    }

    // Check documentation
    if (!phase.hasDocumentation) {
      gaps.push(this.createGap(
        'missing-documentation',
        'medium',
        `Phase ${phase.phaseNumber} Missing Documentation`,
        `Phase ${phase.phaseNumber} (${phase.phaseName}) has no documentation files (SUMMARY, QUICK_REFERENCE, etc.)`,
        [phase.phaseNumber],
        phase.engines.map(e => e.engineName),
        scope,
        [`Create PHASE${phase.phaseNumber}_SUMMARY.md`, `Create PHASE${phase.phaseNumber}_QUICK_REFERENCE.md`, `Create PHASE${phase.phaseNumber}_COMPLETION_REPORT.md`],
        `Expected documentation files, found none`
      ));
    }

    return gaps;
  }

  /**
   * Detect missing integrations between phases
   */
  detectIntegrationGaps(scope: CoverageScopeContext): CoverageGap[] {
    const gaps: CoverageGap[] = [];

    // Expected integrations matrix
    const expectedIntegrations: Array<{source: PhaseNumber, target: PhaseNumber, description: string, critical: boolean}> = [
      // All engines should respect multi-tenancy
      { source: 34, target: 33, description: 'Knowledge Graph respects tenant boundaries', critical: true },
      { source: 35, target: 33, description: 'Search respects tenant boundaries', critical: true },
      { source: 36, target: 33, description: 'Copilot respects tenant boundaries', critical: true },
      { source: 37, target: 33, description: 'Narrative respects tenant boundaries', critical: true },
      { source: 38, target: 33, description: 'Timeline respects tenant boundaries', critical: true },
      { source: 39, target: 33, description: 'Analytics respects tenant boundaries', critical: true },
      { source: 40, target: 33, description: 'Training respects tenant boundaries', critical: true },
      { source: 41, target: 33, description: 'Marketplace respects tenant boundaries', critical: true },
      { source: 42, target: 33, description: 'Insights respects tenant boundaries', critical: true },
      
      // All engines should integrate with Health (Phase 43)
      { source: 43, target: 34, description: 'Health monitors Knowledge Graph integrity', critical: false },
      { source: 43, target: 35, description: 'Health monitors Search index integrity', critical: false },
      { source: 43, target: 38, description: 'Health monitors Timeline consistency', critical: false },
      
      // All engines should integrate with Fabric (Phase 46)
      { source: 46, target: 32, description: 'Fabric links Compliance entities', critical: false },
      { source: 46, target: 35, description: 'Fabric links Search entities', critical: false },
      { source: 46, target: 36, description: 'Fabric links Copilot entities', critical: false },
      { source: 46, target: 37, description: 'Fabric links Narrative entities', critical: false },
      { source: 46, target: 38, description: 'Fabric links Timeline entities', critical: false },
      { source: 46, target: 39, description: 'Fabric links Analytics entities', critical: false },
      { source: 46, target: 40, description: 'Fabric links Training entities', critical: false },
      { source: 46, target: 41, description: 'Fabric links Marketplace entities', critical: false },
      { source: 46, target: 42, description: 'Fabric links Insights entities', critical: false },
      { source: 46, target: 43, description: 'Fabric links Health entities', critical: false },
      
      // Documentation should cover all engines
      { source: 47, target: 33, description: 'Documentation covers Multi-Tenancy', critical: false },
      { source: 47, target: 34, description: 'Documentation covers Knowledge Graph', critical: false },
      { source: 47, target: 35, description: 'Documentation covers Search', critical: false },
      { source: 47, target: 36, description: 'Documentation covers Copilot', critical: false },
      { source: 47, target: 37, description: 'Documentation covers Narrative', critical: false },
      { source: 47, target: 38, description: 'Documentation covers Timeline', critical: false },
      { source: 47, target: 39, description: 'Documentation covers Analytics', critical: false },
      { source: 47, target: 40, description: 'Documentation covers Training', critical: false },
      { source: 47, target: 41, description: 'Documentation covers Marketplace', critical: false },
      { source: 47, target: 42, description: 'Documentation covers Insights', critical: false },
      { source: 47, target: 43, description: 'Documentation covers Health', critical: false },
      { source: 47, target: 44, description: 'Documentation covers Governance', critical: false },
      { source: 47, target: 45, description: 'Documentation covers Governance History', critical: false },
      { source: 47, target: 46, description: 'Documentation covers Fabric', critical: false },
    ];

    const existingIntegrations = this.phaseInventory.getAllIntegrations();

    for (const expected of expectedIntegrations) {
      const exists = existingIntegrations.some(
        i => i.sourcePhase === expected.source && i.targetPhase === expected.target && i.implemented
      );

      if (!exists) {
        const sourcePhase = this.phaseInventory.getPhase(expected.source);
        const targetPhase = this.phaseInventory.getPhase(expected.target);

        if (sourcePhase && targetPhase) {
          gaps.push(this.createGap(
            'missing-integration',
            expected.critical ? 'high' : 'medium',
            `Missing Integration: Phase ${expected.source} → Phase ${expected.target}`,
            expected.description,
            [expected.source, expected.target],
            [...sourcePhase.engines.map(e => e.engineName), ...targetPhase.engines.map(e => e.engineName)],
            scope,
            [`Implement integration from ${sourcePhase.phaseName} to ${targetPhase.phaseName}`, 'Add cross-engine references', 'Test integration'],
            `Expected integration between Phase ${expected.source} and Phase ${expected.target}, found none`
          ));
        }
      }
    }

    return gaps;
  }

  /**
   * Detect missing fabric links
   */
  detectFabricLinkGaps(scope: CoverageScopeContext): CoverageGap[] {
    const gaps: CoverageGap[] = [];

    const phases = this.phaseInventory.getAllPhases();
    const fabricPhase = this.phaseInventory.getPhase(46);

    if (!fabricPhase) return gaps;

    // All phases after 46 should have fabric links
    for (const phase of phases) {
      if (phase.phaseNumber >= 34 && phase.phaseNumber !== 46 && !phase.hasFabricLinks) {
        gaps.push(this.createGap(
          'missing-fabric-links',
          'low',
          `Phase ${phase.phaseNumber} Not Linked to Fabric`,
          `${phase.phaseName} entities are not linked to Data Fabric mesh`,
          [phase.phaseNumber, 46],
          [...phase.engines.map(e => e.engineName), 'FabricEngine'],
          scope,
          [`Create fabric nodes for ${phase.phaseName} entities`, 'Establish edges to related entities', 'Test fabric queries'],
          `Expected fabric links for Phase ${phase.phaseNumber}, found none`
        ));
      }
    }

    return gaps;
  }

  /**
   * Detect missing health checks
   */
  detectHealthCheckGaps(scope: CoverageScopeContext): CoverageGap[] {
    const gaps: CoverageGap[] = [];

    const phases = this.phaseInventory.getAllPhases();
    const healthPhase = this.phaseInventory.getPhase(43);

    if (!healthPhase) return gaps;

    // Engines that store or transform data should have health checks
    const requiresHealthCheck = ['knowledgeGraph', 'search', 'timeline', 'analytics', 'training', 'marketplace', 'insights', 'governance', 'fabric'];

    for (const phase of phases) {
      const needsHealthCheck = phase.engines.some(e => requiresHealthCheck.includes(e.engineType));

      if (needsHealthCheck && phase.phaseNumber !== 43) {
        const hasHealthIntegration = this.phaseInventory.getAllIntegrations().some(
          i => (i.sourcePhase === 43 && i.targetPhase === phase.phaseNumber) || (i.sourcePhase === phase.phaseNumber && i.targetPhase === 43)
        );

        if (!hasHealthIntegration) {
          gaps.push(this.createGap(
            'missing-health-checks',
            'medium',
            `Phase ${phase.phaseNumber} Missing Health Checks`,
            `${phase.phaseName} has no health monitoring integration`,
            [phase.phaseNumber, 43],
            [...phase.engines.map(e => e.engineName), 'HealthEngine'],
            scope,
            [`Add health checks for ${phase.phaseName}`, 'Integrate with Health Engine (Phase 43)', 'Monitor data integrity'],
            `Expected health monitoring for Phase ${phase.phaseNumber}, found none`
          ));
        }
      }
    }

    return gaps;
  }

  /**
   * Detect missing governance coverage
   */
  detectGovernanceCoverageGaps(scope: CoverageScopeContext): CoverageGap[] {
    const gaps: CoverageGap[] = [];

    const phases = this.phaseInventory.getAllPhases();
    const governancePhase = this.phaseInventory.getPhase(44);

    if (!governancePhase) return gaps;

    // All engines should have governance policies
    for (const phase of phases) {
      if (phase.phaseNumber !== 44 && phase.phaseNumber !== 45 && !phase.hasPolicies) {
        gaps.push(this.createGap(
          'missing-governance-coverage',
          'medium',
          `Phase ${phase.phaseNumber} Missing Governance Policies`,
          `${phase.phaseName} has no governance policies defined`,
          [phase.phaseNumber, 44],
          [...phase.engines.map(e => e.engineName), 'GovernanceEngine'],
          scope,
          [`Define governance policies for ${phase.phaseName}`, 'Integrate with Governance Engine (Phase 44)', 'Enforce access control'],
          `Expected governance policies for Phase ${phase.phaseNumber}, found none`
        ));
      }
    }

    return gaps;
  }

  /**
   * Detect gaps by category
   */
  detectGapsByCategory(category: CoverageGapCategory, scope: CoverageScopeContext): CoverageGap[] {
    const allGaps = this.detectAllGaps(scope);
    return allGaps.filter(g => g.category === category);
  }

  /**
   * Detect gaps by severity
   */
  detectGapsBySeverity(severity: CoverageGapSeverity, scope: CoverageScopeContext): CoverageGap[] {
    const allGaps = this.detectAllGaps(scope);
    return allGaps.filter(g => g.severity === severity);
  }

  /**
   * Detect gaps for specific phase
   */
  detectGapsForPhase(phaseNumber: PhaseNumber, scope: CoverageScopeContext): CoverageGap[] {
    const phase = this.phaseInventory.getPhase(phaseNumber);
    if (!phase) return [];

    const phaseGaps = this.detectPhaseGaps(phase, scope);
    const integrationGaps = this.detectAllGaps(scope).filter(
      g => g.affectedPhases.includes(phaseNumber)
    );

    return [...phaseGaps, ...integrationGaps];
  }

  /**
   * Create a coverage gap
   */
  private createGap(
    category: CoverageGapCategory,
    severity: CoverageGapSeverity,
    title: string,
    description: string,
    affectedPhases: PhaseNumber[],
    affectedEngines: string[],
    scope: CoverageScopeContext,
    recommendations: string[],
    impactAnalysis: string
  ): CoverageGap {
    const id = `gap-${category}-${affectedPhases.join('-')}-${Date.now()}`;

    const references: CoverageReference[] = affectedPhases.map(phase => ({
      referenceType: 'phase',
      referenceId: `phase-${phase}`,
      referenceName: `Phase ${phase}`,
      phase,
      description: `Affected Phase ${phase}`
    }));

    return {
      id,
      category,
      severity,
      title,
      description,
      affectedPhases,
      affectedEngines,
      detectedAt: new Date().toISOString(),
      scope,
      recommendations,
      references,
      metadata: {
        expectedComponent: this.getExpectedComponent(category),
        actualComponent: null,
        impactAnalysis,
        estimatedEffort: this.estimateEffort(severity)
      }
    };
  }

  /**
   * Get expected component for gap category
   */
  private getExpectedComponent(category: CoverageGapCategory): string {
    const componentMap: Record<CoverageGapCategory, string> = {
      'missing-engine': 'Core engine module',
      'missing-ui-layer': 'Dashboard component',
      'missing-integration': 'Cross-engine integration',
      'missing-policy': 'Policy enforcement layer',
      'missing-documentation': 'Documentation files (SUMMARY, QUICK_REFERENCE, etc.)',
      'missing-lineage': 'Lineage tracking module',
      'missing-health-checks': 'Health monitoring integration',
      'missing-fabric-links': 'Fabric mesh links',
      'missing-governance-coverage': 'Governance policies'
    };
    return componentMap[category];
  }

  /**
   * Estimate effort based on severity
   */
  private estimateEffort(severity: CoverageGapSeverity): 'low' | 'medium' | 'high' {
    if (severity === 'critical' || severity === 'high') return 'high';
    if (severity === 'medium') return 'medium';
    return 'low';
  }

  /**
   * Define architectural requirements (can be extended)
   */
  private defineArchitecturalRequirements(): ArchitecturalRequirement[] {
    return [
      {
        requirementId: 'req-ui-layer',
        requirementName: 'UI Layer Required',
        category: 'ui',
        description: 'All engines must have at least one UI component',
        applicablePhases: 'all',
        mandatory: true,
        checkFunction: (phase) => phase.uiComponents.length > 0
      },
      {
        requirementId: 'req-audit-log',
        requirementName: 'Audit Log Required',
        category: 'policy',
        description: 'All engines must have audit logging',
        applicablePhases: 'all',
        mandatory: true,
        checkFunction: (phase) => phase.hasLog
      },
      {
        requirementId: 'req-policies',
        requirementName: 'Policy Layer Required',
        category: 'policy',
        description: 'All engines must have policy enforcement',
        applicablePhases: 'all',
        mandatory: false,
        checkFunction: (phase) => phase.hasPolicies
      },
      {
        requirementId: 'req-documentation',
        requirementName: 'Documentation Required',
        category: 'documentation',
        description: 'All phases must have documentation files',
        applicablePhases: 'all',
        mandatory: true,
        checkFunction: (phase) => phase.hasDocumentation
      },
      {
        requirementId: 'req-fabric-links',
        requirementName: 'Fabric Links Required',
        category: 'fabric',
        description: 'All engines should link to Data Fabric',
        applicablePhases: [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 47],
        mandatory: false,
        checkFunction: (phase) => phase.hasFabricLinks
      }
    ];
  }
}
