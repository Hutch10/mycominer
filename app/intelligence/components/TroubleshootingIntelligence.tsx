'use client';

import { useState } from 'react';
import { getTroubleshootingInsight, type TroubleshootingInsight } from '../utils';

const COMMON_SYMPTOMS = [
  { id: 'slow-colonization', label: 'Slow Colonization', icon: '🐌' },
  { id: 'no-pins', label: 'No Pinning', icon: '❌' },
  { id: 'fuzzy-feet', label: 'Fuzzy Feet', icon: '🦶' },
  { id: 'overlay', label: 'Overlay/Stroma', icon: '🛡️' },
  { id: 'drying-caps', label: 'Drying Caps', icon: '🏜️' },
  { id: 'aborts', label: 'Aborted Pins', icon: '⚠️' },
  { id: 'green-mold', label: 'Green Mold', icon: '🦠' },
  { id: 'side-pinning', label: 'Side Pinning', icon: '↔️' }
];

export default function TroubleshootingIntelligence() {
  const [selectedSymptom, setSelectedSymptom] = useState<string>('');
  const [insight, setInsight] = useState<TroubleshootingInsight | null>(null);

  const handleSymptomSelect = (symptomId: string) => {
    setSelectedSymptom(symptomId);
    const result = getTroubleshootingInsight(symptomId);
    setInsight(result);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
        <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">
          🔍 Troubleshooting Intelligence Layer
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Advanced symptom analysis with environmental, substrate, and species correlation.
          Select a symptom to see intelligent diagnostics and recommendations.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {COMMON_SYMPTOMS.map((symptom) => (
            <button
              key={symptom.id}
              onClick={() => handleSymptomSelect(symptom.id)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                selectedSymptom === symptom.id
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/30'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <div className="text-2xl mb-1">{symptom.icon}</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {symptom.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {insight && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {insight.symptom}
            </h3>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <span>🎯</span> Possible Causes
            </h4>
            <ul className="space-y-2">
              {insight.possibleCauses.map((cause, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {insight.relatedEnvironmental.length > 0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h5 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 text-sm">
                  🌡️ Environmental Factors
                </h5>
                <div className="flex flex-wrap gap-1">
                  {insight.relatedEnvironmental.map((factor, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {insight.relatedSubstrate.length > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h5 className="font-semibold text-green-900 dark:text-green-200 mb-2 text-sm">
                  🌾 Substrate Factors
                </h5>
                <div className="flex flex-wrap gap-1">
                  {insight.relatedSubstrate.map((factor, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 rounded"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {insight.relatedSpecies.length > 0 && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h5 className="font-semibold text-purple-900 dark:text-purple-200 mb-2 text-sm">
                  🍄 Commonly Affected Species
                </h5>
                <div className="flex flex-wrap gap-1">
                  {insight.relatedSpecies.map((species, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 rounded"
                    >
                      {species}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span>📚</span> Recommended Reading
            </h4>
            <div className="space-y-2">
              {insight.recommendedPages.slice(0, 5).map((page, idx) => (
                <a
                  key={idx}
                  href={page.path}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 border border-transparent transition-all group"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {page.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{page.category}</div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>💡 Pro Tip:</strong> Most cultivation issues involve multiple interacting factors.
              Use the correlation analysis above to identify which environmental or substrate variables
              to adjust first.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
