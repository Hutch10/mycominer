import {
  SandboxScenario,
  SandboxParameterSet,
  SandboxEnvironmentConfig,
  SandboxScheduleConfig,
  SandboxResourceConfig,
  SandboxRoomAssignment,
} from './sandboxTypes';
import { addSandboxLog } from './sandboxLog';

interface ScenarioInput {
  name: string;
  description?: string;
  baselineId?: string;
  parameters: SandboxParameterSet;
}

interface ScenarioBuildResult {
  scenario: SandboxScenario;
  errors: string[];
  warnings: string[];
}

export function buildSandboxScenario(input: ScenarioInput): ScenarioBuildResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  validateEnvironment(input.parameters.environment, errors, warnings);
  validateSchedule(input.parameters.schedule, errors);
  validateResources(input.parameters.resources, errors, warnings);
  validateRoomAssignments(input.parameters.roomAssignments, errors);

  const scenario: SandboxScenario = {
    scenarioId: `sandbox-${Date.now()}`,
    name: input.name,
    description: input.description,
    baselineId: input.baselineId,
    parameters: input.parameters,
    status: errors.length === 0 ? 'ready' : 'rejected',
    createdAt: new Date().toISOString(),
  };

  addSandboxLog({ category: 'scenario', message: `Scenario created: ${scenario.name}`, context: { scenarioId: scenario.scenarioId, baselineId: scenario.baselineId }, details: { errors, warnings } });

  return { scenario, errors, warnings };
}

function validateEnvironment(env: SandboxEnvironmentConfig | undefined, errors: string[], warnings: string[]) {
  if (!env) return;
  if (env.targetTempC !== undefined && (env.targetTempC < 10 || env.targetTempC > 30)) {
    errors.push('Temperature setpoint must be between 10-30C');
  }
  if (env.targetHumidityPercent !== undefined && (env.targetHumidityPercent < 30 || env.targetHumidityPercent > 95)) {
    errors.push('Humidity setpoint must be between 30-95%');
  }
  if (env.faeSchedulePerDay !== undefined && (env.faeSchedulePerDay < 1 || env.faeSchedulePerDay > 48)) {
    errors.push('FAE schedule must be 1-48 air exchanges/day');
  }
  if (env.energyBias !== undefined && (env.energyBias < 0.5 || env.energyBias > 1.5)) {
    warnings.push('Energy bias is outside nominal 0.5-1.5 range');
  }
}

function validateSchedule(schedule: SandboxScheduleConfig | undefined, errors: string[]) {
  if (!schedule) return;
  if (schedule.startOffsetDays !== undefined && Math.abs(schedule.startOffsetDays) > 14) {
    errors.push('Schedule offset exceeds +/-14 days');
  }
  if (schedule.batchStaggerMinutes !== undefined && (schedule.batchStaggerMinutes < 0 || schedule.batchStaggerMinutes > 720)) {
    errors.push('Batch staggering must be 0-720 minutes');
  }
  if (schedule.shiftWindowHours !== undefined && (schedule.shiftWindowHours < 0 || schedule.shiftWindowHours > 24)) {
    errors.push('Shift window must be within 0-24 hours');
  }
}

function validateResources(resources: SandboxResourceConfig | undefined, errors: string[], warnings: string[]) {
  if (!resources) return;
  if (resources.laborHoursDelta !== undefined && Math.abs(resources.laborHoursDelta) > 200) {
    errors.push('Labor hour delta exceeds +/-200 hours');
  }
  if (resources.equipmentWindowDeltaHours !== undefined && Math.abs(resources.equipmentWindowDeltaHours) > 200) {
    warnings.push('Equipment window delta is large; verify feasibility');
  }
}

function validateRoomAssignments(assignments: SandboxRoomAssignment[] | undefined, errors: string[]) {
  if (!assignments) return;
  const duplicates = new Set<string>();
  assignments.forEach((a) => {
    const key = `${a.fromRoomId}->${a.toRoomId}`;
    if (duplicates.has(key)) {
      errors.push(`Duplicate room reassignment: ${key}`);
    }
    duplicates.add(key);
  });
}
