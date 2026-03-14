/** Metric for a leaf or override: binary (done/not), progress (current/max), or stages (ordered list). */
export interface BinaryMetric {
  type: 'binary';
  value: 0 | 1;
}

export interface ProgressMetric {
  type: 'progress';
  current: number;
  max: number;
  unit?: string;
  target?: number;
}

export interface StagesMetric {
  type: 'stages';
  currentIndex: number;
  stages: string[];
}

export type DomainMetric = BinaryMetric | ProgressMetric | StagesMetric;

/** How to aggregate child progress. v1: average or minimum only. */
export type AggregationMode = 'average' | 'minimum';

export interface Area {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  children: Area[];
  parentId: string | null;
  /** Optional metric: if set, progress comes from this; else from children (or 0 if leaf). */
  metric?: DomainMetric;
  /** How to aggregate child progress when no metric. Default 'average'. */
  aggregation?: AggregationMode;
}

export interface DashboardState {
  areas: Area[];
  currentAreaId: string | null;
  breadcrumbs: string[];
}

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

export const AGGREGATION_MODES: { value: AggregationMode; label: string }[] = [
  { value: 'average', label: 'Average' },
  { value: 'minimum', label: 'Minimum' },
];
