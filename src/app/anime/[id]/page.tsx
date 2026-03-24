import { getAnimeById, getAnimeEpisodes } from '@/lib/jikan';
import EpisodeList from '@/components/EpisodeList';
import MALRating from '@/components/MALRating';

export default async function AnimePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const animeData = await getAnimeById(id);
  const anime = animeData.data;

  if (!anime) {
    return (
      <div className="flex justify-center items-center h-full">
        <h1 className="text-3xl text-slate-400">Anime Not Found</h1>
      </div>
    );
  }

  // Fetch episodes sequentially with delays to avoid Jikan 429 rate limits.
  // Only fetch the first page; if it is full (100 items), fetch the next — and so on.
  const episodesTemp: any[] = [];
  try {
    for (let page = 1; page <= 4; page++) {
      if (page > 1) await new Promise((r) => setTimeout(r, 600)); // 600ms between pages
      const res = await getAnimeEpisodes(id, page);
      if (!res.data || res.data.length === 0) break; // No more pages
      episodesTemp.push(...res.data);
      if (res.data.length < 100) break; // Last page — stop early
    }
  } catch (err) {
    console.warn('Failed to fetch episode pages', err);
  }

  // Remove possible undefined/null data
  const episodes = episodesTemp.filter(Boolean);

  const title = anime.title_english || anime.title;
  const imageUrl = anime.images?.webp?.large_image_url || anime.images?.jpg?.image_url;
  // Fallback to high-res poster if trailer banner is absent
  const bannerUrl = anime.trailer?.images?.maximum_image_url || imageUrl; 

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-12">
      {/* Hero Header */}
      <div className="relative w-full h-[400px] mb-8 rounded-2xl overflow-hidden shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-md scale-110"
          style={{ backgroundImage: `url(${bannerUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 flex items-end space-x-6">
          <img
            src={imageUrl}
            alt={title}
            className="w-48 h-72 object-cover rounded-xl shadow-2xl border-2 border-slate-700/50 relative -bottom-8"
          />
          <div className="mb-4">
            <h1 className="text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
              {title}
            </h1>
            <p className="text-emerald-400 font-medium mt-2 drop-shadow">
              {anime.status} • {anime.episodes ? `${anime.episodes} Episodes` : 'Ongoing'}
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-8 px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column (Info) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-lg">
              <div className="text-center w-1/2 border-r border-slate-700">
                <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">MAL Score</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">★ {anime.score || 'N/A'}</p>
              </div>
              <div className="text-center w-1/2">
                <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Ranked</p>
                <p className="text-2xl font-bold text-white mt-1">#{anime.rank || 'N/A'}</p>
              </div>
            </div>

            {/* Direct MAL Rating Component */}
            <MALRating animeId={id} />

            <div className="mt-6">
              <h3 className="text-lg font-bold text-white mb-2">Synopsis</h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {anime.synopsis || 'No synopsis available.'}
              </p>
            </div>
            
            <a
              href={`/anime/${id}/watch/1`}
              className="mt-8 flex w-full justify-center py-4 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:scale-105 active:scale-95"
            >
              WATCH NOW
            </a>
          </div>
        </div>

        {/* Right Column (Episodes) */}
        <div className="lg:col-span-2">
          <EpisodeList animeId={id} episodes={episodes} />
        </div>
      </div>
    </div>
  );
}
