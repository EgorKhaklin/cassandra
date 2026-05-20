'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import type { StreamEvent } from '@/lib/types';
import { STREAM_PATH } from '@/lib/constants';

/** Subscribe to the SSE stream and pump events into the store. */
export function useSentimentStream() {
  const applyDelta = useAppStore(s => s.applyDelta);
  const applyFullState = useAppStore(s => s.applyFullState);
  const upsertNews = useAppStore(s => s.upsertNews);
  const upsertAlert = useAppStore(s => s.upsertAlert);
  const setNational = useAppStore(s => s.setNational);
  const setStreamHealth = useAppStore(s => s.setStreamHealth);

  useEffect(() => {
    let es: EventSource | null = null;
    let cancelled = false;

    // Bootstrap snapshot gives us the per-state issues array (which the SSE
    // tick deltas don't carry). News + alerts come back over SSE on subscribe,
    // so we deliberately skip them here to avoid double-inserts.
    fetch('/api/snapshot').then(r => r.json()).then((boot) => {
      if (cancelled) return;
      applyFullState(boot.snap);
      setNational(boot.national);
    }).catch(() => {
      setStreamHealth('DEGRADED');
    });

    es = new EventSource(STREAM_PATH);
    setStreamHealth('CONNECTING');

    es.onopen = () => setStreamHealth('NOMINAL');
    es.onerror = () => setStreamHealth('DEGRADED');
    es.onmessage = (ev) => {
      try {
        const e = JSON.parse(ev.data) as StreamEvent;
        switch (e.kind) {
          case 'tick':       applyDelta(e.delta, e.ts); break;
          case 'news':       upsertNews(e.item); break;
          case 'alert':      upsertAlert(e.alert); break;
          case 'national':   setNational(e.snap); break;
          case 'heartbeat':  setStreamHealth('NOMINAL'); break;
        }
      } catch {
        // ignore parse errors
      }
    };

    return () => {
      cancelled = true;
      es?.close();
    };
  }, [applyDelta, applyFullState, upsertNews, upsertAlert, setNational, setStreamHealth]);
}
