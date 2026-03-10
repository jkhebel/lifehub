import { DashboardState } from '../types';

const STORAGE_KEY = 'life-dashboard-data';

export const loadDashboardState = <T extends DashboardState>(
  createDefault: () => T
): T => {
  if (typeof window === 'undefined') {
    return createDefault();
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return createDefault();

  try {
    const parsed = JSON.parse(saved) as T;
    // Minimal shape check: must have areas array
    if (!parsed || !Array.isArray((parsed as DashboardState).areas)) {
      return createDefault();
    }
    return parsed;
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

