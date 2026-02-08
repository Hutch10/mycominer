'use client';

import { useEffect, useMemo, useState } from 'react';
import { deviceRegistry } from '../engine/deviceRegistry';
import { hardwareLogger } from '../engine/hardwareLogger';
import { DeviceMetadata, ControllerRecommendation } from '../engine/hardwareTypes';
import { DeviceConnectionPanel } from './DeviceConnectionPanel';
import { DeviceCard } from './DeviceCard';
import { DeviceCapabilityPanel } from './DeviceCapabilityPanel';
import { ControllerActionPanel } from './ControllerActionPanel';
import { HardwareStatusPanel } from './HardwareStatusPanel';
import {
  HumidifierController,
  HeaterController,
  FanController,
  CO2ScrubberController,
  LightController,
} from '../engine/controllerInterfaces';

export function HardwareDashboard() {
  const [devices, setDevices] = useState<DeviceMetadata[]>(deviceRegistry.list());
  const [recommendations, setRecommendations] = useState<ControllerRecommendation[]>([]);
  const [logs, setLogs] = useState(hardwareLogger.list());

  useEffect(() => {
    const refresh = () => setDevices(deviceRegistry.list());
    deviceRegistry.on('device-added', refresh);
    return () => deviceRegistry.off('device-added', refresh);
  }, []);

  const controllers = useMemo(() => {
    const humid = devices.find((d) => d.name.toLowerCase().includes('humid'));
    const heater = devices.find((d) => d.name.toLowerCase().includes('heat'));
    const fan = devices.find((d) => d.name.toLowerCase().includes('fan'));
    const scrubber = devices.find((d) => d.name.toLowerCase().includes('scrub'));
    const light = devices.find((d) => d.name.toLowerCase().includes('light'));

    return {
      humidifier: humid ? new HumidifierController(humid) : null,
      heater: heater ? new HeaterController(heater) : null,
      fan: fan ? new FanController(fan) : null,
      scrubber: scrubber ? new CO2ScrubberController(scrubber) : null,
      light: light ? new LightController(light) : null,
    };
  }, [devices]);

  // Demo: seed one recommendation on mount
  useEffect(() => {
    const recs: ControllerRecommendation[] = [];
    if (controllers.humidifier) recs.push(controllers.humidifier.recommend(88, 82, { species: 'oyster', stage: 'fruiting' }));
    if (controllers.heater) recs.push(controllers.heater.recommend(20, 18, { species: 'oyster', stage: 'fruiting' }));
    if (controllers.fan) recs.push(controllers.fan.recommend(120, 80, { species: 'oyster', stage: 'fruiting' }));
    setRecommendations(recs);
  }, [controllers]);

  const handleApprove = async (rec: ControllerRecommendation) => {
    const ctl =
      rec.capabilityId.includes('humid') ? controllers.humidifier :
      rec.capabilityId.includes('heater') ? controllers.heater :
      rec.capabilityId.includes('fan') ? controllers.fan :
      rec.capabilityId.includes('co2') ? controllers.scrubber :
      rec.capabilityId.includes('light') ? controllers.light :
      null;
    if (!ctl) throw new Error('No controller');
    const result = await ctl.execute(rec, { species: 'oyster', stage: 'fruiting' });
    setLogs(hardwareLogger.list());
    return result;
  };

  return (
    <div className="space-y-4">
      <DeviceConnectionPanel onDeviceAdded={(d) => setDevices([...devices, d])} />

      <HardwareStatusPanel devices={devices} logs={logs} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Devices</p>
          {devices.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">No devices yet. Add and connect above.</p>
          ) : (
            devices.map((d) => (
              <div key={d.id} className="space-y-2">
                <DeviceCard device={d} />
                <DeviceCapabilityPanel capabilities={d.capabilities} />
              </div>
            ))
          )}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Controller Actions</p>
          <ControllerActionPanel recommendations={recommendations} onApprove={handleApprove} />
        </div>
      </div>
    </div>
  );
}
