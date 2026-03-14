import type { Area } from '../types';

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: string[] };

/** Old shape: areas with trackers or achievements are invalid (clean slate). */
function hasOldShape(area: any): boolean {
  if (area.trackers !== undefined) return true;
  if (area.achievements !== undefined) return true;
  if (Array.isArray(area.children)) {
    return area.children.some((c: any) => hasOldShape(c));
  }
  return false;
}

function validateMetric(metric: any): boolean {
  if (typeof metric !== 'object' || metric === null) {
    return false;
  }
  const { type } = metric;
  if (type === 'binary') {
    if (metric.value !== 0 && metric.value !== 1) {
      return false;
    }
    return true;
  }
  if (type === 'progress') {
    if (typeof metric.current !== 'number' || Number.isNaN(metric.current)) return false;
    if (typeof metric.max !== 'number' || Number.isNaN(metric.max)) return false;
    return true;
  }
  if (type === 'stages') {
    if (typeof metric.currentIndex !== 'number' || Number.isNaN(metric.currentIndex)) return false;
    if (!Array.isArray(metric.stages) || metric.stages.length === 0) return false;
    if (metric.stageBounds !== undefined) {
      if (!Array.isArray(metric.stageBounds) || metric.stageBounds.length !== metric.stages.length + 1)
        return false;
      for (let i = 0; i < metric.stageBounds.length; i++) {
        if (typeof metric.stageBounds[i] !== 'number' || Number.isNaN(metric.stageBounds[i]))
          return false;
        if (i > 0 && metric.stageBounds[i] <= metric.stageBounds[i - 1]) return false;
      }
    }
    if (metric.currentValue !== undefined) {
      if (typeof metric.currentValue !== 'number' || Number.isNaN(metric.currentValue)) return false;
    }
    return true;
  }
  if (type === 'levels') {
    if (!Array.isArray(metric.levels) || metric.levels.length === 0) return false;
    if (!Array.isArray(metric.parameters)) return false;
    for (let p = 0; p < metric.parameters.length; p++) {
      const param = metric.parameters[p];
      if (typeof param !== 'object' || param == null || typeof param.childId !== 'string') return false;
      if (!Array.isArray(param.bounds) || param.bounds.length !== metric.levels.length + 1) return false;
      for (let i = 0; i < param.bounds.length; i++) {
        if (typeof param.bounds[i] !== 'number' || Number.isNaN(param.bounds[i])) return false;
        if (i > 0 && param.bounds[i] <= param.bounds[i - 1]) return false;
      }
    }
    return true;
  }
  return false;
}

export const validateAreas = (raw: unknown): ValidationResult<Area[]> => {
  const errors: string[] = [];

  if (!Array.isArray(raw)) {
    return {
      ok: false,
      errors: ['Root value must be an array of areas'],
    };
  }

  const validateArea = (area: any, indexPath: string): Area | null => {
    if (typeof area !== 'object' || area === null) {
      errors.push(`${indexPath} must be an object`);
      return null;
    }

    if (hasOldShape(area)) {
      errors.push(`${indexPath}: old shape (trackers/achievements) is not supported; use default tree`);
      return null;
    }

    const { id, name, color, parentId, children, metric, aggregation, statName } = area;

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
      errors.push(`${indexPath}.parentId must be a string or null`);
    }

    if (!Array.isArray(children)) {
      errors.push(`${indexPath}.children must be an array`);
    }

    if (metric !== undefined && metric !== null) {
      if (!validateMetric(metric)) {
        errors.push(`${indexPath}.metric must be a valid binary, progress, stages, or levels metric`);
      }
    }

    if (aggregation !== undefined && aggregation !== 'average' && aggregation !== 'minimum') {
      errors.push(`${indexPath}.aggregation must be 'average' or 'minimum' when present`);
    }

    if (statName !== undefined && typeof statName !== 'string') {
      errors.push(`${indexPath}.statName must be a string when present`);
    }

    if (Array.isArray(children)) {
      children.forEach((child: any, childIndex: number) =>
        validateArea(child, `${indexPath}.children[${childIndex}]`)
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
