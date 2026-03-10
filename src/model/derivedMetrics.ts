import { Area, Tracker } from '../types';

export const getTrackerProgress = (tracker: Tracker): number => {
  if (tracker.type === 'boolean') return tracker.value ? 100 : 0;
  if (tracker.target) return Math.min((tracker.value / tracker.target) * 100, 100);
  if (tracker.max) return (tracker.value / tracker.max) * 100;
  return 50;
};

export const calculateAreaProgress = (area: Area): number => {
  const mode = area.aggregation ?? 'average';
  const trackerProgress = area.trackers.map(t => getTrackerProgress(t));
  const childProgress = area.children.map(c => calculateAreaProgress(c));
  const allProgress = [...trackerProgress, ...childProgress];

  if (allProgress.length === 0) return 0;

  if (mode === 'minimum') {
    return Math.min(...allProgress);
  }

  if (mode === 'weighted') {
    const trackerWeights = area.trackers.map(t => t.weight ?? 1);
    const childWeights = area.children.map(() => 1);
    const weights = [...trackerWeights, ...childWeights];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    if (totalWeight === 0) return 0;
    const weightedSum = allProgress.reduce(
      (sum, p, i) => sum + p * weights[i],
      0
    );
    return weightedSum / totalWeight;
  }

  // average (default)
  return allProgress.reduce((a, b) => a + b, 0) / allProgress.length;
};

