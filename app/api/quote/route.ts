import { NextResponse } from 'next/server';

type YahooChart = {
  chart?: {
    result?: Array<{
      meta?: {
        symbol?: string;
        regularMarketPrice?: number;
        previousClose?: number;
        currency?: string;
      };
    }>;
    error?: { description?: string } | null;
  };
};

function yahooSymbols(market: string, ticker: string) {
  const clean = ticker.trim().toUpperCase();
  if (market === 'TW') return [`${clean}.TW`, `${clean}.TWO`];
  return [clean];
}

async function fetchYahoo(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1m`;
  const response = await fetch(url, { next: { revalidate: 60 } });
  if (!response.ok) return null;
  const data = (await response.json()) as YahooChart;
  const meta = data.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice ?? meta?.previousClose;
  if (!price || !Number.isFinite(price)) return null;
  return {
    symbol: meta?.symbol ?? symbol,
    price,
    currency: meta?.currency ?? (symbol.endsWith('.TW') || symbol.endsWith('.TWO') ? 'TWD' : 'USD'),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const market = url.searchParams.get('market') ?? 'US';
  const ticker = url.searchParams.get('ticker') ?? '';

  if (!ticker.trim()) {
    return NextResponse.json({ ok: false, error: 'missing ticker' }, { status: 400 });
  }

  for (const symbol of yahooSymbols(market, ticker)) {
    const quote = await fetchYahoo(symbol);
    if (quote) {
      return NextResponse.json({ ok: true, market, ticker, ...quote });
    }
  }

  return NextResponse.json({ ok: false, market, ticker, error: 'quote not found' }, { status: 404 });
}
