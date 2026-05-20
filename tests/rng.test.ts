import { describe, it, expect } from 'vitest';
import { makeRng, makeGaussian, pick } from '../src/lib/rng';

describe('rng', () => {
  it('seeded RNG is deterministic', () => {
    const a = makeRng(99);
    const b = makeRng(99);
    for (let i = 0; i < 100; i++) {
      expect(a()).toBe(b());
    }
  });

  it('RNG outputs in [0,1)', () => {
    const r = makeRng(1);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('Gaussian samples have mean ~0 and stddev ~1', () => {
    const g = makeGaussian(makeRng(7));
    let sum = 0;
    let sq = 0;
    const N = 5000;
    for (let i = 0; i < N; i++) {
      const v = g();
      sum += v;
      sq += v * v;
    }
    const mean = sum / N;
    const variance = sq / N - mean * mean;
    expect(Math.abs(mean)).toBeLessThan(0.08);
    expect(Math.abs(Math.sqrt(variance) - 1)).toBeLessThan(0.08);
  });

  it('pick returns an element from the array', () => {
    const arr = ['a', 'b', 'c', 'd'];
    const r = makeRng(3);
    for (let i = 0; i < 100; i++) {
      expect(arr).toContain(pick(arr, r));
    }
  });
});
