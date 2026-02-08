'use client';

import { useState } from 'react';

interface FilterPanelProps {
  categories: string[];
  tags: string[];
  selectedCategories: Set<string>;
  selectedTags: Set<string>;
  searchTerm: string;
  onCategoryToggle: (category: string) => void;
  onTagToggle: (tag: string) => void;
  onSearchChange: (term: string) => void;
  onClearAll: () => void;
}

export default function FilterPanel({
  categories,
  tags,
  selectedCategories,
  selectedTags,
  searchTerm,
  onCategoryToggle,
  onTagToggle,
  onSearchChange,
  onClearAll
}: FilterPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('search');

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Categories */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setExpandedSection(expandedSection === 'categories' ? null : 'categories')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <span className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>📁</span> Categories
            <span className="text-xs text-gray-500">({selectedCategories.size})</span>
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${expandedSection === 'categories' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
        {expandedSection === 'categories' && (
          <div className="px-4 py-3 space-y-2 max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.has(category)}
                  onChange={() => onCategoryToggle(category)}
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setExpandedSection(expandedSection === 'tags' ? null : 'tags')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <span className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>🏷️</span> Tags
            <span className="text-xs text-gray-500">({selectedTags.size})</span>
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${expandedSection === 'tags' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
        {expandedSection === 'tags' && (
          <div className="px-4 py-3 space-y-2 max-h-48 overflow-y-auto">
            {tags.slice(0, 20).map((tag) => (
              <label
                key={tag}
                className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedTags.has(tag)}
                  onChange={() => onTagToggle(tag)}
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{tag}</span>
              </label>
            ))}
            {tags.length > 20 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                ... and {tags.length - 20} more tags
              </p>
            )}
          </div>
        )}
      </div>

      {/* Clear All */}
      {(selectedCategories.size > 0 || selectedTags.size > 0 || searchTerm) && (
        <button
          onClick={onClearAll}
          className="w-full px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
