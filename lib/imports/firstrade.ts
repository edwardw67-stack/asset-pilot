export type FirstradeTrade = {
  symbol: string;
  tradeDate: string;
  action: string;
  quantity: number;
  price: number;
  amount: number;
  commission: number;
  fee: number;
};

function toNumber(value: string | undefined): number {
  if (!value) return 0;
  const cleaned = value.replace(/[$,()]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let quote = false;

  for (const char of line) {
    if (char === '"') {
      quote = !quote;
      continue;
    }

    if (char === ',' && !quote) {
      result.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
}

export function parseFirstradeCsv(csv: string): FirstradeTrade[] {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));

    return {
      symbol: row.Symbol ?? row.symbol ?? '',
      tradeDate: row.TradeDate ?? row.Date ?? '',
      action: row.Action ?? '',
      quantity: toNumber(row.Quantity),
      price: toNumber(row.Price),
      amount: toNumber(row.Amount),
      commission: toNumber(row.Commission),
      fee: toNumber(row.Fee),
    };
  });
}
