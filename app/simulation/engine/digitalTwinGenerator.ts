'use client';

import {
  DigitalRoom,
  DigitalTwinSnapshot,
  VirtualDevice,
  VirtualSubstrate,
  EnvironmentalState,
  SimulationMode,
} from '@/app/simulation/engine/simulationTypes';

class DigitalTwinGenerator {
  generateSnapshot(facilityId: string, facilityName: string, roomConfigs: any[], mode: SimulationMode): DigitalTwinSnapshot {
    const rooms = roomConfigs.map((config) => this.createDigitalRoom(config));
    const species = [...new Set(rooms.map((r) => r.species).filter(Boolean))] as string[];
    const stages = [...new Set(rooms.map((r) => r.stage).filter(Boolean))] as string[];

    const snapshot: DigitalTwinSnapshot = {
      id: `twin-${Date.now()}`,
      facilityId,
      facilityName,
      rooms,
      timestamp: Date.now(),
      mode,
      metadata: {
        totalRooms: rooms.length,
        totalDevices: rooms.reduce((sum, r) => sum + r.devices.length, 0),
        species,
        stages,
      },
    };

    return snapshot;
  }

  createDigitalRoom(config: {
    id: string;
    name: string;
    species?: string;
    stage?: string;
    volume?: number;
    devices?: Partial<VirtualDevice>[];
    substrate?: Partial<VirtualSubstrate>;
    initialEnvironment?: Partial<EnvironmentalState>;
  }): DigitalRoom {
    const devices = (config.devices || []).map((d, idx) =>
      this.createVirtualDevice({
        id: d.id || `device-${idx}`,
        type: d.type || 'sensor',
        status: d.status || 'off',
        powerWatts: d.powerWatts || 0,
        effectRate: d.effectRate || 0,
      })
    );

    const substrate = config.substrate
      ? this.createVirtualSubstrate(config.substrate)
      : undefined;

    const environmentalState = this.initializeEnvironmentalState(config.initialEnvironment);

    const room: DigitalRoom = {
      id: config.id,
      name: config.name,
      species: config.species,
      stage: config.stage,
      volume: config.volume || 50, // default 50 m³
      devices,
      substrate,
      environmentalState,
    };

    return room;
  }

  private createVirtualDevice(config: VirtualDevice): VirtualDevice {
    return {
      id: config.id,
      type: config.type,
      status: config.status,
      powerWatts: config.powerWatts,
      effectRate: config.effectRate,
    };
  }

  private createVirtualSubstrate(config: Partial<VirtualSubstrate>): VirtualSubstrate {
    return {
      type: config.type || 'generic',
      massKg: config.massKg || 10,
      moisturePercent: config.moisturePercent || 60,
      co2ProductionRate: config.co2ProductionRate || 50, // ppm/hr
      heatProductionRate: config.heatProductionRate || 20, // watts
    };
  }

  private initializeEnvironmentalState(config?: Partial<EnvironmentalState>): EnvironmentalState {
    return {
      temperatureC: config?.temperatureC ?? 20,
      humidityPercent: config?.humidityPercent ?? 60,
      co2Ppm: config?.co2Ppm ?? 800,
      airflowCFM: config?.airflowCFM ?? 100,
      lightLux: config?.lightLux ?? 0,
      timestamp: Date.now(),
    };
  }

  mirrorFacilityConfiguration(facilityData: any): DigitalTwinSnapshot {
    // In a real implementation, this would fetch from facility orchestrator
    // For now, create a mock facility with representative rooms
    const roomConfigs = [
      {
        id: 'room-1',
        name: 'Fruiting Room A',
        species: 'oyster',
        stage: 'fruiting',
        volume: 60,
        devices: [
          { id: 'heater-1', type: 'heater' as const, status: 'off' as const, powerWatts: 1500, effectRate: 0.5 },
          { id: 'humid-1', type: 'humidifier' as const, status: 'off' as const, powerWatts: 300, effectRate: 2.0 },
          { id: 'fan-1', type: 'fan' as const, status: 'on' as const, powerWatts: 100, effectRate: 50 },
        ],
        substrate: { type: 'straw', massKg: 15, moisturePercent: 65, co2ProductionRate: 60, heatProductionRate: 25 },
        initialEnvironment: { temperatureC: 18, humidityPercent: 85, co2Ppm: 1200 },
      },
      {
        id: 'room-2',
        name: 'Incubation Room B',
        species: 'shiitake',
        stage: 'incubation',
        volume: 40,
        devices: [
          { id: 'heater-2', type: 'heater' as const, status: 'on' as const, powerWatts: 1200, effectRate: 0.4 },
          { id: 'humid-2', type: 'humidifier' as const, status: 'off' as const, powerWatts: 250, effectRate: 1.5 },
        ],
        substrate: { type: 'sawdust', massKg: 20, moisturePercent: 55, co2ProductionRate: 40, heatProductionRate: 15 },
        initialEnvironment: { temperatureC: 24, humidityPercent: 60, co2Ppm: 800 },
      },
    ];

    return this.generateSnapshot('facility-1', facilityData?.name || 'Mock Facility', roomConfigs, 'snapshot');
  }
}

export const digitalTwinGenerator = new DigitalTwinGenerator();
