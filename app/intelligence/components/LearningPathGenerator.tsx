'use client';

import { useState } from 'react';
import { getLearningPathForUserLevel, type LearningPath } from '../utils';

export default function LearningPathGenerator() {
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [showPath, setShowPath] = useState(false);

  const handleGeneratePath = () => {
    const path = getLearningPathForUserLevel(selectedLevel);
    setLearningPath(path);
    setShowPath(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
        <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">
          🎓 Personalized Learning Path Generator
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Generate a customized learning sequence based on your experience level. The intelligence layer
          analyzes the knowledge graph to create an optimal progression through the content.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Your Experience Level
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedLevel === level
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="text-lg font-semibold capitalize">{level}</div>
                  <div className="text-xs mt-1">
                    {level === 'beginner' && 'New to mushroom cultivation'}
                    {level === 'intermediate' && '1-2 successful grows'}
                    {level === 'advanced' && 'Multiple species, optimization focus'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGeneratePath}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Generate Learning Path
          </button>
        </div>
      </div>

      {showPath && learningPath && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 capitalize">
              {learningPath.level} Learning Path
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ⏱️ {learningPath.estimatedDuration}
            </span>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Learning Objectives:</h4>
            <ul className="space-y-2">
              {learningPath.objectives.map((objective, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Recommended Sequence ({learningPath.sequence.length} pages):
            </h4>
            <div className="space-y-2">
              {learningPath.sequence.map((page, idx) => (
                <a
                  key={idx}
                  href={page.path}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 border border-transparent transition-all group"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-semibold text-sm">
                    {idx + 1}
                  </div>
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

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>💡 Tip:</strong> This is a suggested sequence. Feel free to explore pages in any order,
              but this path is optimized for building foundational knowledge before advancing to complex topics.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
