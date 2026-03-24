import AnimeCard from './AnimeCard';

interface AnimeRowProps {
  title: string;
  items: any[];
}

export default function AnimeRow({ title, items }: AnimeRowProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-10 w-full">
      <h2 className="text-2xl font-bold text-white mb-4 px-2 tracking-tight">
        {title}
      </h2>
      <div className="flex space-x-4 overflow-x-auto pb-6 pt-2 px-2 scrollbar-hide">
        {items.map((anime, index) => (
          <AnimeCard key={`${anime.mal_id}-${index}`} anime={anime} />
        ))}
      </div>
    </div>
  );
}
