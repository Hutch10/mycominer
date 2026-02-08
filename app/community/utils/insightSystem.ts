/**
 * Insight System (Client-Side)
 * Contribute tips, observations, troubleshooting patterns, and species behavior notes
 */

import type { Insight, InsightSuggestion, ValidationResult } from './communityTypes';

const INSIGHTS_KEY = 'mushroom-insights';
const SUGGESTIONS_KEY = 'mushroom-insight-suggestions';

/**
 * Get all insights from localStorage
 */
export function getInsights(): Insight[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(INSIGHTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save insights to localStorage
 */
export function saveInsights(insights: Insight[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INSIGHTS_KEY, JSON.stringify(insights));
}

/**
 * Get insight suggestions
 */
export function getInsightSuggestions(): InsightSuggestion[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(SUGGESTIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save insight suggestions
 */
export function saveInsightSuggestions(suggestions: InsightSuggestion[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(suggestions));
}

/**
 * Create a new insight
 */
export function createInsight(insight: Omit<Insight, 'id' | 'createdAt' | 'updatedAt'>): Insight {
  const newInsight: Insight = {
    ...insight,
    id: `insight-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const insights = getInsights();
  insights.unshift(newInsight);
  saveInsights(insights);
  
  return newInsight;
}

/**
 * Update an insight
 */
export function updateInsight(id: string, updates: Partial<Insight>): Insight | null {
  const insights = getInsights();
  const insight = insights.find(i => i.id === id);
  
  if (!insight) return null;
  
  const updated: Insight = {
    ...insight,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  const index = insights.findIndex(i => i.id === id);
  insights[index] = updated;
  saveInsights(insights);
  
  return updated;
}

/**
 * Delete an insight
 */
export function deleteInsight(id: string): boolean {
  const insights = getInsights();
  const filtered = insights.filter(i => i.id !== id);
  
  if (filtered.length === insights.length) return false;
  
  saveInsights(filtered);
  return true;
}

/**
 * Get insight by ID
 */
export function getInsightById(id: string): Insight | null {
  const insights = getInsights();
  return insights.find(i => i.id === id) || null;
}

/**
 * Filter insights by type
 */
export function getInsightsByType(type: Insight['type']): Insight[] {
  return getInsights().filter(i => i.type === type);
}

/**
 * Get insights for a species
 */
export function getInsightsForSpecies(species: string): Insight[] {
  return getInsights().filter(i =>
    i.relatedSpecies?.includes(species)
  );
}

/**
 * Get insights for an issue
 */
export function getInsightsForIssue(issue: string): Insight[] {
  return getInsights().filter(i =>
    i.relatedIssues?.includes(issue)
  );
}

/**
 * Get all tags from insights
 */
export function getInsightTags(): string[] {
  const insights = getInsights();
  const allTags = insights.flatMap(i => i.tags);
  return [...new Set(allTags)];
}

/**
 * Create insight suggestion from grow log
 */
export function suggestInsightFromGrowLog(
  logId: string,
  type: Insight['type'],
  suggestedTags: string[],
  suggestedLinks: { slug: string; title: string }[]
): InsightSuggestion {
  const suggestion: InsightSuggestion = {
    id: `suggestion-${Date.now()}`,
    type,
    suggestedTags,
    suggestedLinks,
    source: 'grow-log',
    sourceId: logId,
    createdAt: new Date().toISOString(),
    isReviewed: false,
  };
  
  const suggestions = getInsightSuggestions();
  suggestions.push(suggestion);
  saveInsightSuggestions(suggestions);
  
  return suggestion;
}

/**
 * Create insight suggestion from note
 */
export function suggestInsightFromNote(
  noteId: string,
  type: Insight['type'],
  suggestedTags: string[],
  suggestedLinks: { slug: string; title: string }[]
): InsightSuggestion {
  const suggestion: InsightSuggestion = {
    id: `suggestion-${Date.now()}`,
    type,
    suggestedTags,
    suggestedLinks,
    source: 'note',
    sourceId: noteId,
    createdAt: new Date().toISOString(),
    isReviewed: false,
  };
  
  const suggestions = getInsightSuggestions();
  suggestions.push(suggestion);
  saveInsightSuggestions(suggestions);
  
  return suggestion;
}

/**
 * Accept insight suggestion (convert to insight)
 */
export function acceptInsightSuggestion(suggestionId: string, insightContent: Omit<Insight, 'id' | 'createdAt' | 'updatedAt'>): Insight | null {
  const suggestions = getInsightSuggestions();
  const suggestion = suggestions.find(s => s.id === suggestionId);
  
  if (!suggestion) return null;
  
  // Mark suggestion as reviewed
  const updated = suggestions.map(s =>
    s.id === suggestionId ? { ...s, isReviewed: true } : s
  );
  saveInsightSuggestions(updated);
  
  // Create the insight
  return createInsight(insightContent);
}

/**
 * Reject insight suggestion
 */
export function rejectInsightSuggestion(suggestionId: string): InsightSuggestion | null {
  const suggestions = getInsightSuggestions();
  const suggestion = suggestions.find(s => s.id === suggestionId);
  
  if (!suggestion) return null;
  
  const updated = suggestions.map(s =>
    s.id === suggestionId ? { ...s, isReviewed: true } : s
  );
  saveInsightSuggestions(updated);
  
  return { ...suggestion, isReviewed: true };
}

/**
 * Get unreviewed suggestions
 */
export function getUnreviewedSuggestions(): InsightSuggestion[] {
  return getInsightSuggestions().filter(s => !s.isReviewed);
}

/**
 * Convert insight to contribution (share with community)
 */
export function shareInsight(insightId: string): Insight | null {
  const insight = getInsightById(insightId);
  if (!insight) return null;
  
  return updateInsight(insightId, { isPrivate: false });
}

/**
 * Make insight private
 */
export function makeInsightPrivate(insightId: string): Insight | null {
  const insight = getInsightById(insightId);
  if (!insight) return null;
  
  return updateInsight(insightId, { isPrivate: true });
}

/**
 * Search insights
 */
export function searchInsights(query: string): Insight[] {
  const lowerQuery = query.toLowerCase();
  return getInsights().filter(i =>
    i.title.toLowerCase().includes(lowerQuery) ||
    i.description.toLowerCase().includes(lowerQuery) ||
    i.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get insights by confidence level
 */
export function getInsightsByConfidence(confidence: 'low' | 'medium' | 'high'): Insight[] {
  return getInsights().filter(i => i.confidence === confidence);
}

/**
 * Validate insight
 */
export function validateInsight(insight: Partial<Insight>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!insight.type) errors.push('Insight type is required');
  if (!insight.title || insight.title.trim().length === 0) errors.push('Title is required');
  if (!insight.description || insight.description.trim().length === 0) errors.push('Description is required');
  
  if (insight.title && insight.title.length > 200) {
    warnings.push('Title is quite long');
  }
  
  if (!insight.tags || insight.tags.length === 0) {
    warnings.push('Adding tags helps organize insights');
  }
  
  if (!insight.confidence) {
    warnings.push('Specifying confidence level helps users assess reliability');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Export insights to JSON
 */
export function exportInsights(insightsToExport?: Insight[]): string {
  const insights = insightsToExport || getInsights();
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data: insights,
    metadata: {
      totalInsights: insights.length,
      typeBreakdown: {
        tip: insights.filter(i => i.type === 'tip').length,
        observation: insights.filter(i => i.type === 'observation').length,
        troubleshootingPattern: insights.filter(i => i.type === 'troubleshooting-pattern').length,
        speciesBehavior: insights.filter(i => i.type === 'species-behavior').length,
      },
    },
  };
  
  return JSON.stringify(data, null, 2);
}

/**
 * Import insights from JSON
 */
export function importInsights(jsonData: string, mergeStrategy: 'replace' | 'merge' = 'merge'): { success: boolean; count: number; errors: string[] } {
  try {
    const data = JSON.parse(jsonData);
    const importedInsights = data.data || [];
    
    if (mergeStrategy === 'replace') {
      saveInsights(importedInsights);
      return { success: true, count: importedInsights.length, errors: [] };
    } else {
      const existing = getInsights();
      const merged = [...existing, ...importedInsights];
      saveInsights(merged);
      return { success: true, count: importedInsights.length, errors: [] };
    }
  } catch (error) {
    return {
      success: false,
      count: 0,
      errors: [error instanceof Error ? error.message : 'Import failed'],
    };
  }
}
