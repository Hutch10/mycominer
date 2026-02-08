// Phase 39: Global Analytics & Incident Pattern Library
// analyticsEngine.ts
// Orchestration facade for analytics: clustering, patterns, trends
// Read-only, deterministic, tenant-scoped, audit-logged

import {
  AnalyticsQuery,
  AnalyticsScope,
  AnalyticsTarget,
  AnalyticsResult,
  IncidentCluster,
  PatternSignature,
  TrendSummary,
  AnalyticsEngine,
} from './analyticsTypes';
import {
  clusterIncidents,
  filterClustersByScope,
  getTopClustersByFrequency,
  getClustersByEventType,
} from './incidentClusterer';
import {
  buildPatternLibraryFromClusters,
  queryPatternLibrary,
  getTopPatternsByIncidenceCount,
} from './patternLibrary';
import { analyzeTrends } from './trendAnalyzer';
import { logAnalyticsQuery, logResultGenerated } from './analyticsLog';
import { TimelineEvent } from '../timeline/timelineTypes';

let analyticsState = {
  clusters: [] as IncidentCluster[],
  patterns: [] as PatternSignature[],
  trends: [] as TrendSummary[],
};

export function initAnalyticsEngine(): AnalyticsEngine {
  return {
    getAnalyticsClusters,
    getPatternLibrary,
    analyzeTrends: analyzeTrendsForQuery,
    queryAnalytics,
    getAnalyticsLog,
    clearAnalyticsLog,
  };
}

export function seedAnalyticsData(
  timelineEvents: TimelineEvent[]
): void {
  // Group events into synthetic incident threads from timeline
  const incidentThreads: Map<string, TimelineEvent[]> = new Map();

  for (const event of timelineEvents) {
    const threadId = event.incidentThreadId || `incident-${event.facilityId}-${event.timestamp}`;
    if (!incidentThreads.has(threadId)) {
      incidentThreads.set(threadId, []);
    }
    incidentThreads.get(threadId)!.push(event);
  }

  // Convert incident threads to incident objects for clustering
  const incidents = Array.from(incidentThreads.entries()).map(([incidentId, events]) => ({
    incidentId,
    events: events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
  }));

  // Cluster by multiple strategies
  const strategies: Array<'event-sequence' | 'severity-transition' | 'sop-reference' | 'capa-pattern' | 'telemetry-anomaly' | 'facility-context'> = [
    'event-sequence',
    'severity-transition',
    'sop-reference',
  ];

  const allClusters: IncidentCluster[] = [];

  for (const incident of incidents) {
    const tenantId = incident.events[0]?.tenantId || 'unknown-tenant';
    const scope: AnalyticsScope = {
      tenantId,
      facilityId: incident.events[0]?.facilityId,
    };

    for (const strategy of strategies) {
      const clusters = clusterIncidents(
        [incident],
        strategy,
        scope,
        tenantId,
        'incidents'
      );
      allClusters.push(...clusters);
    }
  }

  analyticsState.clusters = allClusters;

  // Build pattern library from clusters
  const uniqueTenants = [...new Set(allClusters.map((c) => c.tenantId))];
  for (const tenantId of uniqueTenants) {
    const tenantClusters = allClusters.filter((c) => c.tenantId === tenantId);
    const patterns = buildPatternLibraryFromClusters(tenantClusters, tenantId);
    analyticsState.patterns.push(...patterns);
  }
}

export function getAnalyticsClusters(query: AnalyticsQuery): IncidentCluster[] {
  const filtered = filterClustersByScope(analyticsState.clusters, query.scope);

  if (query.clusteringStrategy) {
    return filtered.filter((c) => {
      const strategy = query.clusteringStrategy!;
      return c.archetype.toLowerCase().includes(strategy.toLowerCase());
    });
  }

  return filtered;
}

export function getPatternLibrary(scope: AnalyticsScope, target: AnalyticsTarget): PatternSignature[] {
  return queryPatternLibrary(scope, target);
}

export function analyzeTrendsForQuery(query: AnalyticsQuery): TrendSummary[] {
  const clusters = getAnalyticsClusters(query);
  return analyzeTrends(clusters, query.scope);
}

export function queryAnalytics(query: AnalyticsQuery): AnalyticsResult {
  const startTime = Date.now();

  // Validate tenant scope
  if (query.scope.tenantId !== query.tenantId) {
    logAnalyticsQuery(query, 'failed', {
      errorMessage: 'Tenant mismatch in query scope',
    });
    return {
      resultId: `result-${query.queryId}`,
      query,
      clusters: [],
      patterns: [],
      trends: [],
      referenceIndex: {
        incidentIds: [],
        deviationIds: [],
        capaIds: [],
        sopIds: [],
        facilityIds: [],
      },
      executionTimeMs: 0,
      createdAt: new Date().toISOString(),
    };
  }

  // Get clusters
  const clusters = getAnalyticsClusters(query);

  // Get patterns if requested
  let patterns: PatternSignature[] = [];
  if (query.includePatterns) {
    patterns = getPatternLibrary(query.scope, query.target);
  }

  // Get trends if requested
  let trends: TrendSummary[] = [];
  if (query.includeTrends) {
    trends = analyzeTrendsForQuery(query);
  }

  // Build reference index
  const referenceIndex = {
    incidentIds: [...new Set(clusters.flatMap((c) => c.incidentIds))],
    deviationIds: [] as string[],
    capaIds: [] as string[],
    sopIds: [...new Set(clusters.flatMap((c) => c.commonSOPReferences))],
    facilityIds: [...new Set(clusters.map((c) => c.facilityId).filter(Boolean) as string[])],
  };

  // Extract deviation/CAPA IDs from event samples
  for (const cluster of clusters) {
    for (const event of cluster.eventSamples) {
      if (event.type === 'deviation' && event.description.includes('dev-')) {
        const match = event.description.match(/(dev-[^\s]+)/);
        if (match) referenceIndex.deviationIds.push(match[1]);
      }
      if (event.type === 'CAPAAction' && event.description.includes('capa-')) {
        const match = event.description.match(/(capa-[^\s]+)/);
        if (match) referenceIndex.capaIds.push(match[1]);
      }
    }
  }

  const executionTimeMs = Date.now() - startTime;

  const result: AnalyticsResult = {
    resultId: `result-${query.queryId}`,
    query,
    clusters,
    patterns,
    trends,
    referenceIndex,
    executionTimeMs,
    createdAt: new Date().toISOString(),
  };

  logAnalyticsQuery(query, 'success', {
    clustersGenerated: clusters.length,
    patternsFound: patterns.length,
    trendsComputed: trends.length,
    executionTimeMs,
  });

  logResultGenerated(
    query.tenantId,
    result.resultId,
    clusters.length,
    patterns.length,
    trends.length,
    executionTimeMs
  );

  return result;
}

export function getAnalyticsLog() {
  const { getAnalyticsLog } = require('./analyticsLog');
  return getAnalyticsLog();
}

export function clearAnalyticsLog() {
  const { clearAnalyticsLog } = require('./analyticsLog');
  clearAnalyticsLog();
}
