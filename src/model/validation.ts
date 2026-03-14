import { Area, Tracker, TrackerType, AchievementKind } from '../types';

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: string[] };

const TRACKER_TYPES: TrackerType[] = [
  'number',
  'percentage',
  'level',
  'boolean',
  'progress',
];

const ACHIEVEMENT_KINDS: AchievementKind[] = ['milestone', 'task', 'project'];

export const validateAreas = (raw: unknown): ValidationResult<Area[]> => {
  const errors: string[] = [];

  if (!Array.isArray(raw)) {
    return {
      ok: false,
      errors: ['Root value must be an array of areas'],
    };
  }

  const validateTracker = (tracker: any, path: string): Tracker | null => {
    if (typeof tracker !== 'object' || tracker === null) {
      errors.push(`${path} must be an object`);
      return null;
    }

    const { id, name, type, value } = tracker;

    if (typeof id !== 'string' || !id.trim()) {
      errors.push(`${path}.id is required and must be a non-empty string`);
    }

    if (typeof name !== 'string' || !name.trim()) {
      errors.push(`${path}.name is required and must be a non-empty string`);
    }

    if (!TRACKER_TYPES.includes(type)) {
      errors.push(
        `${path}.type must be one of ${TRACKER_TYPES.join(', ')}`
      );
    }

    if (typeof value !== 'number' || Number.isNaN(value)) {
      errors.push(`${path}.value is required and must be a number`);
    }

    // Minimal range checks for percentage type
    if (type === 'percentage' && typeof value === 'number') {
      if (value < 0 || value > 100) {
        errors.push(`${path}.value must be between 0 and 100 for percentage trackers`);
      }
    }

    return tracker as Tracker;
  };

  const validateAchievement = (achievement: any, path: string): void => {
    if (typeof achievement !== 'object' || achievement === null) {
      errors.push(`${path} must be an object`);
      return;
    }
    const { id, name, kind, areaId } = achievement;
    if (typeof id !== 'string' || !id.trim()) {
      errors.push(`${path}.id is required and must be a non-empty string`);
    }
    if (typeof name !== 'string' || !name.trim()) {
      errors.push(`${path}.name is required and must be a non-empty string`);
    }
    if (!ACHIEVEMENT_KINDS.includes(kind)) {
      errors.push(`${path}.kind must be one of ${ACHIEVEMENT_KINDS.join(', ')}`);
    }
    if (typeof areaId !== 'string' || !areaId.trim()) {
      errors.push(`${path}.areaId is required and must be a non-empty string`);
    }
    if (Array.isArray(achievement.children)) {
      achievement.children.forEach((child: any, i: number) =>
        validateAchievement(child, `${path}.children[${i}]`)
      );
    }
  };

  const validateArea = (area: any, indexPath: string): Area | null => {
    if (typeof area !== 'object' || area === null) {
      errors.push(`${indexPath} must be an object`);
      return null;
    }

    const { id, name, color, parentId, trackers, children, achievements } = area;

    if (typeof id !== 'string' || !id.trim()) {
      errors.push(`${indexPath}.id is required and must be a non-empty string`);
    }

    if (typeof name !== 'string' || !name.trim()) {
      errors.push(`${indexPath}.name is required and must be a non-empty string`);
    }

    if (typeof color !== 'string' || !color.trim()) {
      errors.push(`${indexPath}.color is required and must be a non-empty string`);
    }

    if (parentId !== null && typeof parentId !== 'string') {
      errors.push(
        `${indexPath}.parentId must be a string or null`
      );
    }

    if (!Array.isArray(trackers)) {
      errors.push(`${indexPath}.trackers must be an array`);
    }

    if (!Array.isArray(children)) {
      errors.push(`${indexPath}.children must be an array`);
    }

    if (Array.isArray(trackers)) {
      trackers.forEach((t, trackerIndex) =>
        validateTracker(t, `${indexPath}.trackers[${trackerIndex}]`)
      );
    }

    if (Array.isArray(children)) {
      children.forEach((child, childIndex) =>
        validateArea(child, `${indexPath}.children[${childIndex}]`)
      );
    }

    if (achievements !== undefined && !Array.isArray(achievements)) {
      errors.push(`${indexPath}.achievements must be an array when present`);
    } else if (Array.isArray(achievements)) {
      achievements.forEach((a: any, i: number) =>
        validateAchievement(a, `${indexPath}.achievements[${i}]`)
      );
    }

    return area as Area;
  };

  raw.forEach((area, index) => {
    validateArea(area, `areas[${index}]`);
  });

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data: raw as Area[] };
};

