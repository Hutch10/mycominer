// Phase 21: Safety Gate
// Runs deterministic, pre-step safety checks with explicit allow/warn/block decisions

'use client';

import {
  ExecutionStepProposal,
  SafetyGateResult,
  SafetyDecision,
  TelemetrySnapshot,
} from '@/app/execution/executionTypes';

interface SafetyGateOptions {
  emergencyStop?: boolean;
  contaminationThreshold?: number; // 0-100 warn threshold
  contaminationBlockThreshold?: number; // 0-100 block threshold
  regressionSignals?: string[];
}

class SafetyGate {
  private buildBaseResult(step: ExecutionStepProposal): SafetyGateResult {
    return {
      gateId: `gate-${step.stepId}-${Date.now()}`,
      stepId: step.stepId,
      decision: 'allow',
      rationale: [],
      recommendedAlternatives: [],
      checks: {},
    };
  }

  evaluateStep(
    step: ExecutionStepProposal,
    telemetry: TelemetrySnapshot | undefined,
    options: SafetyGateOptions = {}
  ): SafetyGateResult {
    const result = this.buildBaseResult(step);
    const contaminationWarn = options.contaminationThreshold ?? 70;
    const contaminationBlock = options.contaminationBlockThreshold ?? 85;

    // Emergency stop always blocks
    if (options.emergencyStop) {
      result.decision = 'block';
      result.checks.emergencyStop = true;
      result.rationale.push('Emergency stop engaged');
      result.recommendedAlternatives.push('Hold execution and inspect onsite');
      return result;
    }

    // Telemetry-based checks
    if (telemetry) {
      const deviations: string[] = [];
      if (step.telemetryWatch?.contaminationRiskMax !== undefined && telemetry.contaminationRiskScore !== undefined) {
        if (telemetry.contaminationRiskScore > step.telemetryWatch.contaminationRiskMax) {
          deviations.push(`Contamination risk ${telemetry.contaminationRiskScore} exceeds limit ${step.telemetryWatch.contaminationRiskMax}`);
          result.checks.contaminationSpike = true;
        }
      } else if (telemetry.contaminationRiskScore !== undefined) {
        if (telemetry.contaminationRiskScore >= contaminationBlock) {
          deviations.push(`Contamination risk ${telemetry.contaminationRiskScore} exceeds block threshold ${contaminationBlock}`);
          result.checks.contaminationSpike = true;
        } else if (telemetry.contaminationRiskScore >= contaminationWarn) {
          deviations.push(`Contamination risk ${telemetry.contaminationRiskScore} exceeds warn threshold ${contaminationWarn}`);
          result.checks.contaminationSpike = true;
        }
      }

      if (step.telemetryWatch?.equipmentLoadMax !== undefined && telemetry.equipmentLoadPercent !== undefined) {
        if (telemetry.equipmentLoadPercent > step.telemetryWatch.equipmentLoadMax) {
          deviations.push(`Equipment load ${telemetry.equipmentLoadPercent}% exceeds limit ${step.telemetryWatch.equipmentLoadMax}%`);
          result.checks.equipmentOverload = true;
        }
      }

      if (step.telemetryWatch?.laborUtilizationMax !== undefined && telemetry.laborUtilizationPercent !== undefined) {
        if (telemetry.laborUtilizationPercent > step.telemetryWatch.laborUtilizationMax) {
          deviations.push(`Labor utilization ${telemetry.laborUtilizationPercent}% exceeds limit ${step.telemetryWatch.laborUtilizationMax}%`);
          result.checks.laborMismatch = true;
        }
      }

      if (step.telemetryWatch?.environmentLimits && telemetry.temperatureC !== undefined) {
        const env = step.telemetryWatch.environmentLimits;
        if (env.temperatureMax !== undefined && telemetry.temperatureC > env.temperatureMax) {
          deviations.push(`Temperature ${telemetry.temperatureC}°C exceeds max ${env.temperatureMax}°C`);
          result.checks.environmentalLimit = true;
        }
        if (env.temperatureMin !== undefined && telemetry.temperatureC < env.temperatureMin) {
          deviations.push(`Temperature ${telemetry.temperatureC}°C below min ${env.temperatureMin}°C`);
          result.checks.environmentalLimit = true;
        }
      }

      if (telemetry.regressionsDetected && telemetry.regressionsDetected.length > 0) {
        result.checks.regressionDetected = true;
        deviations.push(`Regression signals: ${telemetry.regressionsDetected.join(', ')}`);
      }

      if (deviations.length > 0) {
        result.rationale.push(...deviations);
      }
    }

    // Decision aggregation (block beats warn beats allow)
    const shouldBlock = Boolean(
      result.checks.emergencyStop ||
      result.checks.environmentalLimit ||
      (result.checks.contaminationSpike && telemetry?.contaminationRiskScore !== undefined && telemetry.contaminationRiskScore >= contaminationBlock)
    );
    const shouldWarn = Boolean(
      result.checks.laborMismatch ||
      result.checks.equipmentOverload ||
      result.checks.regressionDetected ||
      (result.checks.contaminationSpike && telemetry?.contaminationRiskScore !== undefined && telemetry.contaminationRiskScore >= contaminationWarn)
    );

    if (shouldBlock) {
      result.decision = 'block';
      result.recommendedAlternatives.push('Pause execution and re-run safety checks after remediation');
    } else if (shouldWarn) {
      result.decision = 'warn';
      result.recommendedAlternatives.push('Require manual approval before proceeding');
    } else {
      result.decision = 'allow';
    }

    return result;
  }

  evaluatePlan(
    steps: ExecutionStepProposal[],
    telemetry: TelemetrySnapshot | undefined,
    options: SafetyGateOptions = {}
  ): SafetyGateResult[] {
    return steps.map(step => this.evaluateStep(step, telemetry, options));
  }
}

export const safetyGate = new SafetyGate();
