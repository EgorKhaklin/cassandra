// Partisan-lean color scale.
// Input: lean in [-100, +100] (D..R); intensity in [0, 100].
// Output: a hex color string.
//
// Design rules:
// - A strong-D state (lean ≤ -25) MUST read unambiguously blue at any intensity.
// - A strong-R state (lean ≥ +25) MUST read unambiguously red at any intensity.
// - A swing state (|lean| < 5) reads neutral gray.
// - Intensity modulates LUMINANCE (energy) but never collapses hue.
// - All colors are muted from saturated-cable-news red/blue but still
//   instantly distinguishable on a dark canvas.

const DEM_LO  = { r: 36,  g: 64,  b: 142 };  // dark blue end
const DEM_MID = { r: 70,  g: 116, b: 196 };  // mid blue
const REP_LO  = { r: 158, g: 38,  b: 32  };  // dark red
const REP_MID = { r: 198, g: 78,  b: 64  };  // mid red
const NEUTRAL = { r: 88,  g: 96,  b: 110 };  // slate, slightly cool

type RGB = { r: number; g: number; b: number };

function mix(a: RGB, b: RGB, t: number): RGB {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

function toHex(rgb: RGB): string {
  const h = (n: number) => Math.max(0, Math.min(255, n | 0)).toString(16).padStart(2, '0');
  return `#${h(rgb.r)}${h(rgb.g)}${h(rgb.b)}`;
}

export function clamp(n: number, lo: number, hi: number): number {
  return n < lo ? lo : n > hi ? hi : n;
}

/**
 * Color for a state.
 *
 * Strategy:
 *   1. Pick base hue based on lean direction.
 *   2. Map |lean| to a magnitude curve that crosses ~50% saturation at lean=12
 *      so swing states have visible hue but strong-lean states are unambiguous.
 *   3. Modulate luminance by intensity within the chosen hue family.
 */
export function leanColor(lean: number, intensity = 60): string {
  const L = clamp(lean, -100, 100);
  const I = clamp(intensity, 0, 100);

  // Curve: 0 at lean=0; 1 at lean≈45; concave-up early so swing states get color.
  const mag = Math.min(1, Math.pow(Math.abs(L) / 45, 0.75));

  const direction = L >= 0 ? REP_MID : DEM_MID;
  const directionDark = L >= 0 ? REP_LO : DEM_LO;

  // From neutral toward the direction by magnitude.
  const hueColor = mix(NEUTRAL, direction, mag);

  // Engagement: a state with very low intensity dims toward the darker end of
  // its hue family (not toward neutral). That preserves color identity.
  const engagement = Math.pow(I / 100, 0.7);
  const baseFamily = mix(directionDark, hueColor, 0.45 + 0.55 * engagement);

  return toHex(baseFamily);
}

/** Continuous national-lean color for the balance gauge. */
export function nationalLeanColor(lean: number): string {
  return leanColor(lean, 100);
}

export function severityColor(sev: 'INFO' | 'WATCH' | 'WARN' | 'CRIT'): string {
  switch (sev) {
    case 'INFO': return '#7f8a9c';
    case 'WATCH': return '#d4a437';
    case 'WARN': return '#e08a3a';
    case 'CRIT': return '#c8392f';
  }
}

export function confidenceColor(c: 'HIGH' | 'MED' | 'LOW'): string {
  return c === 'HIGH' ? '#3a8a5f' : c === 'MED' ? '#c69022' : '#7f8a9c';
}
