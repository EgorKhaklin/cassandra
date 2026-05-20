// The CASSANDRA sigil: an angular eye motif inside a hexagonal field.
// Pure SVG so it scales crisply and is themeable.

interface Props {
  size?: number;
  color?: string;
  className?: string;
}

export function Sigil({ size = 22, color = '#d4a437', className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="CASSANDRA sigil"
    >
      <defs>
        <linearGradient id="cas-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {/* Hex frame */}
      <polygon
        points="16,2 28,9 28,23 16,30 4,23 4,9"
        fill="none"
        stroke="url(#cas-grad)"
        strokeWidth="1.4"
      />
      {/* Inner angular eye */}
      <polygon
        points="16,9 23,16 16,23 9,16"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
      />
      {/* Pupil — small filled triangle */}
      <polygon points="16,13 19,17 13,17" fill={color} />
      {/* Spear / sight line through eye */}
      <line x1="2" y1="16" x2="9" y2="16" stroke={color} strokeWidth="0.8" />
      <line x1="23" y1="16" x2="30" y2="16" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}
