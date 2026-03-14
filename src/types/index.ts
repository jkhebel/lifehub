export interface Tracker {
  id: string;
  name: string;
  type: 'number' | 'percentage' | 'level' | 'boolean' | 'progress';
  value: number;
  target?: number;
  min?: number;
  max?: number;
  unit?: string;
  color?: string;
  /** Used when parent area aggregation is 'weighted'. Default 1. */
  weight?: number;
}

export type AggregationMode = 'average' | 'weighted' | 'minimum';

/** Kind of achievement: one-time milestone, repeatable task, or project (container). */
export type AchievementKind = 'milestone' | 'task' | 'project';

export interface Achievement {
  id: string;
  name: string;
  kind: AchievementKind;
  /** Area this achievement belongs to. */
  areaId: string;
  /** Parent achievement id when nested under a project; otherwise undefined. */
  parentId?: string;
  /** XP granted when completed (tasks: per completion; milestones: one-time). */
  xpReward?: number;
  /** For tasks: optional target count per period (e.g. 3x/week). */
  targetCount?: number;
  /** Child achievements when kind is 'project'. */
  children?: Achievement[];
}

export interface Area {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  trackers: Tracker[];
  children: Area[];
  parentId: string | null;
  /** Achievements (milestones, tasks, projects) for this area. */
  achievements?: Achievement[];
  /** Target progress 0-100 for this area. */
  targetProgress?: number;
  /** ISO date string, e.g. "2025-12-31". */
  targetDate?: string;
  /** How to aggregate tracker and child progress. Default 'average'. */
  aggregation?: AggregationMode;
}

/** One completion event (milestone claimed or task checked off). */
export interface CompletionLogEntry {
  achievementId: string;
  completedAt: string; // ISO date string
}

/** Gamification and achievement user state (persisted). */
export interface GamificationState {
  /** Log of all completions (milestones: one entry; tasks: multiple allowed). */
  completionLog: CompletionLogEntry[];
  /** Per-domain cumulative XP. */
  domainXp: Record<string, number>;
  /** Badge ids the user has unlocked. */
  unlockedBadges: string[];
  /** Title ids the user has unlocked. */
  unlockedTitles: string[];
  /** Avatar skin ids unlocked. */
  avatarUnlocks: string[];
  /** Currently selected avatar id. */
  selectedAvatar: string;
  /** Currently selected title id (displayed on character card). */
  selectedTitle: string;
}

export interface DashboardState {
  areas: Area[];
  currentAreaId: string | null;
  breadcrumbs: string[];
  /** Achievement completions, XP, badges, cosmetics. */
  gamification: GamificationState;
}

export type TrackerType = Tracker['type'];

export const TRACKER_TYPES: { value: TrackerType; label: string }[] = [
  { value: 'number', label: 'Number' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'level', label: 'Level' },
  { value: 'progress', label: 'Progress Bar' },
  { value: 'boolean', label: 'Yes/No' },
];

export const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export const DEFAULT_AVATAR_ID = 'default';
export const DEFAULT_TITLE_ID = '';

/** Default gamification state for new users. */
export function getDefaultGamificationState(): GamificationState {
  return {
    completionLog: [],
    domainXp: {},
    unlockedBadges: [],
    unlockedTitles: [],
    avatarUnlocks: [DEFAULT_AVATAR_ID],
    selectedAvatar: DEFAULT_AVATAR_ID,
    selectedTitle: DEFAULT_TITLE_ID,
  };
}
