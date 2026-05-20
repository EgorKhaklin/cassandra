import { confidenceColor } from '@/lib/color-scale';
import type { Confidence } from '@/lib/types';

export function ConfidenceBadge({ level }: { level: Confidence }) {
  return (
    <span
      className="text-2xs font-mono uppercase tracking-widest px-1 py-px rounded-sm border"
      style={{ color: confidenceColor(level), borderColor: confidenceColor(level) }}
    >
      C·{level}
    </span>
  );
}
