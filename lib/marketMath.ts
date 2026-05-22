export type Bar = {
  date: string;
  high: number;
  low: number;
  close: number;
};

export function dailyRange(today: Bar, previous?: Bar): number {
  if (!previous) return today.high - today.low;
  const a = today.high - today.low;
  const b = Math.abs(today.high - previous.close);
  const c = Math.abs(today.low - previous.close);
  return Math.max(a, b, c);
}

export function averageRange(bars: Bar[], days: 5 | 10 | 20): number | null {
  if (bars.length < days + 1) return null;
  const sorted = [...bars].sort((a, b) => a.date.localeCompare(b.date));
  const values = sorted.map((bar, index) => dailyRange(bar, sorted[index - 1]));
  const recent = values.slice(-days);
  const total = recent.reduce((sum, value) => sum + value, 0);
  return Number((total / days).toFixed(4));
}

export function volatilityMultiple(percent: number): number {
  if (percent < 0.02) return 1.8;
  if (percent < 0.04) return 2.3;
  if (percent < 0.07) return 3.0;
  return 4.0;
}

export function trailingPrice(currentPrice: number, average: number, manualMultiple?: number | null): number {
  const percent = average / currentPrice;
  const multiple = manualMultiple ?? volatilityMultiple(percent);
  return Number((currentPrice - average * multiple).toFixed(2));
}
