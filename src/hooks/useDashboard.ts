import { useState, useCallback, useEffect } from 'react';
import { Area, Tracker, DashboardState, getDefaultGamificationState, Achievement, CompletionLogEntry } from '../types';
import { getDefaultAreas } from '../config/loadConfig';
import { v4 as uuidv4 } from 'uuid';
import {
  calculateAreaProgress as calculateAreaProgressModel,
  calculateMilestoneProgress as calculateMilestoneProgressModel,
} from '../model/derivedMetrics';
import {
  getAllEarnedBadgeIds,
  getEarnedTitleIds,
  getEarnedAvatarIds,
} from '../model/gamification';
import {
  loadDashboardState,
  persistDashboardState,
} from '../persistence/localStorage';

export const useDashboard = () => {
  const [state, setState] = useState<DashboardState>(() =>
    loadDashboardState<DashboardState>(() => ({
      areas: getDefaultAreas(),
      currentAreaId: null,
      breadcrumbs: [],
      gamification: getDefaultGamificationState(),
    }))
  );

  // Persist to localStorage
  useEffect(() => {
    persistDashboardState(state);
  }, [state]);

  // Find area by ID recursively
  const findArea = useCallback((areas: Area[], id: string): Area | null => {
    for (const area of areas) {
      if (area.id === id) return area;
      const found = findArea(area.children, id);
      if (found) return found;
    }
    return null;
  }, []);

  // Get current area
  const currentArea = state.currentAreaId
    ? findArea(state.areas, state.currentAreaId)
    : null;

  // Get areas to display (root or children of current)
  const displayAreas = currentArea ? currentArea.children : state.areas;

  // Navigate to an area
  const navigateToArea = useCallback((areaId: string | null) => {
    setState(prev => {
      if (areaId === null) {
        return { ...prev, currentAreaId: null, breadcrumbs: [] };
      }

      // Build breadcrumbs
      const buildBreadcrumbs = (areas: Area[], targetId: string, path: string[] = []): string[] => {
        for (const area of areas) {
          if (area.id === targetId) {
            return [...path, area.id];
          }
          const found = buildBreadcrumbs(area.children, targetId, [...path, area.id]);
          if (found.length > 0) return found;
        }
        return [];
      };

      const breadcrumbs = buildBreadcrumbs(prev.areas, areaId);
      return { ...prev, currentAreaId: areaId, breadcrumbs };
    });
  }, []);

  // Navigate up one level
  const navigateUp = useCallback(() => {
    setState(prev => {
      if (prev.breadcrumbs.length <= 1) {
        return { ...prev, currentAreaId: null, breadcrumbs: [] };
      }
      const newBreadcrumbs = prev.breadcrumbs.slice(0, -1);
      return {
        ...prev,
        currentAreaId: newBreadcrumbs[newBreadcrumbs.length - 1],
        breadcrumbs: newBreadcrumbs
      };
    });
  }, []);

  // Get breadcrumb areas
  const getBreadcrumbAreas = useCallback((): Area[] => {
    return state.breadcrumbs
      .map(id => findArea(state.areas, id))
      .filter((a): a is Area => a !== null);
  }, [state.breadcrumbs, state.areas, findArea]);

  // Update areas recursively
  const updateAreasRecursively = (
    areas: Area[],
    targetId: string,
    updater: (area: Area) => Area
  ): Area[] => {
    return areas.map(area => {
      if (area.id === targetId) {
        return updater(area);
      }
      return {
        ...area,
        children: updateAreasRecursively(area.children, targetId, updater),
      };
    });
  };

  // Add a new area
  const addArea = useCallback((parentId: string | null, name: string, color: string) => {
    const newArea: Area = {
      id: uuidv4(),
      name,
      color,
      parentId,
      trackers: [],
      children: [],
    };

    setState(prev => {
      if (parentId === null) {
        return { ...prev, areas: [...prev.areas, newArea] };
      }
      return {
        ...prev,
        areas: updateAreasRecursively(prev.areas, parentId, area => ({
          ...area,
          children: [...area.children, newArea],
        })),
      };
    });
  }, []);

  // Update an area
  const updateArea = useCallback((areaId: string, updates: Partial<Area>) => {
    setState(prev => ({
      ...prev,
      areas: updateAreasRecursively(prev.areas, areaId, area => ({
        ...area,
        ...updates,
      })),
    }));
  }, []);

  // Delete an area
  const deleteArea = useCallback((areaId: string) => {
    const removeArea = (areas: Area[]): Area[] => {
      return areas
        .filter(a => a.id !== areaId)
        .map(a => ({ ...a, children: removeArea(a.children) }));
    };

    setState(prev => ({
      ...prev,
      areas: removeArea(prev.areas),
      currentAreaId: prev.currentAreaId === areaId ? null : prev.currentAreaId,
    }));
  }, []);

  // Collect id and all descendant ids of an area (so we cannot move a node into itself or its subtree)
  const subtreeIds = useCallback((area: Area): Set<string> => {
    const ids = new Set<string>([area.id]);
    area.children.forEach(c => subtreeIds(c).forEach(id => ids.add(id)));
    return ids;
  }, []);

  // Move an area to a new parent (or root). Optional index = position among siblings.
  const moveArea = useCallback((areaId: string, newParentId: string | null, index?: number) => {
    setState(prev => {
      const area = findArea(prev.areas, areaId);
      if (!area) return prev;
      const cannotDrop = subtreeIds(area);
      if (newParentId && cannotDrop.has(newParentId)) return prev;

      const removeFromTree = (areas: Area[]): { areas: Area[] } =>
        ({ areas: areas.flatMap(a => (a.id === areaId ? [] : [{ ...a, children: removeFromTree(a.children).areas }])) });

      const insertIntoTree = (areas: Area[], parentId: string | null, atIndex: number): Area[] => {
        const updated = { ...area, parentId };
        if (parentId === null) {
          const next = [...areas];
          next.splice(atIndex >= 0 ? Math.min(atIndex, next.length) : next.length, 0, updated);
          return next;
        }
        return areas.map(a =>
          a.id === parentId
            ? {
                ...a,
                children: (() => {
                  const next = [...a.children];
                  const pos = atIndex >= 0 ? Math.min(atIndex, next.length) : next.length;
                  next.splice(pos, 0, updated);
                  return next;
                })(),
              }
            : { ...a, children: insertIntoTree(a.children, parentId, atIndex) }
        );
      };

      const { areas: without } = removeFromTree(prev.areas);
      const atIndex = typeof index === 'number' ? index : -1;
      const withMoved = insertIntoTree(without, newParentId, atIndex);
      return { ...prev, areas: withMoved };
    });
  }, [findArea, subtreeIds]);

  // Add a tracker to an area
  const addTracker = useCallback((areaId: string, tracker: Omit<Tracker, 'id'>) => {
    setState(prev => ({
      ...prev,
      areas: updateAreasRecursively(prev.areas, areaId, area => ({
        ...area,
        trackers: [...area.trackers, { ...tracker, id: uuidv4() }],
      })),
    }));
  }, []);

  // Update a tracker
  const updateTracker = useCallback((areaId: string, trackerId: string, updates: Partial<Tracker>) => {
    setState(prev => ({
      ...prev,
      areas: updateAreasRecursively(prev.areas, areaId, area => ({
        ...area,
        trackers: area.trackers.map(t =>
          t.id === trackerId ? { ...t, ...updates } : t
        ),
      })),
    }));
  }, []);

  // Delete a tracker
  const deleteTracker = useCallback((areaId: string, trackerId: string) => {
    setState(prev => ({
      ...prev,
      areas: updateAreasRecursively(prev.areas, areaId, area => ({
        ...area,
        trackers: area.trackers.filter(t => t.id !== trackerId),
      })),
    }));
  }, []);

  // Add an achievement to an area
  const addAchievement = useCallback((areaId: string, achievement: Omit<Achievement, 'id'>) => {
    const newAchievement: Achievement = {
      ...achievement,
      id: uuidv4(),
    };
    setState(prev => ({
      ...prev,
      areas: updateAreasRecursively(prev.areas, areaId, area => ({
        ...area,
        achievements: [...(area.achievements ?? []), newAchievement],
      })),
    }));
  }, []);

  // Record completion (claim milestone or check off task): append to log, grant XP, and merge earned badges/titles/avatars
  const completeAchievement = useCallback((
    achievementId: string,
    areaId: string,
    xpReward: number = 0
  ) => {
    const now = new Date().toISOString();
    setState(prev => {
      const nextLog: CompletionLogEntry[] = [
        ...prev.gamification.completionLog,
        { achievementId, completedAt: now },
      ];
      const currentDomainXp = prev.gamification.domainXp[areaId] ?? 0;
      const nextDomainXp = {
        ...prev.gamification.domainXp,
        [areaId]: currentDomainXp + xpReward,
      };
      const earnedBadges = getAllEarnedBadgeIds(prev.areas, calculateAreaProgressModel, nextLog);
      const earnedTitles = getEarnedTitleIds(prev.areas, nextLog);
      const earnedAvatars = getEarnedAvatarIds(prev.areas, nextLog);
      const mergedBadges = [...new Set([...prev.gamification.unlockedBadges, ...earnedBadges])];
      const mergedTitles = [...new Set([...prev.gamification.unlockedTitles, ...earnedTitles])];
      const mergedAvatars = [...new Set([...prev.gamification.avatarUnlocks, ...earnedAvatars])];
      return {
        ...prev,
        gamification: {
          ...prev.gamification,
          completionLog: nextLog,
          domainXp: nextDomainXp,
          unlockedBadges: mergedBadges,
          unlockedTitles: mergedTitles,
          avatarUnlocks: mergedAvatars,
        },
      };
    });
  }, []);

  /** Number of times an achievement appears in the completion log. */
  const getCompletionCount = useCallback((achievementId: string): number => {
    return state.gamification.completionLog.filter(
      (e) => e.achievementId === achievementId
    ).length;
  }, [state.gamification.completionLog]);

  /** Whether a milestone has been claimed (at least one completion). */
  const isAchievementCompleted = useCallback((achievementId: string): boolean => {
    return state.gamification.completionLog.some((e) => e.achievementId === achievementId);
  }, [state.gamification.completionLog]);

  const setSelectedAvatar = useCallback((avatarId: string) => {
    setState(prev => ({
      ...prev,
      gamification: { ...prev.gamification, selectedAvatar: avatarId },
    }));
  }, []);

  const setSelectedTitle = useCallback((titleId: string) => {
    setState(prev => ({
      ...prev,
      gamification: { ...prev.gamification, selectedTitle: titleId },
    }));
  }, []);

  // Calculate progress for an area (including children) based on aggregation mode
  const calculateAreaProgress = useCallback((area: Area): number => {
    return calculateAreaProgressModel(area);
  }, []);

  // Milestone-based progress for radar "By milestones" view
  const calculateMilestoneProgress = useCallback((area: Area): number => {
    return calculateMilestoneProgressModel(area, state.gamification.completionLog);
  }, [state.gamification.completionLog]);

  // Reset to initial data
  const resetData = useCallback(() => {
    setState({
      areas: getDefaultAreas(),
      currentAreaId: null,
      breadcrumbs: [],
      gamification: getDefaultGamificationState(),
    });
  }, []);

  return {
    state,
    currentArea,
    displayAreas,
    navigateToArea,
    navigateUp,
    getBreadcrumbAreas,
    addArea,
    updateArea,
    deleteArea,
    moveArea,
    addTracker,
    updateTracker,
    deleteTracker,
    addAchievement,
    completeAchievement,
    getCompletionCount,
    isAchievementCompleted,
    setSelectedAvatar,
    setSelectedTitle,
    calculateAreaProgress,
    calculateMilestoneProgress,
    findArea,
    resetData,
  };
};
