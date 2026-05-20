// Core domain types. Every modeled quantity carries provenance + confidence.

export type Confidence = 'HIGH' | 'MED' | 'LOW';

export type SignalSource =
  | 'poll-aggregator'
  | 'news-sentiment'
  | 'public-discourse'
  | 'simulation';

export type IssueKey =
  | 'economy'
  | 'immigration'
  | 'healthcare'
  | 'foreign-policy'
  | 'climate'
  | 'civil-rights'
  | 'elections'
  | 'crime';

export interface IssueSalience {
  issue: IssueKey;
  salience: number;       // 0..1
  lean: number;           // -100..+100 (D..R)
  delta24h: number;
}

export interface StateSentiment {
  stateCode: string;            // 'CA', 'TX', ...
  partisanLean: number;         // -100 (D) .. +100 (R)
  intensity: number;            // 0..100 — how engaged the population is
  approval: number;             // -100..+100 generic incumbent approval signal
  volatility: number;           // 0..100 — recent stddev of lean
  confidence: Confidence;
  sources: SignalSource[];
  issues: IssueSalience[];
  history: number[];            // last N lean samples for sparkline
  lastTickAt: number;           // epoch ms
}

export interface NationalSnapshot {
  asOf: number;
  nationalLean: number;         // popular-vote-weighted lean
  ecBalance: { dem: number; rep: number; tossup: number };   // EC counts
  loudestIssues: IssueSalience[];
  topMovers: { code: string; delta: number }[];
  streamHealth: 'NOMINAL' | 'DEGRADED' | 'OFFLINE';
  tickRate: number;             // ticks/min
}

export type AlertSeverity = 'INFO' | 'WATCH' | 'WARN' | 'CRIT';

export interface Alert {
  id: string;
  ts: number;
  severity: AlertSeverity;
  title: string;
  detail: string;
  stateCode?: string;
  rule: string;                 // which rule fired
  delta?: number;
  ackd?: boolean;
}

export interface NewsItem {
  id: string;
  ts: number;
  source: string;
  headline: string;
  summary: string;
  url?: string;
  affectedStates: string[];
  sentimentImpact: number;      // -50..+50 — net partisan push
  intensityImpact: number;      // 0..50 — engagement spike
  issue: IssueKey;
  confidence: Confidence;
}

// SSE stream events
export type StreamEvent =
  | { kind: 'tick'; ts: number; delta: { stateCode: string; lean: number; intensity: number; volatility: number }[] }
  | { kind: 'news'; item: NewsItem }
  | { kind: 'alert'; alert: Alert }
  | { kind: 'national'; snap: NationalSnapshot }
  | { kind: 'heartbeat'; ts: number };
