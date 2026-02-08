import { ForecastingReport } from '../forecasting/forecastingTypes';
import { SandboxComparison, SandboxComparisonDelta } from './sandboxTypes';

export interface ComparisonContext {
  scenarioId: string;
  baselineId: string;
  baselineEnergyKwh: number;
  scenarioEnergyKwh: number;
  baselineLaborHours: number;
  scenarioLaborHours: number;
}

export function compareSandbox(
  baseline: ForecastingReport,
  scenario: ForecastingReport,
  ctx: ComparisonContext
): SandboxComparison {
  const capacityDelta = buildDelta(sumRoomCapacity(baseline), sumRoomCapacity(scenario), 'higher-is-better');
  const throughputDelta = buildDelta(sumThroughput(baseline), sumThroughput(scenario), 'higher-is-better');
  const yieldDelta = buildDelta(sumYield(baseline), sumYield(scenario), 'higher-is-better');
  const energyDelta = buildDelta(ctx.baselineEnergyKwh, ctx.scenarioEnergyKwh, 'lower-is-better');
  const laborDelta = buildDelta(ctx.baselineLaborHours, ctx.scenarioLaborHours, 'lower-is-better');

  const roomUtilizationDelta = scenario.capacity.roomUtilization.map((room) => {
    const before = findRoomUtilization(baseline, room.roomId);
    const after = room.utilizationPercent;
    const delta = after - before;
    const trend = classifyDelta(delta, 'higher-is-better');
    return { roomId: room.roomId, before, after, delta, trend };
  });

  return {
    scenarioId: ctx.scenarioId,
    baselineId: ctx.baselineId,
    capacityDelta,
    throughputDelta,
    yieldDelta,
    energyDelta,
    laborDelta,
    roomUtilizationDelta,
  };
}

function sumRoomCapacity(report: ForecastingReport): number {
  return report.capacity.roomUtilization.reduce((sum, r) => sum + r.availableCapacityUnits, 0);
}

function sumThroughput(report: ForecastingReport): number {
  return report.throughput.reduce((sum, t) => sum + t.batchesMax, 0);
}

function sumYield(report: ForecastingReport): number {
  return report.yieldRanges.reduce((sum, y) => sum + y.volumeMax, 0);
}

function findRoomUtilization(report: ForecastingReport, roomId: string): number {
  return report.capacity.roomUtilization.find((r) => r.roomId === roomId)?.utilizationPercent ?? 0;
}

function buildDelta(before: number, after: number, direction: 'higher-is-better' | 'lower-is-better'): SandboxComparisonDelta<number> {
  const delta = after - before;
  const adjustedDelta = direction === 'lower-is-better' ? -delta : delta;
  const trend = classifyDelta(delta, direction);
  return { before, after, delta, trend: trend === 'better' && direction === 'lower-is-better' ? 'better' : trend === 'worse' && direction === 'lower-is-better' ? 'worse' : trend };
}

function classifyDelta(delta: number, direction: 'higher-is-better' | 'lower-is-better'): 'better' | 'worse' | 'mixed' | 'neutral' {
  const threshold = 0.01;
  if (Math.abs(delta) <= threshold) return 'neutral';
  const isPositive = delta > 0;
  if (direction === 'higher-is-better') {
    return isPositive ? 'better' : 'worse';
  }
  return isPositive ? 'worse' : 'better';
}
