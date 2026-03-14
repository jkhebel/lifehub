import { describe, it, expect } from 'vitest';
import {
  getGlobalLevel,
  getPerDomainLevels,
  getBadges,
  progressToLevel,
} from './gamification';
import type { Area } from '../types';

const stubArea = (id: string, name: string): Area => ({
  id,
  name,
  color: '#333',
  parentId: null,
  children: [],
});

describe('progressToLevel', () => {
  it('maps 0–25 to 1', () => {
    expect(progressToLevel(0)).toBe(1);
    expect(progressToLevel(25)).toBe(2);
  });
  it('maps 25–50 to 2', () => {
    expect(progressToLevel(26)).toBe(2);
    expect(progressToLevel(50)).toBe(3);
  });
  it('maps 50–75 to 3', () => {
    expect(progressToLevel(51)).toBe(3);
    expect(progressToLevel(75)).toBe(4);
  });
  it('maps 75–100 to 4', () => {
    expect(progressToLevel(76)).toBe(4);
    expect(progressToLevel(100)).toBe(4);
  });
});

describe('getGlobalLevel', () => {
  it('returns 0 when no areas', () => {
    const getAreaProgress = () => 50;
    expect(getGlobalLevel([], getAreaProgress)).toBe(0);
  });

  it('returns level 1 when all areas 0%', () => {
    const areas = [stubArea('a', 'A'), stubArea('b', 'B')];
    const getAreaProgress = () => 0;
    expect(getGlobalLevel(areas, getAreaProgress)).toBe(1);
  });

  it('returns level 3 when average 50%', () => {
    const areas = [stubArea('a', 'A'), stubArea('b', 'B')];
    const getAreaProgress = (a: Area) => (a.id === 'a' ? 0 : 100);
    expect(getGlobalLevel(areas, getAreaProgress)).toBe(3);
  });

  it('returns level 4 when average 100%', () => {
    const areas = [stubArea('a', 'A')];
    const getAreaProgress = () => 100;
    expect(getGlobalLevel(areas, getAreaProgress)).toBe(4);
  });
});

describe('getPerDomainLevels', () => {
  it('returns correct level per area', () => {
    const areas = [
      stubArea('health', 'Health'),
      stubArea('work', 'Work'),
    ];
    const getAreaProgress = (a: Area) =>
      a.id === 'health' ? 10 : 60;
    const result = getPerDomainLevels(areas, getAreaProgress);
    expect(result).toHaveLength(2);
    expect(result.find((r) => r.areaId === 'health')).toEqual({
      areaId: 'health',
      areaName: 'Health',
      level: 1,
    });
    expect(result.find((r) => r.areaId === 'work')).toEqual({
      areaId: 'work',
      areaName: 'Work',
      level: 3,
    });
  });
});

describe('getBadges', () => {
  it('returns no badges when overall 0%', () => {
    const areas = [stubArea('a', 'A')];
    const getAreaProgress = () => 0;
    expect(getBadges(areas, getAreaProgress)).toEqual([]);
  });

  it('returns no badges when no areas', () => {
    expect(getBadges([], () => 50)).toEqual([]);
  });

  it('returns Getting started and Halfway there when overall 50%', () => {
    const areas = [stubArea('a', 'A')];
    const getAreaProgress = () => 50;
    const badges = getBadges(areas, getAreaProgress);
    expect(badges.map((b) => b.id)).toContain('getting-started');
    expect(badges.map((b) => b.id)).toContain('halfway');
    expect(badges).toHaveLength(2);
  });

  it('returns all badges when overall 100%', () => {
    const areas = [stubArea('a', 'A')];
    const getAreaProgress = () => 100;
    const badges = getBadges(areas, getAreaProgress);
    expect(badges.map((b) => b.id)).toEqual([
      'getting-started',
      'halfway',
      'on-track',
      'fully-balanced',
    ]);
    expect(badges.map((b) => b.label)).toContain('Fully balanced');
  });
});
