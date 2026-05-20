// Threshold-based alert engine. Watches sentiment deltas and emits alerts
// with severity tiers. Dedupes within a configurable window.

import { SWING_STATES, CODE_TO_STATE } from '@/data/states';
import { ALERT_RULES } from '@/lib/constants';
import { fmtLean, fmtDelta } from '@/lib/format';
import type { Alert, NewsItem, StateSentiment, AlertSeverity } from '@/lib/types';

let aid = 1;
function nextId(): string {
  return `A-${Date.now().toString(36)}-${(aid++).toString(36)}`;
}

export interface AlertEngineState {
  /** code -> ts of last alert fired for that code+rule. */
  lastFired: Map<string, number>;
  /** Cooldown per (code,rule) in ms. */
  dedupeWindow: number;
}

export function makeAlertEngine(dedupeWindow = 12000): AlertEngineState {
  return { lastFired: new Map(), dedupeWindow };
}

function dedupeKey(code: string, rule: string): string {
  return `${code}::${rule}`;
}

function canFire(state: AlertEngineState, code: string, rule: string, now: number): boolean {
  const last = state.lastFired.get(dedupeKey(code, rule));
  if (!last) return true;
  return now - last > state.dedupeWindow;
}

function record(state: AlertEngineState, code: string, rule: string, now: number) {
  state.lastFired.set(dedupeKey(code, rule), now);
}

/** Evaluate sentiment deltas against rules. Returns alerts to emit. */
export function evaluateDeltas(
  before: Record<string, StateSentiment>,
  after: Record<string, StateSentiment>,
  state: AlertEngineState,
  now = Date.now(),
): Alert[] {
  const out: Alert[] = [];
  const swing = new Set(SWING_STATES);

  for (const code of Object.keys(after)) {
    const a = after[code];
    const b = before[code];
    if (!a || !b) continue;
    const meta = CODE_TO_STATE[code];

    // Look at history-vs-now delta — represents drift since buffer start (~1m).
    const driftDelta = a.partisanLean - a.history[0];

    // Rule 1: swing-state shift
    if (swing.has(code) && Math.abs(driftDelta) >= ALERT_RULES.SWING_DELTA_24H) {
      if (canFire(state, code, 'SWING_SHIFT', now)) {
        const severity: AlertSeverity = Math.abs(driftDelta) >= ALERT_RULES.CRIT_DELTA_24H ? 'CRIT' : 'WARN';
        out.push({
          id: nextId(),
          ts: now,
          severity,
          title: `${meta?.name ?? code} swinging ${fmtDelta(driftDelta)}`,
          detail: `Swing-state lean drifted ${fmtDelta(driftDelta)} (now ${fmtLean(a.partisanLean)}). Volatility ${a.volatility.toFixed(0)}.`,
          stateCode: code,
          rule: 'SWING_SHIFT',
          delta: driftDelta,
        });
        record(state, code, 'SWING_SHIFT', now);
      }
    }

    // Rule 2: intensity spike
    const intensitySpike = a.intensity - b.intensity;
    if (intensitySpike >= ALERT_RULES.INTENSITY_SPIKE) {
      if (canFire(state, code, 'INTENSITY_SPIKE', now)) {
        out.push({
          id: nextId(),
          ts: now,
          severity: 'WATCH',
          title: `${meta?.name ?? code} intensity spike +${intensitySpike.toFixed(0)}`,
          detail: `Engagement signal climbed ${intensitySpike.toFixed(1)} in one cycle. Check inbound news flow.`,
          stateCode: code,
          rule: 'INTENSITY_SPIKE',
          delta: intensitySpike,
        });
        record(state, code, 'INTENSITY_SPIKE', now);
      }
    }
  }

  return out;
}

/** Emit an alert from a high-impact news item. */
export function alertFromNews(item: NewsItem, state: AlertEngineState, now = Date.now()): Alert | null {
  if (Math.abs(item.sentimentImpact) < 4 && item.intensityImpact < 10) return null;
  const code = item.affectedStates[0];
  if (!code) return null;
  if (!canFire(state, code, 'NEWS_IMPACT', now)) return null;
  record(state, code, 'NEWS_IMPACT', now);

  const meta = CODE_TO_STATE[code];
  const sev: AlertSeverity =
    Math.abs(item.sentimentImpact) >= 4 ? 'WARN' :
    item.intensityImpact >= 12 ? 'WATCH' : 'INFO';

  return {
    id: nextId(),
    ts: now,
    severity: sev,
    title: `News break — ${meta?.name ?? code}`,
    detail: item.headline,
    stateCode: code,
    rule: 'NEWS_IMPACT',
    delta: item.sentimentImpact,
  };
}
