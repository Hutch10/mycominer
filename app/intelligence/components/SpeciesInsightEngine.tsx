'use client';

import { useState } from 'react';
import { getSpeciesInsight, type SpeciesInsight } from '../utils';

const AVAILABLE_SPECIES = [
  { id: 'oyster', name: 'Oyster', icon: '🦪', color: 'blue' },
  { id: 'shiitake', name: 'Shiitake', icon: '🍄', color: 'amber' },
  { id: 'lions-mane', name: "Lion's Mane", icon: '🦁', color: 'orange' },
  { id: 'reishi', name: 'Reishi', icon: '🔴', color: 'red' },
  { id: 'king-oyster', name: 'King Oyster', icon: '👑', color: 'purple' },
  { id: 'turkey-tail', name: 'Turkey Tail', icon: '🦃', color: 'green' }
];

export default function SpeciesInsightEngine() {
  const [selectedSpecies, setSelectedSpecies] = useState<string>('');
  const [insight, setInsight] = useState<SpeciesInsight | null>(null);

  const handleSpeciesSelect = (speciesId: string) => {
    setSelectedSpecies(speciesId);
    const result = getSpeciesInsight(speciesId);
    setInsight(result);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
        <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">
          🍄 Species Insight Engine
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Comprehensive species profiles with ecological niche analysis, substrate compatibility,
          and environmental parameter ranges. Select a species to explore.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {AVAILABLE_SPECIES.map((species) => (
            <button
              key={species.id}
              onClick={() => handleSpeciesSelect(species.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedSpecies === species.id
                  ? `border-${species.color}-500 bg-${species.color}-50 dark:bg-${species.color}-900/30`
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <div className="text-3xl mb-1">{species.icon}</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {species.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {insight && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {insight.species}
            </h3>
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200">
              {insight.difficultyLevel}
            </span>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
              <span>🌍</span> Ecological Niche
            </h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {insight.ecologicalNiche}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span>🌾</span> Substrate Compatibility
            </h4>
            <div className="flex flex-wrap gap-2">
              {insight.substrateCompatibility.map((substrate, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 rounded-full text-sm"
                >
                  {substrate}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span>📊</span> Environmental Parameters
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">🌡️ Temperature</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {insight.environmentalRanges.temperature}
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">💧 Humidity</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {insight.environmentalRanges.humidity}
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">💨 CO₂ Tolerance</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {insight.environmentalRanges.co2}
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">🌬️ Fresh Air Exchange</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {insight.environmentalRanges.fae}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span>📚</span> Related Resources ({insight.relatedPages.length})
            </h4>
            <div className="space-y-2">
              {insight.relatedPages.slice(0, 5).map((page, idx) => (
                <a
                  key={idx}
                  href={page.path}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 border border-transparent transition-all group"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400">
                      {page.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{page.category}</div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>💡 Quick Tip:</strong> Environmental parameters can vary by strain and growing conditions.
              Use these ranges as starting points and adjust based on your specific setup and observations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
