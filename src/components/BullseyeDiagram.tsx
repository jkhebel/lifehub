import { Area } from '../types';

interface BullseyeDiagramProps {
  areas: Area[];
  onAreaClick: (areaId: string) => void;
  calculateProgress: (area: Area) => number;
  centerLabel?: string;
  onCenterClick?: () => void;
}

export const BullseyeDiagram = ({
  areas,
  onAreaClick,
  calculateProgress,
  centerLabel = 'Life',
  onCenterClick,
}: BullseyeDiagramProps) => {
  const size = 400;
  const center = size / 2;
  const maxRadius = size / 2 - 20;
  const minRadius = 50;

  // Calculate ring dimensions based on progress
  const rings = areas.map((area, index) => {
    const progress = calculateProgress(area);
    const angleStart = (index * 360) / areas.length;
    const angleEnd = ((index + 1) * 360) / areas.length;
    const gapAngle = 2; // Gap between segments in degrees

    return {
      area,
      progress,
      angleStart: angleStart + gapAngle / 2,
      angleEnd: angleEnd - gapAngle / 2,
    };
  });

  // Convert polar to cartesian
  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  // Create arc path
  const createArcPath = (
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number
  ) => {
    const start1 = polarToCartesian(center, center, innerRadius, startAngle);
    const end1 = polarToCartesian(center, center, innerRadius, endAngle);
    const start2 = polarToCartesian(center, center, outerRadius, startAngle);
    const end2 = polarToCartesian(center, center, outerRadius, endAngle);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return [
      'M', start2.x, start2.y,
      'A', outerRadius, outerRadius, 0, largeArc, 1, end2.x, end2.y,
      'L', end1.x, end1.y,
      'A', innerRadius, innerRadius, 0, largeArc, 0, start1.x, start1.y,
      'Z',
    ].join(' ');
  };

  // Calculate label position
  const getLabelPosition = (startAngle: number, endAngle: number, radius: number) => {
    const midAngle = (startAngle + endAngle) / 2;
    return polarToCartesian(center, center, radius, midAngle);
  };

  // Render progress rings for each area
  const renderProgressRings = () => {
    if (areas.length === 0) return null;

    const ringWidth = (maxRadius - minRadius) / 3;

    return rings.map(({ area, progress, angleStart, angleEnd }) => {
      // Background ring (full)
      const bgPath = createArcPath(
        minRadius,
        maxRadius,
        angleStart,
        angleEnd
      );

      // Progress ring (partial based on progress)
      const progressRadius = minRadius + ((maxRadius - minRadius) * progress) / 100;
      const progressPath = createArcPath(
        minRadius,
        progressRadius,
        angleStart,
        angleEnd
      );

      // Label position
      const labelPos = getLabelPosition(angleStart, angleEnd, minRadius + ringWidth * 1.5);

      return (
        <g key={area.id} className="cursor-pointer group" onClick={() => onAreaClick(area.id)}>
          {/* Background segment */}
          <path
            d={bgPath}
            fill={`${area.color}20`}
            stroke={area.color}
            strokeWidth="1"
            className="transition-all duration-300 group-hover:fill-opacity-40"
          />

          {/* Progress fill */}
          <path
            d={progressPath}
            fill={area.color}
            fillOpacity="0.6"
            className="transition-all duration-500"
          />

          {/* Hover highlight */}
          <path
            d={bgPath}
            fill="transparent"
            className="transition-all duration-200 group-hover:fill-white group-hover:fill-opacity-10"
          />

          {/* Area label */}
          <text
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-white text-sm font-medium pointer-events-none transition-all duration-200 group-hover:fill-opacity-100"
            fillOpacity="0.9"
          >
            {area.icon && <tspan>{area.icon} </tspan>}
            <tspan>{area.name}</tspan>
          </text>

          {/* Progress percentage */}
          <text
            x={labelPos.x}
            y={labelPos.y + 18}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-white text-xs pointer-events-none"
            fillOpacity="0.6"
          >
            {Math.round(progress)}%
          </text>
        </g>
      );
    });
  };

  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer glow */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
        </defs>

        {/* Background circles for visual effect */}
        <circle
          cx={center}
          cy={center}
          r={maxRadius}
          fill="none"
          stroke="#334155"
          strokeWidth="0.5"
          strokeDasharray="4 4"
        />
        <circle
          cx={center}
          cy={center}
          r={(maxRadius + minRadius) / 2}
          fill="none"
          stroke="#334155"
          strokeWidth="0.5"
          strokeDasharray="4 4"
        />

        {/* Progress rings */}
        {renderProgressRings()}

        {/* Center circle */}
        <g
          className={`${onCenterClick ? 'cursor-pointer' : ''}`}
          onClick={onCenterClick}
        >
          <circle
            cx={center}
            cy={center}
            r={minRadius}
            fill="url(#centerGradient)"
            stroke="#475569"
            strokeWidth="2"
            filter="url(#glow)"
            className={onCenterClick ? 'hover:stroke-blue-400 transition-colors' : ''}
          />
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-white text-base font-semibold"
          >
            {centerLabel}
          </text>
          {onCenterClick && areas.length > 0 && (
            <text
              x={center}
              y={center + 16}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-400 text-xs"
            >
              ← Back
            </text>
          )}
        </g>

        {/* Empty state */}
        {areas.length === 0 && (
          <text
            x={center}
            y={center + 80}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-500 text-sm"
          >
            No sub-areas yet
          </text>
        )}
      </svg>
    </div>
  );
};
