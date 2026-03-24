import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { MAL_API_URL } from '@/lib/mal-oauth';

export async function PUT(request: NextRequest) {
  try {
    const { animeId, score } = await request.json();
    
    if (!animeId || score === undefined) {
      return NextResponse.json({ error: 'Missing requirements' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('mal_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated with MAL' }, { status: 401 });
    }

    const params = new URLSearchParams({
      score: score.toString(),
    });

    const res = await fetch(`${MAL_API_URL}/anime/${animeId}/my_list_status`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('MAL Rating update failed:', err);
      return NextResponse.json({ error: 'Failed to update MAL rating' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
