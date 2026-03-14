import { describe, it, expect } from 'vitest';
import { calculateDomainProgress } from './derivedMetrics';
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
