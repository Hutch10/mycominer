import { buildFacilityLayout, FacilityLayoutInput } from './layoutGenerator';
import { buildSnapshot, TelemetryEnvelope } from './stateMapper';
import { DigitalTwinInsight, DigitalTwinSnapshot } from './digitalTwinTypes';

export interface DigitalTwinData {
  layout: FacilityLayoutInput;
  telemetry: TelemetryEnvelope;
}

export interface DigitalTwinResult {
  snapshot: DigitalTwinSnapshot;
  insights: DigitalTwinInsight[];
}

export function buildDeterministicTwin(data: DigitalTwinData): DigitalTwinResult {
  const layout = buildFacilityLayout(data.layout);
  const snapshot = buildSnapshot(layout, data.telemetry);
  const insights = deriveInsights(snapshot);
  return { snapshot, insights };
}

function deriveInsights(snapshot: DigitalTwinSnapshot): DigitalTwinInsight[] {
  const insights: DigitalTwinInsight[] = [];
  const now = snapshot.timestamp;
  const facilityId = snapshot.facilityId;

  if (snapshot.overlays.bottlenecks && snapshot.overlays.bottlenecks.length > 0) {
    insights.push({
      insightId: `${facilityId}-bottleneck`,
      facilityId,
      timestamp: now,
      type: 'bottleneck',
      severity: 'medium',
      summary: 'High occupancy rooms detected',
      details: `Rooms over 85% occupancy: ${snapshot.overlays.bottlenecks.join(', ')}`,
      impactedRooms: snapshot.overlays.bottlenecks,
      suggestedView: '2d',
    });
  }

  const offlineEquipment = snapshot.overlays.offlineEquipment ?? [];
  if (offlineEquipment.length > 0) {
    insights.push({
      insightId: `${facilityId}-offline`,
      facilityId,
      timestamp: now,
      type: 'offline-equipment',
      severity: 'high',
      summary: 'Offline or alerting equipment present',
      details: `Attention required for equipment: ${offlineEquipment.join(', ')}`,
      impactedEquipment: offlineEquipment,
      suggestedView: '3d',
    });
  }

  const loadSpread = computeLoadSpread(snapshot);
  if (loadSpread > 20) {
    const overloaded = snapshot.roomStates
      .filter((r) => (r.occupancyPercent ?? 0) > 80)
      .map((r) => r.roomId);
    insights.push({
      insightId: `${facilityId}-load-imbalance`,
      facilityId,
      timestamp: now,
      type: 'load-imbalance',
      severity: 'medium',
      summary: 'Uneven room utilization',
      details: `Load delta exceeds threshold (Δ=${loadSpread.toFixed(1)}%)`,
      impactedRooms: overloaded,
      suggestedView: '2d',
    });
  }

  const energyHotspots = snapshot.roomStates
    .filter((r) => (r.energyKwh ?? 0) > 30)
    .map((r) => r.roomId);
  if (energyHotspots.length > 0) {
    insights.push({
      insightId: `${facilityId}-energy`,
      facilityId,
      timestamp: now,
      type: 'energy-hotspot',
      severity: 'low',
      summary: 'Energy hotspots detected',
      details: `Rooms exceeding 30 kWh: ${energyHotspots.join(', ')}`,
      impactedRooms: energyHotspots,
      suggestedView: '3d',
    });
  }

  return insights;
}

function computeLoadSpread(snapshot: DigitalTwinSnapshot): number {
  const loads = snapshot.roomStates
    .map((r) => r.occupancyPercent ?? 0)
    .filter((val) => val > 0);
  if (loads.length === 0) return 0;
  const max = Math.max(...loads);
  const min = Math.min(...loads);
  return max - min;
}
