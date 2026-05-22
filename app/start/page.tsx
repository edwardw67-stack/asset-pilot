export default function StartPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#020617', color: '#e5e7eb', padding: 32 }}>
      <section style={{ maxWidth: 900, margin: '0 auto' }}>
        <p style={{ color: '#94a3b8' }}>Asset Pilot</p>
        <h1>免登入模式</h1>
        <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>
          Auth 設定先暫停。這裡先做可用的資產追蹤流程，資料暫時放在瀏覽器本機，不寫入 Supabase。
        </p>
        <a href="/" style={{ color: '#fbbf24' }}>回 Dashboard</a>
      </section>
    </main>
  );
}
