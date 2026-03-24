import { getAnimeById } from '@/lib/jikan';
import VideoPlayer from '@/components/VideoPlayer';
import MALRating from '@/components/MALRating';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function WatchPage({ params }: { params: { id: string; episodeId: string } }) {
  const { id, episodeId } = await params;

  const animeData = await getAnimeById(id);
  const anime = animeData.data;

  if (!anime) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <h1 className="text-3xl font-bold text-slate-500">Anime Not Found</h1>
      </div>
    );
  }

  const title = anime.title_english || anime.title;
  const epNum = parseInt(episodeId, 10);
  const imageUrl =
    anime.images?.webp?.large_image_url ||
    anime.images?.jpg?.image_url ||
    '';

  // Resolve the stream embed URL from the custom scraper
  let embedUrl: string | null = null;
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const streamRes = await fetch(
      `${baseUrl}/api/stream?title=${encodeURIComponent(title)}&episode=${epNum}`,
      { cache: 'no-store' }
    );
    if (streamRes.ok) {
      const data = await streamRes.json();
      embedUrl = data.embedUrl ?? null;
    }
  } catch (err) {
    console.error('[WatchPage] Stream fetch error:', err);
  }

  const animeInfo = {
    mal_id: anime.mal_id,
    title,
    imageUrl,
    score: anime.score ?? null,
    type: anime.type ?? 'TV',
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-12 mt-4">
      <Link
        href={`/anime/${id}`}
        className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Details
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Theater Stage */}
        <div className="xl:col-span-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl">
            <h1 className="text-2xl font-bold text-white mb-4">
              {title} <span className="text-blue-400">Episode {epNum}</span>
            </h1>

            <VideoPlayer
              embedUrl={embedUrl}
              title={`${title} Episode ${epNum}`}
              episode={epNum}
              animeInfo={animeInfo}
            />
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl sticky top-8">
            <h3 className="text-lg font-bold text-white mb-2">Anime Tracking</h3>
            <p className="text-sm text-slate-400 mb-6">
              Update your MAL progress directly here.
            </p>

            <MALRating animeId={id} />

            <div className="mt-8 border-t border-slate-800 pt-6">
              <h4 className="text-slate-400 font-bold mb-2 uppercase text-xs tracking-wider">Currently Watching</h4>
              <p className="text-white font-medium">{title}</p>
              <p className="text-slate-500 text-sm mt-1">Status: {anime.status}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
