export default function LoginPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#020617', color: '#e5e7eb', display: 'grid', placeItems: 'center', padding: 24 }}>
      <section style={{ width: '100%', maxWidth: 460, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 24, padding: 28 }}>
        <p style={{ margin: 0, color: '#94a3b8' }}>Asset Pilot</p>
        <h1 style={{ margin: '10px 0 12px', fontSize: 34 }}>登入資產儀表板</h1>
        <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>先用 email magic link 登入。Google 登入暫時保留，晚點再處理 redirect mismatch。</p>

        <form action="/auth/email" method="post" style={{ display: 'grid', gap: 12, marginTop: 24 }}>
          <label htmlFor="email" style={{ color: '#cbd5e1', fontWeight: 700 }}>Email</label>
          <input id="email" name="email" type="email" required placeholder="edwardw67@gmail.com" style={{ padding: '14px 16px', borderRadius: 14, border: '1px solid #334155', background: '#020617', color: '#e5e7eb', fontSize: 16 }} />
          <button type="submit" style={{ border: 0, cursor: 'pointer', marginTop: 8, padding: '14px 16px', borderRadius: 14, background: '#f59e0b', color: '#111827', fontWeight: 700, fontSize: 16 }}>寄登入連結</button>
        </form>

        <a href="/auth/google" style={{ display: 'block', marginTop: 18, color: '#93c5fd', textAlign: 'center' }}>改用 Google 登入</a>
        <a href="/" style={{ display: 'block', marginTop: 12, color: '#fbbf24', textAlign: 'center' }}>回 Dashboard</a>
      </section>
    </main>
  );
}
