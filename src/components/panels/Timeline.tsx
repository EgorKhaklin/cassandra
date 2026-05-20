'use client';

import { useEffect, useState } from 'react';
import { fmtLean, fmtTimeShort } from '@/lib/format';
import { leanColor, nationalLeanColor } from '@/lib/color-scale';
import { useAppStore } from '@/store/app-store';
import { PanelToggle } from '@/components/ui/PanelToggle';

interface HistoryPoint {
  ts: number;
  lean: number;
  ec: { d: number; r: number; t: number };
}

export function Timeline() {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const visible = useAppStore(s => s.panels.timeline);
  const tickerVisible = useAppStore(s => s.panels.ticker);
  const bottomOffset = tickerVisible ? 52 : 16;

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await fetch('/api/history');
        const j = await r.json();
        if (!cancelled) setHistory(j.history || []);
      } catch { /* tolerate */ }
    };
    tick();
    const i = setInterval(tick, 5000);
    return () => { cancelled = true; clearInterval(i); };
  }, []);

  const hasData = history.length >= 2;

  // Build chart shapes only when we have data
  let svgEl: React.ReactNode = null;
  let header: React.ReactNode = null;

  if (hasData) {
    const width = 360;
    const height = 40;
    const padding = 8;
    const leans = history.map(h => h.lean);
    const minL = Math.min(-2, ...leans);
    const maxL = Math.max(2, ...leans);
    const range = Math.max(0.5, maxL - minL);
    const x = (i: number) => padding + (i / (history.length - 1)) * (width - 2 * padding);
    const y = (lean: number) => height - padding - ((lean - minL) / range) * (height - 2 * padding);
    const zeroY = y(0);

    const linePath = leans
      .map((l, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(2)} ${y(l).toFixed(2)}`)
      .join(' ');
    const areaPath =
      `M ${x(0)} ${zeroY} ` +
      leans.map((l, i) => `L ${x(i).toFixed(2)} ${y(l).toFixed(2)}`).join(' ') +
      ` L ${x(history.length - 1)} ${zeroY} Z`;
    const lastLean = leans[leans.length - 1];
    const firstTs = history[0].ts;
    const lastTs = history[history.length - 1].ts;
    const spanMin = Math.round((lastTs - firstTs) / 60000);

    header = (
      <div className="flex items-center gap-3 mb-1">
        <span className="uppercase tracking-[0.28em] text-slate-500">national lean · {spanMin}m</span>
        <span className="text-slate-600">{history.length} samples</span>
        <span
          className="ml-auto tabular-nums px-1.5 py-0.5 rounded-sm border"
          style={{ color: nationalLeanColor(lastLean), borderColor: nationalLeanColor(lastLean) }}
        >
          {fmtLean(lastLean)}
        </span>
      </div>
    );
    svgEl = (
      <>
        <svg width={width} height={height} className="block">
          <line x1={padding} y1={zeroY} x2={width - padding} y2={zeroY}
                stroke="#3a4658" strokeWidth={0.6} strokeDasharray="2 3" />
          <defs>
            <linearGradient id="tl-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={leanColor(maxL, 90)} stopOpacity="0.5" />
              <stop offset="50%" stopColor="#3a4658" stopOpacity="0.05" />
              <stop offset="100%" stopColor={leanColor(minL, 90)} stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#tl-grad)" />
          <path d={linePath} fill="none" stroke="#d4a437" strokeWidth={1.2} />
          <circle cx={x(history.length - 1)} cy={y(lastLean)} r={2} fill="#f0c155" />
        </svg>
        <div className="flex justify-between text-slate-600 mt-0.5">
          <span>{fmtTimeShort(firstTs)} ago</span>
          <span>now</span>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className="absolute z-10 bg-graphite/90 backdrop-blur border border-slate-800/80 rounded-sm px-3 py-1.5 font-mono text-2xs transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          left: '50%',
          bottom: bottomOffset,
          // Translate the panel down past the ticker when hidden (always
          // keep it horizontally centered though).
          transform: visible
            ? 'translate(-50%, 0)'
            : 'translate(-50%, 140%)',
        }}
      >
        {hasData ? (
          <>{header}{svgEl}</>
        ) : (
          <div className="text-slate-600 px-2 py-1">awaiting national snapshots…</div>
        )}
      </div>
      {/* Toggle chevron — pinned center-bottom even when timeline is hidden */}
      <PanelToggle
        panel="timeline"
        side="bottom"
        label="timeline"
        style={{
          position: 'absolute',
          bottom: visible ? bottomOffset + 92 : bottomOffset + 8,
          left: '50%',
          transform: 'translateX(-50%)',
          transition: 'bottom 300ms cubic-bezier(0.4,0,0.2,1)',
        }}
      />
    </>
  );
}
