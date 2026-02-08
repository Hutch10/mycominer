/**
 * Community Hub Home Page
 * Overview of community features, grow logs, notes, insights, and suggestions
 */

'use client';

import React, { useState, useEffect } from 'react';
import { GrowLogCard } from './components/GrowLogCard';
import { NoteCard } from './components/NoteCard';
import { InsightCard } from './components/InsightCard';
import { getGrowLogs, deleteGrowLog, getGrowLogStats } from './utils/growLogSystem';
import { getNotes, deleteNote, pinNote, unpinNote } from './utils/notesSystem';
import { getInsights, deleteInsight, shareInsight, makeInsightPrivate } from './utils/insightSystem';
import { getUnreviewedSuggestions } from './utils/insightSystem';
import type { GrowLogEntry, Note, Insight } from './utils/communityTypes';

export default function CommunityHubPage() {
  const [logs, setLogs] = useState<GrowLogEntry[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'notes' | 'insights' | 'suggestions'>('overview');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setLogs(getGrowLogs());
    setNotes(getNotes());
    setInsights(getInsights());
    setSuggestions(getUnreviewedSuggestions());
    setStats(getGrowLogStats());
  }, []);

  const handleDeleteLog = (logId: string) => {
    if (confirm('Delete this grow log?')) {
      deleteGrowLog(logId);
      setLogs(getGrowLogs());
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Delete this note?')) {
      deleteNote(noteId);
      setNotes(getNotes());
    }
  };

  const handleDeleteInsight = (insightId: string) => {
    if (confirm('Delete this insight?')) {
      deleteInsight(insightId);
      setInsights(getInsights());
    }
  };

  const handlePinNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note?.isPinned) {
      unpinNote(noteId);
    } else {
      pinNote(noteId);
    }
    setNotes(getNotes());
  };

  const handleShareInsight = (insightId: string) => {
    const insight = insights.find(i => i.id === insightId);
    if (insight?.isPrivate) {
      shareInsight(insightId);
    } else {
      makeInsightPrivate(insightId);
    }
    setInsights(getInsights());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">🌱 Community Hub</h1>
          <p className="text-purple-200 text-lg">
            Track your grows, capture insights, and learn from your cultivation journey.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 bg-slate-900/95 border-b border-slate-700 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto">
            {[
              { id: 'overview' as const, label: '📊 Overview', icon: '📊' },
              { id: 'logs' as const, label: '📝 Grow Logs', icon: '📝', count: logs.length },
              { id: 'notes' as const, label: '📌 Notes', icon: '📌', count: notes.length },
              { id: 'insights' as const, label: '💡 Insights', icon: '💡', count: insights.length },
              { id: 'suggestions' as const, label: '🔔 Suggestions', icon: '🔔', count: suggestions.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-300'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                {tab.label} {tab.count !== undefined && <span className="ml-1 bg-slate-700 px-2 py-1 rounded-full text-xs">{tab.count}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm font-medium">Total Logs</p>
                <p className="text-4xl font-bold text-purple-400 mt-1">{stats.totalLogs}</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm font-medium">Total Yield</p>
                <p className="text-4xl font-bold text-green-400 mt-1">{stats.totalYield}g</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm font-medium">Success Rate</p>
                <p className="text-4xl font-bold text-yellow-400 mt-1">{Math.round(stats.successRate)}%</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm font-medium">Avg Quality</p>
                <p className="text-4xl font-bold text-blue-400 mt-1">⭐{stats.averageQualityRating.toFixed(1)}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm font-medium mb-2">Favorite Species</p>
                <p className="text-2xl font-bold text-white capitalize">{stats.favoriteSpecies}</p>
                <p className="text-xs text-slate-500 mt-1">{stats.favoriteyields}g total yield</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm font-medium mb-2">Most Used Substrate</p>
                <p className="text-2xl font-bold text-white capitalize">{stats.mostUsedSubstrate}</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm font-medium mb-2">Notes & Insights</p>
                <p className="text-2xl font-bold text-white">{notes.length + insights.length}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Get Started</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="px-6 py-3 bg-purple-900 hover:bg-purple-800 text-white rounded-lg font-medium transition-colors">
                  📝 Create New Grow Log
                </button>
                <button className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-medium transition-colors">
                  📌 Add New Note
                </button>
                <button className="px-6 py-3 bg-yellow-900 hover:bg-yellow-800 text-white rounded-lg font-medium transition-colors">
                  💡 Share an Insight
                </button>
                <button className="px-6 py-3 bg-green-900 hover:bg-green-800 text-white rounded-lg font-medium transition-colors">
                  ⬇️ Import/Export Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Grow Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            {logs.length > 0 ? (
              <>
                <p className="text-slate-400 text-sm">
                  {logs.length} grow log{logs.length !== 1 ? 's' : ''} recorded
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {logs.map(log => (
                    <GrowLogCard
                      key={log.id}
                      log={log}
                      onDelete={handleDeleteLog}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg mb-4">No grow logs yet. Start tracking your first grow!</p>
                <button className="px-6 py-3 bg-purple-900 hover:bg-purple-800 text-white rounded-lg font-medium transition-colors">
                  📝 Create First Grow Log
                </button>
              </div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            {notes.length > 0 ? (
              <>
                <p className="text-slate-400 text-sm">
                  {notes.length} note{notes.length !== 1 ? 's' : ''} • {notes.filter(n => n.isPinned).length} pinned
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onDelete={handleDeleteNote}
                      onPin={handlePinNote}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg mb-4">No notes yet. Start capturing your knowledge!</p>
                <button className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-medium transition-colors">
                  📌 Create First Note
                </button>
              </div>
            )}
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            {insights.length > 0 ? (
              <>
                <p className="text-slate-400 text-sm">
                  {insights.length} insight{insights.length !== 1 ? 's' : ''} • {insights.filter(i => !i.isPrivate).length} shared
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {insights.map(insight => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      onDelete={handleDeleteInsight}
                      onShare={handleShareInsight}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg mb-4">No insights yet. Share what you've learned!</p>
                <button className="px-6 py-3 bg-yellow-900 hover:bg-yellow-800 text-white rounded-lg font-medium transition-colors">
                  💡 Share Your First Insight
                </button>
              </div>
            )}
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            {suggestions.length > 0 ? (
              <>
                <p className="text-slate-400 text-sm">
                  {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} awaiting review
                </p>
                <div className="space-y-4">
                  {suggestions.map(suggestion => (
                    <div
                      key={suggestion.id}
                      className="bg-slate-800 border border-slate-700 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white capitalize">{suggestion.type}</h3>
                          <p className="text-sm text-slate-400">from {suggestion.source}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-slate-300 mb-2">Suggested Tags:</p>
                        <div className="flex flex-wrap gap-1">
                          {suggestion.suggestedTags.map((tag: string) => (
                            <span key={tag} className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 bg-green-900 hover:bg-green-800 text-green-100 rounded transition-colors text-sm font-medium">
                          ✓ Accept
                        </button>
                        <button className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors text-sm font-medium">
                          ✕ Review Later
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg">No suggestions yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
