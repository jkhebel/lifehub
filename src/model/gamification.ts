import type { Area } from '../types';
import type { CompletionLogEntry } from '../types';

/** XP awarded when a binary domain is marked complete (first time). */
export const XP_PER_BINARY_COMPLETE = 50;

/** XP per level unit (sublinear: level = floor(sqrt(totalXp / XP_PER_LEVEL)) + 1). */
export const XP_PER_LEVEL = 100;

/**
 * Character level from total XP (sublinear curve).
 * Level 1 = 0 XP, Level 2 = 100, Level 3 = 400, Level 4 = 900, ...
 */
export function getLevelFromXp(totalXp: number): number {
  if (totalXp <= 0) return 1;
  return Math.floor(Math.sqrt(totalXp / XP_PER_LEVEL)) + 1;
}

/**
 * XP required to reach a given level (cumulative).
 * Level 1 = 0, Level 2 = 100, Level 3 = 400, ...
 */
export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return (level - 1) ** 2 * XP_PER_LEVEL;
}

/**
 * Progress within current level (0–1): how much of the way from current level to next.
 */
export function getXpProgressInLevel(totalXp: number): { progress01: number; currentLevel: number; xpInLevel: number; xpNeededForNext: number } {
  const currentLevel = getLevelFromXp(totalXp);
  const xpAtLevelStart = getXpRequiredForLevel(currentLevel);
  const xpNeededForNext = getXpRequiredForLevel(currentLevel + 1) - xpAtLevelStart;
  const xpInLevel = totalXp - xpAtLevelStart;
  const progress01 = xpNeededForNext <= 0 ? 1 : Math.min(1, xpInLevel / xpNeededForNext);
  return { progress01, currentLevel, xpInLevel, xpNeededForNext };
}

/** Count completions from log (for badges/titles). */
export function getCompletionCount(completionLog: CompletionLogEntry[]): number {
  return completionLog.length;
}

/**
 * Map overall progress (0–100) to a level 1–4. Shared by global and per-domain level.
 */
export function progressToLevel(progress: number): number {
  if (progress >= 75) return 4;
  if (progress >= 50) return 3;
  if (progress >= 25) return 2;
  return 1;
}

/**
 * Compute overall progress as average of root-area completion, then return global level 1–4.
 */
export function getGlobalLevel(
  areas: Area[],
  getAreaProgress: (area: Area) => number
): number {
  if (areas.length === 0) return 0;
  const total = areas.reduce((sum, area) => sum + getAreaProgress(area), 0);
  const overall = total / areas.length;
  return progressToLevel(overall);
}

export interface PerDomainLevel {
  areaId: string;
  areaName: string;
  level: number;
}

/**
 * Per-domain level-like indicators (1–4) for each area in the list.
 */
export function getPerDomainLevels(
  areas: Area[],
  getAreaProgress: (area: Area) => number
): PerDomainLevel[] {
  return areas.map((area) => ({
    areaId: area.id,
    areaName: area.name,
    level: progressToLevel(getAreaProgress(area)),
  }));
}

export interface Badge {
  id: string;
  label: string;
}

/** Threshold-based badges (ordered by threshold ascending). "Getting started" when overall > 0. */
const BADGE_THRESHOLDS: { id: string; label: string; minProgress: number }[] = [
  { id: 'getting-started', label: 'Getting started', minProgress: 0 },
  { id: 'halfway', label: 'Halfway there', minProgress: 50 },
  { id: 'on-track', label: 'On track', minProgress: 75 },
  { id: 'fully-balanced', label: 'Fully balanced', minProgress: 100 },
];

/**
 * Return list of triggered badges based on overall completion (average of root areas).
 */
export function getBadges(
  areas: Area[],
  getAreaProgress: (area: Area) => number
): Badge[] {
  if (areas.length === 0) return [];
  const total = areas.reduce((sum, area) => sum + getAreaProgress(area), 0);
  const overall = total / areas.length;
  return BADGE_THRESHOLDS.filter(
    (b) => (b.id === 'getting-started' ? overall > 0 : overall >= b.minProgress)
  ).map(({ id, label }) => ({ id, label }));
}

/** Milestone-based badge definitions (earned by claiming milestones). */
const MILESTONE_BADGES: { id: string; label: string; minMilestones: number }[] = [
  { id: 'first-milestone', label: 'First milestone', minMilestones: 1 },
  { id: 'five-milestones', label: 'Five milestones', minMilestones: 5 },
  { id: 'ten-milestones', label: 'Ten milestones', minMilestones: 10 },
];

function getMilestoneCounts(_areas: Area[], completionLog: CompletionLogEntry[]): { completed: number } {
  return { completed: completionLog.length };
}

/**
 * Returns badge ids that are earned by current milestone count (for merging into unlockedBadges).
 */
export function getEarnedMilestoneBadges(
  _areas: Area[],
  completionLog: CompletionLogEntry[]
): string[] {
  const { completed } = getMilestoneCounts(_areas, completionLog);
  return MILESTONE_BADGES.filter((b) => completed >= b.minMilestones).map((b) => b.id);
}

/** All badge ids that should be unlocked (progress-based + milestone-based). */
export function getAllEarnedBadgeIds(
  areas: Area[],
  getAreaProgress: (area: Area) => number,
  completionLog: CompletionLogEntry[]
): string[] {
  const progressBadges = getBadges(areas, getAreaProgress).map((b) => b.id);
  const milestoneBadges = getEarnedMilestoneBadges(areas, completionLog);
  return [...new Set([...progressBadges, ...milestoneBadges])];
}

/** Title definitions: id and display label. Unlock by milestones/badges. */
export const TITLE_DEFINITIONS: { id: string; label: string; minMilestones: number }[] = [
  { id: '', label: 'None', minMilestones: 0 },
  { id: 'beginner', label: 'Beginner', minMilestones: 1 },
  { id: 'achiever', label: 'Achiever', minMilestones: 5 },
  { id: 'champion', label: 'Champion', minMilestones: 10 },
];

export function getEarnedTitleIds(
  _areas: Area[],
  completionLog: CompletionLogEntry[]
): string[] {
  const { completed } = getMilestoneCounts(_areas, completionLog);
  return TITLE_DEFINITIONS.filter((t) => t.id && completed >= t.minMilestones).map((t) => t.id);
}

/** Avatar skin definitions: id, label, emoji, optional milestone threshold. */
export interface AvatarDefinition {
  id: string;
  label: string;
  emoji: string;
  minMilestones?: number;
}

export const AVATAR_DEFINITIONS: AvatarDefinition[] = [
  { id: 'default', label: 'Default', emoji: '🧑' },
  { id: 'fitness', label: 'Fitness', emoji: '🏋️', minMilestones: 2 },
  { id: 'scholar', label: 'Scholar', emoji: '📚', minMilestones: 5 },
];

export function getEarnedAvatarIds(
  areas: Area[],
  completionLog: CompletionLogEntry[]
): string[] {
  const { completed } = getMilestoneCounts(areas, completionLog);
  return AVATAR_DEFINITIONS.filter((a) => (a.minMilestones ?? 0) <= completed).map((a) => a.id);
}
