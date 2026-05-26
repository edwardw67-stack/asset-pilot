'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { isFirstradeCsv, parseFirstradeCsv } from './firstrade';

type Holding = { id: string; market: 'TW' | 'US'; ticker: string; name: string; qty: number; cost: number; price: number; atr: number; multiple: number };
type Cash = { id: string; currency: 'TWD' | 'USD'; label: string; amount: number };
type Data = { holdings: Holding[]; cash: Cash[]; usdTwd: number };

type QuoteResult = { ok: boolean; price?: number; symbol?: string; error?: string };

const key = 'asset-pilot-manual-v1';
const empty: Data = { holdings: [], cash: [], usdTwd: 31.2 };

function n(v: FormDataEntryValue | string | null | undefined) { const x = Number(String(v ?? '').replace(/,/g, '')); return Number.isFinite(x) ? x : 0; }
function s(v: FormDataEntryValue | string | null | undefined) { return String(v ?? '').trim(); }
function id() { return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function fmt(v: number) { return new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 0 }).format(v); }
function twd(v: number, marketOrCurrency: string, rate: number) { return marketOrCurrency === 'US' || marketOrCurrency === 'USD' ? v * rate : v; }

function splitCsv(line: string) {
  const out: string[] = [];
  let cur = '';
  let quote = false;
  for (const ch of line) {
    if (ch === '"') { quote = !quote; continue; }
    if (ch === ',' && !quote) { out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function parseImport(text: string) {
  const lines = text.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  if (lines.length < 2) return { holdings: [] as Holding[], cash: [] as Cash[], errors: ['CSV 至少要有標題列與資料列'] };
  const headers = splitCsv(lines[0]).map(x => x.toLowerCase());
  const holdings: Holding[] = [];
  const cash: Cash[] = [];
  const errors: string[] = [];

  lines.slice(1).forEach((line, idx) => {
    const cells = splitCsv(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = cells[i] ?? ''; });
    const first = (row.market || row.type || cells[0] || '').toUpperCase();

    if (first === 'CASH') {
      cash.push({ id: id(), currency: (row.currency || cells[1] || 'TWD').toUpperCase() as 'TWD' | 'USD', label: row.label || row.account || cells[2] || 'Cash', amount: n(row.amount || cells[3]) });
      return;
    }

    const market = (row.market || cells[0] || '').toUpperCase() as 'TW' | 'US';
    if (market !== 'TW' && market !== 'US') { errors.push(`第 ${idx + 2} 列 market 必須是 TW / US / cash`); return; }
    const ticker = (row.ticker || row.symbol || cells[1] || '').toUpperCase();
    if (!ticker) { errors.push(`第 ${idx + 2} 列缺 ticker`); return; }
    holdings.push({ id: id(), market, ticker, name: row.name || cells[2] || ticker, qty: n(row.qty || row.quantity || cells[3]), cost: n(row.cost || row.averagecost || row.avg_cost || cells[4]), price: n(row.price || row.latestprice || cells[5]), atr: n(row.atr || cells[6]), multiple: n(row.multiple || cells[7]) || 2.3 });
  });

  return { holdings, cash, errors };
}

export default function ManualPage() {
  const [data, setData] = useState<Data>(empty);
  const [ready, setReady] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [message, setMessage] = useState('');
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(key);
    setData(raw ? { ...empty, ...JSON.parse(raw) } : empty);
    setReady(true);
  }, []);

  useEffect(() => { if (ready) localStorage.setItem(key, JSON.stringify(data)); }, [data, ready]);

  const sum = useMemo(() => {
    const cost = data.holdings.reduce((a, h) => a + twd(h.qty * h.cost, h.market, data.usdTwd), 0);
    const value = data.holdings.reduce((a, h) => a + twd(h.qty * h.price, h.market, data.usdTwd), 0);
    const cash = data.cash.reduce((a, c) => a + twd(c.amount, c.currency, data.usdTwd), 0);
    return { cost, value, cash, total: value + cash, pnl: value - cost };
  }, [data]);

  function addHolding(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const market = s(f.get('market')) as 'TW' | 'US';
    const item: Holding = { id: id(), market, ticker: s(f.get('ticker')).toUpperCase(), name: s(f.get('name')), qty: n(f.get('qty')), cost: n(f.get('cost')), price: n(f.get('price')), atr: n(f.get('atr')), multiple: n(f.get('multiple')) || 2.3 };
    setData(d => ({ ...d, holdings: [item, ...d.holdings] }));
    e.currentTarget.reset();
  }

  function addCash(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const item: Cash = { id: id(), currency: s(f.get('currency')) as 'TWD' | 'USD', label: s(f.get('label')), amount: n(f.get('amount')) };
    setData(d => ({ ...d, cash: [item, ...d.cash] }));
    e.currentTarget.reset();
  }

  function resetAll() {
    if (!window.confirm('確定要刪除所有持倉與現金？這會清掉目前瀏覽器的本機資料。')) return;
    setData(empty);
    setCsvText('');
    setMessage('已清空所有持倉與現金。');
  }

  function importCsv(text: string) {
    if (!text.trim()) {
      setMessage('沒有可匯入的內容');
      return;
    }

    if (isFirstradeCsv(text)) {
      const parsed = parseFirstradeCsv(text);
      setData(d => ({ ...d, holdings: [...parsed.holdings, ...d.holdings], cash: [...parsed.cash, ...d.cash] }));
      setMessage(`Firstrade 匯入完成：讀取 ${parsed.summary.totalRows} 列，買進 ${parsed.summary.buyRows} 列，賣出 ${parsed.summary.sellRows} 列，股息再投資 ${parsed.summary.reinvestRows} 列；產生 ${parsed.summary.holdingsCount} 筆持倉，估算現金 USD ${parsed.summary.estimatedCashUsd}`);
      return;
    }

    const parsed = parseImport(text);
    setData(d => ({ ...d, holdings: [...parsed.holdings, ...d.holdings], cash: [...parsed.cash, ...d.cash] }));
    setMessage(`匯入 ${parsed.holdings.length} 筆持倉、${parsed.cash.length} 筆現金${parsed.errors.length ? `；錯誤：${parsed.errors.join('；')}` : ''}`);
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    importCsv(text);
  }

  async function refreshQuotes() {
    setLoadingQuotes(true);
    const updated: Holding[] = [];
    let ok = 0;
    let fail = 0;
    for (const h of data.holdings) {
      try {
        const res = await fetch(`/api/quote?market=${h.market}&ticker=${encodeURIComponent(h.ticker)}`);
        const q = await res.json() as QuoteResult;
        if (q.ok && q.price) { updated.push({ ...h, price: q.price }); ok += 1; }
        else { updated.push(h); fail += 1; }
      } catch {
        updated.push(h); fail += 1;
      }
    }
    setData(d => ({ ...d, holdings: updated }));
    setMessage(`股價更新完成：成功 ${ok}，失敗 ${fail}`);
    setLoadingQuotes(false);
  }

  if (!ready) return null;

  return (
    <main style={{ minHeight: '100vh', background: '#020617', color: '#e5e7eb', padding: 28 }}>
      <section style={{ maxWidth: 1120, margin: '0 auto' }}>
        <p style={{ color: '#94a3b8' }}>Asset Pilot</p>
        <h1 style={{ fontSize: 42, margin: '8px 0 18px' }}>手動資產追蹤</h1>
        <p style={{ color: '#94a3b8' }}>先用本機版，不卡登入。可以手動 key in、CSV 匯入，並一鍵更新目前股價。Firstrade 交易流水帳 CSV 會自動轉成目前持倉。</p>
        {message ? <div style={notice}>{message}</div> : null}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 20 }}>
          <Box label="總資產" value={fmt(sum.total)} />
          <Box label="持倉市值" value={fmt(sum.value)} />
          <Box label="現金" value={fmt(sum.cash)} />
          <Box label="未實現損益" value={`${sum.pnl >= 0 ? '+' : ''}${fmt(sum.pnl)}`} />
        </div>

        <section style={panel}>
          <h2>匯率與自動股價</h2>
          <input value={data.usdTwd} onChange={e => setData(d => ({ ...d, usdTwd: Number(e.target.value) || 0 }))} type="number" step="0.01" style={input} />
          <button onClick={refreshQuotes} disabled={loadingQuotes} style={{ ...primary, marginTop: 12, marginRight: 10 }}>{loadingQuotes ? '更新中...' : '一鍵更新目前股價'}</button>
          <button onClick={resetAll} style={{ ...danger, marginTop: 12 }}>全部清空</button>
        </section>

        <section style={panel}>
          <h2>CSV 匯入</h2>
          <p style={{ color: '#94a3b8' }}>支援 Firstrade 原始 CSV。也支援簡易格式：market,ticker,name,qty,cost,price,atr,multiple。現金列用 cash,currency,label,amount。</p>
          <input type="file" accept=".csv,text/csv" onChange={onFile} style={input} />
          <textarea value={csvText} onChange={e => setCsvText(e.target.value)} placeholder="貼上 CSV" rows={6} style={{ ...input, marginTop: 10 }} />
          <button onClick={() => importCsv(csvText)} style={{ ...primary, marginTop: 10 }}>貼上內容匯入</button>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <section style={panel}>
            <h2>新增持倉</h2>
            <form onSubmit={addHolding} style={form}>
              <select name="market" style={input} defaultValue="TW"><option value="TW">台股</option><option value="US">美股</option></select>
              <input name="ticker" placeholder="代號" required style={input} />
              <input name="name" placeholder="股名" required style={input} />
              <input name="qty" placeholder="股數" type="number" step="0.0001" required style={input} />
              <input name="cost" placeholder="成本均價" type="number" step="0.0001" required style={input} />
              <input name="price" placeholder="目前股價" type="number" step="0.0001" required style={input} />
              <input name="atr" placeholder="ATR，可空白" type="number" step="0.0001" style={input} />
              <input name="multiple" placeholder="ATR 倍數，預設 2.3" type="number" step="0.1" style={input} />
              <button style={primary}>新增持倉</button>
            </form>
          </section>

          <section style={panel}>
            <h2>新增現金</h2>
            <form onSubmit={addCash} style={form}>
              <input name="label" placeholder="帳戶，例如 永豐現金" required style={input} />
              <select name="currency" style={input} defaultValue="TWD"><option value="TWD">TWD</option><option value="USD">USD</option></select>
              <input name="amount" placeholder="金額" type="number" step="0.01" required style={input} />
              <button style={primary}>新增現金</button>
            </form>
          </section>
        </div>

        <section style={panel}>
          <h2>持倉</h2>
          {data.holdings.map(h => {
            const value = twd(h.qty * h.price, h.market, data.usdTwd);
            const pnl = twd(h.qty * (h.price - h.cost), h.market, data.usdTwd);
            const stop = h.atr > 0 ? h.price - h.atr * h.multiple : null;
            return <div key={h.id} style={row}><b>{h.market} {h.ticker} {h.name}</b><span>股數 {h.qty} / 成本 {h.cost} / 現價 {h.price} / 市值 {fmt(value)} / 損益 {fmt(pnl)} / ATR 停利 {stop ? stop.toFixed(2) : '-'}</span><button onClick={() => setData(d => ({ ...d, holdings: d.holdings.filter(x => x.id !== h.id) }))} style={danger}>刪除</button></div>;
          })}
        </section>

        <section style={panel}>
          <h2>現金</h2>
          {data.cash.map(c => <div key={c.id} style={row}><b>{c.label}</b><span>{c.currency} {fmt(c.amount)}</span><button onClick={() => setData(d => ({ ...d, cash: d.cash.filter(x => x.id !== c.id) }))} style={danger}>刪除</button></div>)}
        </section>
      </section>
    </main>
  );
}

function Box({ label, value }: { label: string; value: string }) { return <section style={panel}><p style={{ color: '#94a3b8', margin: 0 }}>{label}</p><strong style={{ fontSize: 28 }}>{value}</strong></section>; }

const panel = { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 22, padding: 20, marginTop: 14 };
const input = { width: '100%', padding: 12, borderRadius: 12, border: '1px solid #334155', background: '#020617', color: '#e5e7eb' };
const form = { display: 'grid', gap: 10 };
const primary = { border: 0, borderRadius: 12, padding: 12, background: '#f59e0b', color: '#111827', fontWeight: 800 };
const danger = { border: '1px solid #7f1d1d', borderRadius: 8, padding: '6px 10px', background: '#450a0a', color: '#fecaca' };
const row = { display: 'grid', gridTemplateColumns: '1.2fr 2fr auto', gap: 12, alignItems: 'center', borderTop: '1px solid #1e293b', padding: '12px 0' };
const notice = { marginTop: 14, padding: 12, borderRadius: 12, border: '1px solid #14532d', background: '#052e16', color: '#bbf7d0' };
