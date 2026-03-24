/**
 * hianime-scraper.ts
 *
 * Custom scraper for hianime.to using got with http2 for TLS fingerprinting.
 *
 * Flow:
 *  1. Search hianime.to → pick best title match (not just results[0])
 *  2. Fetch episode list via /ajax/v2/episode/list/<numericId>
 *  3. Fetch server list for an episode via /ajax/v2/episode/servers?episodeId=<numericEpId>
 *  4. Fetch the embed URL via /ajax/v2/episode/sources?id=<serverId>
 */

import got from 'got';
import { load } from 'cheerio';

const HIANIME_BASE = 'https://hianime.to';

const DESKTOP_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

export interface StreamResult {
  embedUrl: string;
  serverName?: string;
}

function hianimeClient(referer: string) {
  return got.extend({
    http2: true,
    headers: {
      'User-Agent': DESKTOP_UA,
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': referer,
      'X-Requested-With': 'XMLHttpRequest',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
    },
    timeout: { request: 15000 },
    retry: { limit: 2 },
  });
}

// ─── Title similarity helpers ────────────────────────────────────────────────

/** Normalise a title for comparison: lowercase, strip punctuation & extra spaces */
function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Score how well `candidate` matches `target`.
 * Higher = better match.
 *
 * Priority:
 *   4 – exact match after normalisation
 *   3 – target is a prefix of candidate (e.g. "fairy tail" → "fairy tail 2018")
 *   2 – candidate starts with target (target is a prefix of candidate slug-base)
 *   1 – candidate contains all words of target
 *   0 – no match
 */
function titleScore(target: string, candidate: string): number {
  const t = normalise(target);
  const c = normalise(candidate);

  if (c === t) return 4;
  // Exact match ignoring trailing year/season suffix like "(2018)" or "2nd season"
  const cBase = c.replace(/\s*(\(?[12][09]\d{2}\)?|[2-9](nd|rd|th)\s*season|season\s*[2-9]|\bpart\s*\d+|\bfinal\s*(series|season)?\b).*/, '').trim();
  if (cBase === t) return 3;
  if (c.startsWith(t + ' ') || c.startsWith(t)) return 2;
  // All words in target appear in candidate
  const words = t.split(' ').filter(Boolean);
  if (words.every((w) => c.includes(w))) return 1;
  return 0;
}

// ─── Step 1: Search with best-match selection ────────────────────────────────

interface SearchResult {
  slug: string;   // e.g. "fairy-tail-6"
  title: string;  // display title scraped from the search page
}

async function searchHianime(query: string): Promise<SearchResult[]> {
  const res = await got.extend({
    http2: true,
    headers: { 'User-Agent': DESKTOP_UA, 'Accept': 'text/html' },
    timeout: { request: 15000 },
  }).get(`${HIANIME_BASE}/search?keyword=${encodeURIComponent(query)}`);

  const $ = load(res.body);
  const results: SearchResult[] = [];

  $('.flw-item').each((_, el) => {
    const a = $(el).find('.film-name a');
    const href = a.attr('href') ?? '';
    const slug = href.split('/')[1]?.split('?')[0] ?? '';
    const title = a.attr('title') || a.text().trim();
    if (slug && title) results.push({ slug, title });
  });

  return results;
}

/**
 * Search HiAnime and return the slug that best matches the requested title.
 *
 * If the top match scores 0 (no meaningful match) we return null so the caller
 * can surface a "not found" error rather than playing the wrong anime.
 */
async function findBestSlug(title: string): Promise<string | null> {
  const results = await searchHianime(title);
  if (!results.length) return null;

  // Score each result and pick the highest
  const scored = results.map((r) => ({
    ...r,
    score: titleScore(title, r.title),
  }));

  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];
  // Accept any result with score ≥ 1 (contains all query words)
  if (best.score === 0) return null;

  return best.slug;
}

// ─── Step 2: Episode list ─────────────────────────────────────────────────────

async function getEpisodes(animeSlug: string): Promise<{ id: string; numericEpId: string; number: number }[]> {
  const numericId = animeSlug.split('-').pop() ?? animeSlug;
  const client = hianimeClient(`${HIANIME_BASE}/watch/${animeSlug}`);
  const res = await client.get(`${HIANIME_BASE}/ajax/v2/episode/list/${numericId}`, {
    responseType: 'json',
  }) as any;

  const $ = load(res.body?.html ?? '');
  const episodes: { id: string; numericEpId: string; number: number }[] = [];

  $('div.detail-infor-content > div > a').each((_, el) => {
    const href = $(el).attr('href') ?? '';
    const numericEpId = href.split('?ep=')[1];
    const slug = href.split('/')[2]?.split('?')[0];
    const number = parseInt($(el).attr('data-number') ?? '0', 10);
    if (numericEpId && slug) {
      episodes.push({ id: `${slug}?ep=${numericEpId}`, numericEpId, number });
    }
  });

  return episodes;
}

// ─── Step 3: Server IDs ───────────────────────────────────────────────────────

async function getServerIds(numericEpId: string, animeSlug: string): Promise<string[]> {
  const referer = `${HIANIME_BASE}/watch/${animeSlug}?ep=${numericEpId}`;
  const client = hianimeClient(referer);
  const res = await client.get(
    `${HIANIME_BASE}/ajax/v2/episode/servers?episodeId=${numericEpId}`,
    { responseType: 'json' }
  ) as any;

  const html: string = res.body?.html ?? '';
  return [...html.matchAll(/data-id="([^"]+)"/g)].map((m) => m[1]);
}

// ─── Step 4: Embed URL ────────────────────────────────────────────────────────

async function getEmbedUrl(serverId: string, animeSlug: string, numericEpId: string): Promise<string | null> {
  const referer = `${HIANIME_BASE}/watch/${animeSlug}?ep=${numericEpId}`;
  const client = hianimeClient(referer);
  const res = await client.get(
    `${HIANIME_BASE}/ajax/v2/episode/sources?id=${serverId}`,
    { responseType: 'json' }
  ) as any;
  return res.body?.link ?? null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getStreamSources(
  animeTitle: string,
  episodeNumber: number
): Promise<StreamResult | null> {
  // 1. Find the best-matching HiAnime slug
  const animeSlug = await findBestSlug(animeTitle);
  if (!animeSlug) return null;

  // 2. Episode list
  const episodes = await getEpisodes(animeSlug);
  const episode = episodes.find((e) => e.number === episodeNumber);
  if (!episode) return null;

  const animeEpSlug = episode.id.split('?ep=')[0];

  // 3. Server IDs
  const serverIds = await getServerIds(episode.numericEpId, animeEpSlug);
  if (!serverIds.length) return null;

  // 4. Get embed URL from first available server
  for (const serverId of serverIds) {
    const embedUrl = await getEmbedUrl(serverId, animeEpSlug, episode.numericEpId);
    if (!embedUrl) continue;
    return { embedUrl, serverName: 'HiAnime' };
  }

  return null;
}

export async function searchAndGetEpisodes(
  animeTitle: string
): Promise<{ number: number; id: string }[] | null> {
  const slug = await findBestSlug(animeTitle);
  if (!slug) return null;
  const eps = await getEpisodes(slug);
  return eps.map((e) => ({ number: e.number, id: e.id }));
}
