import { describe, it, expect } from 'vitest';
import {
  makeAlertEngine,
  evaluateDeltas,
  alertFromNews,
} from '../src/engine/alert-engine';
import { initialSnapshot } from '../src/engine/sentiment-engine';
import type { NewsItem, StateSentiment } from '../src/lib/types';
import { ALERT_RULES } from '../src/lib/constants';

describe('alert-engine', () => {
  it('no alerts when state is at baseline', () => {
    const before = initialSnapshot();
    const after = initialSnapshot();
    const eng = makeAlertEngine();
    const alerts = evaluateDeltas(before, after, eng);
    expect(alerts.length).toBe(0);
  });

  it('fires SWING_SHIFT when a swing state moves > threshold', () => {
    const before = initialSnapshot();
    // PA is a swing state (baseline +2). Push it hard.
    const swing = 'PA';
    const after = {
      ...before,
      [swing]: {
        ...before[swing],
        partisanLean: before[swing].partisanLean + ALERT_RULES.SWING_DELTA_24H + 2,
        // History buffer first value remains the original baseline, so drift looks big.
        history: before[swing].history,
      },
    };
    const eng = makeAlertEngine();
    const alerts = evaluateDeltas(before, after, eng);
    const fired = alerts.find(a => a.rule === 'SWING_SHIFT' && a.stateCode === swing);
    expect(fired).toBeDefined();
    expect(fired?.severity === 'WARN' || fired?.severity === 'CRIT').toBe(true);
  });

  it('dedupes repeated SWING_SHIFT within window', () => {
    const before = initialSnapshot();
    const swing = 'GA';
    const after: Record<string, StateSentiment> = {
      ...before,
      [swing]: {
        ...before[swing],
        partisanLean: before[swing].partisanLean + ALERT_RULES.SWING_DELTA_24H + 1,
      },
    };
    const eng = makeAlertEngine(60_000);
    const first = evaluateDeltas(before, after, eng, 1000);
    const second = evaluateDeltas(before, after, eng, 1500);
    expect(first.find(a => a.rule === 'SWING_SHIFT')).toBeDefined();
    expect(second.find(a => a.rule === 'SWING_SHIFT')).toBeUndefined();
  });

  it('fires INTENSITY_SPIKE when intensity jumps', () => {
    const before = initialSnapshot();
    const code = 'TX';
    const after: Record<string, StateSentiment> = {
      ...before,
      [code]: {
        ...before[code],
        intensity: Math.min(100, before[code].intensity + ALERT_RULES.INTENSITY_SPIKE + 1),
      },
    };
    const eng = makeAlertEngine();
    const alerts = evaluateDeltas(before, after, eng);
    const fired = alerts.find(a => a.rule === 'INTENSITY_SPIKE' && a.stateCode === code);
    expect(fired).toBeDefined();
  });

  it('alertFromNews emits for high-impact items', () => {
    const eng = makeAlertEngine();
    const item: NewsItem = {
      id: 'n1', ts: Date.now(), source: 'Test', headline: 'Big', summary: '',
      affectedStates: ['MI'], sentimentImpact: 6, intensityImpact: 14, issue: 'economy', confidence: 'MED',
    };
    const a = alertFromNews(item, eng);
    expect(a).toBeDefined();
    expect(a?.stateCode).toBe('MI');
  });

  it('alertFromNews skips low-impact items', () => {
    const eng = makeAlertEngine();
    const item: NewsItem = {
      id: 'n2', ts: Date.now(), source: 'Test', headline: 'Meh', summary: '',
      affectedStates: ['NY'], sentimentImpact: 1, intensityImpact: 2, issue: 'crime', confidence: 'MED',
    };
    const a = alertFromNews(item, eng);
    expect(a).toBeNull();
  });
});
