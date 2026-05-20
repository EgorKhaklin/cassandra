import dynamic from 'next/dynamic';
import { TopBar } from '@/components/layout/TopBar';
import { SidePanels } from '@/components/layout/SidePanels';
import { NewsTicker } from '@/components/panels/NewsTicker';
import { Timeline } from '@/components/panels/Timeline';
import { MapLegend } from '@/components/map/MapLegend';
import { ToastDeck } from '@/components/ui/Toast';
import { StreamProvider } from '@/components/StreamProvider';
import { SearchPalette } from '@/components/ui/SearchPalette';

// The 3D canvas needs window — defer to client.
const USAMap3D = dynamic(() => import('@/components/map/USAMap3D'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-void">
      <div className="text-gold font-mono text-2xs tracking-[0.32em] animate-pulse-slow">
        INITIALIZING GEOSPATIAL CORE…
      </div>
    </div>
  ),
});

export default function Page() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-void">
      <USAMap3D />
      <div className="canvas-vignette" />
      <TopBar />
      <SidePanels />
      <MapLegend />
      <Timeline />
      <NewsTicker />
      <ToastDeck />
      <SearchPalette />
      <StreamProvider />

      {/* Watermark / version stamp — lower-right of map */}
      <div className="absolute bottom-12 right-4 z-10 font-mono text-[10px] uppercase tracking-[0.28em] text-slate-600 pointer-events-none">
        cassandra · sentinel of the polis
      </div>
    </main>
  );
}
