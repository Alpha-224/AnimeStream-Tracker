const CONSUMET_URL = process.env.CONSUMET_API_URL || 'http://localhost:4000';

interface StreamSource {
  url: string;
  isM3U8: boolean;
  isIframe?: boolean;
  quality: string;
}

interface StreamResult {
  sources: StreamSource[];
  iframeSrc?: string;
}

/**
 * Fetches streaming sources from HiAnime via the local Consumet API's /stream endpoint.
 *
 * The /stream endpoint bypasses the broken MegaCloud extractor in @consumet/extensions
 * by directly calling HiAnime AJAX with browser-like headers.
 *
 * HiAnime episode IDs from the info endpoint come as: "slug?ep=NNNNN"
 * We extract "NNNNN" and "slug" to call the /stream endpoint which handles the rest.
 */
async function fetchFromHianime(title: string, episodeNumber: number): Promise<StreamResult | null> {
  // 1. Search for the anime
  const searchRes = await fetch(
    `${CONSUMET_URL}/anime/hianime/${encodeURIComponent(title)}`,
    { cache: 'no-store' }
  );
  if (!searchRes.ok) return null;
  const searchData = await searchRes.json();

  const results: any[] = searchData.results ?? [];
  if (!results.length) return null;
  const animeId: string = results[0].id; // e.g. "jujutsu-kaisen-6705"

  // 2. Fetch episode list
  const infoRes = await fetch(
    `${CONSUMET_URL}/anime/hianime/info?id=${animeId}`,
    { cache: 'no-store' }
  );
  if (!infoRes.ok) return null;
  const infoData = await infoRes.json();

  const episodes: any[] = infoData.episodes ?? [];
  if (!episodes.length) return null;

  // 3. Match episode by number
  const episode = episodes.find((ep: any) => ep.number === episodeNumber);
  if (!episode) return null;

  // Episode id format: "jujutsu-kaisen-6705?ep=102662" → extract numeric ep ID
  // (stored internally by the scraper as: "jujutsu-kaisen-6705$episode$102662")
  let numericEpId = '';
  if (episode.id) {
    // Try both formats
    const qpMatch = String(episode.id).match(/\?ep=(\d+)/);
    const dollarMatch = String(episode.id).match(/\$episode\$(\d+)/);
    numericEpId = (qpMatch?.[1] ?? dollarMatch?.[1] ?? '');
  }

  if (!numericEpId) return null;

  // 4. Call our custom /stream endpoint which handles AJAX resolution with browser headers
  const streamRes = await fetch(
    `${CONSUMET_URL}/anime/hianime/stream?ep=${numericEpId}&animeId=${animeId}`,
    { cache: 'no-store' }
  );
  if (!streamRes.ok) return null;
  const streamData = await streamRes.json();

  if (!streamData.sources?.length) return null;
  return { sources: streamData.sources, iframeSrc: streamData.iframeSrc };
}

/**
 * Fallback: fetches from GoGoAnime.
 */
async function fetchFromGogoAnime(title: string, episodeNumber: number): Promise<StreamResult | null> {
  const searchRes = await fetch(
    `${CONSUMET_URL}/anime/gogoanime/${encodeURIComponent(title)}`,
    { cache: 'no-store' }
  );
  if (!searchRes.ok) return null;
  const searchData = await searchRes.json();

  const results: any[] = searchData.results ?? [];
  if (!results.length) return null;
  const animeId: string = results[0].id;

  const infoRes = await fetch(
    `${CONSUMET_URL}/anime/gogoanime/info/${animeId}`,
    { cache: 'no-store' }
  );
  if (!infoRes.ok) return null;
  const infoData = await infoRes.json();
  const episodes: any[] = infoData.episodes ?? [];
  if (!episodes.length) return null;

  const episode = episodes.find((ep: any) => ep.number === episodeNumber);
  if (!episode) return null;

  const streamRes = await fetch(
    `${CONSUMET_URL}/anime/gogoanime/watch/${episode.id}`,
    { cache: 'no-store' }
  );
  if (!streamRes.ok) return null;
  const streamData = await streamRes.json();
  const sources: StreamSource[] = streamData.sources ?? [];

  return sources.length > 0 ? { sources } : null;
}

/**
 * Primary export: tries HiAnime first, falls back to GoGoAnime.
 */
export async function fetchConsumetStream(title: string, episodeNumber: number): Promise<StreamResult | null> {
  try {
    const hi = await fetchFromHianime(title, episodeNumber);
    if (hi) return hi;
    return await fetchFromGogoAnime(title, episodeNumber);
  } catch (_) {
    return null;
  }
}
