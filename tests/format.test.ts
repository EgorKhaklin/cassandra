import { describe, it, expect } from 'vitest';
import { fmtLean, fmtDelta, fmtPct, fmtNum, fmtTimeShort, issueLabel } from '../src/lib/format';

describe('format', () => {
  it('fmtLean uses R+/D+ prefix', () => {
    expect(fmtLean(0)).toBe('R+0.0');           // zero conventionally rendered as R+ since >=0
    expect(fmtLean(5.3)).toBe('R+5.3');
    expect(fmtLean(-7.1)).toBe('D+7.1');
  });

  it('fmtDelta uses signed prefix', () => {
    expect(fmtDelta(0)).toBe('±0.0');
    expect(fmtDelta(1.2)).toBe('+1.2');
    expect(fmtDelta(-2.5)).toBe('−2.5');
  });

  it('fmtPct rounds to n digits', () => {
    expect(fmtPct(50.123, 1)).toBe('50.1%');
    expect(fmtPct(50.6, 0)).toBe('51%');
  });

  it('fmtNum', () => {
    expect(fmtNum(3.14159, 2)).toBe('3.14');
    expect(fmtNum(10, 0)).toBe('10');
  });

  it('fmtTimeShort distinguishes seconds, minutes, hours', () => {
    const now = 1_000_000_000_000;
    expect(fmtTimeShort(now - 1000, now)).toBe('1s');
    expect(fmtTimeShort(now - 90_000, now)).toBe('1m');
    expect(fmtTimeShort(now - 3600_000 * 2, now)).toBe('2h');
    expect(fmtTimeShort(now - 86_400_000 * 3, now)).toBe('3d');
    expect(fmtTimeShort(now - 100, now)).toBe('now');
  });

  it('issueLabel humanizes kebab keys', () => {
    expect(issueLabel('economy')).toBe('Economy');
    expect(issueLabel('foreign-policy')).toBe('Foreign Policy');
    expect(issueLabel('civil-rights')).toBe('Civil Rights');
  });
});
