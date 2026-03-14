import type { ReactNode } from 'react';
import {
  getBadges,
  getGlobalLevel,
  TITLE_DEFINITIONS,
  AVATAR_DEFINITIONS,
  type AvatarDefinition,
} from '../model/gamification';
import { Area, GamificationState } from '../types';
import { getGlobalXp, getXpLevel } from '../model/derivedMetrics';

export interface CharacterCardProps {
  /** Top-level domains to display (same data as bullseye). */
  areas: Area[];
  /** Same completion function as bullseye (model-derived). */
  calculateProgress: (area: Area) => number;
  /** When false, hide explicit gamey chrome (levels/badges) but keep stats. */
  showGamification?: boolean;
  /** Gamification state for avatar, title, XP, and badges. */
  gamification?: GamificationState;
  /** Callbacks to change selected avatar/title. */
  onSelectAvatar?: (avatarId: string) => void;
  onSelectTitle?: (titleId: string) => void;
  /** Optional: Domains tree and Add Area button rendered inside the card. */
  children?: ReactNode;
}

export const CharacterCard = ({
  areas,
  calculateProgress,
  showGamification = true,
  gamification,
  onSelectAvatar,
  onSelectTitle,
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
  const progressBadges = getBadges(areas, calculateProgress);
  const globalXp = gamification ? getGlobalXp(gamification.domainXp) : 0;
  const xpLevel = getXpLevel(globalXp);
  const selectedAvatarDef = AVATAR_DEFINITIONS.find((a) => a.id === (gamification?.selectedAvatar ?? 'default'))
    ?? AVATAR_DEFINITIONS[0];
  const selectedTitleDef = TITLE_DEFINITIONS.find((t) => t.id === (gamification?.selectedTitle ?? ''))
    ?? TITLE_DEFINITIONS[0];
  const milestoneLabels: Record<string, string> = {
    'first-milestone': 'First milestone',
    'five-milestones': 'Five milestones',
    'ten-milestones': 'Ten milestones',
  };
  const milestoneBadges = (gamification?.unlockedBadges ?? [])
    .filter((id) => milestoneLabels[id])
    .map((id) => ({ id, label: milestoneLabels[id] }));

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
        {/* Avatar and title */}
        {showGamification && gamification && (
          <div className="flex items-center gap-3 flex-wrap border-b border-slate-200 pb-3">
            <div className="flex flex-col items-center gap-1">
              <span className="text-4xl" role="img" aria-label={selectedAvatarDef.label}>
                {(selectedAvatarDef as AvatarDefinition).emoji}
              </span>
              {onSelectAvatar && (gamification.avatarUnlocks?.length ?? 0) > 1 && (
                <select
                  value={gamification.selectedAvatar}
                  onChange={(e) => onSelectAvatar(e.target.value)}
                  className="text-xs border border-slate-300 rounded px-2 py-0.5 bg-white text-slate-700"
                  aria-label="Select avatar"
                >
                  {AVATAR_DEFINITIONS.filter((a) => gamification.avatarUnlocks?.includes(a.id)).map((a) => (
                    <option key={a.id} value={a.id}>{a.emoji} {a.label}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {selectedTitleDef.label && selectedTitleDef.label !== 'None' && (
                <span className="text-sm font-medium text-indigo-600 block">
                  {selectedTitleDef.label}
                </span>
              )}
              {onSelectTitle && (gamification.unlockedTitles?.length ?? 0) > 0 && (
                <select
                  value={gamification.selectedTitle}
                  onChange={(e) => onSelectTitle(e.target.value)}
                  className="text-xs border border-slate-300 rounded px-2 py-0.5 bg-white text-slate-700 mt-1"
                  aria-label="Select title"
                >
                  <option value="">None</option>
                  {TITLE_DEFINITIONS.filter((t) => t.id && (gamification.unlockedTitles?.includes(t.id) ?? false)).map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}

        {/* Overall level and progress */}
        <div className="flex items-center justify-between gap-4">
          <div>
            {showGamification && (
              <>
                <span className="text-slate-500 text-sm">Level </span>
                <span className="text-2xl font-bold text-amber-500 tabular-nums">
                  {level}
                </span>
                {gamification && (
                  <span className="text-slate-400 text-sm ml-2">
                    (XP {xpLevel})
                  </span>
                )}
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
        {showGamification && (progressBadges.length > 0 || milestoneBadges.length > 0) && (
          <div className="border-t border-slate-200 pt-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Badges
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {progressBadges.map(({ id, label }) => (
                <span
                  key={id}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-500/20 text-amber-200/90 border border-amber-500/30"
                >
                  {label}
                </span>
              ))}
              {milestoneBadges.map(({ id, label }) => (
                <span
                  key={id}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-500/20 text-emerald-200/90 border border-emerald-500/30"
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
