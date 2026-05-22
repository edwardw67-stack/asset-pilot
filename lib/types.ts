export type Market = 'TW' | 'US';
export type Currency = 'TWD' | 'USD';
export type BrokerName = 'sinopac' | 'yuanta_margin' | 'cathay' | 'taishin' | 'masterlink' | 'firstrade' | 'manual';

export type Holding = {
  id: string;
  market: Market;
  ticker: string;
  name: string;
  brokerAccountId: string;
  quantity: number;
  averageCost: number;
  currency: Currency;
  entryDate?: string | null;
  latestPrice?: number;
  atr5?: number;
  atr10?: number;
  atr20?: number;
  preferredAtrPeriod?: 5 | 10 | 20;
  manualAtrMultiplier?: number | null;
};

export type CashBalance = {
  id: string;
  brokerAccountId: string;
  accountName: string;
  currency: Currency;
  amount: number;
};

export type PortfolioSnapshot = {
  date: string;
  totalAssetsTwd: number;
  netAssetsTwd: number;
  stockValueTwd: number;
  cashTwd: number;
  unrealizedPnlTwd: number;
};

export type OhlcBar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export type AtrStopSuggestion = {
  period: 5 | 10 | 20;
  atr: number;
  atrPercent: number;
  multiplier: number;
  stopPrice: number;
  distancePercent: number;
};
