import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete('mal_token');
  cookieStore.delete('mal_refresh_token');

  return NextResponse.redirect(new URL('/', request.url));
}
