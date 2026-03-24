import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { MAL_TOKEN_URL } from '@/lib/mal-oauth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided.' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get('mal_code_verifier')?.value;

  if (!codeVerifier) {
    return NextResponse.json({ error: 'Code verifier not found or expired. Please try logging in again.' }, { status: 400 });
  }

  const clientId = process.env.MAL_CLIENT_ID;
  const clientSecret = process.env.MAL_CLIENT_SECRET;

  if (!clientId) {
    return NextResponse.json({ error: 'MAL_CLIENT_ID is not configured.' }, { status: 500 });
  }

  // This redirect_uri must exactly match what MAL has registered (the URL MAL redirected the user to)
  const redirectUri = 'http://localhost:3000/api/auth/callback/mal';

  const params = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    code_verifier: codeVerifier,
    redirect_uri: redirectUri,
  });

  if (clientSecret) {
    params.append('client_secret', clientSecret);
  }

  try {
    const response = await fetch(MAL_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error('MAL Token Error:', errData);
      return NextResponse.redirect(new URL('/?error=token_fetch_failed', request.url));
    }

    const data = await response.json();
    const { access_token, refresh_token, expires_in } = data;

    // Save tokens in HttpOnly cookies
    cookieStore.set('mal_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: expires_in,
    });

    if (refresh_token) {
      cookieStore.set('mal_refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    // Clean up the one-time code verifier
    cookieStore.delete('mal_code_verifier');

    return NextResponse.redirect(new URL('/', request.url));
  } catch (err) {
    console.error('Error during token exchange:', err);
    return NextResponse.redirect(new URL('/?error=server_error', request.url));
  }
}
