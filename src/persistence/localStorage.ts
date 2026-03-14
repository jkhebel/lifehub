import type { DashboardState } from '../types';
import { validateAreas } from '../model/validation';
import { getDefaultAreas } from '../config/loadConfig';

const STORAGE_KEY = 'life-dashboard-data';

/** Normalize loaded state: areas, currentAreaId, breadcrumbs, pinnedAreaIds, optional gamification. Shared by local and remote loaders. */
export function normalizeLoadedState(parsed: Partial<DashboardState>): DashboardState {
  const gamification = parsed.gamification;
  const normalizedGamification =
    gamification &&
    typeof gamification.totalXp === 'number' &&
    Array.isArray(gamification.completionLog)
      ? {
          totalXp: gamification.totalXp,
          completionLog: (gamification.completionLog as { domainId?: string; completedAt?: string }[])
            .filter((e) => e && typeof e.domainId === 'string' && typeof e.completedAt === 'string')
            .map((e) => ({ domainId: e.domainId!, completedAt: e.completedAt! })),
        }
      : undefined;

  return {
    areas: Array.isArray(parsed.areas) ? parsed.areas : getDefaultAreas(),
    currentAreaId: parsed.currentAreaId ?? null,
    breadcrumbs: Array.isArray(parsed.breadcrumbs) ? parsed.breadcrumbs : [],
    pinnedAreaIds: Array.isArray(parsed.pinnedAreaIds) ? parsed.pinnedAreaIds : [],
    gamification: normalizedGamification ?? { totalXp: 0, completionLog: [] },
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
    const parsed = JSON.parse(saved) as Partial<DashboardState>;
    if (!parsed || !Array.isArray(parsed.areas)) {
      return createDefault();
    }
    const validation = validateAreas(parsed.areas);
    if (!validation.ok) {
      return createDefault();
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
    // Ignore persistence errors
  }
};
