'use client';

import { useEffect, useRef, useState } from 'react';
import { saveWatchEntry } from '@/lib/watchHistory';

interface AnimeInfo {
  mal_id: number;
  title: string;
  imageUrl: string;
  score: number | null;
  type: string;
}

interface VideoPlayerProps {
  embedUrl?: string | null;
  title?: string;
  episode?: number;
  animeInfo?: AnimeInfo;
}

export default function VideoPlayer({ embedUrl, title, episode, animeInfo }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const startTimeRef = useRef<number | null>(null);
  const savedRef = useRef(false);

  useEffect(() => {
    if (!embedUrl) { setIsLoading(false); return; }
    startTimeRef.current = Date.now();
    savedRef.current = false;

    // Save initial watch entry immediately when player loads
    if (animeInfo && episode) {
      saveWatchEntry({
        mal_id: animeInfo.mal_id,
        title: animeInfo.title,
        imageUrl: animeInfo.imageUrl,
        score: animeInfo.score,
        type: animeInfo.type,
        episode,
        timestamp: 0,
        duration: 1440, // Default 24min (1440s) — actual duration unknown from iframe
      });
    }

    // Periodically update timestamp based on wall-clock time
    // (We can't read iframe internals due to cross-origin restrictions,
    //  so we track elapsed real time as a proxy for episode progress.)
    const timer = setInterval(() => {
      if (!animeInfo || !episode) return;
      const elapsed = Math.round((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
      saveWatchEntry({
        mal_id: animeInfo.mal_id,
        title: animeInfo.title,
        imageUrl: animeInfo.imageUrl,
        score: animeInfo.score,
        type: animeInfo.type,
        episode,
        timestamp: elapsed,
        duration: 1440,
      });
    }, 15_000); // update every 15 seconds

    // Also save on page unload
    const onUnload = () => {
      if (!animeInfo || !episode || savedRef.current) return;
      const elapsed = Math.round((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
      navigator.sendBeacon; // no-op for localStorage, but note the intent
      saveWatchEntry({
        mal_id: animeInfo.mal_id,
        title: animeInfo.title,
        imageUrl: animeInfo.imageUrl,
        score: animeInfo.score,
        type: animeInfo.type,
        episode,
        timestamp: elapsed,
        duration: 1440,
      });
      savedRef.current = true;
    };
    window.addEventListener('beforeunload', onUnload);

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', onUnload);
      onUnload();
    };
  }, [embedUrl, episode, animeInfo]);

  // ─── No source ─────────────────────────────────────────────────────────────
  if (!embedUrl) {
    return (
      <div className="w-full aspect-video bg-[#0a0a0a] flex flex-col items-center justify-center rounded-2xl border border-red-900/40 shadow-2xl">
        <div className="text-5xl mb-4">📡</div>
        <h2 className="text-xl font-bold text-red-400 mb-2">Stream Not Found</h2>
        <p className="text-slate-500 text-sm text-center max-w-xs px-4">
          Could not resolve a video source for this episode.
          Try refreshing the page or selecting a different episode.
        </p>
      </div>
    );
  }

  // ─── Embed player ──────────────────────────────────────────────────────────
  return (
    <div className="w-full relative">
      {isLoading && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden z-10 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}

      <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          referrerPolicy="no-referrer-when-downgrade"
          scrolling="no"
          title={title ?? 'Episode Player'}
          onLoad={() => setIsLoading(false)}
        />
      </div>

      <p className="mt-2 text-center text-xs text-slate-600">
        Streaming via HiAnime · If the player is blank, click inside it or try refreshing.
      </p>
    </div>
  );
}
