/**
 * Environment Advisor Page
 * Interactive coach mode for environmental parameter guidance
 */

'use client';

import React, { useState, useEffect } from 'react';
import { CoachActionButtons } from '../components/CoachActionButtons';
import { getEnvironmentalParameters } from '../utils/coachEngine';
import { initializeMemory } from '../utils/coachMemory';
import type { EnvironmentalParams, CoachMemory } from '../utils/coachTypes';

export default function EnvironmentAdvisorPage() {
  const [memory, setMemory] = useState<CoachMemory | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<string>('oyster');
  const [selectedStage, setSelectedStage] = useState<string>('fruiting');
  const [parameters, setParameters] = useState<EnvironmentalParams | null>(null);

  useEffect(() => {
    const mem = initializeMemory();
    setMemory(mem);

    const params = getEnvironmentalParameters(selectedSpecies, selectedStage);
    setParameters(params);
  }, [selectedSpecies, selectedStage]);

  const handleSpeciesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSpecies(e.target.value);
  };

  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStage(e.target.value);
  };

  if (!memory || !parameters) return <div className="p-8 text-center">Loading...</div>;

  const commonSpecies = [
    { slug: 'oyster', label: 'Oyster Mushrooms' },
    { slug: 'shiitake', label: 'Shiitake' },
    { slug: 'lions-mane', label: "Lion's Mane" },
    { slug: 'reishi', label: 'Reishi' },
    { slug: 'king-oyster', label: 'King Oyster' },
    { slug: 'turkey-tail', label: 'Turkey Tail' },
  ];

  const stages = [
    { value: 'colonization', label: '🦠 Colonization', description: 'Mycelium spreading through substrate' },
    { value: 'fruiting', label: '🍄 Fruiting', description: 'Mushrooms forming and growing' },
  ];

  const tempUnit = parameters.temperature.unit === 'celsius' ? '°C' : '°F';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">🌡️ Environment Advisor</h1>
          <p className="text-cyan-100">Get precise environmental parameters for optimal growth</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Selection Form */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            🎯 Select Your Conditions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Species
              </label>
              <select
                value={selectedSpecies}
                onChange={handleSpeciesChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
              >
                {commonSpecies.map(species => (
                  <option key={species.slug} value={species.slug}>
                    {species.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Growing Stage
              </label>
              <select
                value={selectedStage}
                onChange={handleStageChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
              >
                {stages.map(stage => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Environmental Parameters */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            📊 Environmental Parameters
          </h2>

          {/* Temperature */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🌡️</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Temperature</h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-700 dark:text-red-300 font-semibold uppercase mb-1">
                  Minimum
                </p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {parameters.temperature.min}{tempUnit}
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold uppercase mb-1">
                  Optimal
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {parameters.temperature.optimal}{tempUnit}
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded border border-orange-200 dark:border-orange-800">
                <p className="text-xs text-orange-700 dark:text-orange-300 font-semibold uppercase mb-1">
                  Maximum
                </p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {parameters.temperature.max}{tempUnit}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Maintain temperature within this range. Fluctuations outside this window slow growth and increase contamination risk.
            </p>
          </div>

          {/* Humidity */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">💧</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Humidity</h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded border border-slate-300 dark:border-slate-600">
                <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold uppercase mb-1">
                  Minimum
                </p>
                <p className="text-3xl font-bold text-slate-600 dark:text-slate-400">
                  {parameters.humidity.min}%
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold uppercase mb-1">
                  Optimal
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {parameters.humidity.optimal}%
                </p>
              </div>

              <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded border border-slate-300 dark:border-slate-600">
                <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold uppercase mb-1">
                  Maximum
                </p>
                <p className="text-3xl font-bold text-slate-600 dark:text-slate-400">
                  {parameters.humidity.max}%
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              High humidity is critical for fruiting. Use a hygrometer to monitor and adjust misting frequency accordingly.
            </p>
          </div>

          {/* FAE (Fresh Air Exchange) */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">💨</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Fresh Air Exchange (FAE)</h3>
            </div>

            <div className="space-y-3 bg-slate-50 dark:bg-slate-700/50 p-4 rounded border border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Frequency</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {parameters.fae.frequency}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Duration</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {parameters.fae.duration}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Method</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                  {parameters.fae.method}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              FAE removes excess CO2 buildup which prevents pin formation. Can be achieved through passive ventilation or active fanning.
            </p>
          </div>

          {/* Light */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">💡</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Light Requirements</h3>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded border border-slate-200 dark:border-slate-700 space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Required</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {parameters.light.required ? 'Yes' : 'No'}
                </p>
              </div>
              {parameters.light.duration && (
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Duration</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {parameters.light.duration}
                  </p>
                </div>
              )}
              {parameters.light.intensity && (
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Intensity</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {parameters.light.intensity}
                  </p>
                </div>
              )}
            </div>

            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Indirect light helps mushrooms recognize fruiting conditions. Indirect sunlight or LED grow lights work well.
            </p>
          </div>

          {/* Substrate */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🌾</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Substrate Conditions</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-700/50 p-4 rounded border border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {parameters.substrate.type}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Moisture</p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {parameters.substrate.moisture}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Colonization</p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {parameters.substrate.colonizationDays} days
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fruiting Care</p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {parameters.substrate.fruiting}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="font-bold text-green-900 dark:text-green-100 mb-4">
            💡 Pro Tips
          </h3>
          <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
            <li>✓ Use a thermometer and hygrometer to monitor conditions</li>
            <li>✓ Gradual temperature changes are better than drastic fluctuations</li>
            <li>✓ Adequate FAE is often more important than misting frequency</li>
            <li>✓ Maintain detailed logs of temperature, humidity, and growth progress</li>
            <li>✓ Each growing space is unique—adjust based on your observations</li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-lg border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
            📋 Next Steps
          </h2>
          <p className="text-blue-800 dark:text-blue-200 mb-4">
            You now understand the environmental requirements. Ready to create a detailed grow plan?
          </p>
          <a
            href={`/coach/grow-planner?species=${selectedSpecies}`}
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
          >
            Create Grow Plan →
          </a>
        </div>

        {/* Other Coaches */}
        <CoachActionButtons
          mode="environment-advisor"
          preSelectedSpecies={selectedSpecies}
        />
      </div>
    </div>
  );
}
