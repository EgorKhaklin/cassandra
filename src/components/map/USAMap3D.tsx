'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { StateExtrusion } from './StateExtrusion';
import { CameraController } from './CameraController';
import { GridPlane } from './GridPlane';
import { StateLabel } from './StateLabel';
import { Lighting } from './Lighting';
import { FpsMonitor } from './FpsMonitor';
import { SelectionBeam } from './SelectionBeam';
import { loadStateGeometries, type ProjectedStateGeometry } from '@/lib/geo';
import { useAppStore } from '@/store/app-store';

export default function USAMap3D() {
  const [geoms, setGeoms] = useState<ProjectedStateGeometry[] | null>(null);
  const setSelected = useAppStore(s => s.setSelected);

  useEffect(() => {
    try {
      setGeoms(loadStateGeometries());
    } catch (e) {
      console.error('Failed to load geometries', e);
    }
  }, []);

  const handlePointerMissed = () => setSelected(null);

  const sceneChildren = useMemo(() => {
    if (!geoms) return null;
    return (
      <>
        {geoms.map(g => <StateExtrusion key={g.code} geom={g} />)}
        {geoms.map(g => <StateLabel key={`l-${g.code}`} geom={g} />)}
      </>
    );
  }, [geoms]);

  return (
    <div className="absolute inset-0 bg-void">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.85,
        }}
        camera={{ position: [0, 16, 22], fov: 40, near: 0.1, far: 300 }}
        onPointerMissed={handlePointerMissed}
      >
        <color attach="background" args={['#05070a']} />
        <fog attach="fog" args={['#05070a', 36, 110]} />

        <Suspense fallback={null}>
          <Lighting />
          <GridPlane />
          {sceneChildren}
          <SelectionBeam />
          <CameraController />
          <FpsMonitor />
        </Suspense>
      </Canvas>
    </div>
  );
}
