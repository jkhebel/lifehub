import { Area } from '../types';
import { validateAreas } from '../model/validation';
import { createInitialData } from '../data/initialData';
import defaultConfigJson from '../data/defaultConfig.json';

/**
 * Parse raw config (e.g. from localStorage or import). Returns validated Area[]
 * or falls back to createInitialData() on invalid input.
 */
export function parseConfig(raw: unknown): Area[] {
  const result = validateAreas(raw);
  if (result.ok) return result.data;
  return createInitialData();
}

/**
 * Load the bundled default JSON config, validate it, and return Area[].
 * Falls back to createInitialData() if the bundled default is invalid.
 */
export function getDefaultAreas(): Area[] {
  return parseConfig(defaultConfigJson);
}
