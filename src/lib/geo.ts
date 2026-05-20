// Project us-atlas (TopoJSON) state polygons to 2D Y-up coords for THREE.
// Computed once at module load and cached.
//
// Pipeline:
//   1. us-atlas ships states-albers-10m in pre-projected image-pixel space.
//      X=east (right), Y=south (down). Bounds ≈ X∈[-58, 957], Y∈[13, 607].
//   2. We center on the actual bounds centroid (not 480x300 — Alaska
//      pushes left of the conceptual frame) and flip Y to Y-up.
//   3. Outer rings in us-atlas are CCW in image-Y-down. After flipping Y,
//      they become CW in Y-up. THREE.Shape expects CCW outer / CW holes
//      in Y-up — so we REVERSE each ring after the flip to restore the
//      correct winding. (Earcut tolerates either, but ExtrudeGeometry's
//      side-face normals depend on winding being right.)
//   4. Each state's geometry is exposed as a list of polygons; each polygon
//      is [outer, ...holes]; each ring is a flat [x0,y0, x1,y1, ...].

import { feature } from 'topojson-client';
import { geoPath } from 'd3-geo';
import type { FeatureCollection, Feature, Geometry } from 'geojson';

import statesTopo from 'us-atlas/states-albers-10m.json';

import { FIPS_TO_STATE } from '@/data/states';

// Empirically inspected bounds (see scripts/debug-geo.mjs).
const CENTER_X = 449.7;
const CENTER_Y = 309.8;

export interface ProjectedStateGeometry {
  code: string;
  name: string;
  /** List of polygons. Each polygon: [outer, ...holes]. Each ring: flat XY (Y-up). */
  polygons: number[][][];
  /** Centroid in Y-up centered coords. */
  centroid: [number, number];
  /** [minX, minY, maxX, maxY] in Y-up centered coords. */
  bounds: [number, number, number, number];
  /** Approximate width × height (Y-up units, before world scale). */
  size: [number, number];
}

function transform(pt: readonly [number, number]): [number, number] {
  // Y-up, centered on actual centroid.
  return [pt[0] - CENTER_X, -(pt[1] - CENTER_Y)];
}

/** Signed area of a ring (flat-array form) in Y-up: positive = CCW. */
function signedAreaFlat(ring: number[]): number {
  let a = 0;
  const n = ring.length;
  for (let i = 0; i < n; i += 2) {
    const x1 = ring[i];
    const y1 = ring[i + 1];
    const x2 = ring[(i + 2) % n];
    const y2 = ring[(i + 3) % n];
    a += x1 * y2 - x2 * y1;
  }
  return a / 2;
}

function reverseFlatRing(ring: number[]): number[] {
  const out = new Array<number>(ring.length);
  const n = ring.length;
  for (let i = 0; i < n; i += 2) {
    out[n - i - 2] = ring[i];
    out[n - i - 1] = ring[i + 1];
  }
  return out;
}

let cached: ProjectedStateGeometry[] | null = null;

export function loadStateGeometries(): ProjectedStateGeometry[] {
  if (cached) return cached;

  const fc = feature(statesTopo as any, (statesTopo as any).objects.states) as unknown as
    FeatureCollection<Geometry, { name: string }>;

  const path = geoPath();
  const out: ProjectedStateGeometry[] = [];

  for (const feat of fc.features) {
    const id = (feat.id as string)?.padStart(2, '0');
    const meta = FIPS_TO_STATE[id];
    if (!meta) continue;

    const geom = feat.geometry;
    if (!geom) continue;

    const polys: number[][][] = [];

    const collectPolygon = (rings: number[][][]) => {
      const out: number[][] = [];
      for (let r = 0; r < rings.length; r++) {
        // Project to Y-up.
        const flat: number[] = [];
        for (const pt of rings[r]) {
          const [x, y] = transform(pt as [number, number]);
          flat.push(x, y);
        }
        // Winding correction: outer should be CCW (positive area), holes CW.
        const area = signedAreaFlat(flat);
        const isOuter = r === 0;
        const corrected = (isOuter && area < 0) || (!isOuter && area > 0)
          ? reverseFlatRing(flat)
          : flat;
        out.push(corrected);
      }
      polys.push(out);
    };

    if (geom.type === 'Polygon') {
      collectPolygon(geom.coordinates as number[][][]);
    } else if (geom.type === 'MultiPolygon') {
      for (const poly of geom.coordinates as number[][][][]) {
        collectPolygon(poly);
      }
    }

    const c = path.centroid(feat as Feature<Geometry>);
    const [cx, cy] = transform(c as [number, number]);

    const b = path.bounds(feat as Feature<Geometry>);
    const [bx1, by1] = transform(b[0] as [number, number]);
    const [bx2, by2] = transform(b[1] as [number, number]);
    const minX = Math.min(bx1, bx2);
    const maxX = Math.max(bx1, bx2);
    const minY = Math.min(by1, by2);
    const maxY = Math.max(by1, by2);

    out.push({
      code: meta.code,
      name: meta.name,
      polygons: polys,
      centroid: [cx, cy],
      bounds: [minX, minY, maxX, maxY],
      size: [maxX - minX, maxY - minY],
    });
  }

  cached = out;
  return cached;
}

/** Bounds of the combined country geometry in shape coords. */
export function countryBounds() {
  const geoms = loadStateGeometries();
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const g of geoms) {
    if (g.bounds[0] < minX) minX = g.bounds[0];
    if (g.bounds[1] < minY) minY = g.bounds[1];
    if (g.bounds[2] > maxX) maxX = g.bounds[2];
    if (g.bounds[3] > maxY) maxY = g.bounds[3];
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}
