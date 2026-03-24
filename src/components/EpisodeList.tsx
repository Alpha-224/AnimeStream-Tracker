'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';

interface Episode {
  mal_id: number;
  title: string;
  title_japanese: string;
  aired: string;
  episode_num?: number; // injected by parent
}

interface EpisodeListProps {
  animeId: string;
  episodes: Episode[];
}

export default function EpisodeList({ animeId, episodes }: EpisodeListProps) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Attach sequential episode numbers before filtering
  const episodesWithNum = episodes.map((ep, i) => ({ ...ep, episode_num: i + 1 }));

  const filtered = episodesWithNum.filter(
    (ep) =>
      ep.title?.toLowerCase().includes(search.toLowerCase()) ||
      ep.episode_num.toString().includes(search)
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Episodes</h2>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Ep Name or #"
            className="pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors w-64"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset page on search
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {paginated.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No episodes found.</p>
        ) : (
          paginated.map((ep) => (
            <Link
              key={ep.mal_id}
              href={`/anime/${animeId}/watch/${ep.episode_num}`}
              className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/80 border border-transparent hover:border-slate-600 transition-all group cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-slate-500 group-hover:text-blue-400 transition-colors w-12">
                  {ep.episode_num}
                </span>
                <div>
                  <h4 className="text-white font-medium">{ep.title || `Episode ${ep.episode_num}`}</h4>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-50 hover:bg-slate-700 transition"
          >
            Prev
          </button>
          <span className="text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-50 hover:bg-slate-700 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
