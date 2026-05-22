export type MoneyCurrency = 'TWD' | 'USD';

export type BasicPosition = {
  quantity: number;
  averageCost: number;
  latestPrice: number;
  currency: MoneyCurrency;
};

export type BasicCash = {
  amount: number;
  currency: MoneyCurrency;
};

export function roundAmount(value: number): number {
  return Math.round(value * 100) / 100;
}

export function amountInTwd(amount: number, currency: MoneyCurrency, usdTwdRate: number): number {
  if (currency === 'USD') return roundAmount(amount * usdTwdRate);
  return roundAmount(amount);
}

export function positionCost(position: BasicPosition): number {
  return roundAmount(position.quantity * position.averageCost);
}

export function positionValue(position: BasicPosition): number {
  return roundAmount(position.quantity * position.latestPrice);
}

export function positionProfit(position: BasicPosition): number {
  return roundAmount(positionValue(position) - positionCost(position));
}

export function totalPositionValueTwd(positions: BasicPosition[], usdTwdRate: number): number {
  return roundAmount(
    positions.reduce((sum, position) => sum + amountInTwd(positionValue(position), position.currency, usdTwdRate), 0),
  );
}

export function totalCashTwd(cash: BasicCash[], usdTwdRate: number): number {
  return roundAmount(cash.reduce((sum, item) => sum + amountInTwd(item.amount, item.currency, usdTwdRate), 0));
}
