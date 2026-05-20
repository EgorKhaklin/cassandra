// Number, time, and label formatters tuned for an intelligence HUD.

export function fmtLean(lean: number): string {
  const sign = lean >= 0 ? 'R+' : 'D+';
  return `${sign}${Math.abs(lean).toFixed(1)}`;
}

export function fmtDelta(d: number): string {
  if (d === 0) return '±0.0';
  const sign = d > 0 ? '+' : '−';
  return `${sign}${Math.abs(d).toFixed(1)}`;
}

export function fmtPct(p: number, digits = 0): string {
  return `${p.toFixed(digits)}%`;
}

export function fmtNum(n: number, digits = 1): string {
  return n.toFixed(digits);
}

export function fmtTimeShort(ts: number, now = Date.now()): string {
  const diffSec = Math.floor((now - ts) / 1000);
  if (diffSec < 1) return 'now';
  if (diffSec < 60) return `${diffSec}s`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  return `${Math.floor(diffSec / 86400)}d`;
}

export function fmtClock(ts: number): string {
  const d = new Date(ts);
  return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}:${d.getUTCSeconds().toString().padStart(2, '0')}Z`;
}

export function severityLabel(sev: 'INFO' | 'WATCH' | 'WARN' | 'CRIT'): string {
  return sev;
}

export function issueLabel(k: string): string {
  switch (k) {
    case 'foreign-policy': return 'Foreign Policy';
    case 'civil-rights': return 'Civil Rights';
    default: return k.charAt(0).toUpperCase() + k.slice(1);
  }
}
