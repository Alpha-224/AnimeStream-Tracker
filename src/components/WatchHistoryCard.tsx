'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { WatchEntry, getProgress } from '@/lib/watchHistory';
import { X } from 'lucide-react';

interface WatchHistoryCardProps {
  entry: WatchEntry;
  onRemove?: (mal_id: number) => void;
}

export default function WatchHistoryCard({ entry, onRemove }: WatchHistoryCardProps) {
  const progress = getProgress(entry);
  const timeStr = entry.timestamp > 0
    ? `${Math.floor(entry.timestamp / 60)}m ${Math.floor(entry.timestamp % 60)}s`
    : null;

  return (
    <div className="relative group flex-none">
      {/* Remove button */}
      {onRemove && (
        <button
          onClick={(e) => { e.preventDefault(); onRemove(entry.mal_id); }}
          className="absolute top-2 right-2 z-20 w-6 h-6 bg-black/80 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-600/80 transition-all opacity-0 group-hover:opacity-100"
          title="Remove from history"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      <Link href={`/anime/${entry.mal_id}/watch/${entry.episode}`}>
        <motion.div
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="w-48 cursor-pointer overflow-hidden rounded-xl shadow-lg bg-slate-900 border border-slate-800 flex flex-col"
        >
          {/* Poster */}
          <div className="relative w-full h-64 overflow-hidden">
            <img
              src={entry.imageUrl}
              alt={entry.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-white font-bold text-xs line-clamp-2">{entry.title}</p>
            </div>
          </div>

          {/* Episode + progress */}
          <div className="p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-400">
                Episode {entry.episode}
              </span>
              {timeStr && (
                <span className="text-[10px] text-slate-500">{timeStr}</span>
              )}
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            {entry.duration > 0 && (
              <p className="text-[10px] text-slate-600 text-right">{progress}%</p>
            )}
          </div>
        </motion.div>
      </Link>
    </div>
  );
}
