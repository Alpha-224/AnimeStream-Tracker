import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateCodeVerifier, MAL_AUTH_URL } from '@/lib/mal-oauth';

export async function GET() {
  const codeVerifier = generateCodeVerifier();
  const clientId = process.env.MAL_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ error: 'MAL_CLIENT_ID is not configured.' }, { status: 500 });
  }

  // Set the code verifier in an HttpOnly cookie to survive the redirect loop
  const cookieStore = await cookies();
  cookieStore.set('mal_code_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 15, // 15 minutes
  });

  // This must exactly match the redirect URI registered in your MAL API settings
  const redirectUri = 'http://localhost:3000/api/auth/callback/mal';

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    code_challenge: codeVerifier,
    code_challenge_method: 'plain',
    redirect_uri: redirectUri,
    state: 'csrf_protection',
  });

  const redirectUrl = `${MAL_AUTH_URL}?${params.toString()}`;

  return NextResponse.redirect(redirectUrl);
}
