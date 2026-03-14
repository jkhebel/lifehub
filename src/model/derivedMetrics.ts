import { Area, Tracker, Achievement, CompletionLogEntry } from '../types';

export const getTrackerProgress = (tracker: Tracker): number => {
  if (tracker.type === 'boolean') return tracker.value ? 100 : 0;
  if (tracker.target) return Math.min((tracker.value / tracker.target) * 100, 100);
  if (tracker.max) return (tracker.value / tracker.max) * 100;
  return 50;
};

export const calculateAreaProgress = (area: Area): number => {
  const mode = area.aggregation ?? 'average';
  const trackerProgress = area.trackers.map(t => getTrackerProgress(t));
  const childProgress = area.children.map(c => calculateAreaProgress(c));
  const allProgress = [...trackerProgress, ...childProgress];

  if (allProgress.length === 0) return 0;

  if (mode === 'minimum') {
    return Math.min(...allProgress);
  }

  if (mode === 'weighted') {
    const trackerWeights = area.trackers.map(t => t.weight ?? 1);
    const childWeights = area.children.map(() => 1);
    const weights = [...trackerWeights, ...childWeights];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    if (totalWeight === 0) return 0;
    const weightedSum = allProgress.reduce(
      (sum, p, i) => sum + p * weights[i],
      0
    );
    return weightedSum / totalWeight;
  }

  // average (default)
  return allProgress.reduce((a, b) => a + b, 0) / allProgress.length;
};

/** Collect all achievements (milestones and tasks) from an area and its descendants (including nested project children). */
function collectMilestones(area: Area): Achievement[] {
  const out: Achievement[] = [];
  const visit = (a: Area) => {
    (a.achievements ?? []).forEach((ach) => {
      if (ach.kind === 'milestone') out.push(ach);
      if (ach.kind === 'project' && Array.isArray(ach.children)) {
        ach.children.forEach((c) => {
          if (c.kind === 'milestone') out.push(c);
        });
      }
    });
    a.children.forEach(visit);
  };
  visit(area);
  return out;
}

/** Set of achievement IDs that have at least one completion in the log. */
function completedAchievementIds(completionLog: CompletionLogEntry[]): Set<string> {
  const set = new Set<string>();
  completionLog.forEach((e) => set.add(e.achievementId));
  return set;
}

/** Recursively collect all areas (flatten). */
function collectAreas(areas: Area[]): Area[] {
  const out: Area[] = [];
  const visit = (a: Area) => {
    out.push(a);
    a.children.forEach(visit);
  };
  areas.forEach(visit);
  return out;
}

/** Total and completed milestone counts across all areas. */
export function getMilestoneCounts(
  areas: Area[],
  completionLog: CompletionLogEntry[]
): { total: number; completed: number } {
  const allAreas = collectAreas(areas);
  const completed = completedAchievementIds(completionLog);
  let total = 0;
  let completedCount = 0;
  allAreas.forEach((area) => {
    (area.achievements ?? []).forEach((ach) => {
      if (ach.kind === 'milestone') {
        total += 1;
        if (completed.has(ach.id)) completedCount += 1;
      }
      if (ach.kind === 'project' && Array.isArray(ach.children)) {
        ach.children.forEach((c) => {
          if (c.kind === 'milestone') {
            total += 1;
            if (completed.has(c.id)) completedCount += 1;
          }
        });
      }
    });
  });
  return { total, completed: completedCount };
}

/**
 * Milestone-based progress for an area (and subtree): completed milestones / total milestones, 0–100.
 * If no milestones exist, returns 0.
 */
export function calculateMilestoneProgress(
  area: Area,
  completionLog: CompletionLogEntry[]
): number {
  const milestones = collectMilestones(area);
  if (milestones.length === 0) return 0;
  const completed = completedAchievementIds(completionLog);
  const count = milestones.filter((m) => completed.has(m.id)).length;
  return (count / milestones.length) * 100;
}

/**
 * Blended progress: alpha * trackerProgress + (1 - alpha) * milestoneProgress.
 * If area has no milestones, returns trackerProgress only.
 */
export function calculateBlendedProgress(
  area: Area,
  completionLog: CompletionLogEntry[],
  getTrackerProgress: (area: Area) => number,
  alpha: number = 0.5
): number {
  const trackerP = getTrackerProgress(area);
  const milestoneP = calculateMilestoneProgress(area, completionLog);
  const milestones = collectMilestones(area);
  if (milestones.length === 0) return trackerP;
  return alpha * trackerP + (1 - alpha) * milestoneP;
}

/** Sum of all domain XP (global XP). */
export function getGlobalXp(domainXp: Record<string, number>): number {
  return Object.values(domainXp).reduce((sum, xp) => sum + xp, 0);
}

/** XP-based level: level = floor(sqrt(globalXp / 100)) + 1, minimum 1. */
export function getXpLevel(globalXp: number): number {
  if (globalXp <= 0) return 1;
  return Math.floor(Math.sqrt(globalXp / 100)) + 1;
}

