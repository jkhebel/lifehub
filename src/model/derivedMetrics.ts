import type { Area, LevelsMetric, StagesMetric } from '../types';

/** Numeric value from an area's metric for use in levels bounds (e.g. progress.current, stages.currentValue). */
export function getNumericValueFromArea(area: Area): number {
  const m = area.metric;
  if (!m) return 0;
  if (m.type === 'binary') return m.value;
  if (m.type === 'progress') return m.current;
  if (m.type === 'stages') {
    if (m.stageBounds != null && m.stageBounds.length === m.stages.length + 1 && typeof m.currentValue === 'number') {
      return m.currentValue;
    }
    return m.currentIndex;
  }
  return 0;
}

/**
 * Resolve level index and within-tier progress for a levels metric from a parent domain.
 * Progress = average over parameters of (progress within current tier); level = min tier across parameters.
 */
function getLevelsProgress(domain: Area): {
  progress01: number;
  levelIndex: number;
  levelName: string;
  nextLevelName?: string;
 } | null {
  const m = domain.metric;
  if (!m || m.type !== 'levels') return null;
  const { levels, parameters } = m;
  if (parameters.length === 0) return { progress01: 0, levelIndex: 0, levelName: levels[0] ?? '—', nextLevelName: levels[1] };

  let sumProgress = 0;
  let minIndex = levels.length;
  for (const param of parameters) {
    const child = domain.children.find((c) => c.id === param.childId);
    if (!child || param.bounds.length !== levels.length + 1) continue;
    const value = getNumericValueFromArea(child);
    const bounds = param.bounds;
    const last = bounds[bounds.length - 1]!;
    if (last <= 0) {
      sumProgress += 1;
      minIndex = Math.min(minIndex, levels.length - 1);
      continue;
    }
    if (value >= last) {
      sumProgress += 1;
      minIndex = Math.min(minIndex, levels.length - 1);
      continue;
    }
    let index = 0;
    for (let i = 0; i < bounds.length - 1; i++) {
      if (value >= bounds[i]! && value < bounds[i + 1]!) {
        index = i;
        break;
      }
      index = i + 1;
    }
    minIndex = Math.min(minIndex, index);
    const low = bounds[index]!;
    const high = bounds[index + 1]!;
    const withinTier = high > low ? (value - low) / (high - low) : 1;
    sumProgress += withinTier;
  }
  const progress01 = parameters.length > 0 ? sumProgress / parameters.length : 0;
  const levelName = levels[minIndex] ?? '—';
  const nextLevelName = minIndex < levels.length - 1 ? levels[minIndex + 1] : undefined;
  return { progress01, levelIndex: minIndex, levelName, nextLevelName };
}

/**
 * Single progress function: from metric (binary/progress/stages/levels) or aggregate of children.
 * Returns 0–100.
 */
export function calculateDomainProgress(domain: Area): number {
  if (domain.metric) {
    const m = domain.metric;
    if (m.type === 'binary') {
      return m.value ? 100 : 0;
    }
    if (m.type === 'progress') {
      if (m.max <= 0) return 0;
      return Math.min(100, (m.current / m.max) * 100);
    }
    if (m.type === 'stages') {
      if (m.stages.length <= 1) return m.currentIndex === 0 ? 100 : 0;
      return (m.currentIndex / (m.stages.length - 1)) * 100;
    }
    if (m.type === 'levels') {
      const info = getLevelsProgress(domain);
      if (!info) return 0;
      return info.progress01 * 100;
    }
  }

  if (domain.children.length > 0) {
    const childProgress = domain.children.map((c) => calculateDomainProgress(c));
    const mode = domain.aggregation ?? 'average';
    if (mode === 'minimum') {
      return Math.min(...childProgress);
    }
    return childProgress.reduce((a, b) => a + b, 0) / childProgress.length;
  }

  return 0;
}

export interface ProgressToNextLevelResult {
  /** 0–1 progress within current tier toward next tier (or 1 if at top). */
  progress01: number;
  /** Label for current tier (e.g. "A1", "B2", "50%"). */
  currentTierLabel: string;
  /** Next tier label when not at top. */
  nextTierLabel?: string;
}

/**
 * Resolve effective tier index and value for stages metric (with optional stageBounds/currentValue).
 */
function getStagesTierInfo(m: StagesMetric): { index: number; valueForProgress: number | null } {
  const { stages, stageBounds, currentValue, currentIndex } = m;
  if (stageBounds != null && stageBounds.length === stages.length + 1 && typeof currentValue === 'number') {
    const lastBound = stageBounds[stageBounds.length - 1]!;
    if (currentValue >= lastBound) {
      return { index: stages.length - 1, valueForProgress: 1 };
    }
    let index = 0;
    for (let i = 0; i < stageBounds.length - 1; i++) {
      if (currentValue >= stageBounds[i]! && currentValue < stageBounds[i + 1]!) {
        index = i;
        break;
      }
      index = i + 1;
    }
    const low = stageBounds[index]!;
    const high = stageBounds[index + 1]!;
    const valueForProgress = high > low ? (currentValue - low) / (high - low) : 1;
    return { index, valueForProgress };
  }
  return { index: currentIndex, valueForProgress: null };
}

/**
 * Progress toward the next level/tier for this domain. Used for radar "relative" view.
 * For nodes with children, aggregates children's progress-to-next-level.
 */
export function getProgressToNextLevel(domain: Area): ProgressToNextLevelResult {
  if (domain.metric) {
    const m = domain.metric;
    if (m.type === 'binary') {
      return {
        progress01: m.value,
        currentTierLabel: m.value ? 'Done' : 'Not done',
        nextTierLabel: m.value ? undefined : 'Done',
      };
    }
    if (m.type === 'progress') {
      if (m.max <= 0) {
        return { progress01: 0, currentTierLabel: '0%' };
      }
      const target = m.target != null && m.target > 0 ? m.target : m.max;
      const progress01 = Math.min(1, m.current / target);
      const pct = Math.round((m.current / m.max) * 100);
      return {
        progress01,
        currentTierLabel: `${pct}%`,
        nextTierLabel: progress01 >= 1 ? undefined : target === m.max ? '100%' : `Target ${target}`,
      };
    }
    if (m.type === 'stages') {
      const { stages } = m;
      const { index, valueForProgress } = getStagesTierInfo(m);
      const atTop = index >= stages.length - 1;
      const progress01 = atTop ? 1 : valueForProgress != null ? valueForProgress : 0;
      const currentTierLabel = stages[index] ?? '—';
      const nextTierLabel = atTop ? undefined : stages[index + 1];
      return { progress01, currentTierLabel, nextTierLabel };
    }
    if (m.type === 'levels') {
      const info = getLevelsProgress(domain);
      if (!info) return { progress01: 0, currentTierLabel: '—' };
      const levelNum = info.levelIndex + 1;
      const currentTierLabel = `Level ${levelNum}: ${info.levelName} ${Math.round(info.progress01 * 100)}%`;
      const nextTierLabel = info.nextLevelName;
      return { progress01: info.progress01, currentTierLabel, nextTierLabel };
    }
  }

  if (domain.children.length > 0) {
    const childResults = domain.children.map((c) => getProgressToNextLevel(c));
    const mode = domain.aggregation ?? 'average';
    const progress01 =
      mode === 'minimum'
        ? Math.min(...childResults.map((r) => r.progress01))
        : childResults.reduce((s, r) => s + r.progress01, 0) / childResults.length;
    const labels = [...new Set(childResults.map((r) => r.currentTierLabel))];
    const currentTierLabel = labels.length === 1 ? labels[0]! : '—';
    return { progress01, currentTierLabel };
  }

  return { progress01: 0, currentTierLabel: '—' };
}
