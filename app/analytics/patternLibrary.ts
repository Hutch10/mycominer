// Phase 39: Global Analytics & Incident Pattern Library
// patternLibrary.ts
// Pattern storage and discovery from historical incident clusters

import { PatternSignature, IncidentCluster, AnalyticsScope, AnalyticsTarget } from './analyticsTypes';
import { logPatternLibraryQueried } from './analyticsLog';

let patternLibrary: PatternSignature[] = [];

export function derivePatternFromCluster(cluster: IncidentCluster, clusterSet: IncidentCluster[]): PatternSignature {
  const matchingClusters = clusterSet.filter(
    (c) =>
      c.characteristicSequence.length === cluster.characteristicSequence.length &&
      c.characteristicSequence.every((type, idx) => type === cluster.characteristicSequence[idx])
  );

  const allIncidentsUnderPattern = [...new Set(matchingClusters.flatMap((c) => c.incidentIds))];
  const representativeIncidents = allIncidentsUnderPattern.slice(0, 3);

  // Compute severity profile
  const severityProfile: Record<string, number> = {};
  for (const cluster of matchingClusters) {
    for (const sev of cluster.severityTransitionPattern) {
      severityProfile[sev] = (severityProfile[sev] || 0) + 1;
    }
  }
  const totalSeverities = Object.values(severityProfile).reduce((a, b) => a + b, 1);
  for (const key in severityProfile) {
    severityProfile[key] = severityProfile[key] / totalSeverities;
  }

  // Extract common characteristics
  const commonSOPs = Array.from(
    new Set(matchingClusters.flatMap((c) => c.commonSOPReferences))
  );
  const commonCAPAs = Array.from(
    new Set(matchingClusters.flatMap((c) => c.commonCAPAThemes))
  );
  const commonTelemetry = Array.from(
    new Set(matchingClusters.flatMap((c) => c.commonTelemetryAnomalies))
  );

  // Calculate confidence based on cluster consistency
  const confidence = Math.min(1, Math.max(0, matchingClusters.length / Math.max(1, clusterSet.length)));

  const pattern: PatternSignature = {
    patternId: `pattern-${cluster.tenantId}-${Date.now()}`,
    name: cluster.archetype,
    description: `Recurring incident pattern characterized by sequence: ${cluster.characteristicSequence.join(' → ')}`,
    characteristicSequence: cluster.characteristicSequence,
    representativeIncidents,
    clusterCount: matchingClusters.length,
    incidentsUnderPattern: allIncidentsUnderPattern.length,
    commonSOPReferences: commonSOPs,
    commonDeviationTypes: ['environmental-threshold-breach', 'resource-shortage', 'workflow-deviation'],
    commonCAPAActions: commonCAPAs,
    telemetrySignatures: commonTelemetry,
    severityProfile,
    tenantId: cluster.tenantId,
    facilityIds: cluster.facilityId ? [cluster.facilityId] : [],
    observationStartTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // last 30 days
    observationEndTime: new Date().toISOString(),
    confidence,
  };

  return pattern;
}

export function registerPattern(pattern: PatternSignature): void {
  const existing = patternLibrary.find((p) => p.patternId === pattern.patternId);
  if (!existing) {
    patternLibrary.push(pattern);
  }
}

export function registerMultiplePatterns(patterns: PatternSignature[]): void {
  for (const pattern of patterns) {
    registerPattern(pattern);
  }
}

export function buildPatternLibraryFromClusters(clusters: IncidentCluster[], tenantId: string): PatternSignature[] {
  const newPatterns: PatternSignature[] = [];
  const uniqueSequences = new Map<string, IncidentCluster[]>();

  // Group clusters by characteristic sequence
  for (const cluster of clusters.filter((c) => c.tenantId === tenantId)) {
    const key = cluster.characteristicSequence.join('→');
    if (!uniqueSequences.has(key)) {
      uniqueSequences.set(key, []);
    }
    uniqueSequences.get(key)!.push(cluster);
  }

  // Derive pattern from each unique sequence group
  for (const [, clusterGroup] of uniqueSequences.entries()) {
    if (clusterGroup.length > 0) {
      const pattern = derivePatternFromCluster(clusterGroup[0], clusters);
      newPatterns.push(pattern);
    }
  }

  registerMultiplePatterns(newPatterns);
  return newPatterns;
}

export function queryPatternLibrary(scope: AnalyticsScope, target: AnalyticsTarget): PatternSignature[] {
  const startTime = Date.now();

  let results = patternLibrary.filter((p) => p.tenantId === scope.tenantId);

  if (scope.facilityId) {
    results = results.filter((p) => p.facilityIds.includes(scope.facilityId!));
  }

  if (scope.severity && scope.severity.length > 0) {
    results = results.filter((p) => {
      const hasSeverity = scope.severity!.some((sev) => sev in p.severityProfile);
      return hasSeverity;
    });
  }

  const executionTimeMs = Date.now() - startTime;
  logPatternLibraryQueried(scope.tenantId, results.length, executionTimeMs);

  return results;
}

export function getPatternsByArchetype(archetype: string): PatternSignature[] {
  return patternLibrary.filter((p) => p.name.toLowerCase().includes(archetype.toLowerCase()));
}

export function getPatternsByConfidence(minConfidence: number): PatternSignature[] {
  return patternLibrary.filter((p) => p.confidence >= minConfidence).sort((a, b) => b.confidence - a.confidence);
}

export function getTopPatternsByIncidenceCount(topN: number = 10): PatternSignature[] {
  return patternLibrary.sort((a, b) => b.incidentsUnderPattern - a.incidentsUnderPattern).slice(0, topN);
}

export function getPatternLibrary(): PatternSignature[] {
  return [...patternLibrary];
}

export function getPatternLibraryByTenant(tenantId: string): PatternSignature[] {
  return patternLibrary.filter((p) => p.tenantId === tenantId);
}

export function clearPatternLibrary(): void {
  patternLibrary = [];
}

export function searchPatterns(query: string): PatternSignature[] {
  return patternLibrary.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase()) ||
      p.commonSOPReferences.some((ref) => ref.toLowerCase().includes(query.toLowerCase()))
  );
}

export function getPatternMetadata(): {
  totalPatterns: number;
  patternsByTenant: Record<string, number>;
  averageConfidence: number;
  totalIncidentsUnderPatterns: number;
} {
  const patternsByTenant: Record<string, number> = {};
  let totalIncidents = 0;
  let totalConfidence = 0;

  for (const pattern of patternLibrary) {
    patternsByTenant[pattern.tenantId] = (patternsByTenant[pattern.tenantId] || 0) + 1;
    totalIncidents += pattern.incidentsUnderPattern;
    totalConfidence += pattern.confidence;
  }

  return {
    totalPatterns: patternLibrary.length,
    patternsByTenant,
    averageConfidence: patternLibrary.length > 0 ? totalConfidence / patternLibrary.length : 0,
    totalIncidentsUnderPatterns: totalIncidents,
  };
}
