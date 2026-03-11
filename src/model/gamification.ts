import { Area } from '../types';

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
