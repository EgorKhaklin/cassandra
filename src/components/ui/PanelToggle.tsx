'use client';

import { useAppStore } from '@/store/app-store';

type Side = 'left' | 'right' | 'top' | 'bottom';

interface Props {
  panel: 'leftRail' | 'rightRail' | 'timeline' | 'ticker' | 'topBar' | 'legend';
  side: Side;
  /** Inline style for absolute positioning. */
  style?: React.CSSProperties;
  label?: string;
}

/**
 * Small chevron toggle to collapse/expand a HUD panel. The button stays
 * pinned at the panel's screen-edge whether visible or hidden, so the
 * affordance is always reachable.
 */
export function PanelToggle({ panel, side, style, label }: Props) {
  const visible = useAppStore(s => s.panels[panel]);
  const toggle = useAppStore(s => s.togglePanel);

  // Chevron char picks based on side + visibility
  const glyph = (() => {
    if (side === 'left')   return visible ? '‹' : '›';
    if (side === 'right')  return visible ? '›' : '‹';
    if (side === 'top')    return visible ? '▲' : '▼';
    /* bottom */           return visible ? '▼' : '▲';
  })();

  const isHorizontal = side === 'top' || side === 'bottom';

  return (
    <button
      type="button"
      onClick={() => toggle(panel)}
      title={visible ? `Hide ${label ?? panel}` : `Show ${label ?? panel}`}
      aria-label={visible ? `Hide ${label ?? panel}` : `Show ${label ?? panel}`}
      className={`
        z-30 flex items-center justify-center
        bg-graphite/95 backdrop-blur
        border border-slate-700 text-slate-300
        hover:text-gold hover:border-gold/60 hover:bg-graphite
        active:scale-95
        font-mono leading-none transition-all duration-150
      `}
      style={{
        width: isHorizontal ? 46 : 22,
        height: isHorizontal ? 20 : 46,
        borderRadius: 4,
        fontSize: isHorizontal ? 11 : 13,
        boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 4px 12px -2px rgba(0,0,0,0.4)',
        ...style,
      }}
    >
      <span className="leading-none">{glyph}</span>
    </button>
  );
}
