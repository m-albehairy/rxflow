import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export function toDecimal(value: string | number | Decimal): Decimal {
  return new Decimal(value);
}

export function addMoney(a: string | number | Decimal, b: string | number | Decimal): Decimal {
  return toDecimal(a).plus(toDecimal(b));
}

export function subtractMoney(a: string | number | Decimal, b: string | number | Decimal): Decimal {
  return toDecimal(a).minus(toDecimal(b));
}

export function multiplyMoney(a: string | number | Decimal, b: string | number | Decimal): Decimal {
  return toDecimal(a).times(toDecimal(b));
}

export function divideMoney(a: string | number | Decimal, b: string | number | Decimal): Decimal {
  return toDecimal(a).dividedBy(toDecimal(b));
}

export function roundMoney(value: Decimal, decimals: number = 4): string {
  return value.toFixed(decimals);
}

export function displayMoney(value: string | number | Decimal, decimals: number = 2): string {
  return toDecimal(value).toFixed(decimals);
}

export function isNegative(value: string | number | Decimal): boolean {
  return toDecimal(value).isNegative();
}

export function isZero(value: string | number | Decimal): boolean {
  return toDecimal(value).isZero();
}
