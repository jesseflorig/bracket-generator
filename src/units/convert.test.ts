import { describe, it, expect } from 'vitest';
import { toMm, fromMm, formatDisplay } from './convert';

describe('toMm', () => {
  it('converts inches to mm', () => {
    expect(toMm(1, 'in')).toBeCloseTo(25.4, 5);
    expect(toMm(2, 'in')).toBeCloseTo(50.8, 5);
  });

  it('passes mm through unchanged', () => {
    expect(toMm(50, 'mm')).toBe(50);
    expect(toMm(0, 'mm')).toBe(0);
  });
});

describe('fromMm', () => {
  it('converts mm to inches', () => {
    expect(fromMm(25.4, 'in')).toBeCloseTo(1, 5);
    expect(fromMm(50.8, 'in')).toBeCloseTo(2, 5);
  });

  it('passes mm through unchanged', () => {
    expect(fromMm(50, 'mm')).toBe(50);
    expect(fromMm(0, 'mm')).toBe(0);
  });
});

describe('round-trip', () => {
  it('in→mm→in is lossless', () => {
    const inchValue = 3.5;
    expect(fromMm(toMm(inchValue, 'in'), 'in')).toBeCloseTo(inchValue, 10);
  });

  it('mm→in→mm is lossless', () => {
    const mmValue = 88.9;
    expect(toMm(fromMm(mmValue, 'in'), 'in')).toBeCloseTo(mmValue, 10);
  });
});

describe('formatDisplay', () => {
  it('formats mm values', () => {
    expect(formatDisplay(50, 'mm')).toBe('50.00 mm');
    expect(formatDisplay(3.14159, 'mm', 3)).toBe('3.142 mm');
  });

  it('formats inch values', () => {
    expect(formatDisplay(25.4, 'in')).toBe('1.00 in');
    expect(formatDisplay(50.8, 'in', 1)).toBe('2.0 in');
  });
});
