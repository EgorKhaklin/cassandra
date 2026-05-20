// Sentiment engine. Models lean / intensity / volatility per state via
// a mean-reverting random walk plus event-driven impulses.
//
// Pure functions on a snapshot — easy to unit-test.

import { STATES, type StateMeta } from '@/data/states';
import { ISSUES } from '@/data/issues';
import { clamp } from '@/lib/color-scale';
import type { StateSentiment, NationalSnapshot, IssueKey, IssueSalience } from '@/lib/types';
import { makeGaussian } from '@/lib/rng';

export interface EngineConfig {
  /** Mean-reversion strength toward baseline. Higher = stickier. */
  reversion: number;
  /** Tick-level noise stddev for lean. */
  leanSigma: number;
  /** Tick-level noise stddev for intensity. */
  intensitySigma: number;
  /** Decay per tick on volatility metric. */
  volDecay: number;
}

export const DEFAULT_CONFIG: EngineConfig = {
  reversion: 0.018,
  leanSigma: 0.35,
  intensitySigma: 0.6,
  volDecay: 0.96,
};

export function initialSnapshot(now = Date.now()): Record<string, StateSentiment> {
  const out: Record<string, StateSentiment> = {};
  for (const s of STATES) {
    out[s.code] = stateForMeta(s, now);
  }
  return out;
}

function stateForMeta(s: StateMeta, now: number): StateSentiment {
  // Seed issue salience around baseline lean.
  const issues: IssueSalience[] = ISSUES.map(i => ({
    issue: i.key as IssueKey,
    salience: clamp(i.baseSalience + (Math.random() - 0.5) * 0.1, 0, 1),
    lean: clamp(i.lean + s.baselineLean * 0.4 + (Math.random() - 0.5) * 6, -100, 100),
    delta24h: 0,
  }));

  return {
    stateCode: s.code,
    partisanLean: s.baselineLean,
    intensity: s.baselineIntensity,
    approval: -s.baselineLean * 0.3,
    volatility: 4,
    confidence: Math.abs(s.baselineLean) > 18 ? 'HIGH' : Math.abs(s.baselineLean) > 6 ? 'MED' : 'MED',
    sources: ['poll-aggregator', 'news-sentiment', 'simulation'],
    issues,
    history: Array(48).fill(s.baselineLean),
    lastTickAt: now,
  };
}

/** Pure tick: returns a new snapshot. Does not mutate input. */
export function tick(
  current: Record<string, StateSentiment>,
  gaussian: () => number,
  cfg: EngineConfig = DEFAULT_CONFIG,
  now = Date.now(),
): Record<string, StateSentiment> {
  const out: Record<string, StateSentiment> = {};
  for (const meta of STATES) {
    const prev = current[meta.code];
    if (!prev) {
      out[meta.code] = stateForMeta(meta, now);
      continue;
    }

    // Mean-reverting Ornstein-Uhlenbeck-ish step.
    const drift = (meta.baselineLean - prev.partisanLean) * cfg.reversion;
    const shock = gaussian() * cfg.leanSigma;
    const newLean = clamp(prev.partisanLean + drift + shock, -100, 100);

    const intensityDrift = (meta.baselineIntensity - prev.intensity) * cfg.reversion * 0.6;
    const intensityShock = gaussian() * cfg.intensitySigma;
    const newIntensity = clamp(prev.intensity + intensityDrift + intensityShock, 0, 100);

    const tickDelta = Math.abs(newLean - prev.partisanLean);
    const newVol = clamp(prev.volatility * cfg.volDecay + tickDelta * 4, 0, 100);

    const newHistory = prev.history.slice(1).concat(newLean);

    out[meta.code] = {
      ...prev,
      partisanLean: newLean,
      intensity: newIntensity,
      volatility: newVol,
      history: newHistory,
      lastTickAt: now,
      confidence: newVol > 30 ? 'LOW' : newVol > 14 ? 'MED' : 'HIGH',
    };
  }
  return out;
}

/** Apply a news impulse to a state's sentiment in-place-style (returns new). */
export function applyImpulse(
  s: StateSentiment,
  leanPush: number,
  intensityPush: number,
  issueKey: IssueKey,
): StateSentiment {
  const newLean = clamp(s.partisanLean + leanPush, -100, 100);
  const newIntensity = clamp(s.intensity + intensityPush, 0, 100);
  const newVol = clamp(s.volatility + Math.abs(leanPush) * 2.4, 0, 100);
  const issues = s.issues.map(i =>
    i.issue === issueKey
      ? { ...i, lean: clamp(i.lean + leanPush * 1.3, -100, 100), salience: clamp(i.salience + 0.05, 0, 1), delta24h: i.delta24h + leanPush }
      : i
  );
  return {
    ...s,
    partisanLean: newLean,
    intensity: newIntensity,
    volatility: newVol,
    issues,
  };
}

/** Build a national rollup snapshot. */
export function national(snap: Record<string, StateSentiment>, now = Date.now()): NationalSnapshot {
  let totalPop = 0;
  let weightedLean = 0;
  let dEC = 0;
  let rEC = 0;
  let tEC = 0;

  const movers: { code: string; delta: number }[] = [];

  for (const meta of STATES) {
    const s = snap[meta.code];
    if (!s) continue;

    totalPop += meta.pop2020M;
    weightedLean += s.partisanLean * meta.pop2020M;

    if (s.partisanLean >= 5) rEC += meta.ev;
    else if (s.partisanLean <= -5) dEC += meta.ev;
    else tEC += meta.ev;

    const histDelta = s.history.length > 1 ? s.partisanLean - s.history[0] : 0;
    movers.push({ code: meta.code, delta: histDelta });
  }

  movers.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  // Aggregate issue salience nationally.
  const issueAgg = new Map<IssueKey, { sal: number; lean: number; delta: number; n: number }>();
  for (const meta of STATES) {
    const s = snap[meta.code];
    if (!s) continue;
    for (const i of s.issues) {
      const cur = issueAgg.get(i.issue) ?? { sal: 0, lean: 0, delta: 0, n: 0 };
      cur.sal += i.salience * meta.pop2020M;
      cur.lean += i.lean * meta.pop2020M;
      cur.delta += i.delta24h * meta.pop2020M;
      cur.n += meta.pop2020M;
      issueAgg.set(i.issue, cur);
    }
  }

  const loudest = [...issueAgg.entries()]
    .map(([k, v]) => ({ issue: k, salience: v.sal / v.n, lean: v.lean / v.n, delta24h: v.delta / v.n }))
    .sort((a, b) => b.salience - a.salience);

  return {
    asOf: now,
    nationalLean: weightedLean / Math.max(1, totalPop),
    ecBalance: { dem: dEC, rep: rEC, tossup: tEC },
    loudestIssues: loudest,
    topMovers: movers.slice(0, 5),
    streamHealth: 'NOMINAL',
    tickRate: 50, // 1.2s/tick → ~50/min
  };
}

// Convenience: a single self-contained tick driver useful for tests.
export function tickWithSeed(
  current: Record<string, StateSentiment>,
  rng: () => number,
  cfg?: EngineConfig,
  now?: number,
) {
  return tick(current, makeGaussian(rng), cfg, now);
}
