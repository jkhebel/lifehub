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

export interface Area {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  trackers: Tracker[];
  children: Area[];
  parentId: string | null;
  /** Target progress 0-100 for this area. */
  targetProgress?: number;
  /** ISO date string, e.g. "2025-12-31". */
  targetDate?: string;
  /** How to aggregate tracker and child progress. Default 'average'. */
  aggregation?: AggregationMode;
}

export interface DashboardState {
  areas: Area[];
  currentAreaId: string | null;
  breadcrumbs: string[];
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
