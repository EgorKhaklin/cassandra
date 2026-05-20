'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useAppStore } from '@/store/app-store';
import { loadStateGeometries } from '@/lib/geo';
import { MAP_SCALE } from '@/lib/constants';

/**
 * A vertical gold beam that pierces the selected state.
 * Drawn as a tall transparent cylinder + a halo ring on the ground.
 * Both fade in when a state is selected, fade out otherwise.
 */
export function SelectionBeam() {
  const groupRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const beamMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const geoms = useMemo(() => {
    try { return loadStateGeometries(); } catch { return null; }
  }, []);

  useFrame(() => {
    const grp = groupRef.current;
    const beamMat = beamMatRef.current;
    const ringMat = ringMatRef.current;
    const ring = ringRef.current;
    if (!grp || !beamMat || !ringMat || !ring || !geoms) return;

    const selected = useAppStore.getState().selectedCode;

    const targetOpacity = selected ? 1 : 0;
    beamMat.opacity = THREE.MathUtils.lerp(beamMat.opacity, targetOpacity * 0.18, 0.16);
    ringMat.opacity = THREE.MathUtils.lerp(ringMat.opacity, targetOpacity * 0.7, 0.16);

    if (!selected) return;

    const geom = geoms.find(g => g.code === selected);
    if (!geom) return;
    const [cx, cy] = geom.centroid;
    grp.position.set(cx * MAP_SCALE, 0, -cy * MAP_SCALE);

    // Slow pulse for the ring
    const t = performance.now() * 0.001;
    ring.scale.setScalar(1 + Math.sin(t * 2.4) * 0.08);
  });

  return (
    <group ref={groupRef}>
      {/* Tall beam */}
      <mesh ref={beamRef} position={[0, 8, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 16, 16]} />
        <meshBasicMaterial ref={beamMatRef} color="#f0c155" transparent opacity={0} />
      </mesh>
      {/* Halo ring on ground */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.55, 0.62, 64]} />
        <meshBasicMaterial ref={ringMatRef} color="#f0c155" transparent opacity={0} />
      </mesh>
    </group>
  );
}
