import { describe, it, expect } from 'vitest';
import {
  getTrackerProgress,
  calculateAreaProgress,
  calculateMilestoneProgress,
  calculateBlendedProgress,
  getGlobalXp,
  getXpLevel,
} from './derivedMetrics';
import type { Area, Tracker } from '../types';

describe('getTrackerProgress', () => {
  it('returns 100 for boolean true, 0 for false', () => {
    expect(getTrackerProgress({ id: 'b', name: 'B', type: 'boolean', value: 1 } as Tracker)).toBe(100);
    expect(getTrackerProgress({ id: 'b', name: 'B', type: 'boolean', value: 0 } as Tracker)).toBe(0);
  });

  it('uses target when present', () => {
    const t: Tracker = { id: 'n', name: 'N', type: 'number', value: 5, target: 10 };
    expect(getTrackerProgress(t)).toBe(50);
  });

  it('caps at 100 when value exceeds target', () => {
    const t: Tracker = { id: 'n', name: 'N', type: 'number', value: 15, target: 10 };
    expect(getTrackerProgress(t)).toBe(100);
  });

  it('uses max when no target', () => {
    const t: Tracker = { id: 'n', name: 'N', type: 'number', value: 5, max: 20 };
    expect(getTrackerProgress(t)).toBe(25);
  });

  it('returns 50 when no target or max', () => {
    const t: Tracker = { id: 'n', name: 'N', type: 'number', value: 7 };
    expect(getTrackerProgress(t)).toBe(50);
  });
});

describe('calculateAreaProgress', () => {
  it('returns 0 for area with no trackers and no children', () => {
    const area: Area = {
      id: 'a',
      name: 'A',
      color: '#333',
      parentId: null,
      trackers: [],
      children: [],
    };
    expect(calculateAreaProgress(area)).toBe(0);
  });

  it('averages tracker progress by default', () => {
    const area: Area = {
      id: 'a',
      name: 'A',
      color: '#333',
      parentId: null,
      trackers: [
        { id: 't1', name: 'T1', type: 'number', value: 5, target: 10 },
        { id: 't2', name: 'T2', type: 'number', value: 10, target: 10 },
      ] as Tracker[],
      children: [],
    };
    expect(calculateAreaProgress(area)).toBe(75); // 50 and 100
  });

  it('uses minimum aggregation when set', () => {
    const area: Area = {
      id: 'a',
      name: 'A',
      color: '#333',
      parentId: null,
      aggregation: 'minimum',
      trackers: [
        { id: 't1', name: 'T1', type: 'number', value: 5, target: 10 },
        { id: 't2', name: 'T2', type: 'number', value: 10, target: 10 },
      ] as Tracker[],
      children: [],
    };
    expect(calculateAreaProgress(area)).toBe(50);
  });

  it('aggregates child area progress', () => {
    const child: Area = {
      id: 'c',
      name: 'C',
      color: '#333',
      parentId: 'a',
      trackers: [{ id: 't1', name: 'T1', type: 'number', value: 10, target: 10 } as Tracker],
      children: [],
    };
    const area: Area = {
      id: 'a',
      name: 'A',
      color: '#333',
      parentId: null,
      trackers: [],
      children: [child],
    };
    expect(calculateAreaProgress(area)).toBe(100);
  });
});

describe('calculateMilestoneProgress', () => {
  it('returns 0 when area has no achievements', () => {
    const area: Area = {
      id: 'a',
      name: 'A',
      color: '#333',
      parentId: null,
      trackers: [],
      children: [],
    };
    expect(calculateMilestoneProgress(area, [])).toBe(0);
  });

  it('returns 0–100 based on completed milestones', () => {
    const area: Area = {
      id: 'a',
      name: 'A',
      color: '#333',
      parentId: null,
      trackers: [],
      children: [],
      achievements: [
        { id: 'm1', name: 'M1', kind: 'milestone', areaId: 'a' },
        { id: 'm2', name: 'M2', kind: 'milestone', areaId: 'a' },
      ],
    };
    expect(calculateMilestoneProgress(area, [])).toBe(0);
    expect(calculateMilestoneProgress(area, [{ achievementId: 'm1', completedAt: '2025-01-01' }])).toBe(50);
    expect(calculateMilestoneProgress(area, [
      { achievementId: 'm1', completedAt: '2025-01-01' },
      { achievementId: 'm2', completedAt: '2025-01-02' },
    ])).toBe(100);
  });
});

describe('calculateBlendedProgress', () => {
  it('returns tracker progress when area has no milestones', () => {
    const area: Area = {
      id: 'a',
      name: 'A',
      color: '#333',
      parentId: null,
      trackers: [{ id: 't', name: 'T', type: 'number', value: 5, target: 10 } as Tracker],
      children: [],
    };
    const getTracker = (a: Area) => calculateAreaProgress(a);
    expect(calculateBlendedProgress(area, [], getTracker, 0.5)).toBe(50);
  });
});

describe('getGlobalXp and getXpLevel', () => {
  it('sums domain XP', () => {
    expect(getGlobalXp({})).toBe(0);
    expect(getGlobalXp({ health: 100, growth: 50 })).toBe(150);
  });

  it('returns XP level from global XP', () => {
    expect(getXpLevel(0)).toBe(1);
    expect(getXpLevel(100)).toBe(2);  // sqrt(1)+1 = 2
    expect(getXpLevel(400)).toBe(3);   // sqrt(4)+1 = 3
  });
});
