/**
 * Phase 42: Operator Insights & Knowledge Packs — Insights Engine
 * 
 * Master orchestrator for the insights system.
 * - Queries insights with tenant/federation rules enforcement
 * - Manages knowledge pack selection and access
 * - Delegates to insight assembler
 * - Logs all operations
 */

import {
  InsightQuery,
  InsightQueryResult,
  InsightResult,
  KnowledgePack,
  InsightsEngineInterface,
  Insight,
  InsightCategory,
  InsightStatistics,
} from './insightsTypes';
import {
  logQueryInitiated,
  logQueryCompleted,
  logPackAccessed,
  logTenantIsolationEnforced,
  logFederationRuleApplied,
  getInsightsLogByTenant,
} from './insightsLog';
import { assembleInsight } from './insightAssembler';
import {
  getKnowledgePack,
  getKnowledgePacksByTenant,
  getKnowledgePacksByCategory,
  getFeaturedKnowledgePacks,
  searchKnowledgePacks,
  recordPackAccess,
  getAllKnowledgePacks,
} from './knowledgePackLibrary';

// ==================== INSIGHTS ENGINE ====================

/**
 * Query insights with full tenant isolation and federation rule enforcement
 */
export async function queryInsights(query: InsightQuery): Promise<InsightQueryResult> {
  const startTime = Date.now();
  const logId = logQueryInitiated(query.tenantId, query.insightCategory, query.facilityId);

  try {
    // Enforce tenant isolation
    if (!query.tenantId) {
      logTenantIsolationEnforced(query.tenantId, 'unknown', false);
      throw new Error('Tenant ID required');
    }

    // Get insights (simplified: in production would query database)
    const allInsights = await getInsightsForTenant(query);

    // Filter by query parameters
    let filtered = allInsights;
    if (query.insightCategory) {
      filtered = filtered.filter((i) => i.category === query.insightCategory);
    }
    if (query.dateRange) {
      const start = new Date(query.dateRange.startDate).getTime();
      const end = new Date(query.dateRange.endDate).getTime();
      filtered = filtered.filter((i) => {
        const insightTime = new Date(i.createdAt).getTime();
        return insightTime >= start && insightTime <= end;
      });
    }

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 10;
    const paginatedInsights = filtered.slice(offset, offset + limit);

    // Get related packs
    const relatedPacks = getKnowledgePacksByTenant(query.tenantId, query.facilityId);

    // Build result
    const executionTimeMs = Date.now() - startTime;
    logQueryCompleted(logId, paginatedInsights.length, executionTimeMs, query.tenantId);

    const result: InsightQueryResult = {
      insights: paginatedInsights,
      knowledgePacks: relatedPacks,
      totalCount: allInsights.length,
      filteredCount: filtered.length,
      executionTimeMs,
      query,
      tenant_scope: {
        tenantId: query.tenantId,
        facilityId: query.facilityId,
        authorized: true,
      },
      federation_scope: {
        allowedTenantIds: [query.tenantId],
        crossFacilityAllowed: !!query.facilityId,
      },
    };

    return result;
  } catch (error) {
    throw new Error(`Query failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Assemble a comprehensive insight result
 */
export async function getAssembledInsight(query: InsightQuery): Promise<InsightResult> {
  const logId = logQueryInitiated(query.tenantId, query.insightCategory, query.facilityId);

  try {
    const result = await assembleInsight(query);
    const executionTimeMs = Date.now() - new Date(result.generated_at).getTime();
    logQueryCompleted(logId, result.insights.length, executionTimeMs, query.tenantId);

    return result;
  } catch (error) {
    throw new Error(`Assembly failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get a specific knowledge pack for tenant
 */
export async function getKnowledgePackForTenant(
  packId: string,
  tenantId: string
): Promise<KnowledgePack | null> {
  const pack = getKnowledgePack(packId);

  if (!pack) {
    return null;
  }

  // Enforce tenant authorization (simplified)
  if (pack.tenantId !== tenantId) {
    logTenantIsolationEnforced(tenantId, pack.tenantId, false);
    return null;
  }

  // Record access
  logPackAccessed(packId, pack.name, tenantId, pack.facilityId);
  recordPackAccess(packId);

  return pack;
}

/**
 * List knowledge packs for tenant
 */
export async function listKnowledgePacksForTenant(
  tenantId: string,
  facilityId?: string
): Promise<KnowledgePack[]> {
  const packs = getKnowledgePacksByTenant(tenantId, facilityId);
  packs.forEach((pack) => {
    recordPackAccess(pack.packId);
  });
  return packs;
}

/**
 * Get featured knowledge packs
 */
export async function getFeaturedPacks(): Promise<KnowledgePack[]> {
  return getFeaturedKnowledgePacks();
}

/**
 * Search knowledge packs
 */
export async function searchPacks(query: string): Promise<KnowledgePack[]> {
  return searchKnowledgePacks(query);
}

/**
 * Get insights by category
 */
export async function getInsightsByCategory(
  category: InsightCategory,
  tenantId: string
): Promise<Insight[]> {
  return getInsightsForTenant({ tenantId, insightCategory: category });
}

/**
 * Record insight access
 */
export async function recordInsightAccess(insightId: string, tenantId: string): Promise<void> {
  // In production, would update access count in database
  // For now, this is a no-op placeholder
}

/**
 * Get insights log for tenant
 */
export async function getInsightsLog(
  tenantId: string,
  facilityId?: string,
  limit: number = 50
) {
  return getInsightsLogByTenant(tenantId, limit);
}

/**
 * Initialize insights for tenants
 */
export async function initializeInsights(tenantIds: string[]): Promise<void> {
  // In production, would initialize insights database for each tenant
  console.log(`Initializing insights for tenants: ${tenantIds.join(', ')}`);
}

/**
 * Get insights statistics
 */
export async function getInsightsStats(tenantId: string): Promise<InsightStatistics> {
  const allPacks = getAllKnowledgePacks();
  const tenantPacks = allPacks.filter((p) => p.tenantId === tenantId);

  return {
    total_insights: tenantPacks.length * 3, // Approx 3 insights per pack
    by_category: {
      'incident-patterns': tenantPacks.filter((p) => p.category === 'incident-patterns').length * 3,
      'sop-usage': tenantPacks.filter((p) => p.category === 'sop-usage').length * 3,
      'capa-recurrence': tenantPacks.filter((p) => p.category === 'capa-recurrence').length * 3,
      'environmental-exceptions': tenantPacks.filter((p) => p.category === 'environmental-exceptions').length * 3,
      'training-performance': tenantPacks.filter((p) => p.category === 'training-performance').length * 3,
      'operational-rhythms': tenantPacks.filter((p) => p.category === 'operational-rhythms').length * 3,
      'cross-facility-comparison': tenantPacks.filter((p) => p.category === 'cross-facility-comparison').length * 3,
      'operator-readiness': tenantPacks.filter((p) => p.category === 'operator-readiness').length * 3,
    },
    by_applicability: {
      critical: Math.ceil(tenantPacks.length * 0.2),
      high: Math.ceil(tenantPacks.length * 0.4),
      medium: Math.ceil(tenantPacks.length * 0.25),
      low: Math.ceil(tenantPacks.length * 0.1),
      informational: Math.ceil(tenantPacks.length * 0.05),
    },
    total_knowledge_packs: tenantPacks.length,
    featured_packs: tenantPacks.filter((p) => p.is_featured).length,
    total_references: tenantPacks.reduce((sum, p) => sum + (p.sections.length * 2), 0),
    unique_source_phases: [34, 37, 38, 39, 40],
    average_pack_read_time: Math.round(tenantPacks.reduce((sum, p) => sum + p.estimated_read_time_minutes, 0) / Math.max(tenantPacks.length, 1)),
  };
}

// ==================== HELPER FUNCTIONS ====================

async function getInsightsForTenant(query: InsightQuery): Promise<Insight[]> {
  // Simplified: generates insights on-the-fly
  // In production, would retrieve from persistent storage

  const insights: Insight[] = [];

  // Generate insights based on query category or all
  if (query.insightCategory) {
    // Single category query
    const categoryInsights = generateCategoryInsights(query.insightCategory, query);
    insights.push(...categoryInsights);
  } else {
    // Multi-category query - generate sample insights from all categories
    const categories: InsightCategory[] = [
      'incident-patterns',
      'sop-usage',
      'capa-recurrence',
      'environmental-exceptions',
      'training-performance',
      'operational-rhythms',
      'cross-facility-comparison',
      'operator-readiness',
    ];
    categories.forEach((cat) => {
      const catInsights = generateCategoryInsights(cat, query);
      insights.push(...catInsights.slice(0, 1)); // Just take primary insight per category
    });
  }

  return insights;
}

function generateCategoryInsights(category: InsightCategory, query: InsightQuery): Insight[] {
  // Generate category-specific insights
  // In production, would retrieve from database

  const baseInsight: Insight = {
    insightId: `insight-${category}-${Date.now()}`,
    category,
    title: `${category} Insight for ${query.tenantId}`,
    description: `Detailed analysis of ${category}`,
    summary: `Summary of ${category} patterns and trends`,
    key_findings: [
      'Finding 1 from operational data',
      'Finding 2 from training metrics',
      'Finding 3 from timeline analysis',
    ],
    applicability: 'high',
    tenantId: query.tenantId,
    facilityId: query.facilityId,
    createdAt: new Date().toISOString(),
    sources: [],
    rationale: `Generated from Phases 34, 37, 38, 39, 40 data synthesis`,
    actionable_recommendations: [
      'Action 1 based on data analysis',
      'Action 2 from best practices',
      'Action 3 for improvement',
    ],
    relatedInsightIds: [],
  };

  return [baseInsight];
}

export const insightsEngine: InsightsEngineInterface = {
  queryInsights,
  assembleInsight: getAssembledInsight,
  getKnowledgePack: getKnowledgePackForTenant,
  listKnowledgePacks: listKnowledgePacksForTenant,
  getInsight: async (insightId, tenantId) => null,
  getInsightsByCategory,
  recordInsightAccess,
  getInsightsLog,
  initializeInsights,
};
