'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface SearchResult {
  mal_id: number;
  title: string;
  title_english: string | null;
  images: { webp?: { image_url: string }; jpg?: { image_url: string } };
  type: string;
  score: number | null;
  episodes: number | null;
}

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const close = () => { setOpen(false); setQuery(''); setResults([]); };

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 450);
  };

  return (
    <>
      {/* Compact sidebar trigger */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-800/70 hover:bg-slate-700 border border-slate-700/60 text-slate-400 hover:text-white rounded-xl transition-all text-sm"
      >
        <Search className="w-4 h-4 flex-none" />
        <span className="text-slate-500 text-sm">Search Anime...</span>
      </button>

      {/* Full-screen search overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[10vh]"
            onClick={(e) => { if (e.target === e.currentTarget) close(); }}
          >
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-2xl mx-4"
            >
              {/* Input row */}
              <div className="flex items-center bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 shadow-2xl gap-3">
                {loading
                  ? <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-none" />
                  : <Search className="w-5 h-5 text-slate-400 flex-none" />
                }
                <input
                  ref={inputRef}
                  value={query}
                  onChange={handleChange}
                  placeholder="Search anime..."
                  className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-base"
                />
                {query && (
                  <button onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}>
                    <X className="w-4 h-4 text-slate-500 hover:text-white transition-colors" />
                  </button>
                )}
                <button
                  onClick={close}
                  className="ml-2 text-xs text-slate-500 hover:text-white bg-slate-800 px-2 py-1 rounded-lg transition-colors"
                >
                  ESC
                </button>
              </div>

              {/* Results dropdown */}
              <AnimatePresence>
                {results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto"
                  >
                    {results.map((anime) => {
                      const title = anime.title_english || anime.title;
                      const img = anime.images?.webp?.image_url || anime.images?.jpg?.image_url;
                      return (
                        <Link
                          key={anime.mal_id}
                          href={`/anime/${anime.mal_id}`}
                          onClick={close}
                          className="flex items-center gap-4 px-4 py-3 hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-b-0 group"
                        >
                          {img && (
                            <img
                              src={img}
                              alt={title}
                              className="w-10 h-14 object-cover rounded-lg flex-none"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm group-hover:text-blue-400 transition-colors truncate">
                              {title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-slate-500">{anime.type}</span>
                              {anime.episodes && <span className="text-xs text-slate-600">· {anime.episodes} eps</span>}
                              {anime.score && <span className="text-xs text-yellow-500">★ {anime.score}</span>}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}

                {!loading && query.length > 1 && results.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center text-slate-500 text-sm shadow-2xl"
                  >
                    No results found for &ldquo;{query}&rdquo;
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
