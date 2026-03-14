import type { Area } from '../types';

/**
 * Single progress function: from metric (binary/progress/stages) or aggregate of children.
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
