'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitImpl } from 'three-stdlib';
import { useAppStore } from '@/store/app-store';
import { loadStateGeometries } from '@/lib/geo';
import { MAP_SCALE } from '@/lib/constants';
import { easeInOutCubic } from '@/lib/easing';

/**
 * Maps a shape-coord centroid (Y-up, pre-rotation) to scene-world target.
 *
 * The whole map group has rotation.x = -π/2. So a shape vertex (X, Y, 0)
 * lands at world (X, 0, -Y). We use this to compute a world-space fly-to
 * target above the state centroid.
 */
function shapeToWorldTarget(cx: number, cy: number, hoverHeight = 0): THREE.Vector3 {
  return new THREE.Vector3(cx * MAP_SCALE, hoverHeight, -cy * MAP_SCALE);
}

export function CameraController() {
  const controlsRef = useRef<OrbitImpl | null>(null);
  const { camera } = useThree();
  const selectedCode = useAppStore(s => s.selectedCode);
  const animRef = useRef<{
    startCam: THREE.Vector3;
    endCam: THREE.Vector3;
    startTgt: THREE.Vector3;
    endTgt: THREE.Vector3;
    startTime: number;
    durationMs: number;
  } | null>(null);

  useEffect(() => {
    if (!selectedCode || !controlsRef.current) return;
    const geoms = loadStateGeometries();
    const geom = geoms.find(g => g.code === selectedCode);
    if (!geom) return;

    const [cx, cy] = geom.centroid;
    const sceneTarget = shapeToWorldTarget(cx, cy, 0.4);

    // Closer than current radius; bird's-eye but still tilted.
    const currentRadius = camera.position.distanceTo(controlsRef.current.target);
    const flyRadius = Math.max(currentRadius * 0.55, 8);
    const azimuth = controlsRef.current.getAzimuthalAngle();
    const polar = Math.PI / 3.6; // tilt toward overhead, not pure top-down
    const x = sceneTarget.x + flyRadius * Math.sin(polar) * Math.sin(azimuth);
    const y = sceneTarget.y + flyRadius * Math.cos(polar);
    const z = sceneTarget.z + flyRadius * Math.sin(polar) * Math.cos(azimuth);

    animRef.current = {
      startCam: camera.position.clone(),
      endCam: new THREE.Vector3(x, y, z),
      startTgt: controlsRef.current.target.clone(),
      endTgt: sceneTarget,
      startTime: performance.now(),
      durationMs: 900,
    };
  }, [selectedCode, camera]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const a = animRef.current;
      const ctrls = controlsRef.current;
      if (a && ctrls) {
        const t = Math.min(1, (performance.now() - a.startTime) / a.durationMs);
        const k = easeInOutCubic(t);
        camera.position.lerpVectors(a.startCam, a.endCam, k);
        ctrls.target.lerpVectors(a.startTgt, a.endTgt, k);
        ctrls.update();
        if (t >= 1) animRef.current = null;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={6}
      maxDistance={90}
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI / 2.05}
      target={[0, 0, 0]}
    />
  );
}
