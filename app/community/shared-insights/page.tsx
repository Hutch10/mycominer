/**
 * Shared Insights Page
 * Create, browse, filter, and manage community insights
 */

'use client';

import React, { useState, useEffect } from 'react';
import { InsightCard } from '../components/InsightCard';
import { TagSelector } from '../components/TagSelector';
import {
  getInsights,
  getUnreviewedSuggestions,
  createInsight,
  updateInsight,
  deleteInsight,
  getInsightsByType,
  getInsightTags,
  validateInsight,
  acceptInsightSuggestion,
  rejectInsightSuggestion,
  shareInsight,
  makeInsightPrivate,
} from '../utils/insightSystem';
import type { Insight } from '../utils/communityTypes';

const INSIGHT_TYPES = ['tip', 'observation', 'troubleshooting-pattern', 'species-behavior'] as const;
const CONFIDENCE_LEVELS = ['low', 'medium', 'high'] as const;

export default function SharedInsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [filteredInsights, setFilteredInsights] = useState<Insight[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    type: 'observation' as typeof INSIGHT_TYPES[number],
    title: '',
    description: '',
    relatedSpecies: [] as string[],
    relatedSubstrates: [] as string[],
    relatedIssues: [] as string[],
    tags: [] as string[],
    confidence: 'medium' as typeof CONFIDENCE_LEVELS[number],
  });

  // Filter state
  const [filters, setFilters] = useState({
    type: '',
    confidence: '',
    species: '',
    issue: '',
    tags: [] as string[],
  });

  const MUSHROOM_SPECIES = [
    'oyster', 'shiitake', 'lions-mane', 'reishi', 'cordyceps',
    'turkey-tail', 'chestnut', 'enoki', 'king-oyster', 'pioppino'
  ];

  const COMMON_ISSUES = [
    'contamination', 'slow-colonization', 'no-pins', 'stalled-fruiting',
    'fuzzy-feet', 'side-pinning', 'aborts', 'overlay', 'green-mold',
    'bacterial-contamination', 'drying-caps', 'yellowing-mycelium', 'odd-fruit-shapes'
  ];

  useEffect(() => {
    const allInsights = getInsights();
    setInsights(allInsights);
    setFilteredInsights(allInsights);
    setSuggestions(getUnreviewedSuggestions());
    setAllTags(getInsightTags());
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    let filtered = insights;
    if (newFilters.type) {
      filtered = filtered.filter(i => i.type === newFilters.type);
    }
    if (newFilters.confidence) {
      filtered = filtered.filter(i => i.confidence === newFilters.confidence);
    }
    if (newFilters.species) {
      filtered = filtered.filter(i => i.relatedSpecies?.includes(newFilters.species));
    }
    if (newFilters.issue) {
      filtered = filtered.filter(i => i.relatedIssues?.includes(newFilters.issue));
    }
    if (newFilters.tags.length > 0) {
      filtered = filtered.filter(i =>
        newFilters.tags.some(t => i.tags.includes(t))
      );
    }

    setFilteredInsights(filtered);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const insight: Insight = {
      id: editingId || crypto.randomUUID(),
      type: formData.type,
      title: formData.title,
      description: formData.description,
      relatedSpecies: formData.relatedSpecies,
      relatedSubstrates: formData.relatedSubstrates,
      relatedIssues: formData.relatedIssues,
      tags: formData.tags,
      confidence: formData.confidence,
      isPrivate: true,
      basedOnLogs: [],
      createdAt: editingId ? new Date(insights.find(i => i.id === editingId)?.createdAt || Date.now()).toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const validation = validateInsight(insight);
    if (!validation.valid) {
      alert(`Validation errors:\n${validation.errors.join('\n')}`);
      return;
    }

    if (editingId) {
      updateInsight(editingId, insight);
    } else {
      createInsight(insight);
    }

    setInsights(getInsights());
    setFilteredInsights(getInsights());
    setAllTags(getInsightTags());
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'observation',
      title: '',
      description: '',
      relatedSpecies: [],
      relatedSubstrates: [],
      relatedIssues: [],
      tags: [],
      confidence: 'medium',
    });
  };

  const handleDeleteInsight = (insightId: string) => {
    if (confirm('Delete this insight?')) {
      deleteInsight(insightId);
      const updated = getInsights();
      setInsights(updated);
      setFilteredInsights(updated);
    }
  };

  const handleShareInsight = (insightId: string) => {
    const insight = insights.find(i => i.id === insightId);
    if (insight?.isPrivate) {
      shareInsight(insightId);
    } else {
      makeInsightPrivate(insightId);
    }
    const updated = getInsights();
    setInsights(updated);
    setFilteredInsights(updated);
  };

  const handleAcceptSuggestion = (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    acceptInsightSuggestion(suggestionId, {
      type: suggestion?.type || 'observation',
      title: suggestion?.title || 'New insight',
      description: suggestion?.description || 'Accepted suggestion',
      relatedSpecies: suggestion?.relatedSpecies || [],
      relatedSubstrates: suggestion?.relatedSubstrates || [],
      relatedIssues: suggestion?.relatedIssues || [],
      tags: suggestion?.suggestedTags || [],
      confidence: 'medium',
      isPrivate: true,
      basedOnLogs: [],
      linkedPages: [],
    });
    setSuggestions(getUnreviewedSuggestions());
    setInsights(getInsights());
  };

  const handleRejectSuggestion = (suggestionId: string) => {
    rejectInsightSuggestion(suggestionId);
    setSuggestions(getUnreviewedSuggestions());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-900 to-amber-900 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">💡 Shared Insights</h1>
          <p className="text-yellow-200 text-lg">
            Contribute observations, tips, and patterns to help the community
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Actions */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-yellow-900 hover:bg-yellow-800 text-white rounded-lg font-medium transition-colors"
          >
            {showForm ? '✕ Cancel' : '+ New Insight'}
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">{editingId ? 'Edit' : 'New'} Insight</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    required
                  >
                    <option value="tip">💡 Tip</option>
                    <option value="observation">👁️ Observation</option>
                    <option value="troubleshooting-pattern">🔍 Troubleshooting Pattern</option>
                    <option value="species-behavior">🍄 Species Behavior</option>
                  </select>
                </div>

                {/* Confidence Level */}
                <div>
                  <label className="block text-sm font-medium mb-1">Confidence Level</label>
                  <select
                    value={formData.confidence}
                    onChange={(e) => setFormData({ ...formData, confidence: e.target.value as any })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  placeholder="Brief title for this insight..."
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  placeholder="Detailed description of your insight..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Related Species */}
                <div>
                  <label className="block text-sm font-medium mb-2">Related Species</label>
                  <div className="space-y-2">
                    {formData.relatedSpecies.map(s => (
                      <div key={s} className="flex items-center justify-between bg-slate-700 px-2 py-1 rounded">
                        <span className="text-sm capitalize">{s}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            relatedSpecies: formData.relatedSpecies.filter(x => x !== s)
                          })}
                          className="text-red-400 hover:text-red-300 text-lg"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <select
                      onChange={(e) => {
                        if (e.target.value && !formData.relatedSpecies.includes(e.target.value)) {
                          setFormData({
                            ...formData,
                            relatedSpecies: [...formData.relatedSpecies, e.target.value]
                          });
                        }
                        e.target.value = '';
                      }}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    >
                      <option value="">Add species...</option>
                      {MUSHROOM_SPECIES.map(s => (
                        !formData.relatedSpecies.includes(s) && (
                          <option key={s} value={s}>{s}</option>
                        )
                      ))}
                    </select>
                  </div>
                </div>

                {/* Related Issues */}
                <div>
                  <label className="block text-sm font-medium mb-2">Related Issues</label>
                  <div className="space-y-2">
                    {formData.relatedIssues.map(issue => (
                      <div key={issue} className="flex items-center justify-between bg-slate-700 px-2 py-1 rounded">
                        <span className="text-sm capitalize">{issue.replace('-', ' ')}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            relatedIssues: formData.relatedIssues.filter(x => x !== issue)
                          })}
                          className="text-red-400 hover:text-red-300 text-lg"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <select
                      onChange={(e) => {
                        if (e.target.value && !formData.relatedIssues.includes(e.target.value)) {
                          setFormData({
                            ...formData,
                            relatedIssues: [...formData.relatedIssues, e.target.value]
                          });
                        }
                        e.target.value = '';
                      }}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    >
                      <option value="">Add issue...</option>
                      {COMMON_ISSUES.map(issue => (
                        !formData.relatedIssues.includes(issue) && (
                          <option key={issue} value={issue}>{issue.replace('-', ' ')}</option>
                        )
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <TagSelector
                  availableTags={allTags.length > 0 ? allTags : ['validated', 'personal-experience', 'research-based']}
                  selectedTags={formData.tags}
                  onTagsChange={(tags) => setFormData({ ...formData, tags })}
                  maxTags={10}
                  allowCustom={true}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-yellow-900 hover:bg-yellow-800 text-white rounded-lg font-medium transition-colors"
                >
                  {editingId ? 'Update' : 'Create'} Insight
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Suggestions Section */}
        {suggestions.length > 0 && (
          <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              🔔 Suggested Insights ({suggestions.length})
            </h3>
            <div className="space-y-3">
              {suggestions.slice(0, 3).map(suggestion => (
                <div
                  key={suggestion.id}
                  className="bg-slate-800 border border-slate-700 rounded p-3 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <p className="font-medium capitalize">{suggestion.type}</p>
                    <p className="text-xs text-slate-400">from {suggestion.source}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleAcceptSuggestion(suggestion.id)}
                      className="px-3 py-1 bg-green-900 hover:bg-green-800 text-green-100 rounded text-xs font-medium transition-colors"
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => handleRejectSuggestion(suggestion.id)}
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs font-medium transition-colors"
                    >
                      ✕ Skip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Filter Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
              >
                <option value="">All types</option>
                {INSIGHT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Confidence</label>
              <select
                value={filters.confidence}
                onChange={(e) => handleFilterChange('confidence', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
              >
                <option value="">All levels</option>
                {CONFIDENCE_LEVELS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <button
                onClick={() => {
                  setFilters({
                    type: '',
                    confidence: '',
                    species: '',
                    issue: '',
                    tags: [],
                  });
                  setFilteredInsights(insights);
                }}
                className="w-full px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Insights Display */}
        <div className="grid grid-cols-1 gap-4">
          {filteredInsights.length > 0 ? (
            filteredInsights.map(insight => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onDelete={handleDeleteInsight}
                onShare={handleShareInsight}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">
                {insights.length === 0 ? 'No insights yet. Create your first insight!' : 'No insights match your filters'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
