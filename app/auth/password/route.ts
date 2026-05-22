import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

function redirectGet(url: URL) {
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '').trim();
  const intent = String(formData.get('intent') ?? 'sign-in');
  const requestUrl = new URL(request.url);

  if (!email || !password) {
    return redirectGet(new URL('/auth/login?error=missing-email-or-password', requestUrl.origin));
  }

  const supabase = await createSupabaseServerClient();

  if (intent === 'sign-up') {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${requestUrl.origin}/auth/callback`,
      },
    });

    if (error) {
      return redirectGet(new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin));
    }

    return redirectGet(new URL('/auth/login?message=account-created-try-sign-in', requestUrl.origin));
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirectGet(new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin));
  }

  return redirectGet(new URL('/', requestUrl.origin));
}
