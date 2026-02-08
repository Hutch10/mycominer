/**
 * TagSelector Component
 * Select and manage semantic tags for grow logs, notes, insights
 */

'use client';

import React, { useState } from 'react';

interface TagSelectorProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
  allowCustom?: boolean;
}

export function TagSelector({
  availableTags,
  selectedTags,
  onTagsChange,
  maxTags = 10,
  allowCustom = true,
}: TagSelectorProps) {
  const [customTag, setCustomTag] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim().replace(/\s+/g, '-');
    if (normalizedTag && !selectedTags.includes(normalizedTag) && selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, normalizedTag]);
      setCustomTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    onTagsChange(selectedTags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(customTag);
    } else if (e.key === 'Backspace' && !customTag && selectedTags.length > 0) {
      handleRemoveTag(selectedTags[selectedTags.length - 1]);
    }
  };

  const filteredSuggestions = availableTags.filter(
    tag => !selectedTags.includes(tag) && tag.toLowerCase().includes(customTag.toLowerCase())
  );

  return (
    <div className="space-y-2">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-slate-700/30 rounded">
          {selectedTags.map(tag => (
            <div
              key={tag}
              className="bg-blue-900 text-blue-100 px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              <span>#{tag}</span>
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-400 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <div className="flex gap-2">
          {allowCustom && (
            <>
              <input
                type="text"
                value={customTag}
                onChange={e => {
                  setCustomTag(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Add tag... (press Enter)"
                className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => handleAddTag(customTag)}
                disabled={!customTag || selectedTags.length >= maxTags}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-blue-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </>
          )}
        </div>

        {/* Suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded shadow-lg z-10">
            {filteredSuggestions.slice(0, 5).map(tag => (
              <button
                key={tag}
                onClick={() => {
                  handleAddTag(tag);
                  setShowSuggestions(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-600 text-slate-100 transition-colors first:rounded-t last:rounded-b"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Available Tags */}
      {availableTags.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 font-medium mb-2">Popular Tags</p>
          <div className="flex flex-wrap gap-1">
            {availableTags.slice(0, 8).map(tag => (
              <button
                key={tag}
                onClick={() => handleAddTag(tag)}
                disabled={selectedTags.includes(tag) || selectedTags.length >= maxTags}
                className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Counter */}
      <p className="text-xs text-slate-500">
        {selectedTags.length} / {maxTags} tags
      </p>
    </div>
  );
}
