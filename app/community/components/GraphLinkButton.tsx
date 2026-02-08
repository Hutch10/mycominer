/**
 * GraphLinkButton Component
 * Button to link grow log/note/insight to pages in the knowledge graph
 */

'use client';

import React, { useState } from 'react';
import { searchIndex } from '../../searchIndex';
import type { LinkedContent } from '../utils/communityTypes';

interface GraphLinkButtonProps {
  itemId: string;
  itemType: 'grow-log' | 'note' | 'insight';
  currentLinks?: LinkedContent[];
  onLink: (link: LinkedContent) => void;
  onUnlink?: (contentType: LinkedContent['type'], slug: string) => void;
}

export function GraphLinkButton({
  itemId,
  itemType,
  currentLinks = [],
  onLink,
  onUnlink,
}: GraphLinkButtonProps) {
  const [showSelector, setShowSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPages = searchQuery.trim()
    ? searchIndex.filter(page =>
        (page.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page.slug?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        page.slug
      )
    : [];

  const linkedPages = currentLinks
    .map(link => ({
      link,
      page: searchIndex.find(page => page.slug === link.slug),
    }))
    .filter(item => item.page || item.link);

  const inferContentType = (path?: string): LinkedContent['type'] => {
    if (!path) return 'page';
    if (path.startsWith('/growing-guides') || path.startsWith('/medicinal-mushrooms')) return 'species';
    if (path.startsWith('/guides')) return 'guide';
    if (path.startsWith('/troubleshooting')) return 'troubleshooting';
    if (path.startsWith('/tools')) return 'tool';
    return 'page';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowSelector(!showSelector)}
        className="px-4 py-2 bg-purple-900 hover:bg-purple-800 text-purple-100 rounded text-sm font-medium transition-colors"
      >
        🔗 Link to Content
      </button>

      {showSelector && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 p-4">
          {/* Linked Pages */}
          {linkedPages.length > 0 && (
            <div className="mb-4 pb-4 border-b border-slate-700">
              <p className="text-xs text-slate-400 font-medium mb-2">Linked Pages</p>
              <div className="space-y-1">
                {linkedPages.map(({ link, page }) => (
                  <div
                    key={link.slug}
                    className="flex items-center justify-between bg-slate-700/30 px-2 py-1 rounded text-sm"
                  >
                    <span className="text-slate-200">{page?.title || link.title || link.slug}</span>
                    {onUnlink && (
                      <button
                        onClick={() => {
                          onUnlink(link.type, link.slug);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search pages..."
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 mb-3"
          />

          {/* Suggestions */}
          <div className="max-h-64 overflow-y-auto">
            {filteredPages.length > 0 ? (
              <div className="space-y-1">
                {filteredPages.slice(0, 10).map(page => (
                  <button
                    key={page.slug}
                    onClick={() => {
                      onLink({
                        type: inferContentType(page.path),
                        slug: page.slug!,
                        title: page.title || page.slug || 'linked-page',
                      });
                      setSearchQuery('');
                    }}
                    disabled={currentLinks.some(link => link.slug === page.slug)}
                    className="w-full text-left px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <div className="font-medium">{page.title}</div>
                    <div className="text-xs text-slate-400">{page.slug}</div>
                  </button>
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <p className="text-center text-slate-500 text-sm py-4">No pages found</p>
            ) : (
              <p className="text-center text-slate-500 text-sm py-4">Start typing to search</p>
            )}
          </div>

          <button
            onClick={() => setShowSelector(false)}
            className="w-full mt-3 px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
