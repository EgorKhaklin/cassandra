'use client';

import { useAppStore } from '@/store/app-store';
import { CODE_TO_STATE } from '@/data/states';
import { fmtDelta, fmtTimeShort } from '@/lib/format';
import { leanColor } from '@/lib/color-scale';
import { PanelToggle } from '@/components/ui/PanelToggle';

export function NewsTicker() {
  const news = useAppStore(s => s.news);
  const setSelected = useAppStore(s => s.setSelected);
  const visible = useAppStore(s => s.panels.ticker);

  return (
    <>
      <footer
        className="absolute bottom-0 left-0 right-0 z-20 h-9 bg-void/95 backdrop-blur border-t border-slate-800/80 flex items-center px-4 font-mono text-2xs gap-3 overflow-hidden transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)' }}
      >
        <span className="text-gold tracking-widest shrink-0">› NEWS</span>
        <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap no-scrollbar">
          {news.length === 0 ? (
            <span className="text-slate-600">awaiting news…</span>
          ) : (
            news.slice(0, 10).map(n => {
              const code = n.affectedStates[0];
              const meta = code ? CODE_TO_STATE[code] : null;
              return (
                <button
                  key={n.id}
                  onClick={() => { if (code) setSelected(code); }}
                  className="flex items-center gap-2 text-slate-300 hover:text-ivory transition-colors"
                >
                  <span className="text-slate-600">{fmtTimeShort(n.ts)}</span>
                  <span
                    className="px-1 rounded-sm border text-2xs"
                    style={{
                      color: leanColor(n.sentimentImpact * 20, 80),
                      borderColor: leanColor(n.sentimentImpact * 20, 80),
                    }}
                  >
                    {fmtDelta(n.sentimentImpact)}
                  </span>
                  <span className="text-slate-500 uppercase">{n.source}</span>
                  {meta && <span className="text-gold-dim">[{meta.code}]</span>}
                  <span>{n.headline}</span>
                </button>
              );
            })
          )}
        </div>
      </footer>
      {/* Ticker toggle — pinned to bottom-right corner */}
      <PanelToggle
        panel="ticker"
        side="bottom"
        label="news ticker"
        style={{
          position: 'absolute',
          right: 16,
          bottom: visible ? 50 : 8,
          transition: 'bottom 300ms cubic-bezier(0.4,0,0.2,1)',
        }}
      />
    </>
  );
}
