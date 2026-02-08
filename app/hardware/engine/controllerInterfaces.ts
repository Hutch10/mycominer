'use client';

import { deviceRegistry } from './deviceRegistry';
import { HardwareAction, ControllerRecommendation, DeviceMetadata } from './hardwareTypes';
import { ensureSafeAction } from './hardwareSafety';
import { hardwareLogger } from './hardwareLogger';

interface ControllerContext {
  species?: string;
  stage?: string;
}

export type ControllerKind = 'humidifier' | 'heater' | 'fan' | 'co2-scrubber' | 'light';

abstract class BaseController {
  constructor(protected device: DeviceMetadata) {}

  protected requestAction(
    kind: ControllerKind,
    params: Record<string, any>,
    context?: ControllerContext
  ): ControllerRecommendation {
    const actionId = `${kind}-${Date.now()}`;
    const recommendation: ControllerRecommendation = {
      actionId,
      deviceId: this.device.id,
      capabilityId: `${kind}-control`,
      title: `${kind} adjustment requested`,
      rationale: `Proposed change for ${context?.species ?? 'species'} at ${context?.stage ?? 'stage'}`,
      params,
      requiresApproval: true,
    };
    return recommendation;
  }

  async execute(action: ControllerRecommendation, context?: ControllerContext): Promise<HardwareAction> {
    const safety = ensureSafeAction(action, context);
    const baseAction: HardwareAction = {
      id: action.actionId,
      deviceId: action.deviceId,
      capabilityId: action.capabilityId,
      params: action.params,
      requestedAt: Date.now(),
      status: 'pending',
    };

    deviceRegistry.registerAction(baseAction);
    hardwareLogger.logAction({
      actionId: baseAction.id,
      deviceId: baseAction.deviceId,
      status: baseAction.status,
      message: 'Action requested',
    });

    if (!safety.ok) {
      const rejected: HardwareAction = { ...baseAction, status: 'rejected', reason: safety.errors[0] ?? 'Safety check failed' };
      deviceRegistry.updateAction(baseAction.id, rejected);
      hardwareLogger.logAction({
        actionId: rejected.id,
        deviceId: rejected.deviceId,
        status: rejected.status,
        message: rejected.reason ?? 'Rejected',
      });
      return rejected;
    }

    // In a real system we would send to adapter here after user approval; for now, mark approved and executed
    const approved: HardwareAction = { ...baseAction, status: 'approved', approvedAt: Date.now() };
    deviceRegistry.updateAction(baseAction.id, approved);
    hardwareLogger.logAction({ actionId: approved.id, deviceId: approved.deviceId, status: approved.status, message: 'Approved (stub)' });

    const executed: HardwareAction = { ...approved, status: 'executed', executedAt: Date.now() };
    deviceRegistry.updateAction(baseAction.id, executed);
    hardwareLogger.logAction({ actionId: executed.id, deviceId: executed.deviceId, status: executed.status, message: 'Executed (no-op stub)' });

    return executed;
  }
}

export class HumidifierController extends BaseController {
  recommend(targetHumidity: number, currentHumidity?: number, context?: ControllerContext) {
    const delta = targetHumidity - (currentHumidity ?? targetHumidity);
    const params = { delta, mode: delta > 0 ? 'increase' : 'decrease', target: targetHumidity };
    return this.requestAction('humidifier', params, context);
  }
}

export class HeaterController extends BaseController {
  recommend(targetTemp: number, currentTemp?: number, context?: ControllerContext) {
    const delta = targetTemp - (currentTemp ?? targetTemp);
    const params = { delta, mode: delta > 0 ? 'heat' : 'cool', target: targetTemp };
    return this.requestAction('heater', params, context);
  }
}

export class FanController extends BaseController {
  recommend(targetAirflow: number, currentAirflow?: number, context?: ControllerContext) {
    const delta = targetAirflow - (currentAirflow ?? targetAirflow);
    const params = { delta, mode: delta > 0 ? 'increase' : 'decrease', target: targetAirflow };
    return this.requestAction('fan', params, context);
  }
}

export class CO2ScrubberController extends BaseController {
  recommend(targetCO2: number, currentCO2?: number, context?: ControllerContext) {
    const delta = targetCO2 - (currentCO2 ?? targetCO2);
    const params = { delta, mode: delta < 0 ? 'scrub' : 'idle', target: targetCO2 };
    return this.requestAction('co2-scrubber', params, context);
  }
}

export class LightController extends BaseController {
  recommend(targetLux: number, currentLux?: number, context?: ControllerContext) {
    const delta = targetLux - (currentLux ?? targetLux);
    const params = { delta, mode: delta > 0 ? 'increase' : 'decrease', target: targetLux };
    return this.requestAction('light', params, context);
  }
}
