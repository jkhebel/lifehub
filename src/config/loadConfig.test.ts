import { describe, it, expect } from 'vitest';
import { parseConfig, getDefaultAreas } from './loadConfig';
import { validateAreas } from '../model/validation';

const validTree = [
  {
    id: 'health',
    name: 'Health',
    color: '#22c55e',
    parentId: null,
    trackers: [
      { id: 'workouts', name: 'Workouts', type: 'number', value: 3, target: 5 },
    ],
    children: [],
  },
];

describe('parseConfig', () => {
  it('returns validated Area[] for valid JSON', () => {
    const areas = parseConfig(validTree);
    expect(Array.isArray(areas)).toBe(true);
    expect(areas).toHaveLength(1);
    expect(areas[0].id).toBe('health');
    expect(areas[0].trackers[0].type).toBe('number');
  });

  it('returns safe default for invalid JSON (no throw)', () => {
    const areas = parseConfig({ not: 'an array' });
    expect(Array.isArray(areas)).toBe(true);
    expect(areas.length).toBeGreaterThan(0);
    const validation = validateAreas(areas);
    expect(validation.ok).toBe(true);
  });

  it('returns safe default for malformed area tree', () => {
    const areas = parseConfig([{ id: 'x', name: 'X', trackers: 'not-array', children: [] }]);
    expect(Array.isArray(areas)).toBe(true);
    expect(areas.length).toBeGreaterThan(0);
    const validation = validateAreas(areas);
    expect(validation.ok).toBe(true);
  });
});

describe('getDefaultAreas', () => {
  it('returns array that passes validateAreas', () => {
    const areas = getDefaultAreas();
    expect(Array.isArray(areas)).toBe(true);
    expect(areas.length).toBeGreaterThan(0);
    const result = validateAreas(areas);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toBe(areas);
    }
  });

  it('returns bundled default shape (e.g. health and growth)', () => {
    const areas = getDefaultAreas();
    const ids = areas.map((a) => a.id);
    expect(ids).toContain('health');
    expect(ids).toContain('growth');
  });
});
