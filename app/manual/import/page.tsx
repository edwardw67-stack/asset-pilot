'use client';

import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { isFirstradeCsv, parseFirstradeCsv } from '../firstrade';

type Holding = { id: string; market: 'TW' | 'US'; ticker: string; name: string; qty: number; cost: number; price: number; atr: number; multiple: number };
type Cash = { id: string; currency: 'TWD' | 'USD'; label: string; amount: number };
type Data = { holdings: Holding[]; cash: Cash[]; usdTwd: number };

const key = 'asset-pilot-manual-v1';
const empty: Data = { holdings: [], cash: [], usdTwd: 31.2 };

function readData(): Data {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    return empty;
  }
}

function saveData(data: Data) {
  window.localStorage.setItem(key, JSON.stringify(data));
}

function fmt(v: number) {
  return new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 2 }).format(v);
}

export default function ImportPage() {
  const [fileName, setFileName] = useState('');
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState('');
  const [imported, setImported] = useState<{ holdings: Holding[]; cash: Cash[] }>({ holdings: [], cash: [] });
  const [busy, setBusy] = useState(false);

  const summary = useMemo(() => {
    const qty = imported.holdings.reduce((a, h) => a + h.qty, 0);
    return { count: imported.holdings.length, qty, cash: imported.cash.reduce((a, c) => a + c.amount, 0) };
  }, [imported]);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setMessage('沒有選到檔案。');
      return;
    }

    setBusy(true);
    setFileName(file.name);
    setMessage(`讀取中：${file.name}`);

    try {
      const text = await file.text();
      setPreview(text.slice(0, 1200));

      if (!isFirstradeCsv(text)) {
        setMessage('這不是 Firstrade Account History CSV。請確認第一列有 Symbol,Quantity,Price,Action,Description,TradeDate,Amount,RecordType。');
        setBusy(false);
        return;
      }

      const parsed = parseFirstradeCsv(text);
      const current = readData();
      const next = {
        ...current,
        holdings: [...parsed.holdings, ...current.holdings],
        cash: [...parsed.cash, ...current.cash],
      };
      saveData(next);
      setImported({ holdings: parsed.holdings, cash: parsed.cash });
      setMessage(`Firstrade 匯入完成：讀取 ${parsed.summary.totalRows} 列，買進 ${parsed.summary.buyRows} 列，賣出 ${parsed.summary.sellRows} 列，股息再投資 ${parsed.summary.reinvestRows} 列；產生 ${parsed.summary.holdingsCount} 筆持倉，估算現金 USD ${parsed.summary.estimatedCashUsd}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '匯入失敗');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#020617', color: '#e5e7eb', padding: 28 }}>
      <section style={{ maxWidth: 1060, margin: '0 auto' }}>
        <p style={{ color: '#94a3b8' }}>Asset Pilot</p>
        <h1 style={{ fontSize: 42, margin: '8px 0 18px' }}>Firstrade CSV 匯入</h1>
        <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>這頁專門吃 Firstrade Account History CSV。選檔後會直接讀取、轉成目前持倉，並存到 /manual 的本機資料。</p>

        <section style={panel}>
          <h2>選擇 Firstrade CSV</h2>
          <input type="file" accept=".csv,text/csv" onChange={handleFile} style={input} />
          <p style={{ color: '#94a3b8' }}>目前選擇：{fileName || '尚未選擇檔案'}</p>
          {busy ? <p style={{ color: '#fbbf24' }}>處理中...</p> : null}
          {message ? <div style={notice}>{message}</div> : null}
        </section>

        <section style={panel}>
          <h2>匯入摘要</h2>
          <p>持倉筆數：{summary.count}</p>
          <p>總股數加總：{fmt(summary.qty)}</p>
          <p>估算 USD 現金：{fmt(summary.cash)}</p>
          <a href="/manual" style={{ color: '#fbbf24' }}>回手動資產追蹤</a>
        </section>

        {imported.holdings.length > 0 ? (
          <section style={panel}>
            <h2>匯入持倉預覽</h2>
            {imported.holdings.slice(0, 30).map((h) => (
              <div key={h.id} style={row}>
                <b>{h.ticker}</b>
                <span>{h.name}</span>
                <span>股數 {fmt(h.qty)} / 成本 {fmt(h.cost)}</span>
              </div>
            ))}
          </section>
        ) : null}

        {preview ? (
          <section style={panel}>
            <h2>原始檔前段預覽</h2>
            <pre style={{ whiteSpace: 'pre-wrap', color: '#cbd5e1', overflowX: 'auto' }}>{preview}</pre>
          </section>
        ) : null}
      </section>
    </main>
  );
}

const panel = { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 22, padding: 20, marginTop: 14 };
const input = { width: '100%', padding: 12, borderRadius: 12, border: '1px solid #334155', background: '#020617', color: '#e5e7eb' };
const notice = { marginTop: 14, padding: 12, borderRadius: 12, border: '1px solid #14532d', background: '#052e16', color: '#bbf7d0', lineHeight: 1.6 };
const row = { display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 12, borderTop: '1px solid #1e293b', padding: '10px 0' };
