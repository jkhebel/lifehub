import type { ReactNode } from 'react';
import type { Area } from '../types';

export interface CharacterCardProps {
  /** Top-level domains to display (same data as bullseye). */
  areas: Area[];
  /** Same progress function as bullseye. */
  calculateProgress: (area: Area) => number;
  /** Optional: Domains tree and Add Area button rendered inside the card. */
  children?: ReactNode;
}

export const CharacterCard = ({
  areas,
  calculateProgress,
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

  return (
    <div className="rounded-[10px] border-2 border-indigo-300/90 bg-white/95 overflow-hidden border-t-indigo-200 border-l-indigo-200 card-paper">
      <div className="px-4 py-3 border-b border-indigo-100 bg-indigo-50">
        <h2 className="text-lg font-bold text-indigo-700 tracking-wide">
          Character Sheet
        </h2>
        <p className="text-slate-500 text-xs mt-0.5">
          Snapshot of your domains today
        </p>
      </div>

      <div className="p-4 space-y-4">
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

        {children}
      </div>
    </div>
  );
};
