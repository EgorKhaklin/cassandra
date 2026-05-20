// Easings for camera fly-to and HUD transitions.

export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeOutQuint = (t: number): number => 1 - Math.pow(1 - t, 5);

export const easeOutExpo = (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
