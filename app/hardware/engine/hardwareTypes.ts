'use client';

export type ConnectionType = 'bluetooth' | 'serial' | 'usb' | 'websocket' | 'mqtt' | 'mock';
export type CapabilityType = 'read' | 'write' | 'control' | 'stream';
export type DeviceKind = 'sensor' | 'actuator' | 'controller' | 'gateway';

export interface DeviceCapability {
  id: string;
  type: CapabilityType;
  description: string;
  fields?: Array<{ key: string; label: string; unit?: string; min?: number; max?: number }>;
}

export interface DeviceMetadata {
  id: string;
  name: string;
  kind: DeviceKind;
  manufacturer?: string;
  model?: string;
  firmware?: string;
  connectionType: ConnectionType;
  capabilities: DeviceCapability[];
  lastSeen?: number;
  tags?: string[];
}

export interface HardwareAction {
  id: string;
  deviceId: string;
  capabilityId: string;
  params: Record<string, any>;
  requestedAt: number;
  approvedAt?: number;
  executedAt?: number;
  status: 'pending' | 'approved' | 'executed' | 'rejected' | 'failed';
  reason?: string;
}

export interface SafetyCheckResult {
  ok: boolean;
  warnings: string[];
  errors: string[];
}

export interface ControllerRecommendation {
  actionId: string;
  deviceId: string;
  capabilityId: string;
  title: string;
  rationale: string;
  params: Record<string, any>;
  requiresApproval: boolean;
}

export interface HardwareLogEntry {
  id: string;
  timestamp: number;
  actionId: string;
  deviceId: string;
  status: HardwareAction['status'];
  message: string;
  context?: Record<string, any>;
}
