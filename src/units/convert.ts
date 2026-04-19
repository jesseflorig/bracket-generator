export type UnitSystem = 'mm' | 'in';

const MM_PER_INCH = 25.4;

export function toMm(value: number, from: UnitSystem): number {
  return from === 'in' ? value * MM_PER_INCH : value;
}

export function fromMm(value: number, to: UnitSystem): number {
  return to === 'in' ? value / MM_PER_INCH : value;
}

export function formatDisplay(valueMm: number, unit: UnitSystem, decimals = 2): string {
  const converted = fromMm(valueMm, unit);
  return `${converted.toFixed(decimals)} ${unit}`;
}
