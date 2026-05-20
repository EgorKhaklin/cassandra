'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { severityColor } from '@/lib/color-scale';
import { fmtTimeShort } from '@/lib/format';

/**
 * Top-center toast deck. Compact one-liners so they don't block the map.
 * Max 2 visible at once (capped at the store level). Auto-dismiss in 5s.
 * Click a toast → fly to its state and ack.
 */
export function ToastDeck() {
  const toasts = useAppStore(s => s.toasts);
  const dismissToast = useAppStore(s => s.dismissToast);
  const setSelected = useAppStore(s => s.setSelected);
  const topBarVisible = useAppStore(s => s.panels.topBar);
  const toastsVisible = useAppStore(s => s.panels.toasts);

  // When muted, drop visible toasts immediately so they don't pile up.
  useEffect(() => {
    if (!toastsVisible && toasts.length > 0) {
      for (const t of toasts) dismissToast(t.id);
    }
  }, [toastsVisible, toasts, dismissToast]);

  useEffect(() => {
    if (toasts.length === 0) return;
    const t = setTimeout(() => dismissToast(toasts[0].id), 5000);
    return () => clearTimeout(t);
  }, [toasts, dismissToast]);

  const topOffset = topBarVisible ? 64 : 16;

  if (!toastsVisible) return null;
  if (toasts.length === 0) return null;

  return (
    <div
      className="absolute z-30 flex flex-col items-center gap-1.5 pointer-events-none"
      style={{
        left: '50%',
        top: topOffset,
        transform: 'translateX(-50%)',
        transition: 'top 300ms cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {toasts.map(t => (
        <button
          key={t.id}
          onClick={() => { if (t.stateCode) setSelected(t.stateCode); dismissToast(t.id); }}
          className="text-left pointer-events-auto bg-graphite/95 backdrop-blur border border-slate-800/80 px-2.5 py-1.5 rounded-sm shadow-2xl animate-toast-in hover:border-gold/40 transition-colors flex items-center gap-2.5"
          style={{ borderLeft: `3px solid ${severityColor(t.severity)}`, maxWidth: 460 }}
        >
          <span
            className="text-2xs font-mono uppercase tracking-widest shrink-0"
            style={{ color: severityColor(t.severity) }}
          >
            {t.severity}
          </span>
          {t.stateCode && (
            <span className="text-2xs font-mono text-gold-dim uppercase tracking-widest shrink-0">
              [{t.stateCode}]
            </span>
          )}
          <span className="text-xs text-ivory font-medium leading-tight truncate">
            {t.title}
          </span>
          <span className="text-2xs font-mono text-slate-500 shrink-0 ml-1">
            {fmtTimeShort(t.ts)}
          </span>
        </button>
      ))}
    </div>
  );
}
