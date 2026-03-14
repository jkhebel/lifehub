import type { ReactNode } from 'react';
import { getBadges, getGlobalLevel } from '../model/gamification';
import { Area } from '../types';

export interface CharacterCardProps {
  /** Top-level domains to display (same data as bullseye). */
  areas: Area[];
  /** Same completion function as bullseye (model-derived). */
  calculateProgress: (area: Area) => number;
  /** When false, hide explicit gamey chrome (levels/badges) but keep stats. */
  showGamification?: boolean;
  /** Optional: Domains tree and Add Area button rendered inside the card. */
  children?: ReactNode;
}

export const CharacterCard = ({
  areas,
  calculateProgress,
  showGamification = true,
  children,
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
  const badges = getBadges(areas, calculateProgress);

  return (
    <div className="rounded-[10px] border-2 border-indigo-300/90 bg-white/95 overflow-hidden border-t-indigo-200 border-l-indigo-200 card-paper">
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

        {children}
      </div>
    </div>
  );
};
