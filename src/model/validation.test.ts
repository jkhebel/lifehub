import { describe, it, expect } from 'vitest';
import { validateAreas } from './validation';

const validTree = [
  {
    id: 'health',
    name: 'Health',
    color: '#22c55e',
    parentId: null,
    trackers: [
      {
        id: 'workouts',
        name: 'Workouts',
        type: 'number',
        value: 3,
        target: 5,
      },
    ],
    children: [],
  },
];

describe('validateAreas', () => {
  it('accepts a valid area tree', () => {
    const result = validateAreas(validTree);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('health');
      expect(result.data[0].trackers[0].type).toBe('number');
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
      {
        name: 'Health',
        color: '#22c55e',
        parentId: null,
        trackers: [],
        children: [],
      },
    ];
    const result = validateAreas(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes('id'))).toBe(true);
    }
  });

  it('rejects area with non-array children', () => {
    const bad = [
      {
        id: 'a',
        name: 'A',
        color: '#333',
        parentId: null,
        trackers: [],
        children: 'not-an-array',
      },
    ];
    const result = validateAreas(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes('children'))).toBe(true);
    }
  });

  it('rejects tracker with invalid type', () => {
    const bad = [
      {
        id: 'a',
        name: 'A',
        color: '#333',
        parentId: null,
        trackers: [
          { id: 't1', name: 'T1', type: 'invalid', value: 0 },
        ],
        children: [],
      },
    ];
    const result = validateAreas(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes('type'))).toBe(true);
    }
  });
});
