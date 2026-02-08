import { ForecastingReport, ForecastingEngineInput } from '../forecasting/forecastingTypes';
import { buildDeterministicForecast } from '../forecasting/forecastingEngine';
import { addSandboxLog } from './sandboxLog';
import { SandboxParameterSet, SandboxResult } from './sandboxTypes';

export interface SandboxRunContext {
  baselineForecastInput: ForecastingEngineInput;
  baselineReport: ForecastingReport;
}

export function runSandboxScenario(
  scenarioId: string,
  params: SandboxParameterSet,
  ctx: SandboxRunContext
): SandboxResult {
  const adjustedForecastInput = applyScenarioToForecastInput(ctx.baselineForecastInput, params);
  const forecast = buildDeterministicForecast(adjustedForecastInput);

  const energyEstimateKwh = estimateEnergy(forecast, params);
  const laborHoursEstimate = forecast.capacity.labor.reduce((sum, role) => sum + role.hoursAvailable, 0);

  addSandboxLog({ category: 'run', message: `Sandbox run executed for ${scenarioId}`, context: { scenarioId } });

  return {
    scenarioId,
    label: 'sandbox',
    forecast,
    energyEstimateKwh,
    laborHoursEstimate,
  };
}

function applyScenarioToForecastInput(base: ForecastingEngineInput, params: SandboxParameterSet): ForecastingEngineInput {
  const clone: ForecastingEngineInput = {
    facilityId: base.facilityId,
    horizonDays: Math.max(1, base.horizonDays + (params.schedule?.startOffsetDays ?? 0)),
    rooms: base.rooms.map((r) => ({ ...r })),
    equipment: base.equipment.map((e) => ({ ...e })),
    substrate: { ...base.substrate },
    labor: base.labor.map((l) => ({ ...l })),
    workflows: base.workflows.map((w) => ({ ...w })),
  };

  if (params.environment?.energyBias !== undefined) {
    clone.equipment = clone.equipment.map((e) => ({
      ...e,
      availableHoursPerDay: Math.max(1, e.availableHoursPerDay * params.environment!.energyBias!),
    }));
  }

  if (params.schedule?.batchStaggerMinutes !== undefined) {
    const staggerDays = (params.schedule.batchStaggerMinutes ?? 0) / 1440;
    clone.workflows = clone.workflows.map((w) => ({
      ...w,
      historicalDelayFactor: (w.historicalDelayFactor ?? 0) + staggerDays / Math.max(1, w.durationDays),
    }));
  }

  if (params.resources?.laborHoursDelta !== undefined) {
    const perRoleDelta = params.resources.laborHoursDelta / Math.max(1, clone.labor.length);
    clone.labor = clone.labor.map((l) => ({
      ...l,
      hoursAvailablePerDay: Math.max(0, l.hoursAvailablePerDay + perRoleDelta / Math.max(1, clone.horizonDays)),
    }));
  }

  if (params.resources?.equipmentWindowDeltaHours !== undefined) {
    const delta = params.resources.equipmentWindowDeltaHours;
    clone.equipment = clone.equipment.map((e) => ({
      ...e,
      availableHoursPerDay: Math.max(1, e.availableHoursPerDay + delta / Math.max(1, clone.horizonDays)),
    }));
  }

  if (params.roomAssignments && params.roomAssignments.length > 0) {
    const map = new Map(clone.rooms.map((r) => [r.roomId, r]));
    params.roomAssignments.forEach((assign) => {
      const from = map.get(assign.fromRoomId);
      const to = map.get(assign.toRoomId);
      if (from && to) {
        const shift = Math.floor(from.capacityUnits * 0.1);
        from.capacityUnits = Math.max(0, from.capacityUnits - shift);
        to.capacityUnits += shift;
      }
    });
    clone.rooms = Array.from(map.values());
  }

  return clone;
}

function estimateEnergy(report: ForecastingReport, params: SandboxParameterSet): number {
  const baseHours = report.capacity.equipmentAvailability.reduce((sum, eq) => sum + eq.availableHours, 0);
  const bias = params.environment?.energyBias ?? 1;
  return Math.round(baseHours * bias);
}
