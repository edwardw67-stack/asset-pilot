type LoginPageProps = {
  searchParams?: Promise<{ error?: string; message?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = params?.error;
  const message = params?.message;

  return (
    <main style={{ minHeight: '100vh', background: '#020617', color: '#e5e7eb', display: 'grid', placeItems: 'center', padding: 24 }}>
      <section style={{ width: '100%', maxWidth: 500, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 24, padding: 28 }}>
        <p style={{ margin: 0, color: '#94a3b8' }}>Asset Pilot</p>
        <h1 style={{ margin: '10px 0 12px', fontSize: 34 }}>登入資產儀表板</h1>
        <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>Email magic link 被 Supabase 限流時，先用帳號密碼登入。Google 登入暫時保留，晚點再處理 redirect mismatch。</p>

        {error ? (
          <div style={{ marginTop: 16, padding: 14, borderRadius: 14, border: '1px solid #7f1d1d', background: '#450a0a', color: '#fecaca', lineHeight: 1.6 }}>
            {decodeURIComponent(error)}
          </div>
        ) : null}

        {message ? (
          <div style={{ marginTop: 16, padding: 14, borderRadius: 14, border: '1px solid #14532d', background: '#052e16', color: '#bbf7d0', lineHeight: 1.6 }}>
            {decodeURIComponent(message)}
          </div>
        ) : null}

        <form action="/auth/password" method="post" style={{ display: 'grid', gap: 12, marginTop: 24 }}>
          <label htmlFor="email" style={{ color: '#cbd5e1', fontWeight: 700 }}>Email</label>
          <input id="email" name="email" type="email" required defaultValue="edwardw67@gmail.com" style={{ padding: '14px 16px', borderRadius: 14, border: '1px solid #334155', background: '#020617', color: '#e5e7eb', fontSize: 16 }} />

          <label htmlFor="password" style={{ color: '#cbd5e1', fontWeight: 700, marginTop: 8 }}>Password</label>
          <input id="password" name="password" type="password" required minLength={6} placeholder="至少 6 碼" style={{ padding: '14px 16px', borderRadius: 14, border: '1px solid #334155', background: '#020617', color: '#e5e7eb', fontSize: 16 }} />

          <button name="intent" value="sign-in" type="submit" style={{ border: 0, cursor: 'pointer', marginTop: 8, padding: '14px 16px', borderRadius: 14, background: '#f59e0b', color: '#111827', fontWeight: 700, fontSize: 16 }}>登入</button>
          <button name="intent" value="sign-up" type="submit" style={{ border: '1px solid #334155', cursor: 'pointer', padding: '14px 16px', borderRadius: 14, background: '#111827', color: '#e5e7eb', fontWeight: 700, fontSize: 16 }}>建立帳號</button>
        </form>

        <form action="/auth/email" method="post" style={{ display: 'grid', gap: 12, marginTop: 18 }}>
          <input name="email" type="hidden" value="edwardw67@gmail.com" />
          <button type="submit" style={{ border: '1px solid #334155', cursor: 'pointer', padding: '12px 14px', borderRadius: 14, background: 'transparent', color: '#93c5fd', fontWeight: 700 }}>寄 magic link（目前可能限流）</button>
        </form>

        <a href="/auth/google" style={{ display: 'block', marginTop: 18, color: '#93c5fd', textAlign: 'center' }}>改用 Google 登入</a>
        <a href="/" style={{ display: 'block', marginTop: 12, color: '#fbbf24', textAlign: 'center' }}>回 Dashboard</a>
      </section>
    </main>
  );
}
