'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getAllWatchHistory } from '@/lib/watchHistory';
import { Compass, Loader2 } from 'lucide-react';

interface RecAnime {
  mal_id: number;
  title: string;
  imageUrl: string;
  type: string;
}

export default function RecommendationsPage() {
  const [recs, setRecs] = useState<RecAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/recommendations');
        const data = await res.json();

        // Filter out anime already in watch history
        const watchingIds = new Set(getAllWatchHistory().map((e) => e.mal_id));
        const filtered = (data.data ?? []).filter(
          (r: RecAnime) => !watchingIds.has(r.mal_id) && !!r.imageUrl
        );
        setRecs(filtered);
      } catch (e: any) {
        setError('Could not load recommendations. Try again later.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Recommended
        </h1>
        <p className="text-slate-400 mt-2">
          Fresh picks from{' '}
          <a
            href="https://myanimelist.net/recommendations.php?s=recentrecs&t=anime"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            MAL recent recommendations
          </a>
          {' '}· not including what you&apos;re already watching.
        </p>
      </header>

      {loading && (
        <div className="flex items-center justify-center h-64 gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading recommendations…</span>
        </div>
      )}

      {error && (
        <div className="text-red-400 text-center py-12">{error}</div>
      )}

      {!loading && !error && recs.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Compass className="w-16 h-16 text-slate-700 mb-4" />
          <p className="text-slate-500">No recommendations found right now.</p>
        </div>
      )}

      {!loading && recs.length > 0 && (
        <div className="flex flex-wrap gap-6">
          {recs.map((anime) => (
            <Link key={anime.mal_id} href={`/anime/${anime.mal_id}`}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group w-44 cursor-pointer overflow-hidden rounded-xl shadow-lg bg-slate-900 border border-slate-800 flex-none"
              >
                <div className="relative w-full h-64 overflow-hidden">
                  <img
                    src={anime.imageUrl}
                    alt={anime.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <h3 className="text-white font-bold text-xs line-clamp-2">{anime.title}</h3>
                    <span className="text-slate-400 text-[10px] mt-1">{anime.type}</span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
