'use client';

import { Sigil } from '@/components/ui/Sigil';
import { useAppStore, type Layer } from '@/store/app-store';
import { fmtClock } from '@/lib/format';
import { useEffect, useState } from 'react';
import { PanelToggle } from '@/components/ui/PanelToggle';

const LAYERS: { key: Layer; label: string; caption: string }[] = [
  { key: 'extrusion',  label: 'EXTRUSION',  caption: 'engagement (intensity)' },
  { key: 'choropleth', label: 'CHOROPLETH', caption: 'lean (flat color)' },
  { key: 'surface',    label: 'SURFACE',    caption: 'extremity (|lean|)' },
];

export function TopBar() {
  const layer = useAppStore(s => s.layer);
  const setLayer = useAppStore(s => s.setLayer);
  const showLabels = useAppStore(s => s.showLabels);
  const setShowLabels = useAppStore(s => s.setShowLabels);
  const showGrid = useAppStore(s => s.showGrid);
  const setShowGrid = useAppStore(s => s.setShowGrid);
  const streamHealth = useAppStore(s => s.streamHealth);
  const tickRate = useAppStore(s => s.tickRate);
  const fps = useAppStore(s => s.fps);
  const topBarVisible = useAppStore(s => s.panels.topBar);
  const hideAll = useAppStore(s => s.hideAllPanels);
  const showAll = useAppStore(s => s.showAllPanels);
  const panels = useAppStore(s => s.panels);
  const togglePanel = useAppStore(s => s.togglePanel);
  const allHidden = !panels.leftRail && !panels.rightRail && !panels.timeline && !panels.ticker && !panels.legend;
  const muted = !panels.toasts;

  // Defer the clock to client-only (avoids SSR/CSR mismatch on first paint).
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const healthColor =
    streamHealth === 'NOMINAL' ? '#3a8a5f' :
    streamHealth === 'CONNECTING' ? '#c69022' :
    streamHealth === 'DEGRADED' ? '#c69022' : '#b8312a';

  return (
    <>
    <header
      className="absolute top-0 left-0 right-0 z-20 h-12 bg-void/90 backdrop-blur border-b border-slate-800/80 flex items-center px-4 gap-6 font-mono text-2xs transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{ transform: topBarVisible ? 'translateY(0)' : 'translateY(-100%)' }}
    >
      <div className="flex items-center gap-2.5">
        <Sigil size={22} />
        <span className="text-ivory tracking-[0.32em] font-semibold">CASSANDRA</span>
        <span className="text-slate-500 ml-1">v0.1</span>
      </div>

      <div className="flex items-center gap-2 pl-4 border-l border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full animate-pulse-slow"
            style={{ background: healthColor, boxShadow: `0 0 8px ${healthColor}` }}
          />
          <span className="text-slate-300 tracking-widest">{streamHealth}</span>
        </div>
        <span className="text-slate-500">·</span>
        <span className="text-slate-400">{tickRate}/min</span>
        <span className="text-slate-500">·</span>
        <span className="text-slate-400">{fps} FPS</span>
      </div>

      <div className="flex items-center gap-1 pl-4 border-l border-slate-800/80">
        {LAYERS.map(l => (
          <button
            key={l.key}
            onClick={() => setLayer(l.key)}
            title={l.caption}
            className={`px-2 py-1 rounded-sm tracking-widest transition-colors ${
              layer === l.key
                ? 'bg-gold/10 text-gold border border-gold/40'
                : 'text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {l.label}
          </button>
        ))}
        <span className="text-slate-600 ml-2 text-[10px] tracking-widest">
          ›  {LAYERS.find(l => l.key === layer)?.caption}
        </span>
      </div>

      <div className="flex items-center gap-1 pl-4 border-l border-slate-800/80">
        <button
          onClick={() => setShowLabels(!showLabels)}
          title="Toggle state code labels (CA, TX, ...)"
          className={`px-2 py-1 rounded-sm tracking-widest transition-colors ${
            showLabels
              ? 'text-gold border border-gold/30 bg-gold/5'
              : 'text-slate-500 border border-slate-800 hover:text-slate-300'
          }`}
        >
          LABELS
        </button>
        <button
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle the floor reference grid under the country"
          className={`px-2 py-1 rounded-sm tracking-widest transition-colors ${
            showGrid
              ? 'text-gold border border-gold/30 bg-gold/5'
              : 'text-slate-500 border border-slate-800 hover:text-slate-300'
          }`}
        >
          GRID
        </button>
      </div>

      <div className="ml-auto flex items-center gap-3 text-slate-400">
        <button
          onClick={() => togglePanel('toasts')}
          className={`flex items-center gap-1.5 border px-2 py-1 rounded-sm transition-colors ${
            muted
              ? 'text-crit border-crit/40 bg-crit/10'
              : 'border-slate-800 hover:border-gold/40 hover:text-gold'
          }`}
          title={muted ? 'Unmute warnings' : 'Mute warning toasts'}
        >
          <span className="text-sm leading-none -mt-0.5">{muted ? '⊘' : '◉'}</span>
          <span className="tracking-widest">{muted ? 'MUTED' : 'WARNINGS'}</span>
        </button>
        <button
          onClick={() => (allHidden ? showAll() : hideAll())}
          className={`flex items-center gap-1.5 border px-2 py-1 rounded-sm transition-colors ${
            allHidden
              ? 'text-gold border-gold/40 bg-gold/10'
              : 'border-slate-800 hover:border-gold/40 hover:text-gold'
          }`}
          title={allHidden ? 'Show all panels' : 'Solo map (hide all panels)'}
        >
          <span className="tracking-widest">{allHidden ? 'SHOW ALL' : 'SOLO MAP'}</span>
        </button>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('cassandra-jump'))}
          className="flex items-center gap-1.5 border border-slate-800 px-2 py-1 rounded-sm hover:border-gold/40 hover:text-gold transition-colors"
          title="Jump to state (⌘K)"
        >
          <span className="tracking-widest">JUMP</span>
          <span className="text-slate-600 text-[10px]">⌘K</span>
        </button>
        <span className="tracking-widest tabular-nums">
          {now !== null ? fmtClock(now) : '--:--:--Z'}
        </span>
      </div>
    </header>
    {/* Top bar collapse chevron — pinned to the center-top edge */}
    <PanelToggle
      panel="topBar"
      side="top"
      label="top bar"
      style={{
        position: 'absolute',
        top: topBarVisible ? 60 : 8,
        left: '50%',
        transform: 'translateX(-50%)',
        transition: 'top 300ms cubic-bezier(0.4,0,0.2,1)',
      }}
    />
    </>
  );
}
