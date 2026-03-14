import { useState } from 'react';
import { Area, Achievement, AchievementKind } from '../types';

/** Milestones-only: only milestone and project (container) are offered in the UI. */
const ACHIEVEMENT_KINDS: { value: AchievementKind; label: string }[] = [
  { value: 'milestone', label: 'Milestone' },
  { value: 'project', label: 'Project' },
];

interface AddAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (achievement: Omit<Achievement, 'id'>) => void;
  areaId: string;
}

function AddAchievementModal({
  isOpen,
  onClose,
  onAdd,
  areaId,
}: AddAchievementModalProps) {
  const [name, setName] = useState('');
  const [kind, setKind] = useState<AchievementKind>('milestone');
  const [xpReward, setXpReward] = useState('50');

  if (!isOpen) return null;

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const xp = kind === 'milestone' ? 50 : 0;
    onAdd({
      name: trimmed,
      kind,
      areaId,
      xpReward: kind === 'project' ? undefined : (parseInt(xpReward, 10) || xp),
    });
    setName('');
    setKind('milestone');
    setXpReward('50');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      role="dialog"
      aria-modal="true"
      aria-label="Add milestone"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-5 w-full max-w-sm border-2 border-slate-200 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Add milestone</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500"
              placeholder="e.g. I can do the splits"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <div className="flex gap-2 flex-wrap">
              {ACHIEVEMENT_KINDS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setKind(value)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    kind === value
                      ? 'bg-sky-500 text-white border-sky-500'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {kind !== 'project' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">XP reward</label>
              <input
                type="number"
                min={0}
                value={xpReward}
                onChange={(e) => setXpReward(e.target.value)}
                className="w-20 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
          )}
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="px-3 py-1.5 text-sm rounded-lg bg-sky-500 disabled:bg-slate-300 disabled:text-slate-500 hover:bg-sky-600 text-white transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

interface AchievementsPanelProps {
  area: Area | null;
  onAddAchievement: (areaId: string, achievement: Omit<Achievement, 'id'>) => void;
  onCompleteAchievement: (achievementId: string, areaId: string, xpReward?: number) => void;
  isAchievementCompleted: (achievementId: string) => boolean;
  /** Optional: show a short XP toast after claiming a milestone */
  onXpGained?: (amount: number) => void;
}

function AchievementRow({
  achievement,
  areaId,
  areaColor,
  onComplete,
  isCompleted,
  onXpGained,
}: {
  achievement: Achievement;
  areaId: string;
  areaColor: string;
  onComplete: (achievementId: string, areaId: string, xpReward?: number) => void;
  isCompleted: (id: string) => boolean;
  onXpGained?: (amount: number) => void;
}) {
  const completed = isCompleted(achievement.id);
  const xp = achievement.xpReward ?? 0;

  if (achievement.kind === 'project') {
    return (
      <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/80">
        <div className="font-medium text-slate-800 flex items-center gap-2">
          <span className="text-slate-500">📁</span>
          {achievement.name}
        </div>
        {achievement.children && achievement.children.length > 0 && (
          <div className="mt-2 pl-4 space-y-2 border-l-2 border-slate-200">
            {achievement.children
              .filter((child) => child.kind === 'milestone')
              .map((child) => (
                <AchievementRow
                  key={child.id}
                  achievement={child}
                  areaId={areaId}
                  areaColor={areaColor}
                  onComplete={onComplete}
                  isCompleted={isCompleted}
                  onXpGained={onXpGained}
                />
              ))}
          </div>
        )}
      </div>
    );
  }

  const handleComplete = () => {
    onComplete(achievement.id, areaId, xp);
    if (xp > 0 && onXpGained) onXpGained(xp);
  };

  // Milestones-only: only milestones have Claim/Claimed (tasks are hidden in the UI)
  return (
    <div
      className={`flex items-center justify-between gap-3 py-2 px-3 rounded-lg border transition-colors ${
        completed ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="min-w-0 flex-1 flex items-center gap-2">
        <span className="text-amber-500 shrink-0" aria-hidden>🎯</span>
        <span className={completed ? 'text-slate-500 line-through' : ''}>
          {achievement.name}
        </span>
        {xp > 0 && (
          <span className="text-slate-400 text-xs">+{xp} XP</span>
        )}
      </div>
      <div className="shrink-0">
        {completed ? (
          <span className="text-emerald-600 text-sm font-medium">Claimed</span>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            className="px-3 py-1 text-sm rounded-lg font-medium text-white transition-colors"
            style={{ backgroundColor: areaColor }}
          >
            Claim
          </button>
        )}
      </div>
    </div>
  );
}

export const AchievementsPanel = ({
  area,
  onAddAchievement,
  onCompleteAchievement,
  isAchievementCompleted,
  onXpGained,
}: AchievementsPanelProps) => {
  const [isAdding, setIsAdding] = useState(false);

  if (!area) return null;

  const achievements = area.achievements ?? [];

  return (
    <div className="bg-white/95 rounded-[10px] border-2 border-slate-300 border-t-slate-200 border-l-slate-200 overflow-hidden card-paper">
      <div className="p-4 border-b border-slate-200" style={{ backgroundColor: `${area.color}12` }}>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-slate-700">Milestones</h4>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 text-sm text-sky-600 hover:text-sky-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add milestone
          </button>
        </div>
      </div>
      <div className="p-4">
        {achievements.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <p className="mb-2">No milestones yet</p>
            <p className="text-sm mb-3">
              Add one-time milestones (e.g. &quot;Reached B2 in French&quot;, &quot;I can do the splits&quot;) to track progress and earn XP when you claim them.
            </p>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="text-sky-600 hover:text-sky-700 text-sm font-medium"
            >
              Add your first milestone
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {achievements
              .filter((a) => a.kind === 'milestone' || a.kind === 'project')
              .map((achievement) => (
              <AchievementRow
                key={achievement.id}
                achievement={achievement}
                areaId={area.id}
                areaColor={area.color}
                onComplete={onCompleteAchievement}
                isCompleted={isAchievementCompleted}
                onXpGained={onXpGained}
              />
            ))}
          </div>
        )}
      </div>

      <AddAchievementModal
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        onAdd={(a) => onAddAchievement(area.id, a)}
        areaId={area.id}
      />
    </div>
  );
};
