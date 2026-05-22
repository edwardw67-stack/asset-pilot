import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get('email') ?? '').trim();
  const requestUrl = new URL(request.url);

  if (!email) {
    return NextResponse.redirect(new URL('/auth/login?error=missing-email', requestUrl.origin));
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${requestUrl.origin}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin));
  }

  return NextResponse.redirect(new URL('/auth/check-email', requestUrl.origin));
}
