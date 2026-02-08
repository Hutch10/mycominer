/**
 * Species Advisor Page
 * Interactive coach mode for selecting species based on preferences
 */

'use client';

import React, { useState, useEffect } from 'react';
import { CoachRecommendationList } from '../components/CoachRecommendationList';
import { CoachActionButtons } from '../components/CoachActionButtons';
import {
  getRecommendedSpecies,
  analyzeUserContext,
} from '../utils/coachEngine';
import {
  initializeMemory,
  updateUserProfile,
  addFavorite,
  savePlan,
} from '../utils/coachMemory';
import type { CoachRecommendation, UserProfile, CoachMemory } from '../utils/coachTypes';

export default function SpeciesAdvisorPage() {
  const [memory, setMemory] = useState<CoachMemory | null>(null);
  const [recommendations, setRecommendations] = useState<CoachRecommendation[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);

  // Profile form state
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [climate, setClimate] = useState<'tropical' | 'temperate' | 'arid' | 'cold'>('temperate');
  const [equipment, setEquipment] = useState<'minimal' | 'basic' | 'moderate' | 'professional'>('basic');
  const [space, setSpace] = useState<'apartment' | 'house' | 'greenhouse' | 'farm'>('apartment');
  const [goals, setGoals] = useState<string[]>(['hobby']);

  useEffect(() => {
    const mem = initializeMemory();
    setMemory(mem);
    setSkillLevel(mem.userProfile.skillLevel);
    setClimate(mem.userProfile.climate);
    setEquipment(mem.userProfile.equipment);
    setSpace(mem.userProfile.space);
    setGoals(mem.userProfile.goals.map(g => g.type));

    generateRecommendations(mem.userProfile);
  }, []);

  const generateRecommendations = (profile: UserProfile) => {
    const recs = getRecommendedSpecies(profile);
    setRecommendations(recs);
  };

  const handleUpdateProfile = () => {
    if (!memory) return;

    const updatedProfile: UserProfile = {
      ...memory.userProfile,
      skillLevel,
      climate,
      equipment,
      space,
      goals: goals.map(g => ({ type: g as any })),
    };

    updateUserProfile(updatedProfile);
    setMemory({ ...memory, userProfile: updatedProfile });
    generateRecommendations(updatedProfile);
  };

  const handleSelectSpecies = (rec: CoachRecommendation) => {
    setSelectedSpecies(rec.title);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">🍄 Species Advisor</h1>
          <p className="text-green-100">Find the perfect mushroom species for your situation</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Profile Form */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            🎯 Your Growing Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skill Level */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Skill Level
              </label>
              <select
                value={skillLevel}
                onChange={e => setSkillLevel(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="beginner">🌱 Beginner</option>
                <option value="intermediate">🌿 Intermediate</option>
                <option value="advanced">🏆 Advanced</option>
              </select>
            </div>

            {/* Climate */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Climate
              </label>
              <select
                value={climate}
                onChange={e => setClimate(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="tropical">🌴 Tropical</option>
                <option value="temperate">🌤️ Temperate</option>
                <option value="arid">🏜️ Arid</option>
                <option value="cold">❄️ Cold</option>
              </select>
            </div>

            {/* Equipment */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Equipment Level
              </label>
              <select
                value={equipment}
                onChange={e => setEquipment(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="minimal">💼 Minimal</option>
                <option value="basic">🔧 Basic</option>
                <option value="moderate">⚙️ Moderate</option>
                <option value="professional">🏭 Professional</option>
              </select>
            </div>

            {/* Space */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Growing Space
              </label>
              <select
                value={space}
                onChange={e => setSpace(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="apartment">🏢 Apartment</option>
                <option value="house">🏠 House</option>
                <option value="greenhouse">🌿 Greenhouse</option>
                <option value="farm">🚜 Farm</option>
              </select>
            </div>
          </div>

          {/* Goals */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Goals
            </label>
            <div className="flex flex-wrap gap-2">
              {['food', 'medicine', 'hobby', 'income', 'learning'].map(goal => (
                <button
                  key={goal}
                  onClick={() => {
                    setGoals(prev =>
                      prev.includes(goal)
                        ? prev.filter(g => g !== goal)
                        : [...prev, goal]
                    );
                  }}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                    goals.includes(goal)
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {goal === 'food'
                    ? '🍽️'
                    : goal === 'medicine'
                      ? '💊'
                      : goal === 'hobby'
                        ? '🎯'
                        : goal === 'income'
                          ? '💰'
                          : '📚'}{' '}
                  {goal.charAt(0).toUpperCase() + goal.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleUpdateProfile}
            className="mt-6 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors"
          >
            Get Personalized Recommendations
          </button>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              🎯 Species Recommendations
            </h2>
            <CoachRecommendationList
              recommendations={recommendations}
              onSelectRecommendation={handleSelectSpecies}
              onTakeAction={handleTakeAction}
            />
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-lg border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
            📋 Next Steps
          </h2>
          <div className="space-y-3">
            {selectedSpecies && (
              <>
                <p className="text-blue-800 dark:text-blue-200">
                  ✓ You've selected: <span className="font-semibold">{selectedSpecies}</span>
                </p>
                <div className="flex gap-3">
                  <a
                    href={`/coach/substrate-advisor?species=${selectedSpecies.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-center transition-colors"
                  >
                    Choose Substrate →
                  </a>
                  <a
                    href={`/coach/grow-planner?species=${selectedSpecies.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex-1 px-4 py-2 border border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium text-center transition-colors"
                  >
                    Create Plan →
                  </a>
                </div>
              </>
            )}
            {!selectedSpecies && (
              <p className="text-blue-800 dark:text-blue-200">
                👆 Select a species above to unlock next steps and create your grow plan.
              </p>
            )}
          </div>
        </div>

        {/* Other Coaches */}
        <CoachActionButtons mode="species-advisor" />
      </div>
    </div>
  );
}
