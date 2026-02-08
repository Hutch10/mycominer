/**
 * Phase 47: Autonomous Documentation Engine - Template Library
 * 
 * Deterministic templates with static structure and placeholders.
 * No generative AI, no invented content.
 */

import {
  DocumentationTemplate,
  DocumentationTemplateType,
  DocumentationCategory,
  DocumentationEngineType,
  DocumentationAssetType,
  TemplateSection
} from './documentationTypes';

// ============================================================================
// TEMPLATE LIBRARY
// ============================================================================

export class DocumentationTemplateLibrary {
  private templates: Map<string, DocumentationTemplate> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates(): void {
    const defaultTemplates: DocumentationTemplate[] = [
      this.createEngineOverviewTemplate(),
      this.createAssetSummaryTemplate(),
      this.createCrossEngineLinkSummaryTemplate(),
      this.createGovernanceLineageReportTemplate(),
      this.createHealthDriftSummaryTemplate(),
      this.createTrainingModuleDocumentationTemplate(),
      this.createKnowledgePackDocumentationTemplate(),
      this.createMarketplaceAssetDocumentationTemplate(),
      this.createComplianceReportTemplate(),
      this.createOperationalSummaryTemplate(),
      this.createSystemOverviewTemplate(),
      this.createTimelineEventSummaryTemplate(),
      this.createAnalyticsPatternDocumentationTemplate(),
      this.createFabricLinkDocumentationTemplate()
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // ============================================================================
  // ENGINE OVERVIEW TEMPLATE
  // ============================================================================

  private createEngineOverviewTemplate(): DocumentationTemplate {
    return {
      id: 'template-engine-overview',
      templateType: 'engine-overview',
      name: 'Engine Overview',
      description: 'Comprehensive overview of a system engine',
      category: 'engine-summary',
      sections: [
        {
          id: 'section-basic-info',
          title: 'Basic Information',
          order: 1,
          required: true,
          placeholder: '{ENGINE_NAME} - {ENGINE_DESCRIPTION}',
          metadataFields: ['name', 'description', 'phase', 'version'],
          formatting: 'text'
        },
        {
          id: 'section-capabilities',
          title: 'Capabilities',
          order: 2,
          required: true,
          placeholder: 'This engine provides: {CAPABILITY_LIST}',
          metadataFields: ['capabilities', 'features'],
          formatting: 'list'
        },
        {
          id: 'section-entity-types',
          title: 'Entity Types',
          order: 3,
          required: true,
          placeholder: 'Supported entity types: {ENTITY_TYPE_LIST}',
          metadataFields: ['entityTypes', 'supportedTypes'],
          formatting: 'list'
        },
        {
          id: 'section-statistics',
          title: 'Statistics',
          order: 4,
          required: false,
          placeholder: 'Total entities: {TOTAL_ENTITIES}, Queries (24h): {QUERIES_24H}',
          metadataFields: ['totalEntities', 'queries24h', 'lastUpdated'],
          formatting: 'table'
        },
        {
          id: 'section-integration',
          title: 'Integration Points',
          order: 5,
          required: false,
          placeholder: 'Integrates with: {INTEGRATION_LIST}',
          metadataFields: ['integratedEngines', 'dependencies'],
          formatting: 'list'
        }
      ],
      requiredMetadata: ['name', 'description', 'phase', 'capabilities', 'entityTypes'],
      optionalMetadata: ['version', 'totalEntities', 'queries24h', 'integratedEngines'],
      supportedEngines: [
        'knowledgeGraph', 'search', 'copilot', 'narrative', 'timeline',
        'analytics', 'training', 'marketplace', 'insights', 'health',
        'governance', 'governanceHistory', 'fabric', 'compliance'
      ],
      supportedAssetTypes: [],
      created: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // ============================================================================
  // ASSET SUMMARY TEMPLATE
  // ============================================================================

  private createAssetSummaryTemplate(): DocumentationTemplate {
    return {
      id: 'template-asset-summary',
      templateType: 'asset-summary',
      name: 'Asset Summary',
      description: 'Summary documentation for a system asset',
      category: 'asset-documentation',
      sections: [
        {
          id: 'section-asset-basic',
          title: 'Asset Information',
          order: 1,
          required: true,
          placeholder: '{ASSET_NAME} ({ASSET_TYPE})',
          metadataFields: ['name', 'type', 'id', 'description'],
          formatting: 'text'
        },
        {
          id: 'section-asset-metadata',
          title: 'Metadata',
          order: 2,
          required: true,
          placeholder: 'Created: {CREATED}, Last Updated: {UPDATED}, Owner: {OWNER}',
          metadataFields: ['created', 'updated', 'owner', 'status'],
          formatting: 'table'
        },
        {
          id: 'section-asset-scope',
          title: 'Scope',
          order: 3,
          required: true,
          placeholder: 'Tenant: {TENANT_ID}, Facility: {FACILITY_ID}',
          metadataFields: ['tenantId', 'facilityId', 'roomId', 'visibility'],
          formatting: 'text'
        },
        {
          id: 'section-asset-content',
          title: 'Content',
          order: 4,
          required: false,
          placeholder: '{ASSET_CONTENT}',
          metadataFields: ['content', 'steps', 'procedures', 'data'],
          formatting: 'text'
        },
        {
          id: 'section-asset-references',
          title: 'Related Assets',
          order: 5,
          required: false,
          placeholder: 'References: {REFERENCE_LIST}',
          metadataFields: ['references', 'dependencies', 'relatedAssets'],
          formatting: 'list'
        }
      ],
      requiredMetadata: ['name', 'type', 'id', 'description', 'created', 'tenantId'],
      optionalMetadata: ['updated', 'owner', 'status', 'content', 'references'],
      supportedEngines: ['training', 'insights', 'marketplace', 'governance', 'fabric'],
      supportedAssetTypes: [
        'training-module', 'training-step', 'knowledge-pack', 'insight',
        'marketplace-asset', 'governance-role', 'governance-policy'
      ],
      created: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // ============================================================================
  // CROSS-ENGINE LINK SUMMARY TEMPLATE
  // ============================================================================

  private createCrossEngineLinkSummaryTemplate(): DocumentationTemplate {
    return {
      id: 'template-cross-engine-links',
      templateType: 'cross-engine-link-summary',
      name: 'Cross-Engine Link Summary',
      description: 'Documentation of relationships across engines',
      category: 'lineage-documentation',
      sections: [
        {
          id: 'section-link-overview',
          title: 'Link Overview',
          order: 1,
          required: true,
          placeholder: 'Total links: {TOTAL_LINKS}, Engines: {ENGINE_COUNT}',
          metadataFields: ['totalLinks', 'engineCount', 'linkTypes'],
          formatting: 'text'
        },
        {
          id: 'section-link-list',
          title: 'Links',
          order: 2,
          required: true,
          placeholder: '{FROM_ENTITY} ({FROM_ENGINE}) -> {LINK_TYPE} -> {TO_ENTITY} ({TO_ENGINE})',
          metadataFields: ['fromEntity', 'fromEngine', 'linkType', 'toEntity', 'toEngine', 'strength'],
          formatting: 'table'
        },
        {
          id: 'section-link-rationale',
          title: 'Link Rationale',
          order: 3,
          required: false,
          placeholder: '{LINK_RATIONALE}',
          metadataFields: ['rationale', 'createdBy', 'created'],
          formatting: 'text'
        }
      ],
      requiredMetadata: ['totalLinks', 'engineCount', 'fromEntity', 'toEntity', 'linkType'],
      optionalMetadata: ['strength', 'rationale', 'createdBy'],
      supportedEngines: ['fabric'],
      supportedAssetTypes: ['fabric-node'],
      created: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // ============================================================================
  // GOVERNANCE LINEAGE REPORT TEMPLATE
  // ============================================================================

  private createGovernanceLineageReportTemplate(): DocumentationTemplate {
    return {
      id: 'template-governance-lineage',
      templateType: 'governance-lineage-report',
      name: 'Governance Lineage Report',
      description: 'Historical lineage of governance changes',
      category: 'lineage-documentation',
      sections: [
        {
          id: 'section-governance-entity',
          title: 'Governance Entity',
          order: 1,
          required: true,
          placeholder: '{ENTITY_TYPE}: {ENTITY_NAME} (ID: {ENTITY_ID})',
          metadataFields: ['entityType', 'entityName', 'entityId'],
          formatting: 'text'
        },
        {
          id: 'section-change-history',
          title: 'Change History',
          order: 2,
          required: true,
          placeholder: '{TIMESTAMP}: {CHANGE_TYPE} - {CHANGE_DESCRIPTION}',
          metadataFields: ['changes', 'timestamp', 'changeType', 'description', 'performedBy'],
          formatting: 'table'
        },
        {
          id: 'section-lineage-chain',
          title: 'Lineage Chain',
          order: 3,
          required: false,
          placeholder: '{VERSION_1} -> {VERSION_2} -> {VERSION_3}',
          metadataFields: ['versions', 'lineageChain'],
          formatting: 'list'
        },
        {
          id: 'section-impact-analysis',
          title: 'Impact Analysis',
          order: 4,
          required: false,
          placeholder: 'Affected entities: {AFFECTED_ENTITIES}',
          metadataFields: ['affectedEntities', 'impactScope'],
          formatting: 'list'
        }
      ],
      requiredMetadata: ['entityType', 'entityName', 'entityId', 'changes'],
      optionalMetadata: ['versions', 'affectedEntities', 'impactScope'],
      supportedEngines: ['governanceHistory'],
      supportedAssetTypes: ['governance-role', 'governance-permission', 'governance-policy', 'governance-change'],
      created: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // ============================================================================
  // HEALTH & DRIFT SUMMARY TEMPLATE
  // ============================================================================

  private createHealthDriftSummaryTemplate(): DocumentationTemplate {
    return {
      id: 'template-health-drift',
      templateType: 'health-drift-summary',
      name: 'Health & Drift Summary',
      description: 'System health and configuration drift documentation',
      category: 'operational-documentation',
      sections: [
        {
          id: 'section-health-overview',
          title: 'Health Overview',
          order: 1,
          required: true,
          placeholder: 'Total findings: {TOTAL_FINDINGS}, Critical: {CRITICAL_COUNT}',
          metadataFields: ['totalFindings', 'criticalCount', 'warningCount', 'infoCount'],
          formatting: 'text'
        },
        {
          id: 'section-findings-list',
          title: 'Findings',
          order: 2,
          required: true,
          placeholder: '{SEVERITY}: {FINDING_TYPE} - {DESCRIPTION}',
          metadataFields: ['findings', 'severity', 'findingType', 'description', 'detected'],
          formatting: 'table'
        },
        {
          id: 'section-drift-analysis',
          title: 'Configuration Drift',
          order: 3,
          required: false,
          placeholder: '{DRIFT_TYPE}: Expected {EXPECTED}, Actual {ACTUAL}',
          metadataFields: ['drifts', 'driftType', 'expected', 'actual', 'delta'],
          formatting: 'table'
        },
        {
          id: 'section-recommendations',
          title: 'Recommendations',
          order: 4,
          required: false,
          placeholder: '{RECOMMENDATION_LIST}',
          metadataFields: ['recommendations', 'actions'],
          formatting: 'list'
        }
      ],
      requiredMetadata: ['totalFindings', 'findings', 'severity', 'findingType'],
      optionalMetadata: ['drifts', 'recommendations', 'actions'],
      supportedEngines: ['health'],
      supportedAssetTypes: ['health-finding', 'health-drift', 'integrity-issue'],
      created: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // ============================================================================
  // TRAINING MODULE DOCUMENTATION TEMPLATE
  // ============================================================================

  private createTrainingModuleDocumentationTemplate(): DocumentationTemplate {
    return {
      id: 'template-training-module',
      templateType: 'training-module-documentation',
      name: 'Training Module Documentation',
      description: 'Comprehensive training module documentation',
      category: 'asset-documentation',
      sections: [
        {
          id: 'section-module-info',
          title: 'Module Information',
          order: 1,
          required: true,
          placeholder: '{MODULE_NAME} - {DIFFICULTY} ({DURATION})',
          metadataFields: ['name', 'difficulty', 'duration', 'category'],
          formatting: 'text'
        },
        {
          id: 'section-objectives',
          title: 'Learning Objectives',
          order: 2,
          required: true,
          placeholder: '{OBJECTIVE_LIST}',
          metadataFields: ['objectives', 'outcomes'],
          formatting: 'list'
        },
        {
          id: 'section-steps',
          title: 'Training Steps',
          order: 3,
          required: true,
          placeholder: 'Step {STEP_NUMBER}: {STEP_TITLE} - {STEP_DESCRIPTION}',
          metadataFields: ['steps', 'stepNumber', 'stepTitle', 'stepDescription'],
          formatting: 'list',
          subSections: [
            {
              id: 'subsection-step-content',
              title: 'Content',
              order: 1,
              required: true,
              placeholder: '{STEP_CONTENT}',
              metadataFields: ['content'],
              formatting: 'text'
            }
          ]
        },
        {
          id: 'section-prerequisites',
          title: 'Prerequisites',
          order: 4,
          required: false,
          placeholder: '{PREREQUISITE_LIST}',
          metadataFields: ['prerequisites', 'requiredKnowledge'],
          formatting: 'list'
        },
        {
          id: 'section-certifications',
          title: 'Certifications',
          order: 5,
          required: false,
          placeholder: 'Completion grants: {CERTIFICATION_LIST}',
          metadataFields: ['certifications', 'credentials'],
          formatting: 'list'
        }
      ],
      requiredMetadata: ['name', 'difficulty', 'duration', 'objectives', 'steps'],
      optionalMetadata: ['prerequisites', 'certifications', 'category'],
      supportedEngines: ['training'],
      supportedAssetTypes: ['training-module', 'training-step', 'training-certification'],
      created: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // ============================================================================
  // KNOWLEDGE PACK DOCUMENTATION TEMPLATE
  // ============================================================================

  private createKnowledgePackDocumentationTemplate(): DocumentationTemplate {
    return {
      id: 'template-knowledge-pack',
      templateType: 'knowledge-pack-documentation',
      name: 'Knowledge Pack Documentation',
      description: 'Knowledge pack content and metadata',
      category: 'asset-documentation',
      sections: [
        {
          id: 'section-pack-info',
          title: 'Knowledge Pack Information',
          order: 1,
          required: true,
          placeholder: '{PACK_NAME} - {CATEGORY}',
          metadataFields: ['name', 'category', 'type', 'version'],
          formatting: 'text'
        },
        {
          id: 'section-pack-content',
          title: 'Content',
          order: 2,
          required: true,
          placeholder: '{PACK_CONTENT}',
          metadataFields: ['content', 'summary', 'details'],
          formatting: 'text'
        },
        {
          id: 'section-insights',
          title: 'Insights',
          order: 3,
          required: false,
          placeholder: '{INSIGHT_LIST}',
          metadataFields: ['insights', 'keyPoints'],
          formatting: 'list'
        },
        {
          id: 'section-references',
          title: 'References',
          order: 4,
          required: false,
          placeholder: '{REFERENCE_LIST}',
          metadataFields: ['references', 'sources'],
          formatting: 'list'
        }
      ],
      requiredMetadata: ['name', 'category', 'content'],
      optionalMetadata: ['insights', 'references', 'version'],
      supportedEngines: ['insights'],
      supportedAssetTypes: ['knowledge-pack', 'insight'],
      created: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // ============================================================================
  // MARKETPLACE ASSET DOCUMENTATION TEMPLATE
  // ============================================================================

  private createMarketplaceAssetDocumentationTemplate(): DocumentationTemplate {
    return {
      id: 'template-marketplace-asset',
      templateType: 'marketplace-asset-documentation',
      name: 'Marketplace Asset Documentation',
      description: 'Marketplace asset listing documentation',
      category: 'asset-documentation',
      sections: [
        {
          id: 'section-asset-listing',
          title: 'Asset Listing',
          order: 1,
          required: true,
          placeholder: '{ASSET_NAME} by {VENDOR_NAME}',
          metadataFields: ['name', 'vendorName', 'vendorId', 'category'],
          formatting: 'text'
        },
        {
          id: 'section-asset-details',
          title: 'Details',
          order: 2,
          required: true,
          placeholder: '{DESCRIPTION}',
          metadataFields: ['description', 'features', 'specifications'],
          formatting: 'text'
        },
        {
          id: 'section-pricing',
          title: 'Pricing',
          order: 3,
          required: false,
          placeholder: 'Price: {PRICE}, License: {LICENSE_TYPE}',
          metadataFields: ['price', 'licenseType', 'pricing'],
          formatting: 'table'
        },
        {
          id: 'section-vendor-info',
          title: 'Vendor Information',
          order: 4,
          required: false,
          placeholder: 'Vendor: {VENDOR_NAME}, Rating: {RATING}',
          metadataFields: ['vendorName', 'vendorId', 'rating', 'contact'],
          formatting: 'text'
        }
      ],
      requiredMetadata: ['name', 'vendorName', 'description'],
      optionalMetadata: ['price', 'licenseType', 'rating'],
      supportedEngines: ['marketplace'],
      supportedAssetTypes: ['marketplace-asset', 'marketplace-vendor'],
      created: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // ============================================================================
  // COMPLIANCE REPORT TEMPLATE
  // ============================================================================

  private createComplianceReportTemplate(): DocumentationTemplate {
    return {
      id: 'template-compliance-report',
      templateType: 'compliance-report',
      name: 'Compliance Report',
      description: 'Compliance status and audit documentation',
      category: 'compliance-documentation',
      sections: [
        {
          id: 'section-compliance-overview',
          title: 'Compliance Overview',
          order: 1,
          required: true,
          placeholder: 'Status: {STATUS}, Last Audit: {LAST_AUDIT}',
          metadataFields: ['status', 'lastAudit', 'framework'],
          formatting: 'text'
        },
        {
          id: 'section-controls',
          title: 'Controls',
          order: 2,
          required: true,
          placeholder: '{CONTROL_ID}: {CONTROL_NAME} - {STATUS}',
          metadataFields: ['controls', 'controlId', 'controlName', 'status'],
          formatting: 'table'
        },
        {
          id: 'section-findings',
          title: 'Findings',
          order: 3,
          required: false,
          placeholder: '{FINDING_LIST}',
          metadataFields: ['findings', 'severity', 'description'],
          formatting: 'list'
        }
      ],
      requiredMetadata: ['status', 'lastAudit', 'controls'],
      optionalMetadata: ['findings', 'framework'],
      supportedEngines: ['compliance'],
      supportedAssetTypes: [],
      created: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // ============================================================================
  // OPERATIONAL SUMMARY TEMPLATE
  // ============================================================================

  private createOperationalSummaryTemplate(): DocumentationTemplate {
    return {
      id: 'template-operational-summary',
      templateType: 'operational-summary',
      name: 'Operational Summary',
      description: 'Operational activities and events summary',
      category: 'operational-documentation',
      sections: [
        {
          id: 'section-period',
          title: 'Period',
          order: 1,
          required: true,
          placeholder: 'From {START_DATE} to {END_DATE}',
          metadataFields: ['startDate', 'endDate'],
          formatting: 'text'
        },
        {
          id: 'section-events',
          title: 'Events',
          order: 2,
          required: true,
          placeholder: '{TIMESTAMP}: {EVENT_TYPE} - {DESCRIPTION}',
          metadataFields: ['events', 'timestamp', 'eventType', 'description'],
          formatting: 'table'
        },
        {
          id: 'section-metrics',
          title: 'Metrics',
          order: 3,
          required: false,
          placeholder: '{METRIC_LIST}',
          metadataFields: ['metrics', 'kpis'],
          formatting: 'table'
        }
      ],
      requiredMetadata: ['startDate', 'endDate', 'events'],
      optionalMetadata: ['metrics', 'kpis'],
      supportedEngines: ['timeline'],
      supportedAssetTypes: ['timeline-event'],
      created: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // ============================================================================
  // SYSTEM OVERVIEW TEMPLATE
  // ============================================================================

  private createSystemOverviewTemplate(): DocumentationTemplate {
    return {
      id: 'template-system-overview',
      templateType: 'system-overview',
      name: 'System Overview',
      description: 'Complete system documentation',
      category: 'system-overview',
      sections: [
        {
          id: 'section-system-info',
          title: 'System Information',
          order: 1,
          required: true,
          placeholder: 'Platform: {PLATFORM_NAME}, Version: {VERSION}',
          metadataFields: ['platformName', 'version', 'tenant'],
          formatting: 'text'
        },
        {
          id: 'section-engines',
          title: 'Engines',
          order: 2,
          required: true,
          placeholder: '{ENGINE_LIST}',
          metadataFields: ['engines', 'phases'],
          formatting: 'list'
        },
        {
          id: 'section-statistics',
          title: 'Statistics',
          order: 3,
          required: false,
          placeholder: '{STATISTIC_LIST}',
          metadataFields: ['totalAssets', 'totalUsers', 'totalEvents'],
          formatting: 'table'
        }
      ],
      requiredMetadata: ['platformName', 'engines'],
      optionalMetadata: ['version', 'totalAssets'],
      supportedEngines: [
        'knowledgeGraph', 'search', 'timeline', 'analytics', 'training',
        'insights', 'governance', 'health', 'fabric'
      ],
      supportedAssetTypes: [],
      created: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // ============================================================================
  // TIMELINE EVENT SUMMARY TEMPLATE
  // ============================================================================

  private createTimelineEventSummaryTemplate(): DocumentationTemplate {
    return {
      id: 'template-timeline-event',
      templateType: 'timeline-event-summary',
      name: 'Timeline Event Summary',
      description: 'Timeline event documentation',
      category: 'operational-documentation',
      sections: [
        {
          id: 'section-event-info',
          title: 'Event Information',
          order: 1,
          required: true,
          placeholder: '{EVENT_TYPE}: {EVENT_NAME} at {TIMESTAMP}',
          metadataFields: ['eventType', 'eventName', 'timestamp'],
          formatting: 'text'
        },
        {
          id: 'section-event-details',
          title: 'Details',
          order: 2,
          required: true,
          placeholder: '{DESCRIPTION}',
          metadataFields: ['description', 'details', 'actors'],
          formatting: 'text'
        },
        {
          id: 'section-event-impact',
          title: 'Impact',
          order: 3,
          required: false,
          placeholder: '{IMPACT_DESCRIPTION}',
          metadataFields: ['impact', 'affectedAssets'],
          formatting: 'text'
        }
      ],
      requiredMetadata: ['eventType', 'eventName', 'timestamp', 'description'],
      optionalMetadata: ['impact', 'affectedAssets'],
      supportedEngines: ['timeline'],
      supportedAssetTypes: ['timeline-event'],
      created: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // ============================================================================
  // ANALYTICS PATTERN DOCUMENTATION TEMPLATE
  // ============================================================================

  private createAnalyticsPatternDocumentationTemplate(): DocumentationTemplate {
    return {
      id: 'template-analytics-pattern',
      templateType: 'analytics-pattern-documentation',
      name: 'Analytics Pattern Documentation',
      description: 'Analytics pattern analysis documentation',
      category: 'operational-documentation',
      sections: [
        {
          id: 'section-pattern-info',
          title: 'Pattern Information',
          order: 1,
          required: true,
          placeholder: '{PATTERN_TYPE}: {PATTERN_NAME}',
          metadataFields: ['patternType', 'patternName', 'detected'],
          formatting: 'text'
        },
        {
          id: 'section-pattern-data',
          title: 'Pattern Data',
          order: 2,
          required: true,
          placeholder: '{PATTERN_DESCRIPTION}',
          metadataFields: ['description', 'frequency', 'confidence'],
          formatting: 'text'
        },
        {
          id: 'section-pattern-implications',
          title: 'Implications',
          order: 3,
          required: false,
          placeholder: '{IMPLICATION_LIST}',
          metadataFields: ['implications', 'recommendations'],
          formatting: 'list'
        }
      ],
      requiredMetadata: ['patternType', 'patternName', 'description'],
      optionalMetadata: ['implications', 'recommendations'],
      supportedEngines: ['analytics'],
      supportedAssetTypes: ['analytics-pattern', 'analytics-cluster', 'analytics-trend'],
      created: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // ============================================================================
  // FABRIC LINK DOCUMENTATION TEMPLATE
  // ============================================================================

  private createFabricLinkDocumentationTemplate(): DocumentationTemplate {
    return {
      id: 'template-fabric-link',
      templateType: 'fabric-link-documentation',
      name: 'Fabric Link Documentation',
      description: 'Cross-engine fabric link documentation',
      category: 'lineage-documentation',
      sections: [
        {
          id: 'section-link-info',
          title: 'Link Information',
          order: 1,
          required: true,
          placeholder: '{FROM_ENTITY} -> {LINK_TYPE} -> {TO_ENTITY}',
          metadataFields: ['fromEntity', 'toEntity', 'linkType'],
          formatting: 'text'
        },
        {
          id: 'section-link-strength',
          title: 'Relationship Details',
          order: 2,
          required: true,
          placeholder: 'Strength: {STRENGTH}, Rationale: {RATIONALE}',
          metadataFields: ['strength', 'rationale', 'created'],
          formatting: 'text'
        },
        {
          id: 'section-link-scope',
          title: 'Scope',
          order: 3,
          required: true,
          placeholder: 'Tenant: {TENANT_ID}, Visibility: {VISIBILITY}',
          metadataFields: ['tenantId', 'facilityId', 'visibility'],
          formatting: 'text'
        }
      ],
      requiredMetadata: ['fromEntity', 'toEntity', 'linkType', 'strength', 'tenantId'],
      optionalMetadata: ['rationale', 'facilityId'],
      supportedEngines: ['fabric'],
      supportedAssetTypes: ['fabric-node'],
      created: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  getTemplate(id: string): DocumentationTemplate | undefined {
    return this.templates.get(id);
  }

  getTemplateByType(templateType: DocumentationTemplateType): DocumentationTemplate | undefined {
    return Array.from(this.templates.values()).find(t => t.templateType === templateType);
  }

  getAllTemplates(): DocumentationTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(category: DocumentationCategory): DocumentationTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.category === category);
  }

  getTemplatesByEngine(engineType: DocumentationEngineType): DocumentationTemplate[] {
    return Array.from(this.templates.values()).filter(t =>
      t.supportedEngines.includes(engineType)
    );
  }

  getTemplatesByAssetType(assetType: DocumentationAssetType): DocumentationTemplate[] {
    return Array.from(this.templates.values()).filter(t =>
      t.supportedAssetTypes.length === 0 || t.supportedAssetTypes.includes(assetType)
    );
  }

  addTemplate(template: DocumentationTemplate): void {
    this.templates.set(template.id, template);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function createDocumentationTemplateLibrary(): DocumentationTemplateLibrary {
  return new DocumentationTemplateLibrary();
}
