import { describe, it, expect } from 'vitest';
import { formatInr, parseInrToPaise } from './money.js';

describe('formatInr', () => {
  it('formats zero paise correctly', () => {
    expect(formatInr(0)).toMatch(/₹\s*0\.00/);
  });

  it('formats positive paise values with Indian currency formatting', () => {
    expect(formatInr(100000)).toMatch(/₹\s*1,000\.00/);
    expect(formatInr(5000000)).toMatch(/₹\s*50,000\.00/);
    expect(formatInr(123456789)).toMatch(/₹\s*12,34,567\.89/);
  });

  it('formats small fractions of a rupee correctly', () => {
    expect(formatInr(7)).toMatch(/₹\s*0\.07/);
    expect(formatInr(50)).toMatch(/₹\s*0\.50/);
  });

  it('handles invalid inputs gracefully', () => {
    expect(formatInr(null)).toMatch(/₹\s*0\.00/);
    expect(formatInr(undefined)).toMatch(/₹\s*0\.00/);
    expect(formatInr(NaN)).toMatch(/₹\s*0\.00/);
  });
});

describe('parseInrToPaise', () => {
  it('parses whole integer rupee amounts', () => {
    expect(parseInrToPaise('100')).toEqual({ ok: true, paise: 10000 });
    expect(parseInrToPaise('1')).toEqual({ ok: true, paise: 100 });
    expect(parseInrToPaise('1000')).toEqual({ ok: true, paise: 100000 });
  });

  it('parses decimal inputs with exact precision (no float trap)', () => {
    // 0.07 is a classic floating-point trap (0.07 * 100 === 7.000000000000001)
    expect(parseInrToPaise('0.07')).toEqual({ ok: true, paise: 7 });
    // 0.1 and 0.2 traps
    expect(parseInrToPaise('0.10')).toEqual({ ok: true, paise: 10 });
    expect(parseInrToPaise('0.20')).toEqual({ ok: true, paise: 20 });
    expect(parseInrToPaise('0.30')).toEqual({ ok: true, paise: 30 });
    expect(parseInrToPaise('1.14')).toEqual({ ok: true, paise: 114 });
    expect(parseInrToPaise('1,00,000.99')).toEqual({ ok: true, paise: 10000099 });
  });

  it('parses single decimal digit (assumes trailing zero)', () => {
    expect(parseInrToPaise('10.5')).toEqual({ ok: true, paise: 1050 });
    expect(parseInrToPaise('.5')).toEqual({ ok: true, paise: 50 });
  });

  it('strips currency symbols and commas', () => {
    expect(parseInrToPaise('₹1,250.50')).toEqual({ ok: true, paise: 125050 });
    expect(parseInrToPaise('INR 500')).toEqual({ ok: true, paise: 50000 });
    expect(parseInrToPaise('Rs. 200')).toEqual({ ok: true, paise: 20000 });
  });

  it('rejects more than 2 decimal places', () => {
    const res = parseInrToPaise('10.999');
    expect(res.ok).toBe(false);
    expect(res.error).toBe('Amount cannot have more than 2 decimal places');
  });

  it('rejects zero and negative amounts', () => {
    expect(parseInrToPaise('0')).toEqual({ ok: false, error: 'Amount must be greater than zero' });
    expect(parseInrToPaise('0.00')).toEqual({ ok: false, error: 'Amount must be greater than zero' });
    expect(parseInrToPaise('-50')).toEqual({ ok: false, error: 'Amount must be a positive number' });
  });

  it('rejects empty, whitespace, and non-numeric inputs', () => {
    expect(parseInrToPaise('')).toEqual({ ok: false, error: 'Amount is required' });
    expect(parseInrToPaise('   ')).toEqual({ ok: false, error: 'Amount is required' });
    expect(parseInrToPaise('abc')).toEqual({ ok: false, error: 'Please enter a valid numeric amount' });
    expect(parseInrToPaise('1.2.3')).toEqual({ ok: false, error: 'Please enter a valid numeric amount' });
    expect(parseInrToPaise('.')).toEqual({ ok: false, error: 'Please enter a valid numeric amount' });
  });
});

