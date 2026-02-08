import {
  BottleneckAnalysis,
  ForecastingInsight,
  ForecastingReport,
  RoomCapacityProfile,
  EquipmentAvailabilityProfile,
  SubstrateInventoryProfile,
  LaborAvailabilityProfile,
  WorkflowTimingProfile,
} from './forecastingTypes';
import { computeCapacitySnapshot, CapacityModelerInput } from './capacityModeler';
import { estimateThroughput, ThroughputEstimatorInput } from './throughputEstimator';
import { calculateYieldRanges, YieldRangeInput } from './yieldRangeCalculator';
import { addForecastLog } from './forecastingLog';

export interface ForecastingEngineInput {
  facilityId: string;
  horizonDays: number;
  rooms: RoomCapacityProfile[];
  equipment: EquipmentAvailabilityProfile[];
  substrate: SubstrateInventoryProfile;
  labor: LaborAvailabilityProfile[];
  workflows: WorkflowTimingProfile[];
}

export function buildDeterministicForecast(input: ForecastingEngineInput): ForecastingReport {
  const capacityInput: CapacityModelerInput = {
    facilityId: input.facilityId,
    horizonDays: input.horizonDays,
    rooms: input.rooms,
    equipment: input.equipment,
    substrate: input.substrate,
    labor: input.labor,
  };
  const capacity = computeCapacitySnapshot(capacityInput);
  addForecastLog({ category: 'capacity-snapshot', message: 'Capacity snapshot generated', context: { facilityId: input.facilityId } });

  const throughputInput: ThroughputEstimatorInput = {
    facilityId: input.facilityId,
    horizonDays: input.horizonDays,
    capacity,
    workflows: input.workflows,
  };
  const throughput = estimateThroughput(throughputInput);
  addForecastLog({ category: 'throughput-estimate', message: 'Throughput estimated', context: { facilityId: input.facilityId } });

  const yieldInput: YieldRangeInput = {
    facilityId: input.facilityId,
    throughput,
    substrate: input.substrate,
  };
  const yieldRanges = calculateYieldRanges(yieldInput);
  addForecastLog({ category: 'yield-range', message: 'Yield ranges calculated', context: { facilityId: input.facilityId } });

  const bottlenecks = analyzeBottlenecks(capacity, throughput);
  const insights = buildInsights(capacity, bottlenecks, throughput, yieldRanges);

  const report: ForecastingReport = {
    reportId: `${input.facilityId}-${Date.now()}`,
    facilityId: input.facilityId,
    timestamp: new Date().toISOString(),
    capacity,
    throughput,
    yieldRanges,
    bottlenecks,
    insights,
  };

  addForecastLog({ category: 'report', message: 'Forecast report compiled', context: { facilityId: input.facilityId, reportId: report.reportId } });
  return report;
}

function analyzeBottlenecks(capacity: ReturnType<typeof computeCapacitySnapshot>, throughput: ReturnType<typeof estimateThroughput>): BottleneckAnalysis {
  const bottlenecks: BottleneckAnalysis['bottlenecks'] = [];

  capacity.roomUtilization
    .filter((room) => room.constrainedBy !== 'none')
    .forEach((room) => {
      bottlenecks.push({ type: 'room', id: room.roomId, severity: 'medium', detail: `Room limited by ${room.constrainedBy}` });
    });

  capacity.equipmentAvailability
    .filter((eq) => eq.cyclesPossible < 2)
    .forEach((eq) => bottlenecks.push({ type: 'equipment', id: eq.equipmentId, severity: 'high', detail: 'Low equipment cycles available' }));

  capacity.labor
    .filter((role) => role.batchesPossible < 2)
    .forEach((role) => bottlenecks.push({ type: 'labor', id: role.role, severity: 'medium', detail: 'Labor hours tight' }));

  if (capacity.substrate.batchesPossible < 2) {
    bottlenecks.push({ type: 'substrate', id: 'substrate', severity: 'high', detail: 'Substrate volume constrained' });
  }

  throughput
    .filter((t) => t.batchesMax === 0)
    .forEach((t) => bottlenecks.push({ type: 'room', id: t.workflowId, severity: 'high', detail: 'Workflow stalled by constraints' }));

  return { facilityId: capacity.facilityId, timestamp: capacity.timestamp, bottlenecks };
}

function buildInsights(
  capacity: ReturnType<typeof computeCapacitySnapshot>,
  bottlenecks: BottleneckAnalysis,
  throughput: ReturnType<typeof estimateThroughput>,
  yieldRanges: ReturnType<typeof calculateYieldRanges>
): ForecastingInsight[] {
  const insights: ForecastingInsight[] = [];
  const now = new Date().toISOString();
  const facilityId = capacity.facilityId;

  if (bottlenecks.bottlenecks.length > 0) {
    insights.push({
      insightId: `${facilityId}-bottlenecks`,
      facilityId,
      timestamp: now,
      severity: 'high',
      category: 'bottleneck',
      summary: 'Bottlenecks identified',
      details: `${bottlenecks.bottlenecks.length} bottleneck(s) require attention`,
      relatedIds: bottlenecks.bottlenecks.map((b) => b.id),
    });
  }

  const lowThroughput = throughput.filter((t) => t.batchesMax < 2);
  if (lowThroughput.length > 0) {
    insights.push({
      insightId: `${facilityId}-throughput`,
      facilityId,
      timestamp: now,
      severity: 'medium',
      category: 'throughput',
      summary: 'Throughput limited',
      details: `Low throughput workflows: ${lowThroughput.map((t) => t.workflowName).join(', ')}`,
      relatedIds: lowThroughput.map((t) => t.workflowId),
    });
  }

  const lowYield = yieldRanges.filter((y) => y.volumeMax === 0);
  if (lowYield.length > 0) {
    insights.push({
      insightId: `${facilityId}-yield`,
      facilityId,
      timestamp: now,
      severity: 'medium',
      category: 'yield',
      summary: 'Yield ranges at zero',
      details: `No producible volume for: ${lowYield.map((y) => y.workflowName).join(', ')}`,
      relatedIds: lowYield.map((y) => y.workflowId),
    });
  }

  return insights;
}
