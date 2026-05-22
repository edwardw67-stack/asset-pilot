export function roundMoney(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}
