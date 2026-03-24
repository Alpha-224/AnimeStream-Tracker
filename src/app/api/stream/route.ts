import { NextRequest, NextResponse } from 'next/server';
import { getStreamSources } from '@/lib/hianime-scraper';

/**
 * GET /api/stream?title=<anime title>&episode=<episode number>
 *
 * Returns the MegaCloud embed iframe URL for the requested episode.
 * Uses a custom scraper (got + http2 for TLS fingerprinting) to call
 * HiAnime's AJAX endpoints server-side, then returns the embed URL
 * to the client for iframe rendering.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title');
  const episode = searchParams.get('episode');

  if (!title || !episode) {
    return NextResponse.json({ error: 'title and episode params are required' }, { status: 400 });
  }

  const episodeNum = parseInt(episode, 10);
  if (isNaN(episodeNum)) {
    return NextResponse.json({ error: 'episode must be a number' }, { status: 400 });
  }

  try {
    const result = await getStreamSources(title, episodeNum);

    if (!result || !result.embedUrl) {
      return NextResponse.json(
        { error: 'No stream source found for this episode' },
        { status: 404 }
      );
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store, no-cache' },
    });
  } catch (err: any) {
    console.error('[Stream API] Error:', err.message);
    return NextResponse.json(
      { error: 'Scraper failed', detail: err.message },
      { status: 500 }
    );
  }
}
