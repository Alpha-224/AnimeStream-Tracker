'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface AnimeCardProps {
  anime: any;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  const title = anime.title_english || anime.title;
  const imageUrl = anime.images?.webp?.large_image_url || anime.images?.jpg?.image_url;

  return (
    <Link href={`/anime/${anime.mal_id}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative group w-48 h-72 flex-none cursor-pointer overflow-hidden rounded-xl shadow-lg bg-slate-900 border border-slate-800"
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <h3 className="text-white font-bold text-sm line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-xs font-semibold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
              ★ {anime.score || 'N/A'}
            </span>
            <span className="text-xs text-slate-300">
              {anime.type}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
