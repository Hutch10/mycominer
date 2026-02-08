/**
 * NoteCard Component
 * Display note with title, preview, linked content, and actions
 */

'use client';

import React from 'react';
import type { Note } from '../utils/communityTypes';

interface NoteCardProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete?: (noteId: string) => void;
  onPin?: (noteId: string) => void;
  onUnlink?: (noteId: string, type: string, slug: string) => void;
}

export function NoteCard({ note, onEdit, onDelete, onPin, onUnlink }: NoteCardProps) {
  const getContentTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      species: '🍄',
      guide: '📚',
      troubleshooting: '🔧',
      tool: '⚙️',
      page: '📄',
    };
    return icons[type] || '🔗';
  };

  const truncateText = (text: string, length: number) => {
    return text.length > length ? text.slice(0, length) + '...' : text;
  };

  return (
    <div
      className={`rounded-lg p-4 border transition-colors ${
        note.color
          ? `bg-${note.color}-900/20 border-${note.color}-700`
          : 'bg-slate-800 border-slate-700'
      } hover:border-slate-600`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {note.isPinned && <span className="text-yellow-400">📌</span>}
            <h3 className="text-base font-semibold text-white">{note.title}</h3>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          {new Date(note.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Content Preview */}
      <p className="text-sm text-slate-300 mb-3 line-clamp-2">
        {truncateText(note.content.replace(/[#*`]/g, ''), 200)}
      </p>

      {/* Linked Content */}
      {note.linkedContent.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-slate-400 font-medium mb-1">Linked To</p>
          <div className="flex flex-wrap gap-1">
            {note.linkedContent.map(link => (
              <div
                key={`${link.type}-${link.slug}`}
                className="bg-slate-700 text-slate-200 text-xs px-2 py-1 rounded flex items-center gap-1 group"
              >
                <span>{getContentTypeIcon(link.type)}</span>
                <span>{link.title}</span>
                {onUnlink && (
                  <button
                    onClick={() => onUnlink(note.id, link.type, link.slug)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-all"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.map(tag => (
            <span key={tag} className="bg-slate-700/50 text-slate-300 text-xs px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-slate-700">
        {onPin && (
          <button
            onClick={() => onPin(note.id)}
            className="flex-1 text-sm px-3 py-1 rounded bg-yellow-900 hover:bg-yellow-800 text-yellow-100 transition-colors"
          >
            {note.isPinned ? 'Unpin' : 'Pin'}
          </button>
        )}
        <button
          onClick={() => onEdit?.(note)}
          className="flex-1 text-sm px-3 py-1 rounded bg-blue-900 hover:bg-blue-800 text-blue-100 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete?.(note.id)}
          className="flex-1 text-sm px-3 py-1 rounded bg-red-900 hover:bg-red-800 text-red-100 transition-colors"
        >
          Delete
        </button>
      </div>

      {/* Privacy Indicator */}
      <p className="text-xs text-slate-600 mt-2 text-right">
        {note.isPrivate ? '🔒 Private' : '👁️ Visible'}
      </p>
    </div>
  );
}
