/**
 * Notes Manager Page
 * Create, view, filter, search, and manage personal notes
 */

'use client';

import React, { useState, useEffect } from 'react';
import { NoteCard } from '../components/NoteCard';
import { TagSelector } from '../components/TagSelector';
import { GraphLinkButton } from '../components/GraphLinkButton';
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  filterNotes,
  pinNote,
  unpinNote,
  getNoteTags,
  searchNotes,
  exportNotes,
  importNotes,
  validateNote,
} from '../utils/notesSystem';
import { downloadFile, importData } from '../utils/exportImportSystem';
import type { Note, LinkedContent } from '../utils/communityTypes';

const CONTENT_TYPES = ['species', 'guide', 'troubleshooting', 'tool', 'page'] as const;
const COLORS = ['default', 'yellow', 'blue', 'green', 'purple', 'red'];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    linkedContent: [] as LinkedContent[],
    color: 'default',
  });

  // Filter state
  const [filters, setFilters] = useState({
    tags: [] as string[],
    linkedType: '',
    pinned: false,
    searchQuery: '',
  });

  useEffect(() => {
    const allNotes = getNotes();
    setNotes(allNotes);
    setFilteredNotes(allNotes);
    setAllTags(getNoteTags());
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const results = searchNotes(query);
      setFilteredNotes(results);
    } else {
      const filtered = filterNotes(filters);
      setFilteredNotes(filtered);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const filtered = filterNotes(newFilters);
    setFilteredNotes(filtered);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const note: Note = {
      id: editingId || crypto.randomUUID(),
      title: formData.title,
      content: formData.content,
      tags: formData.tags,
      linkedContent: formData.linkedContent,
      color: formData.color as any,
      isPinned: editingId ? notes.find(n => n.id === editingId)?.isPinned || false : false,
      isPrivate: true,
      createdAt: editingId ? new Date(notes.find(n => n.id === editingId)?.createdAt || Date.now()).toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const validation = validateNote(note);
    if (!validation.valid) {
      alert(`Validation errors:\n${validation.errors.join('\n')}`);
      return;
    }

    if (editingId) {
      updateNote(editingId, note);
    } else {
      createNote(note);
    }

    setNotes(getNotes());
    setFilteredNotes(getNotes());
    setAllTags(getNoteTags());
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      tags: [],
      linkedContent: [],
      color: 'default',
    });
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Delete this note?')) {
      deleteNote(noteId);
      const updated = getNotes();
      setNotes(updated);
      setFilteredNotes(updated);
    }
  };

  const handlePinNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note?.isPinned) {
      unpinNote(noteId);
    } else {
      pinNote(noteId);
    }
    const updated = getNotes();
    setNotes(updated);
    setFilteredNotes(updated);
  };

  const handleExport = () => {
    const data = exportNotes();
    downloadFile(JSON.stringify(data, null, 2), 'mushroom-notes-backup.json');
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        importNotes(data);
        setNotes(getNotes());
        setFilteredNotes(getNotes());
        setAllTags(getNoteTags());
        alert('Notes imported successfully!');
      } catch (err) {
        alert('Failed to import notes: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    };
    input.click();
  };

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.isPinned);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-cyan-900 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">📌 Notes</h1>
          <p className="text-blue-200 text-lg">
            Capture your knowledge with personal notes, tags, and links
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Actions */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-medium transition-colors"
          >
            {showForm ? '✕ Cancel' : '+ New Note'}
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-cyan-900 hover:bg-cyan-800 text-white rounded-lg font-medium transition-colors"
          >
            ⬇ Export
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-cyan-900 hover:bg-cyan-800 text-white rounded-lg font-medium transition-colors"
          >
            ⬆ Import
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">{editingId ? 'Edit' : 'New'} Note</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  placeholder="Note title..."
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-1">Content (Markdown)</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white font-mono text-sm"
                  placeholder="Write your note here... Markdown supported"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Color */}
                <div>
                  <label className="block text-sm font-medium mb-1">Color</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  >
                    {COLORS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <TagSelector
                    availableTags={allTags.length > 0 ? allTags : ['tips', 'experiment', 'species-specific', 'technique']}
                    selectedTags={formData.tags}
                    onTagsChange={(tags) => setFormData({ ...formData, tags })}
                    maxTags={10}
                    allowCustom={true}
                  />
                </div>
              </div>

              {/* Linked Content */}
              <div>
                <label className="block text-sm font-medium mb-2">Link to Content</label>
                <GraphLinkButton
                  itemId={editingId || 'new-note'}
                  itemType="note"
                  currentLinks={formData.linkedContent}
                  onLink={(link) => {
                    setFormData({
                      ...formData,
                      linkedContent: [...formData.linkedContent, link],
                    });
                  }}
                  onUnlink={(type, slug) => {
                    setFormData({
                      ...formData,
                      linkedContent: formData.linkedContent.filter(
                        l => !(l.type === type && l.slug === slug)
                      ),
                    });
                  }}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-medium transition-colors"
                >
                  {editingId ? 'Update' : 'Create'} Note
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

        {/* Search and Filter */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
          <div className="space-y-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Content Type</label>
                <select
                  value={filters.linkedType}
                  onChange={(e) => handleFilterChange('linkedType', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                >
                  <option value="">All types</option>
                  {CONTENT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Pinned Notes</label>
                <select
                  value={filters.pinned ? 'yes' : 'no'}
                  onChange={(e) => handleFilterChange('pinned', e.target.value === 'yes')}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                >
                  <option value="no">All notes</option>
                  <option value="yes">Pinned only</option>
                </select>
              </div>

              <div>
                <button
                  onClick={() => {
                    setFilters({
                      tags: [],
                      linkedType: '',
                      pinned: false,
                      searchQuery: '',
                    });
                    setSearchQuery('');
                    setFilteredNotes(notes);
                  }}
                  className="w-full px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm font-medium transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Display */}
        <div className="space-y-6">
          {/* Pinned Notes Section */}
          {pinnedNotes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-yellow-400">📌 Pinned Notes ({pinnedNotes.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pinnedNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onDelete={handleDeleteNote}
                    onPin={handlePinNote}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Notes Section */}
          {unpinnedNotes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">All Notes ({unpinnedNotes.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unpinnedNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onDelete={handleDeleteNote}
                    onPin={handlePinNote}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredNotes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">
                {searchQuery ? 'No notes found matching your search' : 'No notes yet. Create your first note!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
