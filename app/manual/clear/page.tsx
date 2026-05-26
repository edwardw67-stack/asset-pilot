'use client';

import { useEffect, useState } from 'react';

const key = 'asset-pilot-manual-v1';

export default function ClearManualPage() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    window.localStorage.removeItem(key);
    setDone(true);
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: '#020617', color: '#e5e7eb', padding: 28 }}>
      <section style={{ maxWidth: 760, margin: '0 auto', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 24, padding: 28 }}>
        <p style={{ color: '#94a3b8' }}>Asset Pilot</p>
        <h1 style={{ fontSize: 42, margin: '8px 0 18px' }}>本機資料已清空</h1>
        <p style={{ color: '#94a3b8', lineHeight: 1.8 }}>
          {done ? '已清掉 /manual 的 localStorage 持倉與現金資料。現在可以回手動資產追蹤頁重新匯入。' : '清除中...'}
        </p>
        <a href="/manual" style={{ display: 'inline-block', marginTop: 18, color: '#111827', background: '#f59e0b', padding: '12px 16px', borderRadius: 12, fontWeight: 800, textDecoration: 'none' }}>回 /manual</a>
      </section>
    </main>
  );
}
