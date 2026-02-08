'use client';

import { useState } from 'react';
import { SimulationScenario, SimulationMode, ScenarioType } from '@/app/simulation/engine/simulationTypes';
import { digitalTwinGenerator } from '@/app/simulation/engine/digitalTwinGenerator';

interface ScenarioBuilderProps {
  onScenarioCreated: (scenario: SimulationScenario) => void;
}

export default function SimulationScenarioBuilder({ onScenarioCreated }: ScenarioBuilderProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ScenarioType>('baseline');
  const [mode, setMode] = useState<SimulationMode>('time-series');
  const [duration, setDuration] = useState(60);

  const handleCreate = () => {
    if (!name) {
      alert('Please provide a scenario name');
      return;
    }

    // Generate digital twin from mock facility
    const snapshot = digitalTwinGenerator.mirrorFacilityConfiguration({ name: 'Mock Facility' });

    const scenario: SimulationScenario = {
      id: `scenario-${Date.now()}`,
      name,
      description,
      type,
      mode,
      rooms: snapshot.rooms,
      duration,
      parameters: {},
    };

    onScenarioCreated(scenario);

    // Reset form
    setName('');
    setDescription('');
    setDuration(60);
  };

  return (
    <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
      <h3 className="text-lg font-bold mb-4">Create Simulation Scenario</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Scenario Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
            placeholder="e.g., Baseline Summer Conditions"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
            placeholder="Optional description..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Scenario Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ScenarioType)}
              className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="baseline">Baseline</option>
              <option value="what-if">What-If Analysis</option>
              <option value="optimization">Optimization</option>
              <option value="contamination-scenario">Contamination Scenario</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Simulation Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as SimulationMode)}
              className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="snapshot">Snapshot</option>
              <option value="time-series">Time-Series</option>
              <option value="stress-test">Stress Test</option>
              <option value="optimization">Optimization</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
            min={1}
            max={1440}
          />
        </div>

        <button
          onClick={handleCreate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          Create & Add to Queue
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4 italic">
        All simulations are virtual and do not affect real hardware.
      </p>
    </div>
  );
}
