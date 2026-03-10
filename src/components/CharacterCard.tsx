import { Area } from '../types';

export interface CharacterCardProps {
  /** Top-level domains to display (same data as bullseye). */
  areas: Area[];
  /** Same completion function as bullseye (model-derived). */
  calculateProgress: (area: Area) => number;
}

/** Simple level from 0–100 aggregate (e.g. 0–25 → 1, 25–50 → 2, 50–75 → 3, 75–100 → 4). */
function levelFromProgress(progress: number): number {
  if (progress >= 75) return 4;
  if (progress >= 50) return 3;
  if (progress >= 25) return 2;
  return 1;
}

export const CharacterCard = ({
  areas,
  calculateProgress,
}: CharacterCardProps) => {
  const completionByArea = areas.map((area) => ({
    area,
    progress: calculateProgress(area),
  }));
  const overallProgress =
    completionByArea.length === 0
      ? 0
      : completionByArea.reduce((sum, { progress }) => sum + progress, 0) /
        completionByArea.length;
  const level = levelFromProgress(overallProgress);

  return (
    <div className="rounded-xl border-2 border-amber-600/40 bg-gradient-to-b from-slate-800/90 to-slate-900/90 overflow-hidden shadow-lg">
      {/* Character sheet header */}
      <div className="px-4 py-3 border-b border-slate-600/50 bg-slate-800/50">
        <h2 className="text-lg font-bold text-amber-200/90 tracking-wide">
          Character Sheet
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">
          Overview of your life domains
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Overall level and progress */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-slate-400 text-sm">Level </span>
            <span className="text-2xl font-bold text-amber-400 tabular-nums">
              {level}
            </span>
          </div>
          <div className="flex-1 min-w-0 max-w-[180px]">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Overall</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500/80 transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Top-level domain stats (same metrics as bullseye) */}
        <div className="border-t border-slate-700/50 pt-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Domains
          </h3>
          <ul className="space-y-2">
            {completionByArea.map(({ area, progress }) => (
              <li
                key={area.id}
                className="flex items-center gap-2 text-sm"
              >
                {area.icon && (
                  <span className="shrink-0 text-base" aria-hidden>
                    {area.icon}
                  </span>
                )}
                <span
                  className="min-w-0 truncate text-slate-200"
                  style={{ color: area.color }}
                >
                  {area.name}
                </span>
                <span className="shrink-0 text-slate-500 tabular-nums ml-auto">
                  {Math.round(progress)}%
                </span>
                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden shrink-0">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: area.color,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
