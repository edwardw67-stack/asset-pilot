export type ImportedHolding = {
  id: string;
  market: 'TW' | 'US';
  ticker: string;
  name: string;
  qty: number;
  cost: number;
  price: number;
  atr: number;
  multiple: number;
};

export type ImportedCash = {
  id: string;
  currency: 'TWD' | 'USD';
  label: string;
  amount: number;
};

type Position = {
  ticker: string;
  name: string;
  qty: number;
  costBasis: number;
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clean(value: unknown) {
  return String(value ?? '').trim();
}

function num(value: unknown) {
  const parsed = Number(clean(value).replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function splitCsvLine(line: string) {
  const result: string[] = [];
  let current = '';
  let quote = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === '"' && next === '"' && quote) {
      current += '"';
      i += 1;
      continue;
    }

    if (ch === '"') {
      quote = !quote;
      continue;
    }

    if (ch === ',' && !quote) {
      result.push(current.trim());
      current = '';
      continue;
    }

    current += ch;
  }

  result.push(current.trim());
  return result;
}

function parseRows(text: string) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const headers = splitCsvLine(lines[0] ?? '').map((item) => item.trim());

  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] ?? '';
    });
    return row;
  });
}

function shortName(description: string, ticker: string) {
  const text = description
    .replace(/UNSOLICITED/gi, '')
    .replace(/COMMON STOCK/gi, '')
    .replace(/CLASS [A-Z]/gi, '')
    .replace(/CAPITAL STOCK/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return ticker;
  const reinIndex = text.toUpperCase().indexOf(' REIN @');
  return reinIndex > 0 ? text.slice(0, reinIndex).trim() : text.slice(0, 48).trim();
}

function addBuy(position: Position, quantity: number, cashOut: number) {
  if (quantity <= 0 || cashOut <= 0) return;
  position.costBasis += cashOut;
  position.qty += quantity;
}

function addSell(position: Position, quantity: number) {
  if (quantity <= 0 || position.qty <= 0) return;
  const removed = Math.min(quantity, position.qty);
  const avgCost = position.costBasis / position.qty;
  position.qty -= removed;
  position.costBasis -= avgCost * removed;
  if (position.qty < 0.000001) {
    position.qty = 0;
    position.costBasis = 0;
  }
}

export function isFirstradeCsv(text: string) {
  const first = text.split(/\r?\n/)[0] ?? '';
  return ['Symbol', 'Quantity', 'Price', 'Action', 'Amount', 'RecordType'].every((key) => first.includes(key));
}

export function parseFirstradeCsv(text: string) {
  const rows = parseRows(text);
  const positions = new Map<string, Position>();
  let cashUsd = 0;
  let buyRows = 0;
  let sellRows = 0;
  let reinvestRows = 0;

  for (const row of rows) {
    const ticker = clean(row.Symbol).toUpperCase();
    const action = clean(row.Action).toUpperCase();
    const description = clean(row.Description);
    const quantity = num(row.Quantity);
    const amount = num(row.Amount);
    const commission = num(row.Commission);
    const fee = num(row.Fee);

    cashUsd += amount;

    if (!ticker) continue;

    const position = positions.get(ticker) ?? {
      ticker,
      name: shortName(description, ticker),
      qty: 0,
      costBasis: 0,
    };

    if (action === 'BUY') {
      addBuy(position, Math.abs(quantity), Math.abs(amount) + commission + fee);
      buyRows += 1;
    } else if (action === 'SELL') {
      addSell(position, Math.abs(quantity));
      sellRows += 1;
    } else if (action === 'OTHER' && description.toUpperCase().includes('REIN @') && quantity > 0 && amount < 0) {
      addBuy(position, quantity, Math.abs(amount) + commission + fee);
      reinvestRows += 1;
    }

    if (position.qty > 0) positions.set(ticker, position);
    else positions.delete(ticker);
  }

  const holdings: ImportedHolding[] = [...positions.values()]
    .filter((item) => item.qty > 0.000001)
    .sort((a, b) => a.ticker.localeCompare(b.ticker))
    .map((item) => {
      const averageCost = item.qty > 0 ? item.costBasis / item.qty : 0;
      return {
        id: makeId(),
        market: 'US',
        ticker: item.ticker,
        name: item.name || item.ticker,
        qty: Math.round(item.qty * 1000000) / 1000000,
        cost: Math.round(averageCost * 10000) / 10000,
        price: Math.round(averageCost * 10000) / 10000,
        atr: 0,
        multiple: 2.3,
      };
    });

  const cash: ImportedCash[] = [
    {
      id: makeId(),
      currency: 'USD',
      label: 'Firstrade Cash（CSV 估算）',
      amount: Math.round(cashUsd * 100) / 100,
    },
  ];

  return {
    holdings,
    cash,
    summary: {
      totalRows: rows.length,
      buyRows,
      sellRows,
      reinvestRows,
      holdingsCount: holdings.length,
      estimatedCashUsd: Math.round(cashUsd * 100) / 100,
    },
  };
}
