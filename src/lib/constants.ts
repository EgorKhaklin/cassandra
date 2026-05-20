export const TICK_INTERVAL_MS = 1200;
export const NATIONAL_SNAPSHOT_INTERVAL_MS = 4800;
export const NEWS_INTERVAL_MS = 7000;
export const HEARTBEAT_INTERVAL_MS = 5000;

export const STREAM_PATH = '/api/stream';

export const HISTORY_BUFFER_SIZE = 48; // ~1 hour at 1.2s/tick? no — used for sparkline display

// Scene scaling: country span ≈ 1015 x 594 in shape coords (post Y-flip).
// 0.022 world units per pixel → world span ≈ 22 x 13. Fills the canvas
// comfortably while leaving margin for HUD panels on each side.
export const MAP_SCALE = 0.022;
export const EXTRUSION_BASE = 0.12;   // minimum prism height
export const EXTRUSION_GAIN = 0.028;  // intensity → height multiplier (intensity * GAIN = max ~2.8)

// Default alert thresholds.
export const ALERT_RULES = {
  SWING_DELTA_24H: 4.0,       // 4-point lean shift in a swing state
  INTENSITY_SPIKE: 18,        // 18-point intensity spike
  CRIT_DELTA_24H: 7.0,        // 7-point shift — critical
};
