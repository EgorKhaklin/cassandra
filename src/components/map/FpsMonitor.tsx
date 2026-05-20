'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { useAppStore } from '@/store/app-store';

/** Sample FPS into the store every ~500ms (not every frame). */
export function FpsMonitor() {
  const frames = useRef(0);
  const last = useRef(performance.now());
  const setFps = useAppStore(s => s.setFps);

  useFrame(() => {
    frames.current++;
    const now = performance.now();
    if (now - last.current >= 500) {
      const fps = Math.round((frames.current * 1000) / (now - last.current));
      setFps(fps);
      frames.current = 0;
      last.current = now;
    }
  });

  return null;
}
