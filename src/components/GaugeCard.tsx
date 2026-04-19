interface GaugeCardProps {
  value: number;
  min: number;
  max: number;
  title: string;
  unit: string;
  color: string;
  trackColor: string;
}

export default function GaugeCard({
  value,
  min,
  max,
  title,
  unit,
  color,
  trackColor,
}: GaugeCardProps) {
  const percent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const radius = 54;
  const cx = 70;
  const cy = 70;
  const startAngle = 210;
  const span = 300;

  function polarToCartesian(
    centerX: number,
    centerY: number,
    r: number,
    deg: number
  ) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return {
      x: centerX + r * Math.cos(rad),
      y: centerY + r * Math.sin(rad),
    };
  }

  function describeArc(
    cx: number,
    cy: number,
    r: number,
    startDeg: number,
    endDeg: number
  ) {
    const start = polarToCartesian(cx, cy, r, startDeg);
    const end = polarToCartesian(cx, cy, r, endDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  }

  const trackPath = describeArc(cx, cy, radius, startAngle, startAngle + span);
  const filledAngle = startAngle + (percent / 100) * span;
  const valuePath =
    percent > 0
      ? describeArc(cx, cy, radius, startAngle, Math.min(filledAngle, startAngle + span))
      : null;

  const needleTip = polarToCartesian(cx, cy, radius - 8, filledAngle);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="140" height="105" viewBox="0 0 140 105">
        {/* Track */}
        <path
          d={trackPath}
          fill="none"
          stroke={trackColor}
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Value arc */}
        {valuePath && (
          <path
            d={valuePath}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            style={{ transition: "all 0.7s ease" }}
          />
        )}
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ transition: "all 0.7s ease" }}
        />
        <circle cx={cx} cy={cy} r="4" fill={color} />
        {/* Value text */}
        <text x={cx} y={cy + 22} textAnchor="middle" fill="white" fontSize="15" fontWeight="bold">
          {value.toFixed(1)}
          <tspan fontSize="9" fill="#94a3b8">
            {" "}{unit}
          </tspan>
        </text>
      </svg>
      <p className="text-xs text-slate-400 text-center font-medium">{title}</p>
    </div>
  );
}
