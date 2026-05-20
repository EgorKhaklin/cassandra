'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useAppStore } from '@/store/app-store';

/**
 * The stage under the country.
 * - Dark "void" floor with subtle radial vignette texture
 * - Faint orthogonal grid sitting just above the floor (toggleable)
 * - Two reticule rings (gold inner, dem-blue outer) — calibration marks
 */
export function GridPlane() {
  const showGrid = useAppStore(s => s.showGrid);

  const gridHelper = useMemo(() => {
    const grid = new THREE.GridHelper(80, 80, '#1c2531', '#11181f');
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.42;
    grid.position.y = -0.008;
    return grid;
  }, []);

  const floorTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const size = 512;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d')!;
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, '#0e131a');
    grad.addColorStop(0.55, '#080b10');
    grad.addColorStop(1, '#04060a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <circleGeometry args={[52, 96]} />
        <meshStandardMaterial
          map={floorTexture ?? undefined}
          color="#0a0e14"
          roughness={1}
          metalness={0.05}
        />
      </mesh>

      {showGrid && <primitive object={gridHelper} />}

      {/* Inner gold reticule */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[15, 15.08, 192]} />
        <meshBasicMaterial color="#d4a437" transparent opacity={0.28} />
      </mesh>
      {/* Mid dem-blue reticule */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[22, 22.08, 192]} />
        <meshBasicMaterial color="#2554a6" transparent opacity={0.18} />
      </mesh>
      {/* Outer faint ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[32, 32.05, 192]} />
        <meshBasicMaterial color="#1c2531" transparent opacity={0.7} />
      </mesh>

      {/* Cardinal direction marks (small gold ticks) */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((rot, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, rot]}
          position={[0, 0.003, 0]}
        >
          <planeGeometry args={[0.1, 1.4]} />
          <meshBasicMaterial color="#d4a437" transparent opacity={0.35} />
        </mesh>
      ))}
    </>
  );
}
