'use client';

import { useEffect, useState } from 'react';
import { getAllWatchHistory, WatchEntry, removeWatchEntry } from '@/lib/watchHistory';
import WatchHistoryCard from '@/components/WatchHistoryCard';
import { Tv } from 'lucide-react';

export default function CurrentlyWatchingPage() {
  const [history, setHistory] = useState<WatchEntry[]>([]);

  const load = () => setHistory(getAllWatchHistory());

  useEffect(() => {
    load();
    window.addEventListener('watchHistoryChange', load);
    return () => window.removeEventListener('watchHistoryChange', load);
  }, []);

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Currently Watching
        </h1>
        <p className="text-slate-400 mt-2">Pick up where you left off.</p>
      </header>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Tv className="w-16 h-16 text-slate-700 mb-4" />
          <p className="text-slate-500 text-lg font-semibold">Nothing here yet.</p>
          <p className="text-slate-600 text-sm mt-1">
            Start watching an episode and it will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6">
          {history.map((entry) => (
            <WatchHistoryCard
              key={entry.mal_id}
              entry={entry}
              onRemove={(id) => { removeWatchEntry(id); load(); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
