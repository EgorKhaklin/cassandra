import { describe, it, expect } from 'vitest';
import {
  initialSnapshot,
  tickWithSeed,
  applyImpulse,
  national,
} from '../src/engine/sentiment-engine';
import { makeRng } from '../src/lib/rng';
import { STATES } from '../src/data/states';

describe('sentiment-engine', () => {
  it('initial snapshot covers all 50 states', () => {
    const s = initialSnapshot();
    expect(Object.keys(s).length).toBe(STATES.length);
    for (const m of STATES) {
      expect(s[m.code]).toBeDefined();
      expect(s[m.code].partisanLean).toBeCloseTo(m.baselineLean);
      expect(s[m.code].history.length).toBeGreaterThan(0);
    }
  });

  it('tick is deterministic given the same seed', () => {
    const a = initialSnapshot();
    const b = initialSnapshot();
    const rngA = makeRng(42);
    const rngB = makeRng(42);
    const a1 = tickWithSeed(a, rngA);
    const b1 = tickWithSeed(b, rngB);
    for (const c of STATES.map(s => s.code)) {
      expect(a1[c].partisanLean).toBeCloseTo(b1[c].partisanLean, 8);
      expect(a1[c].intensity).toBeCloseTo(b1[c].intensity, 8);
    }
  });

  it('tick stays within [-100, 100] for lean and [0, 100] for intensity', () => {
    let s = initialSnapshot();
    const rng = makeRng(7);
    for (let i = 0; i < 200; i++) s = tickWithSeed(s, rng);
    for (const code of STATES.map(m => m.code)) {
      expect(s[code].partisanLean).toBeGreaterThanOrEqual(-100);
      expect(s[code].partisanLean).toBeLessThanOrEqual(100);
      expect(s[code].intensity).toBeGreaterThanOrEqual(0);
      expect(s[code].intensity).toBeLessThanOrEqual(100);
    }
  });

  it('mean reversion pulls toward baseline over many ticks', () => {
    let s = initialSnapshot();
    // Knock CA hard, then tick many times. Expect drift back toward its baseline.
    const code = 'CA';
    s = { ...s, [code]: { ...s[code], partisanLean: 50 } }; // way off baseline (-20)
    const rng = makeRng(123);
    for (let i = 0; i < 800; i++) s = tickWithSeed(s, rng, { reversion: 0.04, leanSigma: 0.05, intensitySigma: 0.05, volDecay: 0.95 });
    // Should be much closer to baseline (-20) than to 50.
    expect(Math.abs(s[code].partisanLean - (-20))).toBeLessThan(15);
  });

  it('applyImpulse pushes lean and bumps volatility', () => {
    const s = initialSnapshot()['PA'];
    const baseV = s.volatility;
    const after = applyImpulse(s, 5, 8, 'economy');
    expect(after.partisanLean).toBeCloseTo(s.partisanLean + 5, 4);
    expect(after.intensity).toBeCloseTo(Math.min(100, s.intensity + 8), 4);
    expect(after.volatility).toBeGreaterThan(baseV);
    const econ = after.issues.find(i => i.issue === 'economy');
    expect(econ?.salience).toBeGreaterThan(0);
  });

  it('national rollup: EC counts sum to 538', () => {
    const s = initialSnapshot();
    const n = national(s);
    expect(n.ecBalance.dem + n.ecBalance.rep + n.ecBalance.tossup).toBe(538);
  });

  it('national rollup loudest issues sorted descending', () => {
    const s = initialSnapshot();
    const n = national(s);
    for (let i = 1; i < n.loudestIssues.length; i++) {
      expect(n.loudestIssues[i - 1].salience).toBeGreaterThanOrEqual(n.loudestIssues[i].salience);
    }
  });

  it('national topMovers limited to 5 and sorted by abs delta', () => {
    const s = initialSnapshot();
    const n = national(s);
    expect(n.topMovers.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < n.topMovers.length; i++) {
      expect(Math.abs(n.topMovers[i - 1].delta)).toBeGreaterThanOrEqual(Math.abs(n.topMovers[i].delta));
    }
  });
});
