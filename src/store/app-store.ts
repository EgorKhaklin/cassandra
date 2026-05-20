// Single Zustand store. Slices: stream, selection, layers, ui, alerts/news buffers.

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  StateSentiment,
  NationalSnapshot,
  Alert,
  NewsItem,
} from '@/lib/types';

export type Layer = 'choropleth' | 'extrusion' | 'surface';

interface AppState {
  // stream
  streamHealth: 'CONNECTING' | 'NOMINAL' | 'DEGRADED' | 'OFFLINE';
  lastTickAt: number;
  tickRate: number;

  // data — store partial sentiment by code to keep updates cheap
  states: Record<string, StateSentiment>;
  national: NationalSnapshot | null;
  news: NewsItem[];
  alerts: Alert[];

  // selection
  selectedCode: string | null;
  hoveredCode: string | null;

  // ui
  layer: Layer;
  showLabels: boolean;
  showGrid: boolean;
  fps: number;

  // panel visibility (collapsible HUD)
  panels: {
    leftRail: boolean;
    rightRail: boolean;
    timeline: boolean;
    ticker: boolean;
    topBar: boolean;
    legend: boolean;
    toasts: boolean;
  };

  // toast queue
  toasts: Alert[];

  // actions
  applyDelta(delta: { stateCode: string; lean: number; intensity: number; volatility: number }[], ts: number): void;
  applyFullState(s: Record<string, StateSentiment>): void;
  upsertNews(item: NewsItem): void;
  upsertAlert(alert: Alert): void;
  setNational(snap: NationalSnapshot): void;
  setSelected(code: string | null): void;
  setHovered(code: string | null): void;
  setLayer(layer: Layer): void;
  setShowLabels(v: boolean): void;
  setShowGrid(v: boolean): void;
  setStreamHealth(h: AppState['streamHealth']): void;
  setFps(n: number): void;
  ackAlert(id: string): void;
  dismissToast(id: string): void;
  togglePanel(name: keyof AppState['panels']): void;
  setPanel(name: keyof AppState['panels'], visible: boolean): void;
  hideAllPanels(): void;
  showAllPanels(): void;
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set) => ({
    streamHealth: 'CONNECTING',
    lastTickAt: 0,
    tickRate: 0,
    states: {},
    national: null,
    news: [],
    alerts: [],
    selectedCode: null,
    hoveredCode: null,
    layer: 'extrusion',
    showLabels: true,
    showGrid: true,
    fps: 0,
    panels: {
      leftRail: true,
      rightRail: true,
      timeline: true,
      ticker: true,
      topBar: true,
      legend: true,
      toasts: true,
    },
    toasts: [],

    applyDelta(delta, ts) {
      set((st) => {
        const next = { ...st.states };
        for (const d of delta) {
          const prev = next[d.stateCode];
          if (prev) {
            next[d.stateCode] = {
              ...prev,
              partisanLean: d.lean,
              intensity: d.intensity,
              volatility: d.volatility,
              history: prev.history.slice(1).concat(d.lean),
              lastTickAt: ts,
            };
          } else {
            // Stub minimal record until full state arrives.
            next[d.stateCode] = {
              stateCode: d.stateCode,
              partisanLean: d.lean,
              intensity: d.intensity,
              volatility: d.volatility,
              approval: 0,
              confidence: 'MED',
              sources: ['simulation'],
              issues: [],
              history: Array(48).fill(d.lean),
              lastTickAt: ts,
            };
          }
        }
        const dt = ts - st.lastTickAt;
        const tickRate = dt > 0 ? Math.round(60000 / dt) : st.tickRate;
        return { states: next, lastTickAt: ts, tickRate, streamHealth: 'NOMINAL' };
      });
    },

    applyFullState(s) {
      set({ states: s });
    },

    upsertNews(item) {
      set((st) => {
        if (st.news.some(n => n.id === item.id)) return st;
        return { news: [item, ...st.news].slice(0, 80) };
      });
    },

    upsertAlert(alert) {
      set((st) => {
        if (st.alerts.some(a => a.id === alert.id)) return st;
        // Toasts only for elevated severities. Cap at 2 so the stack
        // doesn't dominate the map. Older toasts get dropped.
        const isToastable = alert.severity === 'WARN' || alert.severity === 'CRIT';
        return {
          alerts: [alert, ...st.alerts].slice(0, 200),
          toasts: isToastable ? [...st.toasts, alert].slice(-2) : st.toasts,
        };
      });
    },

    setNational(snap) { set({ national: snap }); },
    setSelected(code) { set({ selectedCode: code }); },
    setHovered(code) { set({ hoveredCode: code }); },
    setLayer(layer) { set({ layer }); },
    setShowLabels(v) { set({ showLabels: v }); },
    setShowGrid(v) { set({ showGrid: v }); },
    setStreamHealth(h) { set({ streamHealth: h }); },
    setFps(n) { set({ fps: n }); },
    ackAlert(id) {
      set((st) => ({ alerts: st.alerts.map(a => a.id === id ? { ...a, ackd: true } : a) }));
    },
    dismissToast(id) {
      set((st) => ({ toasts: st.toasts.filter(t => t.id !== id) }));
    },
    togglePanel(name) {
      set((st) => ({ panels: { ...st.panels, [name]: !st.panels[name] } }));
    },
    setPanel(name, visible) {
      set((st) => ({ panels: { ...st.panels, [name]: visible } }));
    },
    hideAllPanels() {
      set((st) => ({
        panels: {
          ...st.panels,
          leftRail: false,
          rightRail: false,
          timeline: false,
          ticker: false,
          legend: false,
        },
      }));
    },
    showAllPanels() {
      set((st) => ({
        panels: {
          leftRail: true,
          rightRail: true,
          timeline: true,
          ticker: true,
          topBar: true,
          legend: true,
          toasts: true,
        },
      }));
    },
  }))
);

// Stable selectors.
export const selectState = (code: string) => (s: AppState) => s.states[code];
