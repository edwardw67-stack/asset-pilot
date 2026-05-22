import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

function pickGoogleParams(location: string | null) {
  if (!location) {
    return {
      googleLocation: null,
      googleClientId: null,
      googleRedirectUri: null,
      googleResponseType: null,
      googleScope: null,
    };
  }

  const url = new URL(location);

  return {
    googleLocation: location,
    googleClientId: url.searchParams.get('client_id'),
    googleRedirectUri: url.searchParams.get('redirect_uri'),
    googleResponseType: url.searchParams.get('response_type'),
    googleScope: url.searchParams.get('scope'),
  };
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${requestUrl.origin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    return NextResponse.json({
      ok: false,
      error: error?.message ?? 'No OAuth URL returned',
      appOrigin: requestUrl.origin,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
    });
  }

  let googleLocation: string | null = null;
  let authorizeStatus: number | null = null;
  let authorizeError: string | null = null;

  try {
    const response = await fetch(data.url, { redirect: 'manual' });
    authorizeStatus = response.status;
    googleLocation = response.headers.get('location');
  } catch (err) {
    authorizeError = err instanceof Error ? err.message : 'Unknown fetch error';
  }

  return NextResponse.json({
    ok: true,
    appOrigin: requestUrl.origin,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
    supabaseAuthorizeUrl: data.url,
    authorizeStatus,
    authorizeError,
    ...pickGoogleParams(googleLocation),
  });
}
