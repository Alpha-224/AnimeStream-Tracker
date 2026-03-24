import { NextRequest, NextResponse } from 'next/server';
import got from 'got';
import { load } from 'cheerio';

/**
 * GET /api/recommendations
 *
 * 1. Scrapes MAL recent anime recommendations page for anime IDs
 * 2. Enriches each ID via Jikan API to get proper images, score, type
 * 3. Returns up to 40 unique anime
 */
export async function GET(_req: NextRequest) {
  try {
    // ── Step 1: Scrape MAL recommendations page ─────────────────────────────
    const res = await got.extend({
      http2: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: { request: 12000 },
    }).get('https://myanimelist.net/recommendations.php?s=recentrecs&t=anime');

    const $ = load(res.body);
    const seenIds = new Set<number>();
    const malIds: number[] = [];

    // Extract every /anime/<id>/ link
    $('a[href*="/anime/"]').each((_, el) => {
      const href = $(el).attr('href') ?? '';
      const match = href.match(/\/anime\/(\d+)\//);
      if (!match) return;
      const id = parseInt(match[1], 10);
      if (!seenIds.has(id)) {
        seenIds.add(id);
        malIds.push(id);
      }
    });

    if (!malIds.length) {
      return NextResponse.json({ data: [] });
    }

    // ── Step 2: Enrich via Jikan in small parallel batches ──────────────────
    // Jikan has a 3 req/s rate limit, so batch with delays
    const BATCH_SIZE = 5;
    const DELAY_MS = 400;
    const enriched: any[] = [];

    for (let i = 0; i < Math.min(malIds.length, 60); i += BATCH_SIZE) {
      const batch = malIds.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((id) =>
          fetch(`https://api.jikan.moe/v4/anime/${id}`, {
            next: { revalidate: 3600 },
          }).then((r) => (r.ok ? r.json() : null))
        )
      );

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value?.data) {
          const a = result.value.data;
          const imageUrl =
            a.images?.webp?.image_url ||
            a.images?.jpg?.image_url ||
            '';
          if (imageUrl) {
            enriched.push({
              mal_id: a.mal_id,
              title: a.title_english || a.title,
              imageUrl,
              score: a.score ?? null,
              type: a.type ?? 'TV',
              episodes: a.episodes ?? null,
            });
          }
        }
      }

      // Rate-limit delay between batches
      if (i + BATCH_SIZE < Math.min(malIds.length, 60)) {
        await new Promise((r) => setTimeout(r, DELAY_MS));
      }
    }

    return NextResponse.json({ data: enriched.slice(0, 40) });
  } catch (err: any) {
    console.error('[Recommendations API]', err.message);
    return NextResponse.json({ error: err.message, data: [] }, { status: 500 });
  }
}
