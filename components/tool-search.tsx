// Enhancement #8: Tool Search Functionality
"use client";

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { ALL_TOOLS } from '@/lib/tools-data';

export default function ToolSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? ALL_TOOLS.filter(t =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase()) ||
        t.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search tools...</span>
        <kbd className="hidden sm:inline text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>⌘K</kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
          <div className="w-full max-w-lg mx-4 rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <Search className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} autoFocus
                className="flex-1 bg-transparent outline-none text-sm" style={{ color: 'var(--text-primary)' }}
                placeholder="Search AI tools by name, category, or description..." />
              {query && <button onClick={() => setQuery('')}><X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /></button>}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {filtered.length === 0 && query.trim() && (
                <div className="p-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>No tools found for &quot;{query}&quot;</div>
              )}
              {!query.trim() && (
                <div className="p-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>Type to search across all 45 AI tools</div>
              )}
              {filtered.map(tool => (
                <Link key={tool.slug} href={`/${tool.slug}`} onClick={() => { setIsOpen(false); setQuery(''); }}
                  className="flex items-center gap-3 px-4 py-3 transition-all" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent)' }}>
                    {tool.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{tool.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{tool.description}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-light)' }}>
                    {tool.category}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
