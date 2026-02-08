'use client';

import { ControllerRecommendation, SafetyCheckResult } from './hardwareTypes';

const SPECIES_LIMITS: Record<string, Record<string, { temp?: [number, number]; humidity?: [number, number]; co2?: [number, number]; airflow?: [number, number]; light?: [number, number] }>> = {
  oyster: {
    colonization: { temp: [15, 25], humidity: [85, 95], co2: [0, 1200], airflow: [0, 120], light: [0, 100] },
    fruiting: { temp: [12, 24], humidity: [80, 95], co2: [800, 1200], airflow: [50, 200], light: [100, 1000] },
  },
};

export function ensureSafeAction(action: ControllerRecommendation, context?: { species?: string; stage?: string }): SafetyCheckResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  const species = context?.species ?? 'oyster';
  const stage = context?.stage ?? 'fruiting';
  const limits = SPECIES_LIMITS[species]?.[stage];

  const target = action.params.target as number | undefined;
  const field = detectField(action.capabilityId);

  if (limits && field && typeof target === 'number') {
    const range = limits[field as keyof typeof limits] as [number, number] | undefined;
    if (range) {
      if (target < range[0] || target > range[1]) {
        errors.push(`Target ${target} is outside safe range ${range[0]}-${range[1]} for ${species}/${stage}`);
      } else if (Math.abs(action.params.delta ?? 0) > (range[1] - range[0]) * 0.6) {
        warnings.push('Large adjustment requested; consider smaller steps');
      }
    }
  }

  return { ok: errors.length === 0, warnings, errors };
}

function detectField(capabilityId: string): 'temp' | 'humidity' | 'co2' | 'airflow' | 'light' | null {
  if (capabilityId.includes('heater')) return 'temp';
  if (capabilityId.includes('humid')) return 'humidity';
  if (capabilityId.includes('co2')) return 'co2';
  if (capabilityId.includes('fan')) return 'airflow';
  if (capabilityId.includes('light')) return 'light';
  return null;
}
