const JIKAN_API = 'https://api.jikan.moe/v4';

// Helper to avoid rate limits when fetching multiple categories
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchJikan(endpoint: string, wait = 0) {
  if (wait > 0) await delay(wait);
  
  const res = await fetch(`${JIKAN_API}${endpoint}`, {
    next: { revalidate: 3600 }, // Cache for 1 hour to heavily prevent 429s
  });
  
  if (!res.ok) {
    console.error(`Jikan API failed resolving ${endpoint}: ${res.status}`);
    return { data: [] }; // Graceful degradation
  }
  return res.json();
}

export async function getTopAnime(wait = 0) {
  return fetchJikan('/top/anime?limit=15', wait);
}

export async function getAiringAnime(wait = 0) {
  return fetchJikan('/seasons/now?limit=15', wait);
}

export async function getUpcomingAnime(wait = 0) {
  return fetchJikan('/seasons/upcoming?limit=15', wait);
}

export async function getAnimeById(id: string) {
  return fetchJikan(`/anime/${id}/full`);
}

export async function getAnimeEpisodes(id: string, page = 1) {
  return fetchJikan(`/anime/${id}/episodes?page=${page}`);
}
