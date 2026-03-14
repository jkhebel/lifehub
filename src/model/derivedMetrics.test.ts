import { describe, it, expect } from 'vitest';
import { calculateDomainProgress, getProgressToNextLevel } from './derivedMetrics';
import type { Area } from '../types';

describe('calculateDomainProgress', () => {
  it('returns 0 for area with no metric and no children', () => {
    const area: Area = {
      id: 'a',
      name: 'A',
      color: '#333',
      parentId: null,
      children: [],
    };
    expect(calculateDomainProgress(area)).toBe(0);
  });

  it('binary: 100 when value 1, 0 when value 0', () => {
    expect(calculateDomainProgress({
      id: 'a', name: 'A', color: '#333', parentId: null, children: [],
      metric: { type: 'binary', value: 1 },
    })).toBe(100);
    expect(calculateDomainProgress({
      id: 'a', name: 'A', color: '#333', parentId: null, children: [],
      metric: { type: 'binary', value: 0 },
    })).toBe(0);
  });

  it('progress: (current/max)*100 capped at 100', () => {
    expect(calculateDomainProgress({
      id: 'a', name: 'A', color: '#333', parentId: null, children: [],
      metric: { type: 'progress', current: 5, max: 10 },
    })).toBe(50);
    expect(calculateDomainProgress({
      id: 'a', name: 'A', color: '#333', parentId: null, children: [],
      metric: { type: 'progress', current: 15, max: 10 },
    })).toBe(100);
    expect(calculateDomainProgress({
      id: 'a', name: 'A', color: '#333', parentId: null, children: [],
      metric: { type: 'progress', current: 0, max: 10 },
    })).toBe(0);
  });

  it('progress: returns 0 when max <= 0', () => {
    expect(calculateDomainProgress({
      id: 'a', name: 'A', color: '#333', parentId: null, children: [],
      metric: { type: 'progress', current: 5, max: 0 },
    })).toBe(0);
    expect(calculateDomainProgress({
      id: 'a', name: 'A', color: '#333', parentId: null, children: [],
      metric: { type: 'progress', current: 5, max: -1 },
    })).toBe(0);
  });

  it('stages: single stage gives 100 when currentIndex 0 else 0', () => {
    expect(calculateDomainProgress({
      id: 'a', name: 'A', color: '#333', parentId: null, children: [],
      metric: { type: 'stages', currentIndex: 0, stages: ['Only'] },
    })).toBe(100);
    expect(calculateDomainProgress({
      id: 'a', name: 'A', color: '#333', parentId: null, children: [],
      metric: { type: 'stages', currentIndex: 1, stages: ['Only'] },
    })).toBe(0);
  });

  it('stages: progress from currentIndex / (length-1)', () => {
    const area: Area = {
      id: 'a',
      name: 'A',
      color: '#333',
      parentId: null,
      children: [],
      metric: { type: 'stages', currentIndex: 1, stages: ['N5', 'N4', 'N3'] }, // 3 stages -> indices 0,1,2 -> 0%, 50%, 100%
    };
    expect(calculateDomainProgress(area)).toBe(50);
    expect(calculateDomainProgress({
      id: 'a', name: 'A', color: '#333', parentId: null, children: [],
      metric: { type: 'stages', currentIndex: 0, stages: ['N5', 'N4', 'N3'] },
    })).toBe(0);
    expect(calculateDomainProgress({
      id: 'a', name: 'A', color: '#333', parentId: null, children: [],
      metric: { type: 'stages', currentIndex: 2, stages: ['N5', 'N4', 'N3'] },
    })).toBe(100);
  });

  it('aggregates children with average by default', () => {
    const child1: Area = {
      id: 'c1',
      name: 'C1',
      color: '#333',
      parentId: 'a',
      children: [],
      metric: { type: 'binary', value: 0 },
    };
    const child2: Area = {
      id: 'c2',
      name: 'C2',
      color: '#333',
      parentId: 'a',
      children: [],
      metric: { type: 'binary', value: 1 },
    };
    const area: Area = {
      id: 'a',
      name: 'A',
      color: '#333',
      parentId: null,
      children: [child1, child2],
    };
    expect(calculateDomainProgress(area)).toBe(50);
  });

  it('aggregates children with minimum when set', () => {
    const child1: Area = {
      id: 'c1',
      name: 'C1',
      color: '#333',
      parentId: 'a',
      children: [],
      metric: { type: 'progress', current: 5, max: 10 },
    };
    const child2: Area = {
      id: 'c2',
      name: 'C2',
      color: '#333',
      parentId: 'a',
      children: [],
      metric: { type: 'progress', current: 10, max: 10 },
    };
    const area: Area = {
      id: 'a',
      name: 'A',
      color: '#333',
      parentId: null,
      aggregation: 'minimum',
      children: [child1, child2],
    };
    expect(calculateDomainProgress(area)).toBe(50);
  });
});

describe('getProgressToNextLevel', () => {
  it('returns 0 progress and label for area with no metric and no children', () => {
    const area: Area = {
      id: 'a',
      name: 'A',
      color: '#333',
      parentId: null,
      children: [],
    };
    expect(getProgressToNextLevel(area)).toEqual({ progress01: 0, currentTierLabel: '—' });
  });

  it('binary: progress01 0 or 1, labels Done / Not done', () => {
    expect(getProgressToNextLevel({
      id: 'a', name: 'A', color: '#333', parentId: null, children: [],
      metric: { type: 'binary', value: 1 },
    })).toEqual({ progress01: 1, currentTierLabel: 'Done' });
    expect(getProgressToNextLevel({
      id: 'a', name: 'A', color: '#333', parentId: null, children: [],
      metric: { type: 'binary', value: 0 },
    })).toEqual({ progress01: 0, currentTierLabel: 'Not done', nextTierLabel: 'Done' });
  });

  it('progress: progress01 from current/max or current/target', () => {
    const r = getProgressToNextLevel({
      id: 'a', name: 'A', color: '#333', parentId: null, children: [],
      metric: { type: 'progress', current: 5, max: 10 },
    });
    expect(r.progress01).toBe(0.5);
    expect(r.currentTierLabel).toBe('50%');
  });

  it('stages with stageBounds and currentValue: progress within tier', () => {
    const area: Area = {
      id: 'a',
      name: 'Japanese',
      color: '#333',
      parentId: null,
      children: [],
      metric: {
        type: 'stages',
        currentIndex: 0,
        stages: ['A1', 'A2', 'B1', 'B2'],
        stageBounds: [0, 1000, 2000, 4000, 6000],
        currentValue: 500,
      },
    };
    const r = getProgressToNextLevel(area);
    expect(r.progress01).toBe(0.5); // 500/1000
    expect(r.currentTierLabel).toBe('A1');
    expect(r.nextTierLabel).toBe('A2');
  });

  it('stages with stageBounds and currentValue: French B1 at 75% to B2', () => {
    const area: Area = {
      id: 'a',
      name: 'French',
      color: '#333',
      parentId: null,
      children: [],
      metric: {
        type: 'stages',
        currentIndex: 2,
        stages: ['A1', 'A2', 'B1', 'B2'],
        stageBounds: [0, 1000, 2000, 4000, 6000],
        currentValue: 3500,
      },
    };
    const r = getProgressToNextLevel(area);
    expect(r.progress01).toBe(0.75); // (3500-2000)/(4000-2000)
    expect(r.currentTierLabel).toBe('B1');
    expect(r.nextTierLabel).toBe('B2');
  });

  it('stages without bounds: index-based, at top tier gives progress01 1', () => {
    const area: Area = {
      id: 'a',
      name: 'A',
      color: '#333',
      parentId: null,
      children: [],
      metric: { type: 'stages', currentIndex: 2, stages: ['N5', 'N4', 'N3'] },
    };
    expect(getProgressToNextLevel(area)).toEqual({
      progress01: 1,
      currentTierLabel: 'N3',
    });
  });

  it('aggregates children progress-to-next-level', () => {
    const area: Area = {
      id: 'a',
      name: 'A',
      color: '#333',
      parentId: null,
      children: [
        { id: 'c1', name: 'C1', color: '#333', parentId: 'a', children: [], metric: { type: 'binary', value: 0 } },
        { id: 'c2', name: 'C2', color: '#333', parentId: 'a', children: [], metric: { type: 'binary', value: 1 } },
      ],
    };
    const r = getProgressToNextLevel(area);
    expect(r.progress01).toBe(0.5);
    expect(r.currentTierLabel).toBe('—');
  });

  it('levels metric: progress and label from child parameters', () => {
    const area: Area = {
      id: 'parent',
      name: 'French',
      color: '#333',
      parentId: null,
      children: [
        { id: 'vocab', name: 'Vocabulary', color: '#333', parentId: 'parent', children: [], metric: { type: 'progress', current: 2500, max: 6000 } },
      ],
      metric: {
        type: 'levels',
        levels: ['A1', 'A2', 'B1', 'B2'],
        parameters: [{ childId: 'vocab', bounds: [0, 1000, 2000, 4000, 6000] }],
      },
    };
    expect(calculateDomainProgress(area)).toBeCloseTo((2500 - 2000) / (4000 - 2000) * 100, 0);
    const r = getProgressToNextLevel(area);
    expect(r.currentTierLabel).toMatch(/Level 3: B1 \d+%/);
    expect(r.nextTierLabel).toBe('B2');
  });
});
