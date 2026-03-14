import { DashboardState, getDefaultGamificationState } from '../types';
import { validateAreas } from '../model/validation';
import { getDefaultAreas } from '../config/loadConfig';

const STORAGE_KEY = 'life-dashboard-data';

/** Merge saved state with defaults so new fields (e.g. gamification) are always present. */
function normalizeLoadedState(parsed: DashboardState): DashboardState {
  const defaultGamification = getDefaultGamificationState();
  const g = parsed.gamification;
  return {
    areas: parsed.areas,
    currentAreaId: parsed.currentAreaId ?? null,
    breadcrumbs: Array.isArray(parsed.breadcrumbs) ? parsed.breadcrumbs : [],
    gamification: {
      completionLog: Array.isArray(g?.completionLog) ? g.completionLog : defaultGamification.completionLog,
      domainXp: g?.domainXp && typeof g.domainXp === 'object' ? g.domainXp : defaultGamification.domainXp,
      unlockedBadges: Array.isArray(g?.unlockedBadges) ? g.unlockedBadges : defaultGamification.unlockedBadges,
      unlockedTitles: Array.isArray(g?.unlockedTitles) ? g.unlockedTitles : defaultGamification.unlockedTitles,
      avatarUnlocks: Array.isArray(g?.avatarUnlocks) ? g.avatarUnlocks : defaultGamification.avatarUnlocks,
      selectedAvatar: typeof g?.selectedAvatar === 'string' ? g.selectedAvatar : defaultGamification.selectedAvatar,
      selectedTitle: typeof g?.selectedTitle === 'string' ? g.selectedTitle : defaultGamification.selectedTitle,
    },
  };
}

export const loadDashboardState = <T extends DashboardState>(
  createDefault: () => T
): T => {
  if (typeof window === 'undefined') {
    return createDefault();
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return createDefault();

  try {
    const parsed = JSON.parse(saved) as DashboardState;
    // Minimal shape check: must have areas array
    if (!parsed || !Array.isArray(parsed.areas)) {
      return createDefault();
    }
    // Validate restored areas; fall back to default tree if corrupted
    const validation = validateAreas(parsed.areas);
    if (!validation.ok) {
      return {
        ...normalizeLoadedState(parsed),
        areas: getDefaultAreas(),
      } as T;
    }
    return normalizeLoadedState(parsed) as T;
  } catch {
    return createDefault();
  }
};

export const persistDashboardState = (state: DashboardState): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore persistence errors; app will fall back to defaults on next load
  }
};

