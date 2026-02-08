"use client";

import { useState, useEffect, useRef } from "react";
import { searchIndex } from "../searchIndex";

interface SearchItem {
  title: string;
  path: string;
  category: string;
}

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "k" && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  // Focus input when open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Filter results
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = searchIndex
      .filter(item => item.title.toLowerCase().includes(q))
      .map(item => {
        let category = "Other";
        if (item.path.startsWith("/foundations")) category = "Foundations";
        else if (item.path.startsWith("/growing-guides")) category = "Growing Guides";
        else if (item.path.startsWith("/troubleshooting")) category = "Troubleshooting";
        else if (item.path.startsWith("/medicinal-mushrooms")) category = "Medicinal Mushrooms";
        return { ...item, category };
      });
    setResults(filtered);
  }, [query]);

  // Click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  if (!isOpen) return null;

  // Group results
  const grouped = results.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SearchItem[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
        </div>
        <div className="p-4 overflow-y-auto max-h-96">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">{category}</h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsOpen(false)}
                    className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">{item.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{item.path}</div>
                  </a>
                ))}
              </div>
            </div>
          ))}
          {results.length === 0 && query && (
            <p className="text-gray-500 dark:text-gray-400">No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
}