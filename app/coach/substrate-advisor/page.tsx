/**
 * Substrate Advisor Page
 * Interactive coach mode for selecting substrates
 */

'use client';

import React, { useState, useEffect } from 'react';
import { CoachRecommendationList } from '../components/CoachRecommendationList';
import { CoachActionButtons } from '../components/CoachActionButtons';
import { getRecommendedSubstrate } from '../utils/coachEngine';
import { initializeMemory, addFavorite } from '../utils/coachMemory';
import type { CoachRecommendation, CoachMemory } from '../utils/coachTypes';

export default function SubstrateAdvisorPage() {
  const [memory, setMemory] = useState<CoachMemory | null>(null);
  const [recommendations, setRecommendations] = useState<CoachRecommendation[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string>('');
  const [selectedSubstrate, setSelectedSubstrate] = useState<string | null>(null);

  useEffect(() => {
    const mem = initializeMemory();
    setMemory(mem);

    if (selectedSpecies) {
      const recs = getRecommendedSubstrate(selectedSpecies, mem.userProfile);
      setRecommendations(recs);
    }
  }, [selectedSpecies]);

  const handleSpeciesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const species = e.target.value;
    setSelectedSpecies(species);
    setSelectedSubstrate(null);
  };

  const handleSelectSubstrate = (rec: CoachRecommendation) => {
    setSelectedSubstrate(rec.title);
    if (memory) {
      addFavorite(rec.id);
    }
  };

  const handleTakeAction = (action: any) => {
    if (action.actionType === 'navigate' && action.target) {
      window.location.href = action.target;
    }
  };

  if (!memory) return <div className="p-8 text-center">Loading...</div>;

  const commonSpecies = [
    'oyster',
    'shiitake',
    'lions-mane',
    'reishi',
    'king-oyster',
    'turkey-tail',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">🌾 Substrate Advisor</h1>
          <p className="text-amber-100">Find the best substrate for your species and setup</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Species Selection */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            🍄 Select Your Species
          </h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Which species are you growing?
            </label>
            <select
              value={selectedSpecies}
              onChange={handleSpeciesChange}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white text-lg"
            >
              <option value="">-- Select a species --</option>
              {commonSpecies.map(species => (
                <option key={species} value={species}>
                  {species.replace(/-/g, ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            Different species thrive on different substrates. We'll recommend the best options for your
            equipment level and experience.
          </p>
        </div>

        {/* Substrate Recommendations */}
        {selectedSpecies && recommendations.length > 0 && (
          <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800">
              <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-2">
                📊 Substrates for {selectedSpecies.replace(/-/g, ' ').toUpperCase()}
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Based on your {memory.userProfile.equipment} equipment and {memory.userProfile.skillLevel} skill level
              </p>
            </div>

            <CoachRecommendationList
              recommendations={recommendations}
              onSelectRecommendation={handleSelectSubstrate}
              onTakeAction={handleTakeAction}
            />
          </div>
        )}

        {/* Info if no species selected */}
        {!selectedSpecies && (
          <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              👆 Select a species above to see substrate recommendations
            </p>
          </div>
        )}

        {/* Substrate Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="font-bold text-green-900 dark:text-green-100 mb-2">
              💡 About Substrates
            </h3>
            <p className="text-sm text-green-800 dark:text-green-200">
              The substrate is the nutritional base for mushroom mycelium. Different species prefer different
              substrates based on their ecological niches.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
              🔍 Substrate Selection Factors
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>✓ Species preference</li>
              <li>✓ Cost and availability</li>
              <li>✓ Preparation difficulty</li>
              <li>✓ Yield potential</li>
              <li>✓ Storage requirements</li>
            </ul>
          </div>
        </div>

        {/* Next Steps */}
        {selectedSpecies && selectedSubstrate && (
          <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-lg border border-green-200 dark:border-green-800">
            <h2 className="text-xl font-bold text-green-900 dark:text-green-100 mb-4">
              ✓ Next Steps
            </h2>
            <p className="text-green-800 dark:text-green-200 mb-4">
              Great! You've selected <span className="font-semibold">{selectedSpecies.replace(/-/g, ' ')}</span> on{' '}
              <span className="font-semibold">{selectedSubstrate}</span>
            </p>
            <div className="flex gap-3 flex-wrap">
              <a
                href={`/coach/environment-advisor?species=${selectedSpecies}&substrate=${selectedSubstrate.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors"
              >
                Set Up Environment →
              </a>
              <a
                href={`/coach/grow-planner?species=${selectedSpecies}&substrate=${selectedSubstrate.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-6 py-3 border border-green-500 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 font-medium transition-colors"
              >
                Create Grow Plan →
              </a>
            </div>
          </div>
        )}

        {/* Other Coaches */}
        <CoachActionButtons
          mode="substrate-advisor"
          preSelectedSpecies={selectedSpecies || undefined}
        />
      </div>
    </div>
  );
}
