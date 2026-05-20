'use client';

import { StateDetailPanel } from '@/components/panels/StateDetailPanel';
import { NationalMetrics } from '@/components/panels/NationalMetrics';
import { AlertsCenter } from '@/components/panels/AlertsCenter';
import { NewsFeed } from '@/components/panels/NewsFeed';
import { useAppStore } from '@/store/app-store';
import { PanelToggle } from '@/components/ui/PanelToggle';

const LEFT_WIDTH = 320;
const RIGHT_WIDTH = 330;
const RAIL_INSET = 12;      // distance from screen edge to panel
const CHEVRON_GAP = 10;     // clear space between chevron and panel
const TRANS = 'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]';

export function SidePanels() {
  const topBar = useAppStore(s => s.panels.topBar);
  const leftVisible = useAppStore(s => s.panels.leftRail);
  const rightVisible = useAppStore(s => s.panels.rightRail);
  const tickerVisible = useAppStore(s => s.panels.ticker);

  const topOffset = topBar ? 64 : 16;
  const bottomOffset = tickerVisible ? 52 : 16;

  return (
    <>
      {/* Left rail */}
      <aside
        className={`absolute z-10 flex flex-col gap-3 overflow-y-auto pointer-events-auto ${TRANS}`}
        style={{
          left: RAIL_INSET,
          top: topOffset,
          bottom: bottomOffset,
          width: LEFT_WIDTH,
          transform: leftVisible ? 'translateX(0)' : `translateX(-${LEFT_WIDTH + RAIL_INSET + 8}px)`,
        }}
      >
        <NationalMetrics />
        <AlertsCenter />
      </aside>
      <PanelToggle
        panel="leftRail"
        side="left"
        label="left rail"
        style={{
          position: 'absolute',
          top: '50%',
          left: leftVisible ? RAIL_INSET + LEFT_WIDTH + CHEVRON_GAP : 6,
          transform: 'translateY(-50%)',
          transition: 'left 300ms cubic-bezier(0.4,0,0.2,1)',
        }}
      />

      {/* Right rail */}
      <aside
        className={`absolute z-10 flex flex-col gap-3 overflow-y-auto pointer-events-auto ${TRANS}`}
        style={{
          right: RAIL_INSET,
          top: topOffset,
          bottom: bottomOffset,
          width: RIGHT_WIDTH,
          transform: rightVisible ? 'translateX(0)' : `translateX(${RIGHT_WIDTH + RAIL_INSET + 8}px)`,
        }}
      >
        <StateDetailPanel />
        <NewsFeed />
      </aside>
      <PanelToggle
        panel="rightRail"
        side="right"
        label="right rail"
        style={{
          position: 'absolute',
          top: '50%',
          right: rightVisible ? RAIL_INSET + RIGHT_WIDTH + CHEVRON_GAP : 6,
          transform: 'translateY(-50%)',
          transition: 'right 300ms cubic-bezier(0.4,0,0.2,1)',
        }}
      />
    </>
  );
}
