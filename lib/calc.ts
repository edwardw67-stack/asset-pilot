export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function multiply(a: number, b: number): number {
  return round2(a * b);
}
