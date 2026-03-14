import type { Area } from '../types';
import { validateAreas } from '../model/validation';
import { getResetAreas } from '../data/initialData';

/**
 * Parse raw config (e.g. from localStorage or import). Returns validated Area[]
 * or falls back to default six OG domains on invalid input or old shape.
 */
export function parseConfig(raw: unknown): Area[] {
  const result = validateAreas(raw);
  if (result.ok) return result.data;
  return getResetAreas();
}

/**
 * Default tree: six OG top-level domains (new shape, no metrics).
 */
export function getDefaultAreas(): Area[] {
  return getResetAreas();
}
