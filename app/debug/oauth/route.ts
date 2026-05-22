import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

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

  const oauthUrl = new URL(data.url);

  return NextResponse.json({
    ok: true,
    appOrigin: requestUrl.origin,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
    googleClientId: oauthUrl.searchParams.get('client_id'),
    googleRedirectUri: oauthUrl.searchParams.get('redirect_uri'),
    googleResponseType: oauthUrl.searchParams.get('response_type'),
    googleScope: oauthUrl.searchParams.get('scope'),
  });
}
