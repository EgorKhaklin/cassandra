// Quick CLI sanity check on the projection pipeline.
// Run: node scripts/debug-geo.mjs

import { feature } from 'topojson-client';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const topoPath = require.resolve('us-atlas/states-albers-10m.json');
const statesTopo = JSON.parse(readFileSync(topoPath, 'utf8'));

const fc = feature(statesTopo, statesTopo.objects.states);

console.log('States in topojson:', fc.features.length);

function signedArea(ring) {
  let a = 0;
  for (let i = 0, n = ring.length; i < n; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % n];
    a += x1 * y2 - x2 * y1;
  }
  return a / 2;
}

let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
let totalRings = 0;
let ccwOuters = 0;
let cwOuters = 0;

for (const feat of fc.features) {
  const geom = feat.geometry;
  if (!geom) continue;
  const polygons = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  for (const poly of polygons) {
    for (const [ringIdx, ring] of poly.entries()) {
      totalRings++;
      const a = signedArea(ring);
      if (ringIdx === 0) {
        if (a > 0) ccwOuters++; else cwOuters++;
      }
      for (const [x, y] of ring) {
        if (x < xMin) xMin = x;
        if (x > xMax) xMax = x;
        if (y < yMin) yMin = y;
        if (y > yMax) yMax = y;
      }
    }
  }
}

console.log('Total rings:', totalRings);
console.log('Outer ring winding: CCW=' + ccwOuters + '  CW=' + cwOuters);
console.log('Bounds X:', xMin.toFixed(1), '..', xMax.toFixed(1));
console.log('Bounds Y:', yMin.toFixed(1), '..', yMax.toFixed(1));
console.log('Center:', ((xMin + xMax) / 2).toFixed(1), ((yMin + yMax) / 2).toFixed(1));
console.log('Span:  ', (xMax - xMin).toFixed(1), 'x', (yMax - yMin).toFixed(1));

// Inspect California
const ca = fc.features.find(f => f.id === '06');
if (ca) {
  const g = ca.geometry;
  const sample = g.type === 'Polygon' ? g.coordinates[0] : g.coordinates[0][0];
  console.log('\nCA outer ring vertex count:', sample.length);
  console.log('CA first vertex:', sample[0]);
  console.log('CA mid vertex:  ', sample[Math.floor(sample.length / 2)]);
  console.log('CA last vertex: ', sample[sample.length - 1]);
  console.log('CA outer area:', signedArea(sample).toFixed(0));
}

// Inspect DC (small)
const dc = fc.features.find(f => f.id === '11');
if (dc) {
  const g = dc.geometry;
  const sample = g.type === 'Polygon' ? g.coordinates[0] : g.coordinates[0][0];
  console.log('\nDC outer ring vertex count:', sample.length);
  console.log('DC bounds: ',
    Math.min(...sample.map(p => p[0])).toFixed(1), '..',
    Math.max(...sample.map(p => p[0])).toFixed(1), 'x',
    Math.min(...sample.map(p => p[1])).toFixed(1), '..',
    Math.max(...sample.map(p => p[1])).toFixed(1)
  );
}
