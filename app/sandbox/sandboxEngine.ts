import { ForecastingReport, ForecastingEngineInput } from '../forecasting/forecastingTypes';
import { buildSandboxScenario } from './sandboxScenarioBuilder';
import { runSandboxScenario, SandboxRunContext } from './sandboxRunner';
import { compareSandbox } from './sandboxComparator';
import { addSandboxLog } from './sandboxLog';
import {
  SandboxComparison,
  SandboxInsight,
  SandboxParameterSet,
  SandboxScenario,
  SandboxResult,
} from './sandboxTypes';

export interface SandboxExecutionBundle {
  scenario: SandboxScenario;
  result: SandboxResult;
  comparison: SandboxComparison;
  insights: SandboxInsight[];
}

export function executeSandbox(
  input: { name: string; description?: string; baselineId?: string; parameters: SandboxParameterSet },
  baselineForecastInput: ForecastingEngineInput,
  baselineReport: ForecastingReport
): SandboxExecutionBundle {
  const { scenario, errors } = buildSandboxScenario(input);
  if (errors.length > 0) {
    addSandboxLog({ category: 'rejection', message: `Scenario rejected: ${scenario.name}`, context: { scenarioId: scenario.scenarioId }, details: errors });
    return {
      scenario,
      result: {
        scenarioId: scenario.scenarioId,
        label: 'sandbox',
        forecast: baselineReport,
        energyEstimateKwh: 0,
        laborHoursEstimate: 0,
      },
      comparison: {
        scenarioId: scenario.scenarioId,
        baselineId: scenario.baselineId ?? 'baseline',
        capacityDelta: { before: 0, after: 0, delta: 0, trend: 'neutral' },
        throughputDelta: { before: 0, after: 0, delta: 0, trend: 'neutral' },
        yieldDelta: { before: 0, after: 0, delta: 0, trend: 'neutral' },
        energyDelta: { before: 0, after: 0, delta: 0, trend: 'neutral' },
        laborDelta: { before: 0, after: 0, delta: 0, trend: 'neutral' },
        roomUtilizationDelta: [],
      },
      insights: [],
    };
  }

  const runCtx: SandboxRunContext = {
    baselineForecastInput,
    baselineReport,
  };

  const result = runSandboxScenario(scenario.scenarioId, input.parameters, runCtx);

  const baselineEnergyKwh = estimateBaselineEnergy(baselineReport);
  const baselineLabor = baselineReport.capacity.labor.reduce((sum, role) => sum + role.hoursAvailable, 0);

  const comparison = compareSandbox(baselineReport, result.forecast, {
    scenarioId: scenario.scenarioId,
    baselineId: scenario.baselineId ?? 'baseline',
    baselineEnergyKwh,
    scenarioEnergyKwh: result.energyEstimateKwh,
    baselineLaborHours: baselineLabor,
    scenarioLaborHours: result.laborHoursEstimate,
  });

  const insights = buildSandboxInsights(comparison, scenario.scenarioId);

  addSandboxLog({ category: 'comparison', message: `Scenario compared: ${scenario.name}`, context: { scenarioId: scenario.scenarioId } });
  addSandboxLog({ category: 'insight', message: `Insights generated for ${scenario.name}`, context: { scenarioId: scenario.scenarioId }, details: insights });

  return { scenario, result, comparison, insights };
}

function buildSandboxInsights(comparison: SandboxComparison, scenarioId: string): SandboxInsight[] {
  const insights: SandboxInsight[] = [];

  const throughputTrend = comparison.throughputDelta.trend;
  insights.push({
    insightId: `${scenarioId}-throughput`,
    scenarioId,
    severity: throughputTrend === 'better' ? 'medium' : 'low',
    summary: 'Throughput shift',
    detail: `Δ batches: ${comparison.throughputDelta.delta.toFixed(1)}`,
    rationale: 'Based on deterministic cycle time and capacity deltas',
    whenUseful: 'Use when planning schedule shifts or resource reallocations',
    risks: 'Non-binding sandbox; verify before promotion',
  });

  const energyTrend = comparison.energyDelta.trend;
  insights.push({
    insightId: `${scenarioId}-energy`,
    scenarioId,
    severity: energyTrend === 'better' ? 'low' : 'medium',
    summary: 'Energy impact',
    detail: `Δ energy: ${comparison.energyDelta.delta.toFixed(1)} kWh`,
    rationale: 'Energy bias applied to equipment hours',
    whenUseful: 'Use for setpoint tuning or load balancing',
    risks: 'Energy estimate is operational only; no biological coupling',
  });

  const laborTrend = comparison.laborDelta.trend;
  insights.push({
    insightId: `${scenarioId}-labor`,
    scenarioId,
    severity: laborTrend === 'better' ? 'low' : 'medium',
    summary: 'Labor load shift',
    detail: `Δ labor hours: ${comparison.laborDelta.delta.toFixed(1)}`,
    rationale: 'Computed from adjusted labor availability per day',
    whenUseful: 'Use when testing staffing plans',
    risks: 'Ensure labor availability aligns with compliance rules',
  });

  return insights;
}

function estimateBaselineEnergy(report: ForecastingReport): number {
  return Math.round(report.capacity.equipmentAvailability.reduce((sum, eq) => sum + eq.availableHours, 0));
}
