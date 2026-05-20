import { describe, it, expect } from 'vitest';
import { leanColor, severityColor, confidenceColor, clamp } from '../src/lib/color-scale';

describe('color-scale', () => {
  it('clamp keeps values in range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  it('leanColor returns 7-char hex strings', () => {
    const c1 = leanColor(0, 60);
    const c2 = leanColor(50, 80);
    const c3 = leanColor(-50, 80);
    for (const c of [c1, c2, c3]) {
      expect(c).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('leanColor pure D should differ from pure R', () => {
    expect(leanColor(100, 100)).not.toBe(leanColor(-100, 100));
  });

  it('low intensity dims the color (mostly grayer)', () => {
    const lowI = leanColor(60, 5);
    const hiI = leanColor(60, 100);
    expect(lowI).not.toBe(hiI);
  });

  it('severityColor returns a hex per severity', () => {
    expect(severityColor('INFO')).toMatch(/^#/);
    expect(severityColor('WATCH')).toMatch(/^#/);
    expect(severityColor('WARN')).toMatch(/^#/);
    expect(severityColor('CRIT')).toMatch(/^#/);
    // CRIT should differ from INFO
    expect(severityColor('CRIT')).not.toBe(severityColor('INFO'));
  });

  it('confidenceColor maps to distinct hexes', () => {
    expect(confidenceColor('HIGH')).not.toBe(confidenceColor('LOW'));
    expect(confidenceColor('MED')).not.toBe(confidenceColor('HIGH'));
  });
});
