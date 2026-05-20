'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { Billboard, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { MAP_SCALE, EXTRUSION_BASE, EXTRUSION_GAIN } from '@/lib/constants';
import type { ProjectedStateGeometry } from '@/lib/geo';
import { useAppStore } from '@/store/app-store';
import { lerp } from '@/lib/easing';

interface Props {
  geom: ProjectedStateGeometry;
}

const BASE_FONT = 0.22;
const HOT_FONT = 0.34;
const LABEL_PADDING = 0.06;       // small gap above the prism top
const HOT_LIFT = 0.18;             // extra rise when hovered/selected

/**
 * Billboarded state code that rides the prism top.
 *
 * The label's Y position is recomputed in useFrame to match whatever the
 * current layer mode does to mesh.scale.z. That keeps the label glued to
 * the top of the prism through EXTRUSION ↔ CHOROPLETH ↔ SURFACE toggles
 * and through live intensity/lean changes — no jumpiness.
 *
 * X/Z (the horizontal position) are fixed at the state's projected centroid.
 */
export function StateLabel({ geom }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const textRef = useRef<any>(null);

  const showLabels = useAppStore(s => s.showLabels);

  // Fixed horizontal placement. After the parent group's -π/2 X rotation,
  // shape (cx, cy) maps to world (cx*scale, _, -cy*scale).
  const [cx, cy] = geom.centroid;
  const worldX = cx * MAP_SCALE;
  const worldZ = -cy * MAP_SCALE;

  useFrame(() => {
    const grp = groupRef.current;
    if (!grp) return;

    const st = useAppStore.getState();
    if (!st.showLabels) return;

    const s = st.states[geom.code];
    const layer = st.layer;
    const hovered = st.hoveredCode === geom.code;
    const selected = st.selectedCode === geom.code;
    const isHot = hovered || selected;

    // Match StateExtrusion's height calculation so the label sits just above
    // the prism top for whatever layer mode is active.
    let prismHeight: number;
    if (!s || layer === 'choropleth') {
      prismHeight = EXTRUSION_BASE;
    } else if (layer === 'surface') {
      prismHeight = EXTRUSION_BASE + Math.abs(s.partisanLean) * (EXTRUSION_GAIN * 1.4);
    } else {
      prismHeight = EXTRUSION_BASE + s.intensity * EXTRUSION_GAIN;
    }

    const targetY = prismHeight + LABEL_PADDING + (isHot ? HOT_LIFT : 0);
    grp.position.y = lerp(grp.position.y, targetY, 0.16);

    // Font size and color via text ref (drei's Text has color + fontSize as props
    // but they also accept imperative updates).
    if (textRef.current) {
      const targetSize = isHot ? HOT_FONT : BASE_FONT;
      textRef.current.fontSize = lerp(textRef.current.fontSize ?? BASE_FONT, targetSize, 0.18);
      textRef.current.color = isHot ? '#f0c155' : '#cad0db';
    }
  });

  if (!showLabels) return null;

  return (
    <group ref={groupRef} position={[worldX, EXTRUSION_BASE + LABEL_PADDING, worldZ]}>
      <Billboard>
        <Text
          ref={textRef}
          fontSize={BASE_FONT}
          color="#cad0db"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.005}
          outlineColor="#000000"
          depthOffset={-1}
        >
          {geom.code}
        </Text>
      </Billboard>
    </group>
  );
}
