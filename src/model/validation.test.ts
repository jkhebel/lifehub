import { describe, it, expect } from 'vitest';
import { validateAreas } from './validation';

const validTree = [
  {
    id: 'health',
    name: 'Health',
    color: '#22c55e',
    parentId: null,
    children: [],
  },
];

describe('validateAreas', () => {
  it('accepts a valid area tree (no metric)', () => {
    const result = validateAreas(validTree);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('health');
      expect(result.data[0].children).toEqual([]);
    }
  });

  it('accepts area with binary metric', () => {
    const tree = [
      { id: 'a', name: 'A', color: '#333', parentId: null, children: [], metric: { type: 'binary', value: 1 } },
    ];
    const result = validateAreas(tree);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data[0].metric).toEqual({ type: 'binary', value: 1 });
    }
  });

  it('accepts area with progress metric', () => {
    const tree = [
      { id: 'a', name: 'A', color: '#333', parentId: null, children: [], metric: { type: 'progress', current: 5, max: 10 } },
    ];
    const result = validateAreas(tree);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data[0].metric).toEqual({ type: 'progress', current: 5, max: 10 });
    }
  });

  it('accepts area with stages metric', () => {
    const tree = [
      { id: 'a', name: 'A', color: '#333', parentId: null, children: [], metric: { type: 'stages', currentIndex: 1, stages: ['N5', 'N4', 'N3'] } },
    ];
    const result = validateAreas(tree);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data[0].metric).toEqual({ type: 'stages', currentIndex: 1, stages: ['N5', 'N4', 'N3'] });
    }
  });

  it('rejects non-array root', () => {
    const result = validateAreas({});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain('Root value must be an array of areas');
    }
  });

  it('rejects area with missing id', () => {
    const bad = [
      { name: 'Health', color: '#22c55e', parentId: null, children: [] },
    ];
    const result = validateAreas(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes('id'))).toBe(true);
    }
  });

  it('rejects area with non-array children', () => {
    const bad = [
      { id: 'a', name: 'A', color: '#333', parentId: null, children: 'not-an-array' },
    ];
    const result = validateAreas(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes('children'))).toBe(true);
    }
  });

  it('rejects area with trackers (old shape)', () => {
    const bad = [
      { id: 'a', name: 'A', color: '#333', parentId: null, trackers: [], children: [] },
    ];
    const result = validateAreas(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.toLowerCase().includes('tracker'))).toBe(true);
    }
  });

  it('rejects area with achievements (old shape)', () => {
    const bad = [
      { id: 'a', name: 'A', color: '#333', parentId: null, children: [], achievements: [] },
    ];
    const result = validateAreas(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.toLowerCase().includes('achievement'))).toBe(true);
    }
  });

  it('rejects binary metric with invalid value', () => {
    const bad = [
      { id: 'a', name: 'A', color: '#333', parentId: null, children: [], metric: { type: 'binary', value: 2 } },
    ];
    const result = validateAreas(bad);
    expect(result.ok).toBe(false);
  });

  it('rejects progress metric with missing max', () => {
    const bad = [
      { id: 'a', name: 'A', color: '#333', parentId: null, children: [], metric: { type: 'progress', current: 5 } },
    ];
    const result = validateAreas(bad);
    expect(result.ok).toBe(false);
  });

  it('rejects stages metric with empty stages', () => {
    const bad = [
      { id: 'a', name: 'A', color: '#333', parentId: null, children: [], metric: { type: 'stages', currentIndex: 0, stages: [] } },
    ];
    const result = validateAreas(bad);
    expect(result.ok).toBe(false);
  });

  it('accepts area with statName', () => {
    const tree = [
      { id: 'health', name: 'Health', color: '#22c55e', parentId: null, children: [], statName: 'HP' },
    ];
    const result = validateAreas(tree);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data[0].statName).toBe('HP');
  });

  it('accepts stages metric with stageBounds and currentValue', () => {
    const tree = [
      {
        id: 'lang',
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
      },
    ];
    const result = validateAreas(tree);
    expect(result.ok).toBe(true);
  });

  it('rejects stages metric with stageBounds wrong length', () => {
    const bad = [
      {
        id: 'a',
        name: 'A',
        color: '#333',
        parentId: null,
        children: [],
        metric: { type: 'stages', currentIndex: 0, stages: ['A1', 'A2'], stageBounds: [0, 1000] },
      },
    ];
    const result = validateAreas(bad);
    expect(result.ok).toBe(false);
  });

  it('rejects statName when not a string', () => {
    const bad = [
      { id: 'a', name: 'A', color: '#333', parentId: null, children: [], statName: 123 },
    ];
    const result = validateAreas(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.includes('statName'))).toBe(true);
  });

  it('accepts valid levels metric', () => {
    const root = [
      {
        id: 'p',
        name: 'P',
        color: '#333',
        parentId: null,
        children: [
          { id: 'c', name: 'C', color: '#333', parentId: 'p', children: [] },
        ],
        metric: {
          type: 'levels',
          levels: ['A1', 'A2', 'B1'],
          parameters: [{ childId: 'c', bounds: [0, 1000, 2000, 4000] }],
        },
      },
    ];
    const result = validateAreas(root);
    expect(result.ok).toBe(true);
  });

  it('rejects levels metric with wrong bounds length', () => {
    const bad = [
      {
        id: 'p',
        name: 'P',
        color: '#333',
        parentId: null,
        children: [],
        metric: { type: 'levels', levels: ['A1', 'A2'], parameters: [{ childId: 'x', bounds: [0, 1] }] },
      },
    ];
    const result = validateAreas(bad);
    expect(result.ok).toBe(false);
  });
});
