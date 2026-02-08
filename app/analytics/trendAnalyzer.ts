// Phase 39: Global Analytics & Incident Pattern Library
// trendAnalyzer.ts
// Deterministic trend analysis for frequencies, comparisons, densities, and rhythms

import { TrendSummary, TrendDataPoint, AnalyticsScope } from './analyticsTypes';
import { IncidentCluster } from './analyticsTypes';
import { TimelineEvent } from '../timeline/timelineTypes';
import { logTrendAnalysisComplete } from './analyticsLog';

export function computeIncidentFrequency(
  clusters: IncidentCluster[],
  scope: AnalyticsScope,
  aggregationLevel: 'daily' | 'weekly' | 'monthly'
): TrendDataPoint[] {
  const filtered = clusters.filter((c) => c.tenantId === scope.tenantId);
  const dataMap: Map<string, number> = new Map();

  for (const cluster of filtered) {
    const date = new Date(cluster.createdAt);
    let key = '';

    if (aggregationLevel === 'daily') {
      key = date.toISOString().split('T')[0];
    } else if (aggregationLevel === 'weekly') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0] + '-w';
    } else if (aggregationLevel === 'monthly') {
      key = date.toISOString().slice(0, 7);
    }

    dataMap.set(key, (dataMap.get(key) || 0) + cluster.frequencyInDataset);
  }

  const dataPoints: TrendDataPoint[] = Array.from(dataMap.entries())
    .map(([label, value]) => ({
      timestamp: label,
      value,
      label: `${label}: ${value} incidents`,
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return dataPoints;
}

export function computeCAPARecurrence(
  clusters: IncidentCluster[],
  scope: AnalyticsScope,
  aggregationLevel: 'daily' | 'weekly' | 'monthly'
): TrendDataPoint[] {
  const filtered = clusters.filter((c) => c.tenantId === scope.tenantId && c.commonCAPAThemes.length > 0);
  const dataMap: Map<string, number> = new Map();

  for (const cluster of filtered) {
    const date = new Date(cluster.createdAt);
    let key = '';

    if (aggregationLevel === 'daily') {
      key = date.toISOString().split('T')[0];
    } else if (aggregationLevel === 'weekly') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0] + '-w';
    } else if (aggregationLevel === 'monthly') {
      key = date.toISOString().slice(0, 7);
    }

    dataMap.set(key, (dataMap.get(key) || 0) + cluster.commonCAPAThemes.length);
  }

  const dataPoints: TrendDataPoint[] = Array.from(dataMap.entries())
    .map(([label, value]) => ({
      timestamp: label,
      value,
      label: `${label}: ${value} CAPA actions`,
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return dataPoints;
}

export function computeSOPChangeDensity(
  clusters: IncidentCluster[],
  scope: AnalyticsScope,
  aggregationLevel: 'daily' | 'weekly' | 'monthly'
): TrendDataPoint[] {
  const filtered = clusters.filter((c) => c.tenantId === scope.tenantId && c.commonSOPReferences.length > 0);
  const dataMap: Map<string, number> = new Map();

  for (const cluster of filtered) {
    const date = new Date(cluster.createdAt);
    let key = '';

    if (aggregationLevel === 'daily') {
      key = date.toISOString().split('T')[0];
    } else if (aggregationLevel === 'weekly') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0] + '-w';
    } else if (aggregationLevel === 'monthly') {
      key = date.toISOString().slice(0, 7);
    }

    dataMap.set(key, (dataMap.get(key) || 0) + cluster.commonSOPReferences.length);
  }

  const dataPoints: TrendDataPoint[] = Array.from(dataMap.entries())
    .map(([label, value]) => ({
      timestamp: label,
      value,
      label: `${label}: ${value} SOP refs`,
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return dataPoints;
}

export function computeEnvironmentalExceptionRhythm(
  clusters: IncidentCluster[],
  scope: AnalyticsScope
): TrendDataPoint[] {
  const filtered = clusters.filter(
    (c) =>
      c.tenantId === scope.tenantId &&
      c.characteristicSequence.some((type) => type === 'environmentalException')
  );

  const dataMap: Map<string, number> = new Map();

  for (const cluster of filtered) {
    const sample = cluster.eventSamples[0];
    if (sample && sample.type === 'environmentalException') {
      const date = new Date(sample.timestamp);
      const hour = date.getHours();
      const key = `Hour ${hour.toString().padStart(2, '0')}:00`;

      dataMap.set(key, (dataMap.get(key) || 0) + 1);
    }
  }

  const dataPoints: TrendDataPoint[] = Array.from(dataMap.entries())
    .map(([label, value]) => ({
      timestamp: label,
      value,
      label: `${label}: ${value} exceptions`,
    }))
    .sort((a, b) => {
      const hourA = parseInt(a.timestamp.split(' ')[1]);
      const hourB = parseInt(b.timestamp.split(' ')[1]);
      return hourA - hourB;
    });

  return dataPoints;
}

export function computeCrossFacilityComparison(
  clusters: IncidentCluster[],
  scope: AnalyticsScope,
  metric: 'incident-frequency' | 'capa-density' | 'sop-reference-density'
): TrendDataPoint[] {
  const facilityMap: Map<string, number> = new Map();
  const filtered = clusters.filter((c) => c.tenantId === scope.tenantId);

  for (const cluster of filtered) {
    const facilityId = cluster.facilityId || 'unknown-facility';

    let value = 0;
    if (metric === 'incident-frequency') {
      value = cluster.frequencyInDataset;
    } else if (metric === 'capa-density') {
      value = cluster.commonCAPAThemes.length;
    } else if (metric === 'sop-reference-density') {
      value = cluster.commonSOPReferences.length;
    }

    facilityMap.set(facilityId, (facilityMap.get(facilityId) || 0) + value);
  }

  const dataPoints: TrendDataPoint[] = Array.from(facilityMap.entries())
    .map(([label, value]) => ({
      timestamp: label,
      value,
      label: `${label}: ${value}`,
    }))
    .sort((a, b) => b.value - a.value);

  return dataPoints;
}

export function generateTrendInsights(
  dataPoints: TrendDataPoint[],
  trendName: string
): string[] {
  const insights: string[] = [];

  if (dataPoints.length === 0) {
    insights.push(`No data available for ${trendName}`);
    return insights;
  }

  const values = dataPoints.map((dp) => dp.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const avgValue = values.reduce((a, b) => a + b, 0) / values.length;

  insights.push(`Average ${trendName}: ${avgValue.toFixed(1)}`);
  insights.push(`Peak ${trendName}: ${maxValue}`);
  insights.push(`Lowest ${trendName}: ${minValue}`);

  if (values.length > 1) {
    const recent = values.slice(-3);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const trend = recentAvg > avgValue ? 'increasing' : 'decreasing';
    insights.push(`Recent trend: ${trend}`);
  }

  return insights;
}

export function createTrendSummary(
  trendId: string,
  name: string,
  description: string,
  metric: string,
  dataPoints: TrendDataPoint[],
  scope: AnalyticsScope,
  aggregationLevel: 'daily' | 'weekly' | 'monthly' | 'facility' | 'tenant',
  linkedClusters: string[] = [],
  linkedPatterns: string[] = []
): TrendSummary {
  const insights = generateTrendInsights(dataPoints, name);

  return {
    trendId,
    name,
    description,
    metric,
    scope,
    dataPoints,
    aggregationLevel,
    tenantId: scope.tenantId,
    facilityIds: scope.facilityId ? [scope.facilityId] : [],
    insights,
    linkedClusters,
    linkedPatterns,
    createdAt: new Date().toISOString(),
  };
}

export function analyzeTrends(
  clusters: IncidentCluster[],
  scope: AnalyticsScope
): TrendSummary[] {
  const startTime = Date.now();
  const trends: TrendSummary[] = [];

  // Incident frequency trend
  const incidentFreqData = computeIncidentFrequency(clusters, scope, 'daily');
  trends.push(
    createTrendSummary(
      `trend-incident-freq-${scope.tenantId}`,
      'Incident Frequency',
      'Daily count of incidents over time',
      'incident-frequency',
      incidentFreqData,
      scope,
      'daily'
    )
  );

  // CAPA recurrence trend
  const capaRecData = computeCAPARecurrence(clusters, scope, 'daily');
  trends.push(
    createTrendSummary(
      `trend-capa-rec-${scope.tenantId}`,
      'CAPA Recurrence',
      'Daily count of CAPA actions initiated',
      'capa-recurrence',
      capaRecData,
      scope,
      'daily'
    )
  );

  // SOP reference density trend
  const sopDensityData = computeSOPChangeDensity(clusters, scope, 'daily');
  trends.push(
    createTrendSummary(
      `trend-sop-density-${scope.tenantId}`,
      'SOP Reference Density',
      'Daily count of SOP references in incidents',
      'sop-density',
      sopDensityData,
      scope,
      'daily'
    )
  );

  // Environmental exception rhythm
  const envRhythmData = computeEnvironmentalExceptionRhythm(clusters, scope);
  trends.push(
    createTrendSummary(
      `trend-env-rhythm-${scope.tenantId}`,
      'Environmental Exception Rhythm',
      'Hourly distribution of environmental exceptions',
      'environmental-exception-rhythm',
      envRhythmData,
      scope,
      'daily'
    )
  );

  // Cross-facility incident comparison
  const facilityCompData = computeCrossFacilityComparison(clusters, scope, 'incident-frequency');
  trends.push(
    createTrendSummary(
      `trend-facility-cmp-${scope.tenantId}`,
      'Facility Incident Comparison',
      'Incident frequency by facility',
      'facility-incident-comparison',
      facilityCompData,
      scope,
      'facility'
    )
  );

  const executionTimeMs = Date.now() - startTime;
  logTrendAnalysisComplete(scope.tenantId, trends.length, executionTimeMs);

  return trends;
}
