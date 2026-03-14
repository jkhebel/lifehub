import { describe, it, expect } from 'vitest';
import { parseConfig, getDefaultAreas } from './loadConfig';
import { validateAreas } from '../model/validation';

const validTree = [
  {
    id: 'health',
    name: 'Health',
    color: '#22c55e',
    parentId: null,
    children: [],
  },
];

describe('parseConfig', () => {
  it('returns validated Area[] for valid JSON (new shape)', () => {
    const areas = parseConfig(validTree);
    expect(Array.isArray(areas)).toBe(true);
    expect(areas).toHaveLength(1);
    expect(areas[0].id).toBe('health');
    expect(areas[0].children).toEqual([]);
  });

  it('returns safe default for invalid JSON (no throw)', () => {
    const areas = parseConfig({ not: 'an array' });
    expect(Array.isArray(areas)).toBe(true);
    expect(areas.length).toBeGreaterThan(0);
    const validation = validateAreas(areas);
    expect(validation.ok).toBe(true);
  });

  it('returns safe default for malformed area tree', () => {
    const areas = parseConfig([{ id: 'x', name: 'X', color: '#333', parentId: null, children: 'not-array' }]);
    expect(Array.isArray(areas)).toBe(true);
    expect(areas.length).toBeGreaterThan(0);
    const validation = validateAreas(areas);
    expect(validation.ok).toBe(true);
  });

  it('returns safe default for old shape (trackers)', () => {
    const oldShape = [{ id: 'x', name: 'X', color: '#333', parentId: null, trackers: [], children: [] }];
    const areas = parseConfig(oldShape);
    expect(Array.isArray(areas)).toBe(true);
    expect(areas.length).toBeGreaterThan(0);
    const validation = validateAreas(areas);
    expect(validation.ok).toBe(true);
    expect(areas[0].id).toBe('health'); // default six OG domains
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

  it('returns six OG domains (health, growth, etc.)', () => {
    const areas = getDefaultAreas();
    const ids = areas.map((a) => a.id);
    expect(ids).toContain('health');
    expect(ids).toContain('growth');
    expect(ids).toHaveLength(6);
  });
});
