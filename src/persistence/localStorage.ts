import type { DashboardState } from '../types';
import { validateAreas } from '../model/validation';
import { getDefaultAreas } from '../config/loadConfig';

const STORAGE_KEY = 'life-dashboard-data';

/** Normalize loaded state: only areas, currentAreaId, breadcrumbs. */
function normalizeLoadedState(parsed: Partial<DashboardState>): DashboardState {
  return {
    areas: Array.isArray(parsed.areas) ? parsed.areas : getDefaultAreas(),
    currentAreaId: parsed.currentAreaId ?? null,
    breadcrumbs: Array.isArray(parsed.breadcrumbs) ? parsed.breadcrumbs : [],
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
