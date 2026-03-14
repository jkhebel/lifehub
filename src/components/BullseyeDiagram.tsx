import type { Area } from '../types';
import type { ProgressToNextLevelResult } from '../model/derivedMetrics';

export type RadarViewMode = 'relative' | 'objective';

export interface RadarSeries {
  name: string;
  getValue: (area: Area) => number;
}

const SERIES_COLORS = [
  { fill: 'rgba(45, 212, 191, 0.35)', stroke: '#14b8a6' },
  { fill: 'rgba(139, 92, 246, 0.35)', stroke: '#7c3aed' },
  { fill: 'rgba(245, 158, 11, 0.35)', stroke: '#d97706' },
  { fill: 'rgba(236, 72, 153, 0.35)', stroke: '#db2777' },
];

interface BullseyeDiagramProps {
  areas: Area[];
  onAreaClick: (areaId: string) => void;
  calculateProgress: (area: Area) => number;
  getProgressToNextLevel?: (area: Area) => ProgressToNextLevelResult;
  viewMode?: RadarViewMode;
  /** When viewMode is 'objective', optional multiple series (each = one polygon + legend entry). */
  series?: RadarSeries[];
  centerLabel?: string;
  onCenterClick?: () => void;
}

// Polar: angle in degrees, 0 = top, clockwise. Returns { x, y } in SVG space.
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

// Scale 0–100 to radius between minR and maxR
function progressToRadius(progress: number, minR: number, maxR: number) {
  return minR + ((maxR - minR) * progress) / 100;
}

export const BullseyeDiagram = ({
  areas,
  onAreaClick,
  calculateProgress,
  getProgressToNextLevel,
  viewMode = 'objective',
  series = [],
  centerLabel = 'Life',
  onCenterClick,
}: BullseyeDiagramProps) => {
  const size = 400;
  const center = size / 2;
  const maxRadius = size / 2 - 36;
  const minRadius = 24;
  const labelRadius = maxRadius + 12;
  const scaleLevels = [0, 25, 50, 75, 100];
  const gridStroke = '#e5e7eb';
  const dataPointRadius = 4;
  const useMultiSeries = viewMode === 'objective' && series.length > 0;
  const activeSeries = useMultiSeries ? series : [{ name: 'Progress', getValue: (a: Area) => getValueForAxis(a) }];
  const getValueForAxis = (area: Area): number =>
    viewMode === 'relative' && getProgressToNextLevel
      ? getProgressToNextLevel(area).progress01 * 100
      : calculateProgress(area);

  const n = areas.length;

  if (n === 0) {
    return (
      <div className="flex items-center justify-center w-full">
        <svg
          role="img"
          aria-label="Radar chart of life domains"
          width="100%"
          height="100%"
          viewBox={`0 0 ${size} ${size}`}
          className="max-w-md aspect-square bg-white rounded-[10px] border-2 border-slate-300 border-t-slate-200 border-l-slate-200 card-paper"
        >
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-500 text-sm font-medium"
          >
            No areas yet. Add areas to see your radar.
          </text>
        </svg>
      </div>
    );
  }

  const angleStep = 360 / n;
  const axisAngles = areas.map((_, i) => i * angleStep);

  // Polygon points for a concentric ring at a given scale level (0–100)
  const ringPoints = (level: number) => {
    const r = progressToRadius(level, minRadius, maxRadius);
    return axisAngles.map((angle) => polarToCartesian(center, center, r, angle));
  };

  // Per-series polygon points (for multi-series or single default)
  const seriesDataPoints = activeSeries.map((s) =>
    areas.map((area, i) => {
      const progress = s.getValue(area);
      const r = progressToRadius(progress, minRadius, maxRadius);
      return polarToCartesian(center, center, r, axisAngles[i]);
    })
  );
  const primaryDataPoints = seriesDataPoints[0] ?? [];

  // Wedge path for hit area (center → axis i outer → axis i+1 outer → center)
  const wedgePath = (axisIndex: number) => {
    const a1 = axisAngles[axisIndex];
    const a2 = axisAngles[(axisIndex + 1) % n];
    const p1 = polarToCartesian(center, center, maxRadius, a1);
    const p2 = polarToCartesian(center, center, maxRadius, a2);
    return `M ${center} ${center} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} Z`;
  };

  const padding = 56;
  const viewSize = size + padding * 2;
  const viewBox = `-${padding} -${padding} ${viewSize} ${viewSize}`;

  return (
    <div className="flex items-center justify-center w-full overflow-visible">
      <svg
        role="img"
        aria-label="Radar chart of life domains and completion"
        width="100%"
        height="100%"
        viewBox={viewBox}
        className="max-w-md aspect-square bg-white rounded-[10px] border-2 border-slate-300 border-t-slate-200 border-l-slate-200 card-paper"
        style={{ overflow: 'visible' }}
      >
        {/* Concentric polygon rings (grid) */}
        {scaleLevels.map((level) => (
          <polygon
            key={level}
            points={ringPoints(level)
              .map((p) => `${p.x},${p.y}`)
              .join(' ')}
            fill="none"
            stroke={gridStroke}
            strokeWidth={1}
          />
        ))}

        {/* Spokes */}
        {axisAngles.map((angle) => {
          const end = polarToCartesian(center, center, maxRadius, angle);
          return (
            <line
              key={angle}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              stroke={gridStroke}
              strokeWidth={1}
            />
          );
        })}

        {/* Scale labels (e.g. 0, 25, 50, 75, 100) on one axis to avoid clutter) */}
        {scaleLevels.map((level) => {
          const p = polarToCartesian(center, center, progressToRadius(level, minRadius, maxRadius), 0);
          return (
            <text
              key={level}
              x={p.x - 10}
              y={p.y}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-slate-400 text-[10px] font-medium tabular-nums"
            >
              {level}
            </text>
          );
        })}

        {/* Data polygon(s): one per series */}
        {seriesDataPoints.map((points, idx) => {
          const colors = SERIES_COLORS[idx % SERIES_COLORS.length]!;
          return (
            <polygon
              key={activeSeries[idx]!.name}
              points={points.map((p) => `${p.x},${p.y}`).join(' ')}
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth={2}
              className="transition-all duration-500"
            />
          );
        })}
        {primaryDataPoints.map((p, i) => (
          <circle
            key={areas[i]!.id}
            cx={p.x}
            cy={p.y}
            r={dataPointRadius}
            fill={SERIES_COLORS[0]!.stroke}
            className="pointer-events-none"
          />
        ))}

        {/* Invisible clickable wedges per area */}
        {areas.map((area, i) => (
          <path
            key={area.id}
            d={wedgePath(i)}
            fill="transparent"
            className="cursor-pointer"
            onClick={() => onAreaClick(area.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onAreaClick(area.id);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`${area.name}, ${Math.round(getValueForAxis(area))} percent`}
          />
        ))}

        {/* Category labels at outer end of each axis */}
        {areas.map((area, i) => {
          const p = polarToCartesian(center, center, labelRadius, axisAngles[i]);
          const progress = getValueForAxis(area);
          const tierLabel =
            viewMode === 'relative' && getProgressToNextLevel
              ? getProgressToNextLevel(area).currentTierLabel
              : null;
          const isRight = p.x >= center;
          return (
            <g key={area.id} className="pointer-events-none">
              <text
                x={p.x}
                y={p.y}
                textAnchor={isRight ? 'start' : 'end'}
                dominantBaseline="middle"
                className="fill-slate-700 text-xs font-semibold font-pixel"
              >
                {area.icon && `${area.icon} `}
                {area.name}
              </text>
              <text
                x={p.x}
                y={p.y + 12}
                textAnchor={isRight ? 'start' : 'end'}
                dominantBaseline="middle"
                className="fill-slate-500 text-[10px] tabular-nums"
              >
                {tierLabel != null ? tierLabel : `${Math.round(progress)}%`}
              </text>
            </g>
          );
        })}

        {/* Center: optional label and back action */}
        <g
          className={onCenterClick ? 'cursor-pointer' : ''}
          onClick={onCenterClick}
          aria-hidden
        >
          <circle
            cx={center}
            cy={center}
            r={minRadius - 4}
            fill="#f8fafc"
            stroke="#e2e8f0"
            strokeWidth={1.5}
          />
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-600 text-sm font-semibold"
          >
            {centerLabel}
          </text>
          {onCenterClick && (
            <text
              x={center}
              y={center + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-400 text-[10px]"
            >
              Back
            </text>
          )}
        </g>
      </svg>
      {activeSeries.length > 1 && (
        <div className="flex flex-wrap justify-center gap-3 mt-2 text-[10px]" role="list" aria-label="Radar series legend">
          {activeSeries.map((s, idx) => {
            const colors = SERIES_COLORS[idx % SERIES_COLORS.length]!;
            return (
              <span key={s.name} className="inline-flex items-center gap-1.5" role="listitem">
                <span
                  className="inline-block w-3 h-2 rounded-sm border border-current"
                  style={{ backgroundColor: colors.fill, borderColor: colors.stroke }}
                />
                <span className="text-slate-600">{s.name}</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
