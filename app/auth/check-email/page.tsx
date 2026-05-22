export default function CheckEmailPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#020617', color: '#e5e7eb', display: 'grid', placeItems: 'center', padding: 24 }}>
      <section style={{ width: '100%', maxWidth: 460, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 24, padding: 28 }}>
        <p style={{ margin: 0, color: '#94a3b8' }}>Asset Pilot</p>
        <h1 style={{ margin: '10px 0 12px', fontSize: 34 }}>去信箱收信</h1>
        <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>登入連結已寄出。點信裡的連結後，會回到 Asset Pilot。</p>
        <a href="/auth/login" style={{ display: 'block', marginTop: 20, color: '#fbbf24', textAlign: 'center' }}>回登入頁</a>
      </section>
    </main>
  );
}
