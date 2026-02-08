/**
 * Notes System (Client-Side)
 * Create, edit, delete personal notes with markdown support and linking
 */

import type { Note, NoteFilter, LinkedContent, ValidationResult } from './communityTypes';

const STORAGE_KEY = 'mushroom-notes';

/**
 * Initialize or retrieve notes from localStorage
 */
export function getNotes(): Note[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save notes to localStorage
 */
export function saveNotes(notes: Note[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

/**
 * Create a new note
 */
export function createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
  const newNote: Note = {
    ...note,
    id: `note-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const notes = getNotes();
  notes.unshift(newNote);
  saveNotes(notes);
  
  return newNote;
}

/**
 * Update an existing note
 */
export function updateNote(id: string, updates: Partial<Note>): Note | null {
  const notes = getNotes();
  const note = notes.find(n => n.id === id);
  
  if (!note) return null;
  
  const updated: Note = {
    ...note,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  const index = notes.findIndex(n => n.id === id);
  notes[index] = updated;
  saveNotes(notes);
  
  return updated;
}

/**
 * Delete a note
 */
export function deleteNote(id: string): boolean {
  const notes = getNotes();
  const filtered = notes.filter(n => n.id !== id);
  
  if (filtered.length === notes.length) return false;
  
  saveNotes(filtered);
  return true;
}

/**
 * Get a single note by ID
 */
export function getNoteById(id: string): Note | null {
  const notes = getNotes();
  return notes.find(n => n.id === id) || null;
}

/**
 * Filter notes
 */
export function filterNotes(filter: NoteFilter): Note[] {
  let notes = getNotes();
  
  if (filter.tags && filter.tags.length > 0) {
    notes = notes.filter(n =>
      filter.tags!.some(tag => n.tags.includes(tag))
    );
  }
  
  if (filter.linkedType) {
    notes = notes.filter(n =>
      n.linkedContent.some(lc => lc.type === filter.linkedType)
    );
  }
  
  if (filter.isPinned !== undefined) {
    notes = notes.filter(n => n.isPinned === filter.isPinned);
  }
  
  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase();
    notes = notes.filter(n =>
      n.title.toLowerCase().includes(query) ||
      n.content.toLowerCase().includes(query)
    );
  }
  
  return notes;
}

/**
 * Add a link to a note
 */
export function linkNoteToContent(noteId: string, content: LinkedContent): Note | null {
  const note = getNoteById(noteId);
  if (!note) return null;
  
  // Prevent duplicate links
  if (!note.linkedContent.some(lc => lc.slug === content.slug && lc.type === content.type)) {
    note.linkedContent.push(content);
  }
  
  return updateNote(noteId, { linkedContent: note.linkedContent });
}

/**
 * Remove a link from a note
 */
export function unlinkNoteFromContent(noteId: string, type: string, slug: string): Note | null {
  const note = getNoteById(noteId);
  if (!note) return null;
  
  const filtered = note.linkedContent.filter(lc => !(lc.type === type && lc.slug === slug));
  return updateNote(noteId, { linkedContent: filtered });
}

/**
 * Pin a note
 */
export function pinNote(id: string): Note | null {
  return updateNote(id, { isPinned: true });
}

/**
 * Unpin a note
 */
export function unpinNote(id: string): Note | null {
  return updateNote(id, { isPinned: false });
}

/**
 * Get pinned notes
 */
export function getPinnedNotes(): Note[] {
  return getNotes().filter(n => n.isPinned);
}

/**
 * Get all unique tags from notes
 */
export function getNoteTags(): string[] {
  const notes = getNotes();
  const allTags = notes.flatMap(n => n.tags);
  return [...new Set(allTags)];
}

/**
 * Get notes linked to a specific content
 */
export function getNotesForContent(type: string, slug: string): Note[] {
  const notes = getNotes();
  return notes.filter(n =>
    n.linkedContent.some(lc => lc.type === type && lc.slug === slug)
  );
}

/**
 * Search notes by content
 */
export function searchNotes(query: string): Note[] {
  const lowerQuery = query.toLowerCase();
  return getNotes().filter(n =>
    n.title.toLowerCase().includes(lowerQuery) ||
    n.content.toLowerCase().includes(lowerQuery) ||
    n.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get notes created or updated within a date range
 */
export function getNotesInDateRange(startDate: string, endDate: string): Note[] {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  
  return getNotes().filter(n => {
    const created = new Date(n.createdAt).getTime();
    return created >= start && created <= end;
  });
}

/**
 * Export notes to JSON
 */
export function exportNotes(notesToExport?: Note[]): string {
  const notes = notesToExport || getNotes();
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data: notes,
    metadata: {
      totalNotes: notes.length,
      tags: getNoteTags(),
    },
  };
  
  return JSON.stringify(data, null, 2);
}

/**
 * Import notes from JSON
 */
export function importNotes(jsonData: string, mergeStrategy: 'replace' | 'merge' = 'merge'): { success: boolean; count: number; errors: string[] } {
  try {
    const data = JSON.parse(jsonData);
    const importedNotes = data.data || [];
    
    if (mergeStrategy === 'replace') {
      saveNotes(importedNotes);
      return { success: true, count: importedNotes.length, errors: [] };
    } else {
      const existing = getNotes();
      const merged = [...existing, ...importedNotes];
      saveNotes(merged);
      return { success: true, count: importedNotes.length, errors: [] };
    }
  } catch (error) {
    return {
      success: false,
      count: 0,
      errors: [error instanceof Error ? error.message : 'Import failed'],
    };
  }
}

/**
 * Validate note
 */
export function validateNote(note: Partial<Note>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!note.title || note.title.trim().length === 0) {
    errors.push('Note title is required');
  }
  
  if (note.title && note.title.length > 200) {
    warnings.push('Note title is very long; consider a shorter title');
  }
  
  if (!note.content || note.content.trim().length === 0) {
    errors.push('Note content is required');
  }
  
  if (note.content && note.content.length > 50000) {
    warnings.push('Note is very long; consider breaking it into multiple notes');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
