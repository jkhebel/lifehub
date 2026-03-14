import type { Area } from '../types';

/** Stable ids for the six OG top-level domains (used by reset). */
const RESET_AREA_IDS = {
  health: 'health',
  career: 'career',
  finances: 'finances',
  relationships: 'relationships',
  growth: 'growth',
  recreation: 'recreation',
} as const;

/**
 * Minimal dataset for "Reset to defaults" and initial load: six OG top-level domains,
 * new shape (no trackers/achievements), no metric, no subdomains.
 */
export function getResetAreas(): Area[] {
  return [
    {
      id: RESET_AREA_IDS.health,
      name: 'Health',
      color: '#22c55e',
      icon: '💚',
      description: 'Physical and mental wellness',
      parentId: null,
      children: [],
      aggregation: 'average',
      statName: 'HP',
    },
    {
      id: RESET_AREA_IDS.career,
      name: 'Career',
      color: '#3b82f6',
      icon: '💼',
      description: 'Professional growth and work life',
      parentId: null,
      children: [],
      aggregation: 'average',
      statName: 'Renown',
    },
    {
      id: RESET_AREA_IDS.finances,
      name: 'Finances',
      color: '#f59e0b',
      icon: '💰',
      description: 'Financial health and money management',
      parentId: null,
      children: [],
      aggregation: 'average',
      statName: 'Fortune',
    },
    {
      id: RESET_AREA_IDS.relationships,
      name: 'Relationships',
      color: '#ec4899',
      icon: '❤️',
      description: 'Connections with people who matter',
      parentId: null,
      children: [],
      aggregation: 'average',
      statName: 'Charm',
    },
    {
      id: RESET_AREA_IDS.growth,
      name: 'Growth',
      color: '#8b5cf6',
      icon: '🌱',
      description: 'Personal development and self-improvement',
      parentId: null,
      children: [],
      aggregation: 'average',
      statName: 'Wisdom',
    },
    {
      id: RESET_AREA_IDS.recreation,
      name: 'Recreation',
      color: '#06b6d4',
      icon: '🎮',
      description: 'Fun, hobbies, and leisure activities',
      parentId: null,
      children: [],
      aggregation: 'average',
      statName: 'Spirit',
    },
  ];
}
