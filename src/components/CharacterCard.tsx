import {
  getBadges,
  getGlobalLevel,
  getPerDomainLevels,
} from '../model/gamification';
import { Area } from '../types';

export interface CharacterCardProps {
  /** Top-level domains to display (same data as bullseye). */
  areas: Area[];
  /** Same completion function as bullseye (model-derived). */
  calculateProgress: (area: Area) => number;
  /** When false, hide explicit gamey chrome (levels/badges) but keep stats. */
  showGamification?: boolean;
}

export const CharacterCard = ({
  areas,
  calculateProgress,
  showGamification = true,
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
  const level = getGlobalLevel(areas, calculateProgress);
  const perDomainLevels = getPerDomainLevels(areas, calculateProgress);
  const badges = getBadges(areas, calculateProgress);

  return (
    <div className="rounded-[12px] border-2 border-indigo-200 bg-white/90 overflow-hidden shadow-[3px_3px_0_0_rgba(129,140,248,0.7),inset_0_1px_0_rgba(255,255,255,0.9)]">
      {/* Character sheet header */}
      <div className="px-4 py-3 border-b border-indigo-100 bg-indigo-50">
        <h2 className="text-lg font-bold text-indigo-700 tracking-wide">
          Character Sheet
        </h2>
        <p className="text-slate-500 text-xs mt-0.5">
          Snapshot of your real-life domains today
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Overall level and progress */}
        <div className="flex items-center justify-between gap-4">
          <div>
            {showGamification && (
              <>
                <span className="text-slate-500 text-sm">Level </span>
                <span className="text-2xl font-bold text-amber-500 tabular-nums">
                  {level}
                </span>
              </>
            )}
            {!showGamification && (
              <>
                <span className="text-slate-500 text-sm">Overall completion</span>
              </>
            )}
          </div>
          <div className="flex-1 min-w-0 max-w-[180px]">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Overall</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-400/90 transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Badges */}
        {showGamification && badges.length > 0 && (
          <div className="border-t border-slate-200 pt-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Badges
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {badges.map(({ id, label }) => (
                <span
                  key={id}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-500/20 text-amber-200/90 border border-amber-500/30"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Top-level domain stats (same metrics as bullseye) */}
        <div className="border-t border-slate-200 pt-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Domains
          </h3>
          {completionByArea.length > 0 && (
            <p className="text-[11px] text-slate-500 mb-2">
              {(() => {
                const sorted = [...completionByArea].sort(
                  (a, b) => b.progress - a.progress
                );
                const strongest = sorted[0];
                const weakest = sorted[sorted.length - 1];
                if (!strongest) return null;
                if (sorted.length === 1) {
                  return `Strongest focus: ${strongest.area.name}`;
                }
                return `Strongest: ${strongest.area.name} • Needs support: ${weakest.area.name}`;
              })()}
            </p>
          )}
          <ul className="space-y-2">
            {completionByArea.map(({ area, progress }) => {
              const domainLevel =
                perDomainLevels.find((d) => d.areaId === area.id)?.level ?? 1;
              return (
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
                  {showGamification && (
                    <span className="shrink-0 text-slate-500 text-xs tabular-nums">
                      Lv.{domainLevel}
                    </span>
                  )}
                  <span className="shrink-0 text-slate-500 tabular-nums ml-auto">
                    {Math.round(progress)}%
                  </span>
                <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden shrink-0">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: area.color,
                    }}
                  />
                </div>
              </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
