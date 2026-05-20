'use client';

import { leanColor } from '@/lib/color-scale';
import { useAppStore } from '@/store/app-store';
import { PanelToggle } from '@/components/ui/PanelToggle';

const STOPS = [-50, -30, -15, 0, 15, 30, 50];

export function MapLegend() {
  const visible = useAppStore(s => s.panels.legend);
  const tickerVisible = useAppStore(s => s.panels.ticker);
  const bottomOffset = tickerVisible ? 52 : 16;

  return (
    <>
      <div
        className="absolute z-10 bg-graphite/85 backdrop-blur border border-slate-800/80 rounded-sm p-2 font-mono text-2xs transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          left: 16,
          bottom: bottomOffset,
          transform: visible ? 'translateY(0)' : 'translateY(140%)',
        }}
      >
        <div className="text-slate-500 uppercase tracking-widest mb-1">Partisan lean</div>
        <div className="flex items-center gap-px">
          {STOPS.map(v => (
            <div key={v} className="flex flex-col items-center">
              <div className="w-7 h-2.5" style={{ background: leanColor(v, 90) }} />
              <span className="text-slate-500 mt-0.5">{v > 0 ? `R+${v}` : v < 0 ? `D+${-v}` : '0'}</span>
            </div>
          ))}
        </div>
        <div className="text-slate-600 mt-1 text-[10px]">extrusion height = intensity</div>
      </div>
      {/* Legend toggle — bottom-left corner */}
      <PanelToggle
        panel="legend"
        side="bottom"
        label="legend"
        style={{
          position: 'absolute',
          left: 16,
          bottom: visible ? bottomOffset + 78 : bottomOffset + 8,
          transition: 'bottom 300ms cubic-bezier(0.4,0,0.2,1)',
        }}
      />
    </>
  );
}
