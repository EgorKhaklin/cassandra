// Tiny SVG sparkline. Renders a polyline plus a center reference line.

interface Props {
  data: number[];
  width?: number;
  height?: number;
  min?: number;
  max?: number;
  color?: string;
  reference?: number; // y value to draw a horizontal reference line at
}

export function Sparkline({
  data,
  width = 160,
  height = 36,
  min,
  max,
  color = '#d4a437',
  reference = 0,
}: Props) {
  if (!data || data.length === 0) {
    return <svg width={width} height={height} className="block" />;
  }

  const lo = min ?? Math.min(...data);
  const hi = max ?? Math.max(...data);
  const range = Math.max(0.0001, hi - lo);

  const xStep = width / Math.max(1, data.length - 1);
  const y = (v: number) => height - ((v - lo) / range) * height;

  const refY = y(reference);

  const points = data
    .map((d, i) => `${(i * xStep).toFixed(2)},${y(d).toFixed(2)}`)
    .join(' ');

  return (
    <svg width={width} height={height} className="block">
      {/* Reference center line */}
      <line
        x1={0}
        y1={refY}
        x2={width}
        y2={refY}
        stroke="#3a4658"
        strokeWidth={0.5}
        strokeDasharray="2 3"
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.4}
        points={points}
      />
      {/* Tip marker */}
      <circle
        cx={(data.length - 1) * xStep}
        cy={y(data[data.length - 1])}
        r={1.6}
        fill={color}
      />
    </svg>
  );
}
