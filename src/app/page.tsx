import { getTopAnime, getAiringAnime, getUpcomingAnime } from '@/lib/jikan';
import AnimeRow from '@/components/AnimeRow';

export default async function Home() {
  // Use delays to avoid triggering Jikan API rate limit (3 req/sec)
  const [topRes, airingRes, upcomingRes] = await Promise.all([
    getTopAnime(0),
    getAiringAnime(400),
    getUpcomingAnime(800)
  ]);

  return (
    <div className="w-full h-full max-w-[1600px] mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Discover
        </h1>
        <p className="text-slate-400 mt-2">Explore the best anime across all categories.</p>
      </header>

      <div className="space-y-4">
        <AnimeRow title="Currently Airing" items={airingRes.data} />
        <AnimeRow title="All-Time Popular" items={topRes.data} />
        <AnimeRow title="Upcoming Seasons" items={upcomingRes.data} />
      </div>
    </div>
  );
}
