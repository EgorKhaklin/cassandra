// The simulation singleton. Lives in the Node process for the duration
// of the dev/prod server. Emits events on a tiny pub/sub that the SSE
// route subscribes to.

import { initialSnapshot, tick, applyImpulse, national } from './sentiment-engine';
import { generateNews } from './news-ingester';
import { makeAlertEngine, evaluateDeltas, alertFromNews } from './alert-engine';
import { makeRng, makeGaussian } from '@/lib/rng';
import {
  TICK_INTERVAL_MS,
  NATIONAL_SNAPSHOT_INTERVAL_MS,
  NEWS_INTERVAL_MS,
  HEARTBEAT_INTERVAL_MS,
} from '@/lib/constants';
import type { StreamEvent, StateSentiment, NationalSnapshot, Alert, NewsItem } from '@/lib/types';

type Listener = (e: StreamEvent) => void;

class Simulation {
  private snap: Record<string, StateSentiment>;
  private listeners = new Set<Listener>();
  private rng = makeRng(0xC1A55ED); // 'CLASSED' as seed
  private gaussian = makeGaussian(this.rng);
  private alertState = makeAlertEngine(15000);
  private timers: NodeJS.Timeout[] = [];
  private running = false;
  private national: NationalSnapshot;
  private recentNews: NewsItem[] = [];
  private recentAlerts: Alert[] = [];
  /** Ring buffer of recent state snapshots — keyed by ts, ~10 minutes wide. */
  private history: { ts: number; lean: number; ec: { d: number; r: number; t: number } }[] = [];

  constructor() {
    this.snap = initialSnapshot();
    this.national = national(this.snap);
  }

  start() {
    if (this.running) return;
    this.running = true;

    const tickTimer = setInterval(() => this.doTick(), TICK_INTERVAL_MS);
    const newsTimer = setInterval(() => this.doNews(), NEWS_INTERVAL_MS);
    const natTimer = setInterval(() => this.doNational(), NATIONAL_SNAPSHOT_INTERVAL_MS);
    const hbTimer = setInterval(() => this.emit({ kind: 'heartbeat', ts: Date.now() }), HEARTBEAT_INTERVAL_MS);

    this.timers = [tickTimer, newsTimer, natTimer, hbTimer];
  }

  stop() {
    for (const t of this.timers) clearInterval(t);
    this.timers = [];
    this.running = false;
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    // Push an initial snapshot to new subscribers.
    fn({ kind: 'national', snap: this.national });
    // Push full delta of every state so the client renders correctly on first paint.
    const allDelta = Object.values(this.snap).map(s => ({
      stateCode: s.stateCode,
      lean: s.partisanLean,
      intensity: s.intensity,
      volatility: s.volatility,
    }));
    fn({ kind: 'tick', ts: Date.now(), delta: allDelta });
    // Push recent news + alerts for context.
    for (const n of this.recentNews.slice(-8)) fn({ kind: 'news', item: n });
    for (const a of this.recentAlerts.slice(-8)) fn({ kind: 'alert', alert: a });

    return () => this.listeners.delete(fn);
  }

  /** Read-only view of current state. */
  getSnapshot() {
    return {
      snap: this.snap,
      national: this.national,
      news: this.recentNews.slice(-30),
      alerts: this.recentAlerts.slice(-30),
    };
  }

  private emit(e: StreamEvent) {
    for (const l of this.listeners) l(e);
  }

  private doTick() {
    const before = this.snap;
    this.snap = tick(this.snap, this.gaussian);

    // Emit delta — only changed states (we tick all of them but client wants compact).
    const delta = Object.values(this.snap).map(s => ({
      stateCode: s.stateCode,
      lean: s.partisanLean,
      intensity: s.intensity,
      volatility: s.volatility,
    }));
    this.emit({ kind: 'tick', ts: Date.now(), delta });

    // Evaluate alerts.
    const alerts = evaluateDeltas(before, this.snap, this.alertState);
    for (const a of alerts) {
      this.recentAlerts.push(a);
      this.emit({ kind: 'alert', alert: a });
    }
    // Bound recent buffers.
    if (this.recentAlerts.length > 100) this.recentAlerts.shift();
  }

  private doNews() {
    const { item, leanPush, intensityPush } = generateNews(this.snap, this.rng);

    // Apply impulse to all affected states.
    for (const code of item.affectedStates) {
      const s = this.snap[code];
      if (!s) continue;
      this.snap[code] = applyImpulse(s, leanPush, intensityPush, item.issue);
    }

    this.recentNews.push(item);
    if (this.recentNews.length > 100) this.recentNews.shift();
    this.emit({ kind: 'news', item });

    const a = alertFromNews(item, this.alertState);
    if (a) {
      this.recentAlerts.push(a);
      this.emit({ kind: 'alert', alert: a });
    }
  }

  private doNational() {
    this.national = national(this.snap);
    this.history.push({
      ts: this.national.asOf,
      lean: this.national.nationalLean,
      ec: {
        d: this.national.ecBalance.dem,
        r: this.national.ecBalance.rep,
        t: this.national.ecBalance.tossup,
      },
    });
    // Keep ~10 minutes (assuming 4.8s/snap → 125 entries)
    if (this.history.length > 160) this.history.shift();
    this.emit({ kind: 'national', snap: this.national });
  }

  getHistory() {
    return this.history.slice();
  }
}

// Module-level singleton. Across hot reloads in dev we want to preserve state,
// so we stash on globalThis.
declare global {
  // eslint-disable-next-line no-var
  var __cassandraSim: Simulation | undefined;
}

export function getSimulation(): Simulation {
  if (!globalThis.__cassandraSim) {
    globalThis.__cassandraSim = new Simulation();
    globalThis.__cassandraSim.start();
  }
  return globalThis.__cassandraSim;
}
