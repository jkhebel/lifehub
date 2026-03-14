import type { ReactNode } from 'react';
import type { Area, GamificationState } from '../types';
import { getLevelFromXp, getXpProgressInLevel } from '../model/gamification';

export interface CharacterCardProps {
  /** Top-level domains to display (same data as bullseye). */
  areas: Area[];
  /** Same progress function as bullseye. */
  calculateProgress: (area: Area) => number;
  /** Optional gamification state for level and XP bar. */
  gamification?: GamificationState;
  /** Optional: Domains tree and Add Area button rendered inside the card. */
  children?: ReactNode;
}

export const CharacterCard = ({
  areas,
  calculateProgress,
  gamification,
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

  const displayLabel = (area: Area) => area.statName?.trim() ? area.statName : area.name;

  const xpState = gamification ? getXpProgressInLevel(gamification.totalXp) : null;
  const level = gamification ? getLevelFromXp(gamification.totalXp) : null;

  return (
    <div className="rounded-[10px] border-2 border-indigo-300/90 bg-white/95 overflow-hidden border-t-indigo-200 border-l-indigo-200 card-paper">
      <div className="px-4 py-3 border-b border-indigo-100 bg-indigo-50">
        <h2 className="text-lg font-bold text-indigo-700 tracking-wide font-pixel">
          Character Sheet
        </h2>
        <p className="text-slate-500 text-xs mt-0.5">
          Snapshot of your domains today
        </p>
      </div>

      <div className="p-4 space-y-4">
        {level != null && xpState != null && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500 text-sm">Level {level}</span>
            <div className="flex-1 min-w-0 max-w-[180px]">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>XP</span>
                <span>{gamification.totalXp} XP</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-violet-400/90 transition-all duration-500"
                  style={{ width: `${xpState.progress01 * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500 text-sm">Overall progress</span>
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

        {completionByArea.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1.5">
            {completionByArea.map(({ area, progress }) => (
              <span
                key={area.id}
                className="text-xs text-slate-600"
                title={`${area.name}: ${Math.round(progress)}%`}
              >
                <span className="font-medium text-slate-700">{displayLabel(area)}</span>
                <span className="tabular-nums ml-1">{Math.round(progress)}%</span>
              </span>
            ))}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};
