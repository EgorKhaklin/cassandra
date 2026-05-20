'use client';

import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import type { ProjectedStateGeometry } from '@/lib/geo';
import { MAP_SCALE, EXTRUSION_BASE, EXTRUSION_GAIN } from '@/lib/constants';
import { leanColor } from '@/lib/color-scale';
import { useAppStore } from '@/store/app-store';
import { lerp } from '@/lib/easing';

interface Props {
  geom: ProjectedStateGeometry;
}

export function StateExtrusion({ geom }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const edgeRef = useRef<THREE.LineSegments>(null);
  const edgeMatRef = useRef<THREE.LineBasicMaterial>(null);
  const tmpColor = useMemo(() => new THREE.Color(), []);
  const tmpEdgeColor = useMemo(() => new THREE.Color(), []);

  const setHovered = useAppStore(s => s.setHovered);
  const setSelected = useAppStore(s => s.setSelected);

  // Build geometry once. Geometry is in shape coords (XY plane, Y-up); the
  // parent group is rotated -π/2 on X so the shape lands on the ground plane
  // and the extrusion direction (local +Z) becomes world +Y (up).
  const { geometry, topEdgesGeometry } = useMemo(() => {
    const shapes: THREE.Shape[] = [];

    for (const poly of geom.polygons) {
      if (poly.length === 0) continue;
      const [outer, ...holes] = poly;
      if (!outer || outer.length < 6) continue;

      const shape = new THREE.Shape();
      for (let i = 0; i < outer.length; i += 2) {
        const x = outer[i] * MAP_SCALE;
        const y = outer[i + 1] * MAP_SCALE;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      shape.autoClose = true;

      for (const ring of holes) {
        if (ring.length < 6) continue;
        const hole = new THREE.Path();
        for (let i = 0; i < ring.length; i += 2) {
          const x = ring[i] * MAP_SCALE;
          const y = ring[i + 1] * MAP_SCALE;
          if (i === 0) hole.moveTo(x, y);
          else hole.lineTo(x, y);
        }
        shape.holes.push(hole);
      }

      shapes.push(shape);
    }

    const extruded = new THREE.ExtrudeGeometry(shapes, {
      depth: 1,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.004,
      bevelOffset: 0,
      bevelSegments: 1,
      curveSegments: 1,
      steps: 1,
    });
    extruded.computeVertexNormals();

    // Build a "top outline" buffer geometry that's the outer + hole rings
    // extruded to z=1. This renders cleanly above the fill via polygonOffset.
    const positions: number[] = [];
    for (const poly of geom.polygons) {
      for (const ring of poly) {
        if (ring.length < 4) continue;
        for (let i = 0; i < ring.length; i += 2) {
          const x0 = ring[i] * MAP_SCALE;
          const y0 = ring[i + 1] * MAP_SCALE;
          const x1 = ring[(i + 2) % ring.length] * MAP_SCALE;
          const y1 = ring[(i + 3) % ring.length] * MAP_SCALE;
          // Each segment is a line: top edge at z=1
          positions.push(x0, y0, 1, x1, y1, 1);
        }
      }
    }
    const topEdges = new THREE.BufferGeometry();
    topEdges.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    return { geometry: extruded, topEdgesGeometry: topEdges };
  }, [geom]);

  useEffect(() => {
    if (!matRef.current) return;
    matRef.current.color.set('#1a212c');
    matRef.current.emissive.set('#000000');
  }, []);

  useFrame(() => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;

    const st = useAppStore.getState();
    const s = st.states[geom.code];
    if (!s) return;

    const hovered = st.hoveredCode === geom.code;
    const selected = st.selectedCode === geom.code;
    const layer = st.layer;

    // EXTRUSION: height = intensity (engagement) — default question.
    // CHOROPLETH: flat — color-only readout, classic choropleth map.
    // SURFACE:    height = |partisanLean| (political extremity) — answers
    //             "where is the polity most polarized?" visually.
    let targetH: number;
    if (layer === 'choropleth') {
      targetH = EXTRUSION_BASE;
    } else if (layer === 'surface') {
      const extremity = Math.abs(s.partisanLean); // 0..100
      targetH = EXTRUSION_BASE + extremity * (EXTRUSION_GAIN * 1.4) +
        (selected ? 0.45 : hovered ? 0.2 : 0);
    } else {
      targetH = EXTRUSION_BASE + s.intensity * EXTRUSION_GAIN +
        (selected ? 0.45 : hovered ? 0.18 : 0);
    }
    mesh.scale.z = lerp(mesh.scale.z, targetH, 0.14);

    tmpColor.set(leanColor(s.partisanLean, s.intensity));
    if (selected) tmpColor.lerp(new THREE.Color('#f0c155'), 0.28);
    else if (hovered) tmpColor.lerp(new THREE.Color('#d4a437'), 0.30);
    mat.color.lerp(tmpColor, 0.2);

    // Subtle emissive — only for selected/hovered. Volatility no longer floods
    // every state with amber.
    if (selected) {
      mat.emissive.setRGB(0.22, 0.14, 0.04);
    } else if (hovered) {
      mat.emissive.setRGB(0.15, 0.10, 0.025);
    } else {
      // Faint volatility tint, capped low.
      const vol = Math.min(1, s.volatility / 80);
      mat.emissive.setRGB(vol * 0.06, vol * 0.045, vol * 0.012);
    }
    mat.emissiveIntensity = 1.0;

    // Track mesh scale on the edge overlay so the top outline rides the prism top.
    const edge = edgeRef.current;
    if (edge) {
      edge.scale.z = mesh.scale.z;
    }
    // Edge color: gold-tinted on hover/selected, neutral otherwise.
    const edgeMat = edgeMatRef.current;
    if (edgeMat) {
      tmpEdgeColor.set(selected ? '#f0c155' : hovered ? '#d4a437' : '#5a6479');
      edgeMat.color.lerp(tmpEdgeColor, 0.25);
      edgeMat.opacity = selected ? 1 : hovered ? 0.95 : 0.7;
    }
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(geom.code);
    if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
  };
  const handlePointerOut = () => {
    setHovered(null);
    if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
  };
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setSelected(geom.code);
  };

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          ref={matRef}
          color={'#1a212c'}
          metalness={0.05}
          roughness={0.85}
          envMapIntensity={0.25}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>

      {/* Top edge outline — rides the prism's scale.z via imperative update.
          polygonOffset on the fill keeps the line visible without z-fighting. */}
      <lineSegments ref={edgeRef} geometry={topEdgesGeometry}>
        <lineBasicMaterial ref={edgeMatRef} color="#5a6479" transparent opacity={0.7} />
      </lineSegments>
    </group>
  );
}
