/**
 * Troubleshooting Advisor Page
 * Interactive coach mode for symptom-based troubleshooting
 */

'use client';

import React, { useState, useEffect } from 'react';
import { CoachRecommendationList } from '../components/CoachRecommendationList';
import { CoachActionButtons } from '../components/CoachActionButtons';
import { getTroubleshootingSteps, analyzeUserContext } from '../utils/coachEngine';
import { initializeMemory, recordIssueResolution } from '../utils/coachMemory';
import type { CoachRecommendation, CoachMemory } from '../utils/coachTypes';

export default function TroubleshootingAdvisorPage() {
  const [memory, setMemory] = useState<CoachMemory | null>(null);
  const [recommendations, setRecommendations] = useState<CoachRecommendation[]>([]);
  const [selectedSymptom, setSelectedSymptom] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [showSolutions, setShowSolutions] = useState(false);

  useEffect(() => {
    const mem = initializeMemory();
    setMemory(mem);

    if (selectedSymptom) {
      const recs = getTroubleshootingSteps(selectedSymptom);
      setRecommendations(recs);
      setShowSolutions(true);
    }
  }, [selectedSymptom]);

  const handleSymptomSelect = (symptom: string) => {
    setSelectedSymptom(symptom);
    setSearchInput(symptom);
    const recs = getTroubleshootingSteps(symptom);
    setRecommendations(recs);
    setShowSolutions(true);
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      handleSymptomSelect(searchInput.trim());
    }
  };

  const handleTakeAction = (action: any) => {
    if (action.actionType === 'navigate' && action.target) {
      window.location.href = action.target;
    } else if (action.actionType === 'monitor') {
      // Log monitoring action
      console.log('Monitoring:', action);
    }
  };

  const commonIssues = [
    { symptom: 'no-pins', label: '📍 No Pins Forming', icon: '❌' },
    { symptom: 'green-mold', label: '🟢 Green Mold', icon: '🦠' },
    { symptom: 'fuzzy-feet', label: '🦶 Fuzzy Feet', icon: '🌱' },
    { symptom: 'slow-colonization', label: '🐢 Slow Colonization', icon: '⏳' },
    { symptom: 'side-pinning', label: '↔️ Side Pinning', icon: '🔄' },
    { symptom: 'stalled-fruiting', label: '⏸️ Stalled Fruiting', icon: '🛑' },
  ];

  if (!memory) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">🔧 Troubleshooting Advisor</h1>
          <p className="text-red-100">Diagnose and solve cultivation problems</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Symptom Input */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            🔍 Describe Your Problem
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              What symptom are you experiencing?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSearch()}
                placeholder="e.g., 'no pins', 'mold', 'fuzzy feet'..."
                className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-white"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Common Issues */}
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Common issues:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {commonIssues.map(issue => (
                <button
                  key={issue.symptom}
                  onClick={() => handleSymptomSelect(issue.symptom)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors text-left ${
                    selectedSymptom === issue.symptom
                      ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100'
                      : 'border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-700 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                  }`}
                >
                  {issue.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Solutions */}
        {showSolutions && recommendations.length > 0 && (
          <div className="space-y-6">
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
              <h3 className="font-bold text-red-900 dark:text-red-100 mb-2">
                🔍 Analysis of "{selectedSymptom.replace(/-/g, ' ')}"
              </h3>
              <p className="text-sm text-red-800 dark:text-red-200">
                I've identified {recommendations.length} possible causes. The most likely are shown below, ranked by probability.
              </p>
            </div>

            <CoachRecommendationList
              recommendations={recommendations}
              emptyMessage="No specific guidance found. Try describing the symptom differently."
              onTakeAction={handleTakeAction}
            />

            {/* Resolution Confirmation */}
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-green-800 dark:text-green-200 mb-4">
                Did these suggestions help solve your problem?
              </p>
              <button
                onClick={() => {
                  recordIssueResolution();
                  setShowSolutions(false);
                  setSelectedSymptom('');
                  setSearchInput('');
                  setRecommendations([]);
                }}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors"
              >
                ✓ Problem Solved!
              </button>
            </div>
          </div>
        )}

        {/* Prevention Guide */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-lg border border-blue-200 dark:border-blue-800">
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">
            🛡️ Prevention Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                ✓ Sterilization & Sanitation
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Pressure cook all substrates at 15 PSI for 90+ minutes</li>
                <li>• Use clean tools and containers</li>
                <li>• Practice proper hand hygiene</li>
                <li>• Maintain a clean workspace</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                ✓ Environmental Control
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Monitor temperature with a thermometer</li>
                <li>• Track humidity with a hygrometer</li>
                <li>• Maintain consistent FAE schedule</li>
                <li>• Keep detailed cultivation logs</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                ✓ Monitoring & Detection
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Check bags daily for contamination</li>
                <li>• Observe mycelium progression</li>
                <li>• Act quickly on early warning signs</li>
                <li>• Isolate suspected contaminated batches</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                ✓ Cultivation Practices
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Use high-quality spawn</li>
                <li>• Follow species-specific protocols</li>
                <li>• Don't rush colonization</li>
                <li>• Avoid contaminated water sources</li>
              </ul>
            </div>
          </div>
        </div>

        {/* When to Cull */}
        <div className="bg-amber-50 dark:bg-amber-900/20 p-8 rounded-lg border border-amber-200 dark:border-amber-800">
          <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-4">
            ⚠️ When to Accept a Loss
          </h2>
          <p className="text-amber-800 dark:text-amber-200 mb-4">
            Sometimes the best decision is to cull a contaminated batch. This prevents spread and saves time/resources:
          </p>
          <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
            <li>
              <span className="font-semibold">Extensive green/blue mold</span> - Usually unrecoverable, high risk of spread
            </li>
            <li>
              <span className="font-semibold">Bacterial contamination</span> - No effective treatment, will waste resources
            </li>
            <li>
              <span className="font-semibold">Mold across multiple bags</span> - Indicates environmental or protocol problems
            </li>
            <li>
              <span className="font-semibold">No growth after 4+ weeks</span> - May be contaminated but not visibly obvious
            </li>
          </ul>
        </div>

        {/* Other Coaches */}
        <CoachActionButtons mode="troubleshooting-advisor" />
      </div>
    </div>
  );
}
