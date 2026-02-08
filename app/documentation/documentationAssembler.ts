/**
 * Phase 47: Autonomous Documentation Engine - Documentation Assembler
 * 
 * Deterministic document assembly from real system metadata.
 * No generative AI, no invented content.
 */

import {
  DocumentationQuery,
  DocumentationResult,
  DocumentationBundle,
  DocumentationSection,
  DocumentationReference,
  DocumentationMetadata,
  MetadataSource,
  DocumentationScopeContext,
  ReferenceType,
  DocumentationEngineType,
  DocumentationAssetType,
  DocumentationTemplate
} from './documentationTypes';
import { DocumentationTemplateLibrary } from './documentationTemplateLibrary';

// ============================================================================
// DOCUMENTATION ASSEMBLER
// ============================================================================

export class DocumentationAssembler {
  private templateLibrary: DocumentationTemplateLibrary;

  constructor(templateLibrary: DocumentationTemplateLibrary) {
    this.templateLibrary = templateLibrary;
  }

  /**
   * Assemble documentation from template and metadata
   */
  assembleDocumentation(
    query: DocumentationQuery,
    template: DocumentationTemplate,
    metadataSources: MetadataSource[],
    performedBy: string
  ): DocumentationResult {
    const startTime = Date.now();

    // Extract metadata by field
    const metadataByField = this.organizeMetadataByField(metadataSources);

    // Generate sections
    const sections = this.generateSections(template, metadataByField, query.scope);

    // Generate references
    const references = this.generateReferences(metadataSources, query.scope);

    // Generate table of contents
    const tableOfContents = query.options?.includeTableOfContents
      ? this.generateTableOfContents(sections)
      : undefined;

    const bundle: DocumentationBundle = {
      sections,
      references,
      tableOfContents,
      totalSections: sections.length,
      totalReferences: references.length,
      totalMetadataFields: Object.keys(metadataByField).length
    };

    const metadata: DocumentationMetadata = {
      templateUsed: template.id,
      templateVersion: template.version,
      metadataSources,
      totalEnginesQueried: this.countUniqueEngines(metadataSources),
      enginesQueried: this.getUniqueEngines(metadataSources),
      totalFieldsExtracted: metadataSources.length,
      policyEvaluations: [],
      generatedAt: new Date().toISOString(),
      generatedBy: performedBy,
      scope: query.scope
    };

    const executionTime = Date.now() - startTime;

    return {
      id: this.generateResultId(),
      queryType: query.queryType,
      templateType: template.templateType,
      title: this.generateTitle(template, metadataByField),
      description: template.description,
      category: template.category,
      scope: query.scope,
      bundle,
      metadata,
      executionTimeMs: executionTime,
      generatedAt: new Date().toISOString(),
      generatedBy: performedBy
    };
  }

  /**
   * Generate sections from template
   */
  private generateSections(
    template: DocumentationTemplate,
    metadataByField: Record<string, any>,
    scope: DocumentationScopeContext
  ): DocumentationSection[] {
    const sections: DocumentationSection[] = [];

    for (const templateSection of template.sections) {
      const section = this.generateSection(
        templateSection,
        metadataByField,
        scope,
        1
      );
      if (section) {
        sections.push(section);
      }
    }

    return sections;
  }

  /**
   * Generate single section
   */
  private generateSection(
    templateSection: any,
    metadataByField: Record<string, any>,
    scope: DocumentationScopeContext,
    level: number
  ): DocumentationSection | null {
    // Fill placeholder with real metadata
    let content = templateSection.placeholder;
    const metadataUsed: MetadataSource[] = [];
    const references: string[] = [];

    for (const fieldName of templateSection.metadataFields) {
      const value = metadataByField[fieldName];
      if (value !== undefined) {
        // Replace placeholder
        const placeholder = `{${fieldName.toUpperCase().replace(/([A-Z])/g, '_$1')}}`;
        content = content.replace(placeholder, this.formatValue(value, templateSection.formatting));

        // Track metadata source
        if (value.source) {
          metadataUsed.push(value.source);
        }

        // Track references
        if (value.references) {
          references.push(...value.references);
        }
      }
    }

    // If required section has no content, return null
    if (templateSection.required && content === templateSection.placeholder) {
      return null;
    }

    // Generate subsections
    const subSections = templateSection.subSections
      ? templateSection.subSections
          .map((sub: any) => this.generateSection(sub, metadataByField, scope, level + 1))
          .filter((s: any) => s !== null)
      : undefined;

    return {
      id: this.generateSectionId(),
      title: templateSection.title,
      order: templateSection.order,
      level,
      content,
      contentType: templateSection.formatting,
      metadataSource: metadataUsed,
      references,
      subSections,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generate references from metadata
   */
  private generateReferences(
    metadataSources: MetadataSource[],
    scope: DocumentationScopeContext
  ): DocumentationReference[] {
    const references: DocumentationReference[] = [];
    const seen = new Set<string>();

    for (const source of metadataSources) {
      if (source.sourceAssetId) {
        const refId = `${source.engineType}-${source.sourceAssetId}`;
        if (!seen.has(refId)) {
          seen.add(refId);

          references.push({
            id: this.generateReferenceId(),
            referenceType: this.determineReferenceType(source.engineType),
            targetEngine: source.engineType,
            targetPhase: source.sourcePhase,
            targetAssetType: source.sourceAssetType,
            targetAssetId: source.sourceAssetId,
            targetAssetName: String(source.fieldValue?.name || source.sourceAssetId),
            description: `Reference to ${source.engineType} asset`,
            scope,
            visibility: this.determineVisibility(scope)
          });
        }
      }
    }

    return references;
  }

  /**
   * Generate table of contents
   */
  private generateTableOfContents(sections: DocumentationSection[]): any[] {
    const toc: any[] = [];
    let order = 0;

    for (const section of sections) {
      order++;
      toc.push({
        id: this.generateTocId(),
        title: section.title,
        level: section.level,
        order,
        sectionId: section.id
      });

      if (section.subSections) {
        for (const sub of section.subSections) {
          order++;
          toc.push({
            id: this.generateTocId(),
            title: sub.title,
            level: sub.level,
            order,
            sectionId: sub.id
          });
        }
      }
    }

    return toc;
  }

  /**
   * Organize metadata by field name
   */
  private organizeMetadataByField(sources: MetadataSource[]): Record<string, any> {
    const byField: Record<string, any> = {};

    for (const source of sources) {
      byField[source.fieldName] = {
        value: source.fieldValue,
        source
      };
    }

    return byField;
  }

  /**
   * Format value based on formatting type
   */
  private formatValue(value: any, formatting: string): string {
    if (value?.value !== undefined) {
      value = value.value;
    }

    if (Array.isArray(value)) {
      if (formatting === 'list') {
        return value.map((v, i) => `${i + 1}. ${v}`).join('\n');
      }
      return value.join(', ');
    }

    if (typeof value === 'object' && value !== null) {
      if (formatting === 'json') {
        return JSON.stringify(value, null, 2);
      }
      return JSON.stringify(value);
    }

    return String(value);
  }

  /**
   * Generate title from template and metadata
   */
  private generateTitle(template: DocumentationTemplate, metadataByField: Record<string, any>): string {
    const name = metadataByField.name?.value || metadataByField.engineName?.value || 'Unknown';
    return `${template.name}: ${name}`;
  }

  /**
   * Count unique engines
   */
  private countUniqueEngines(sources: MetadataSource[]): number {
    return new Set(sources.map(s => s.engineType)).size;
  }

  /**
   * Get unique engines
   */
  private getUniqueEngines(sources: MetadataSource[]): DocumentationEngineType[] {
    return Array.from(new Set(sources.map(s => s.engineType)));
  }

  /**
   * Determine reference type
   */
  private determineReferenceType(engineType: DocumentationEngineType): ReferenceType {
    if (engineType === 'fabric') return 'fabric-link-reference';
    if (engineType === 'governanceHistory') return 'lineage-reference';
    if (engineType === 'compliance') return 'compliance-reference';
    return 'asset-reference';
  }

  /**
   * Determine visibility
   */
  private determineVisibility(scope: DocumentationScopeContext): 'public' | 'tenant' | 'facility' | 'room' | 'private' {
    if (scope.scope === 'global') return 'public';
    if (scope.scope === 'tenant') return 'tenant';
    if (scope.scope === 'facility') return 'facility';
    if (scope.scope === 'room') return 'room';
    return 'private';
  }

  // ============================================================================
  // ID GENERATION
  // ============================================================================

  private generateResultId(): string {
    return `doc-result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSectionId(): string {
    return `doc-section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReferenceId(): string {
    return `doc-ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTocId(): string {
    return `doc-toc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// METADATA EXTRACTION (MOCK - WOULD INTEGRATE WITH REAL ENGINES)
// ============================================================================

export function extractMetadataFromEngines(
  query: DocumentationQuery,
  template: DocumentationTemplate
): MetadataSource[] {
  const sources: MetadataSource[] = [];
  const now = new Date().toISOString();

  // This is a mock implementation
  // In production, this would query real engines based on query filters

  if (query.filters.engineType) {
    // Extract from specific engine
    sources.push(...mockExtractFromEngine(query.filters.engineType, template, query.scope, now));
  } else if (query.filters.assetId) {
    // Extract from specific asset
    sources.push(...mockExtractFromAsset(query.filters.assetId, query.filters.assetType!, query.scope, now));
  } else {
    // Extract system overview
    sources.push(...mockExtractSystemOverview(query.scope, now));
  }

  return sources;
}

function mockExtractFromEngine(
  engineType: DocumentationEngineType,
  template: DocumentationTemplate,
  scope: DocumentationScopeContext,
  timestamp: string
): MetadataSource[] {
  const phase = getPhaseForEngine(engineType);
  
  return [
    {
      engineType,
      sourcePhase: phase,
      fieldName: 'name',
      fieldValue: formatEngineName(engineType),
      extractedAt: timestamp
    },
    {
      engineType,
      sourcePhase: phase,
      fieldName: 'description',
      fieldValue: `${formatEngineName(engineType)} provides comprehensive capabilities for the mushroom cultivation platform.`,
      extractedAt: timestamp
    },
    {
      engineType,
      sourcePhase: phase,
      fieldName: 'phase',
      fieldValue: phase,
      extractedAt: timestamp
    },
    {
      engineType,
      sourcePhase: phase,
      fieldName: 'capabilities',
      fieldValue: ['Data management', 'Query execution', 'Cross-engine integration'],
      extractedAt: timestamp
    },
    {
      engineType,
      sourcePhase: phase,
      fieldName: 'entityTypes',
      fieldValue: getEntityTypesForEngine(engineType),
      extractedAt: timestamp
    }
  ];
}

function mockExtractFromAsset(
  assetId: string,
  assetType: DocumentationAssetType,
  scope: DocumentationScopeContext,
  timestamp: string
): MetadataSource[] {
  const engineType = getEngineForAssetType(assetType);
  const phase = getPhaseForEngine(engineType);

  return [
    {
      engineType,
      sourcePhase: phase,
      sourceAssetType: assetType,
      sourceAssetId: assetId,
      fieldName: 'name',
      fieldValue: `Sample ${assetType}`,
      extractedAt: timestamp
    },
    {
      engineType,
      sourcePhase: phase,
      sourceAssetType: assetType,
      sourceAssetId: assetId,
      fieldName: 'type',
      fieldValue: assetType,
      extractedAt: timestamp
    },
    {
      engineType,
      sourcePhase: phase,
      sourceAssetType: assetType,
      sourceAssetId: assetId,
      fieldName: 'description',
      fieldValue: `This is a sample ${assetType} for demonstration purposes.`,
      extractedAt: timestamp
    },
    {
      engineType,
      sourcePhase: phase,
      sourceAssetType: assetType,
      sourceAssetId: assetId,
      fieldName: 'created',
      fieldValue: timestamp,
      extractedAt: timestamp
    },
    {
      engineType,
      sourcePhase: phase,
      sourceAssetType: assetType,
      sourceAssetId: assetId,
      fieldName: 'tenantId',
      fieldValue: scope.tenantId,
      extractedAt: timestamp
    }
  ];
}

function mockExtractSystemOverview(
  scope: DocumentationScopeContext,
  timestamp: string
): MetadataSource[] {
  return [
    {
      engineType: 'fabric',
      sourcePhase: 46,
      fieldName: 'platformName',
      fieldValue: 'Mushroom Cultivation Platform',
      extractedAt: timestamp
    },
    {
      engineType: 'fabric',
      sourcePhase: 46,
      fieldName: 'version',
      fieldValue: '1.0.0',
      extractedAt: timestamp
    },
    {
      engineType: 'fabric',
      sourcePhase: 46,
      fieldName: 'tenant',
      fieldValue: scope.tenantId,
      extractedAt: timestamp
    },
    {
      engineType: 'fabric',
      sourcePhase: 46,
      fieldName: 'engines',
      fieldValue: [
        'Knowledge Graph', 'Search', 'Timeline', 'Analytics',
        'Training', 'Insights', 'Governance', 'Health', 'Fabric'
      ],
      extractedAt: timestamp
    }
  ];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getPhaseForEngine(engineType: DocumentationEngineType): number {
  const phases: Record<DocumentationEngineType, number> = {
    compliance: 32,
    knowledgeGraph: 34,
    search: 35,
    copilot: 36,
    narrative: 37,
    timeline: 38,
    analytics: 39,
    training: 40,
    marketplace: 41,
    insights: 42,
    health: 43,
    governance: 44,
    governanceHistory: 45,
    fabric: 46
  };
  return phases[engineType] || 0;
}

function formatEngineName(engineType: DocumentationEngineType): string {
  const names: Record<DocumentationEngineType, string> = {
    compliance: 'Compliance Engine',
    knowledgeGraph: 'Knowledge Graph',
    search: 'Search Engine',
    copilot: 'Copilot',
    narrative: 'Narrative Engine',
    timeline: 'Timeline Engine',
    analytics: 'Analytics Engine',
    training: 'Training System',
    marketplace: 'Marketplace',
    insights: 'Insights Engine',
    health: 'Health Monitor',
    governance: 'Governance System',
    governanceHistory: 'Governance History',
    fabric: 'Data Fabric'
  };
  return names[engineType] || engineType;
}

function getEntityTypesForEngine(engineType: DocumentationEngineType): string[] {
  const types: Record<DocumentationEngineType, string[]> = {
    compliance: ['compliance-control', 'compliance-finding'],
    knowledgeGraph: ['kg-node'],
    search: ['search-entity'],
    copilot: ['conversation', 'suggestion'],
    narrative: ['narrative-reference', 'narrative-explanation'],
    timeline: ['timeline-event'],
    analytics: ['analytics-pattern', 'analytics-cluster', 'analytics-trend'],
    training: ['training-module', 'training-step', 'training-certification'],
    marketplace: ['marketplace-asset', 'marketplace-vendor'],
    insights: ['knowledge-pack', 'insight'],
    health: ['health-finding', 'health-drift', 'integrity-issue'],
    governance: ['governance-role', 'governance-permission', 'governance-policy'],
    governanceHistory: ['governance-change', 'governance-lineage'],
    fabric: ['fabric-node', 'fabric-edge']
  };
  return types[engineType] || [];
}

function getEngineForAssetType(assetType: DocumentationAssetType): DocumentationEngineType {
  if (assetType.startsWith('training-')) return 'training';
  if (assetType.startsWith('knowledge-') || assetType === 'insight') return 'insights';
  if (assetType.startsWith('marketplace-')) return 'marketplace';
  if (assetType.startsWith('governance-')) return 'governance';
  if (assetType.startsWith('health-')) return 'health';
  if (assetType.startsWith('analytics-')) return 'analytics';
  if (assetType === 'timeline-event') return 'timeline';
  if (assetType === 'kg-node') return 'knowledgeGraph';
  if (assetType === 'fabric-node') return 'fabric';
  return 'fabric';
}

export function createDocumentationAssembler(
  templateLibrary: DocumentationTemplateLibrary
): DocumentationAssembler {
  return new DocumentationAssembler(templateLibrary);
}
