// Phase 39: Global Analytics & Incident Pattern Library
// incidentClusterer.ts
// Deterministic clustering logic for incidents, deviations, CAPA, environmental exceptions

import { IncidentCluster, AnalyticsScope, AnalyticsTarget } from './analyticsTypes';
import { TimelineEvent } from '../timeline/timelineTypes';
import { logClusteringComplete } from './analyticsLog';

export function computeSimilarityScore(event1: TimelineEvent, event2: TimelineEvent): number {
  let score = 0;
  const maxScore = 5;

  if (event1.type === event2.type) score++;
  if (event1.severity === event2.severity) score++;
  if (event1.facilityId === event2.facilityId) score++;
  if (event1.roomId === event2.roomId) score++;
  if (event1.sourceSystem === event2.sourceSystem) score++;

  return score / maxScore;
}

export function extractEventSequence(events: TimelineEvent[]): string[] {
  return events.map((e) => e.type);
}

export function extractSeverityTransition(events: TimelineEvent[]): string[] {
  return events.map((e) => e.severity);
}

export function extractCommonSOPReferences(events: TimelineEvent[]): string[] {
  const sopRefs: string[] = [];
  for (const event of events) {
    if (event.linkedIds) {
      sopRefs.push(...event.linkedIds.filter((id) => id.startsWith('sop-')));
    }
  }
  return [...new Set(sopRefs)];
}

export function extractCommonCAPAThemes(events: TimelineEvent[]): string[] {
  const capaThemes: string[] = [];
  for (const event of events) {
    if (event.type === 'CAPAAction') {
      const match = event.description.match(/CAPA[^:]*:\s*([^(]+)/);
      if (match) capaThemes.push(match[1].trim());
    }
  }
  return [...new Set(capaThemes)];
}

export function extractTelemetryAnomalies(events: TimelineEvent[]): string[] {
  const anomalies: string[] = [];
  for (const event of events) {
    if (event.type === 'environmentalException') {
      if (event.description.includes('Temperature')) anomalies.push('temp-spike');
      if (event.description.includes('humidity')) anomalies.push('humidity-drift');
      if (event.description.includes('pressure')) anomalies.push('pressure-anomaly');
    }
  }
  return [...new Set(anomalies)];
}

export function clusterIncidents(
  incidents: { incidentId: string; events: TimelineEvent[] }[],
  strategy: 'event-sequence' | 'severity-transition' | 'sop-reference' | 'capa-pattern' | 'telemetry-anomaly' | 'facility-context',
  scope: AnalyticsScope,
  tenantId: string,
  target: AnalyticsTarget
): IncidentCluster[] {
  const startTime = Date.now();

  // Group incidents by strategy
  const groups: Map<string, typeof incidents> = new Map();

  for (const incident of incidents) {
    let groupKey = '';

    if (strategy === 'event-sequence') {
      groupKey = extractEventSequence(incident.events).join('→');
    } else if (strategy === 'severity-transition') {
      groupKey = extractSeverityTransition(incident.events).join('→');
    } else if (strategy === 'sop-reference') {
      const sopRefs = extractCommonSOPReferences(incident.events);
      groupKey = sopRefs.length > 0 ? sopRefs.join(',') : 'no-sop';
    } else if (strategy === 'capa-pattern') {
      const capaThemes = extractCommonCAPAThemes(incident.events);
      groupKey = capaThemes.length > 0 ? capaThemes.join(',') : 'no-capa';
    } else if (strategy === 'telemetry-anomaly') {
      const anomalies = extractTelemetryAnomalies(incident.events);
      groupKey = anomalies.length > 0 ? anomalies.join(',') : 'no-anomaly';
    } else if (strategy === 'facility-context') {
      groupKey = incident.events[0]?.facilityId || 'unknown-facility';
    }

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(incident);
  }

  // Convert groups to clusters
  const clusters: IncidentCluster[] = [];
  let clusterIndex = 0;

  for (const [groupKey, groupIncidents] of groups.entries()) {
    if (groupIncidents.length > 0) {
      const allEvents = groupIncidents.flatMap((inc) => inc.events);
      const sortedEvents = allEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      let archetype = '';
      if (strategy === 'event-sequence') {
        archetype = extractEventSequence(sortedEvents).join(' → ');
      } else if (strategy === 'severity-transition') {
        archetype = `Severity Pattern: ${extractSeverityTransition(sortedEvents).join(' → ')}`;
      } else if (strategy === 'sop-reference') {
        archetype = `SOP-Referenced Incidents: ${groupKey}`;
      } else if (strategy === 'capa-pattern') {
        archetype = `CAPA Pattern: ${groupKey}`;
      } else if (strategy === 'telemetry-anomaly') {
        archetype = `Telemetry Anomalies: ${groupKey}`;
      } else if (strategy === 'facility-context') {
        archetype = `Facility-Level: ${groupKey}`;
      }

      const cluster: IncidentCluster = {
        clusterId: `cluster-${tenantId}-${clusterIndex}`,
        archetype,
        incidentIds: groupIncidents.map((inc) => inc.incidentId),
        eventSamples: sortedEvents.slice(0, 5), // first 5 events as samples
        characteristicSequence: extractEventSequence(sortedEvents),
        severityTransitionPattern: extractSeverityTransition(sortedEvents),
        commonSOPReferences: extractCommonSOPReferences(allEvents),
        commonCAPAThemes: extractCommonCAPAThemes(allEvents),
        commonTelemetryAnomalies: extractTelemetryAnomalies(allEvents),
        frequencyInDataset: groupIncidents.length,
        clusterSize: groupIncidents.length,
        tenantId,
        facilityId: scope.facilityId,
        createdAt: new Date().toISOString(),
      };

      clusters.push(cluster);
      clusterIndex++;
    }
  }

  const executionTimeMs = Date.now() - startTime;
  logClusteringComplete(tenantId, clusters.length, executionTimeMs);

  return clusters;
}

export function filterClustersByScope(clusters: IncidentCluster[], scope: AnalyticsScope): IncidentCluster[] {
  return clusters.filter((cluster) => {
    if (cluster.tenantId !== scope.tenantId) return false;
    if (scope.facilityId && cluster.facilityId !== scope.facilityId) return false;
    if (scope.severity && scope.severity.length > 0) {
      const hasSeverity = cluster.severityTransitionPattern.some((sev) => scope.severity!.includes(sev));
      if (!hasSeverity) return false;
    }
    return true;
  });
}

export function getTopClustersByFrequency(clusters: IncidentCluster[], topN: number = 10): IncidentCluster[] {
  return clusters.sort((a, b) => b.frequencyInDataset - a.frequencyInDataset).slice(0, topN);
}

export function getClustersByEventType(clusters: IncidentCluster[], eventType: string): IncidentCluster[] {
  return clusters.filter((cluster) => cluster.characteristicSequence.includes(eventType));
}

export function getClustersByArchetype(clusters: IncidentCluster[], archetypePattern: string): IncidentCluster[] {
  return clusters.filter((cluster) => cluster.archetype.toLowerCase().includes(archetypePattern.toLowerCase()));
}
