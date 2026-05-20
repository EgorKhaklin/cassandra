'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useAppStore } from '@/store/app-store';

/**
 * The stage under the country.
 * - Dark "void" floor with a subtle radial vignette texture
 * - Two-layer grid (minor + major) toggleable via the GRID button in the top
 *   bar — bright enough to be obviously visible/invisible
 * - Reticule rings + cardinal tick marks for distance calibration
 */
export function GridPlane() {
  const showGrid = useAppStore(s => s.showGrid);

  // Minor grid: 80×80 fine cells, dim
  const minorGrid = useMemo(() => {
    const grid = new THREE.GridHelper(80, 80, '#3a4658', '#1f2734');
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.55;
    grid.position.y = -0.005;
    return grid;
  }, []);

  // Major grid: 80×8 coarse cells, brighter — gives a clear "quadrant" feel
  const majorGrid = useMemo(() => {
    const grid = new THREE.GridHelper(80, 8, '#6b7488', '#454f63');
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.42;
    grid.position.y = -0.004;
    return grid;
  }, []);

  // Radial-gradient floor texture (drawn once into a canvas).
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

      {showGrid && (
        <>
          <primitive object={minorGrid} />
          <primitive object={majorGrid} />
        </>
      )}

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
