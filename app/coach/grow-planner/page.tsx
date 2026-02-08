/**
 * Grow Planner Page
 * Interactive coach mode for creating detailed grow plans
 */

'use client';

import React, { useState, useEffect } from 'react';
import { CoachStepCard } from '../components/CoachStepCard';
import { CoachProgressIndicator } from '../components/CoachProgressIndicator';
import { CoachActionButtons } from '../components/CoachActionButtons';
import { generateGrowPlan } from '../utils/coachEngine';
import { initializeMemory, savePlan, getPlan } from '../utils/coachMemory';
import type { GrowPlan, CoachMemory, UserProfile } from '../utils/coachTypes';

export default function GrowPlannerPage() {
  const [memory, setMemory] = useState<CoachMemory | null>(null);
  const [plan, setPlan] = useState<GrowPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<GrowPlan[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string>('');
  const [selectedSubstrate, setSelectedSubstrate] = useState<string>('');
  const [planName, setPlanName] = useState<string>('');
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    const mem = initializeMemory();
    setMemory(mem);
    setSavedPlans(mem.savedPlans);
  }, []);

  const commonSpecies = [
    'oyster',
    'shiitake',
    'lions-mane',
    'reishi',
    'king-oyster',
    'turkey-tail',
  ];

  const commonSubstrates = [
    'straw',
    'hardwood-sawdust',
    'wood-chips',
    'coffee-grounds',
    'grain',
  ];

  const handleGeneratePlan = () => {
    if (!memory || !selectedSpecies) return;

    const userProfile: UserProfile = {
      ...memory.userProfile,
    };

    const newPlan = generateGrowPlan(
      selectedSpecies,
      selectedSubstrate || 'species-dependent',
      userProfile
    );

    if (planName) {
      newPlan.name = planName;
    }

    setPlan(newPlan);
    setShowForm(false);
  };

  const handleSavePlan = () => {
    if (!plan || !memory) return;

    plan.status = 'active';
    plan.lastUpdated = new Date().toISOString();

    savePlan(plan);
    setSavedPlans([...savedPlans.filter(p => p.id !== plan.id), plan]);
  };

  const handleTaskComplete = (taskId: string) => {
    if (!plan) return;

    const updatedPlan = {
      ...plan,
      stages: plan.stages.map(stage => ({
        ...stage,
        tasks: stage.tasks.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        ),
      })),
    };

    setPlan(updatedPlan);
  };

  const handleStageComplete = () => {
    setCurrentStageIndex(prev => Math.min(prev + 1, (plan?.stages.length || 1) - 1));
  };

  if (!memory) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">📋 Grow Planner</h1>
          <p className="text-purple-100">Create a detailed, personalized grow plan</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {showForm ? (
          /* Plan Creation Form */
          <div className="max-w-2xl space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                🎯 Create Your Grow Plan
              </h2>

              <div className="space-y-6">
                {/* Plan Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Plan Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={planName}
                    onChange={e => setPlanName(e.target.value)}
                    placeholder="e.g., 'My First Oyster Grow'"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                {/* Species */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Species *
                  </label>
                  <select
                    value={selectedSpecies}
                    onChange={e => setSelectedSpecies(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">-- Select Species --</option>
                    {commonSpecies.map(species => (
                      <option key={species} value={species}>
                        {species.replace(/-/g, ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Substrate */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Substrate (Optional)
                  </label>
                  <select
                    value={selectedSubstrate}
                    onChange={e => setSelectedSubstrate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">-- Select Substrate --</option>
                    {commonSubstrates.map(substrate => (
                      <option key={substrate} value={substrate}>
                        {substrate.replace(/-/g, ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 The plan will be customized based on your profile ({memory.userProfile.skillLevel} level, {memory.userProfile.climate} climate)
                  </p>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGeneratePlan}
                  disabled={!selectedSpecies}
                  className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-colors"
                >
                  Generate Grow Plan
                </button>
              </div>
            </div>

            {/* Previous Plans */}
            {savedPlans.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  📚 Your Previous Plans
                </h2>
                <div className="space-y-3">
                  {savedPlans.slice(0, 5).map(savedPlan => (
                    <button
                      key={savedPlan.id}
                      onClick={() => {
                        setPlan(savedPlan);
                        setSelectedSpecies(savedPlan.species);
                        setSelectedSubstrate(savedPlan.substrate);
                        setPlanName(savedPlan.name);
                        setShowForm(false);
                      }}
                      className="w-full text-left p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {savedPlan.name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Created {new Date(savedPlan.createdAt).toLocaleDateString()} •{' '}
                        <span className="capitalize">{savedPlan.status}</span>
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : plan ? (
          /* Plan Display */
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {plan.name}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  Started {new Date(plan.startDate).toLocaleDateString()} • Est. complete{' '}
                  {new Date(plan.estimatedCompletionDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSavePlan}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors"
                >
                  💾 Save Plan
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors"
                >
                  ← New Plan
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stages */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  🗂️ Growing Stages
                </h3>
                <div className="space-y-3">
                  {plan.stages.map((stage, idx) => (
                    <CoachStepCard
                      key={idx}
                      stage={stage}
                      stageIndex={idx}
                      isActive={idx === currentStageIndex}
                      isCompleted={stage.tasks.every(t => t.completed)}
                      onTaskComplete={handleTaskComplete}
                      onStageComplete={handleStageComplete}
                    />
                  ))}
                </div>
              </div>

              {/* Progress Sidebar */}
              <div className="lg:col-span-1">
                <CoachProgressIndicator
                  plan={plan}
                  currentStage={currentStageIndex}
                  goalsAchieved={Math.floor(
                    (plan.stages.filter(s => s.tasks.every(t => t.completed)).length /
                      plan.stages.length) *
                      5
                  )}
                  totalGoals={5}
                  sessionsCompleted={memory?.statistics.sessionsCount || 0}
                />
              </div>
            </div>

            {/* Timeline Overview */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                📅 Timeline Overview
              </h3>

              <div className="space-y-3">
                {plan.stages.map((stage, idx) => {
                  const startDay = plan.stages
                    .slice(0, idx)
                    .reduce((sum, s) => sum + s.duration, 0);
                  const endDay = startDay + stage.duration;

                  return (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-32">
                        <p className="font-medium text-slate-900 dark:text-white capitalize">
                          {stage.stage.replace(/-/g, ' ')}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Days {startDay}-{endDay}
                        </p>
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 transition-all"
                            style={{
                              width: `${((endDay - startDay) / (plan.stages.reduce((s, st) => s + st.duration, 0))) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="w-12 text-right">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {stage.duration}d
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-semibold">Total Duration:</span>{' '}
                  {plan.stages.reduce((sum, s) => sum + s.duration, 0)} days
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                📝 Plan Notes
              </h3>
              <p className="text-slate-700 dark:text-slate-300">{plan.notes}</p>
            </div>

            {/* Action Buttons */}
            <CoachActionButtons />
          </div>
        ) : null}
      </div>
    </div>
  );
}
