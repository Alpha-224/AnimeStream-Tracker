import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/search?q=<query>&page=<page>
 * Proxies to the Jikan API search endpoint.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  const page = searchParams.get('page') ?? '1';

  if (!q.trim()) {
    return NextResponse.json({ data: [] });
  }

  try {
    const res = await fetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&page=${page}&limit=20&sfw=true`,
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message, data: [] }, { status: 500 });
  }
}
