import { useState, useCallback, useEffect, useRef } from 'react';
import type { Area, DashboardState, DomainMetric } from '../types';
import { XP_PER_BINARY_COMPLETE } from '../model/gamification';
import { getDefaultAreas } from '../config/loadConfig';
import { getResetAreas } from '../data/initialData';
import { v4 as uuidv4 } from 'uuid';
import {
  calculateDomainProgress as calculateDomainProgressModel,
  getProgressToNextLevel as getProgressToNextLevelModel,
} from '../model/derivedMetrics';
import {
  loadDashboardState,
  persistDashboardState,
} from '../persistence/localStorage';
import { loadRemoteState, saveRemoteState } from '../persistence/supabaseStorage';
import { useAuth } from '../auth/AuthContext';

const createDefault = (): DashboardState => ({
  areas: getDefaultAreas(),
  currentAreaId: null,
  breadcrumbs: [],
  pinnedAreaIds: [],
  gamification: { totalXp: 0, completionLog: [] },
});

export const useDashboard = () => {
  const { user } = useAuth();
  const [state, setState] = useState<DashboardState>(() =>
    loadDashboardState<DashboardState>(createDefault)
  );
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When user changes: load from remote or local
  useEffect(() => {
    let cancelled = false;
    if (user) {
      loadRemoteState(user.id).then((remote) => {
        if (!cancelled && remote) setState(remote);
      });
    } else {
      setState(loadDashboardState<DashboardState>(createDefault));
    }
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Persist: local when no user, remote (debounced) when user
  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      persistDashboardState(state);
      return;
    }
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      saveRemoteState(userId, state).catch((err) => {
        console.error('Failed to sync dashboard state to account', err);
      });
    }, 500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [state, user?.id]);

  const findArea = useCallback((areas: Area[], id: string): Area | null => {
    for (const area of areas) {
      if (area.id === id) return area;
      const found = findArea(area.children, id);
      if (found) return found;
    }
    return null;
  }, []);

  const currentArea = state.currentAreaId
    ? findArea(state.areas, state.currentAreaId)
    : null;

  const displayAreas = currentArea ? currentArea.children : state.areas;

  const navigateToArea = useCallback((areaId: string | null) => {
    setState(prev => {
      if (areaId === null) {
        return { ...prev, currentAreaId: null, breadcrumbs: [] };
      }
      const buildBreadcrumbs = (areas: Area[], targetId: string, path: string[] = []): string[] => {
        for (const area of areas) {
          if (area.id === targetId) return [...path, area.id];
          const found = buildBreadcrumbs(area.children, targetId, [...path, area.id]);
          if (found.length > 0) return found;
        }
        return [];
      };
      const breadcrumbs = buildBreadcrumbs(prev.areas, areaId);
      return { ...prev, currentAreaId: areaId, breadcrumbs };
    });
  }, []);

  const navigateUp = useCallback(() => {
    setState(prev => {
      if (prev.breadcrumbs.length <= 1) {
        return { ...prev, currentAreaId: null, breadcrumbs: [] };
      }
      const newBreadcrumbs = prev.breadcrumbs.slice(0, -1);
      return {
        ...prev,
        currentAreaId: newBreadcrumbs[newBreadcrumbs.length - 1],
        breadcrumbs: newBreadcrumbs,
      };
    });
  }, []);

  const getBreadcrumbAreas = useCallback((): Area[] => {
    return state.breadcrumbs
      .map(id => findArea(state.areas, id))
      .filter((a): a is Area => a !== null);
  }, [state.breadcrumbs, state.areas, findArea]);

  const updateAreasRecursively = (
    areas: Area[],
    targetId: string,
    updater: (area: Area) => Area
  ): Area[] => {
    return areas.map(area => {
      if (area.id === targetId) return updater(area);
      return {
        ...area,
        children: updateAreasRecursively(area.children, targetId, updater),
      };
    });
  };

  const addArea = useCallback(
    (
      parentId: string | null,
      name: string,
      color: string,
      initial?: { icon?: string; metric?: DomainMetric }
    ) => {
      const newArea: Area = {
        id: uuidv4(),
        name,
        color,
        parentId,
        children: [],
        ...(initial?.icon !== undefined && { icon: initial.icon }),
        ...(initial?.metric !== undefined && { metric: initial.metric }),
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
    },
    []
  );

  const updateArea = useCallback((areaId: string, updates: Partial<Pick<Area, 'name' | 'color' | 'icon' | 'description' | 'aggregation' | 'statName'>>) => {
    setState(prev => ({
      ...prev,
      areas: updateAreasRecursively(prev.areas, areaId, area => ({
        ...area,
        ...updates,
      })),
    }));
  }, []);

  const updateDomainMetric = useCallback((domainId: string, metric: DomainMetric | null) => {
    setState(prev => {
      const nextAreas = updateAreasRecursively(prev.areas, domainId, area => ({
        ...area,
        metric: metric ?? undefined,
      }));
      const gamification = prev.gamification ?? { totalXp: 0, completionLog: [] };
      if (
        metric &&
        metric.type === 'binary' &&
        metric.value === 1 &&
        !gamification.completionLog.some((e) => e.domainId === domainId)
      ) {
        return {
          ...prev,
          areas: nextAreas,
          gamification: {
            totalXp: gamification.totalXp + XP_PER_BINARY_COMPLETE,
            completionLog: [
              ...gamification.completionLog,
              { domainId, completedAt: new Date().toISOString() },
            ],
          },
        };
      }
      return { ...prev, areas: nextAreas };
    });
  }, []);

  const subtreeIds = useCallback((area: Area): Set<string> => {
    const ids = new Set<string>([area.id]);
    area.children.forEach(c => subtreeIds(c).forEach(id => ids.add(id)));
    return ids;
  }, []);

  const deleteArea = useCallback((areaId: string) => {
    const removeArea = (areas: Area[]): Area[] => {
      return areas
        .filter(a => a.id !== areaId)
        .map(a => ({ ...a, children: removeArea(a.children) }));
    };
    setState(prev => {
      const area = findArea(prev.areas, areaId);
      const idsToRemove = area ? subtreeIds(area) : new Set<string>([areaId]);
      const isCurrentOrDescendant = prev.currentAreaId === areaId || prev.breadcrumbs.includes(areaId);
      return {
        ...prev,
        areas: removeArea(prev.areas),
        currentAreaId: isCurrentOrDescendant ? null : prev.currentAreaId,
        breadcrumbs: isCurrentOrDescendant ? [] : prev.breadcrumbs,
        pinnedAreaIds: prev.pinnedAreaIds.filter(id => !idsToRemove.has(id)),
      };
    });
  }, [findArea, subtreeIds]);

  const moveArea = useCallback((areaId: string, newParentId: string | null, index?: number) => {
    setState(prev => {
      const area = findArea(prev.areas, areaId);
      if (!area) return prev;
      const cannotDrop = subtreeIds(area);
      if (newParentId && cannotDrop.has(newParentId)) return prev;

      const removeFromTree = (areas: Area[]): Area[] =>
        areas.flatMap(a =>
          a.id === areaId ? [] : [{ ...a, children: removeFromTree(a.children) }]
        );

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

      const without = removeFromTree(prev.areas);
      const atIndex = typeof index === 'number' ? index : -1;
      return { ...prev, areas: insertIntoTree(without, newParentId, atIndex) };
    });
  }, [findArea, subtreeIds]);

  const calculateDomainProgress = useCallback((area: Area): number => {
    return calculateDomainProgressModel(area);
  }, []);

  const getProgressToNextLevel = useCallback((area: Area) => {
    return getProgressToNextLevelModel(area);
  }, []);

  const resetData = useCallback(() => {
    setState({
      areas: getResetAreas(),
      currentAreaId: null,
      breadcrumbs: [],
      pinnedAreaIds: [],
      gamification: { totalXp: 0, completionLog: [] },
    });
  }, []);

  const replaceState = useCallback((newState: DashboardState) => {
    const ids = new Set<string>();
    const collectIds = (areas: Area[]) => {
      for (const a of areas) {
        ids.add(a.id);
        collectIds(a.children);
      }
    };
    collectIds(newState.areas);
    setState({
      ...newState,
      currentAreaId:
        newState.currentAreaId != null && ids.has(newState.currentAreaId)
          ? newState.currentAreaId
          : null,
      breadcrumbs: (newState.breadcrumbs ?? []).filter((id) => ids.has(id)),
      pinnedAreaIds: (newState.pinnedAreaIds ?? []).filter((id) => ids.has(id)),
    });
  }, []);

  const togglePin = useCallback((areaId: string) => {
    setState(prev => {
      const has = prev.pinnedAreaIds.includes(areaId);
      if (has) {
        return {
          ...prev,
          pinnedAreaIds: prev.pinnedAreaIds.filter(id => id !== areaId),
        };
      }
      return {
        ...prev,
        pinnedAreaIds: [...prev.pinnedAreaIds, areaId],
      };
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
    updateDomainMetric,
    deleteArea,
    moveArea,
    calculateDomainProgress,
    getProgressToNextLevel,
    findArea,
    resetData,
    replaceState,
    togglePin,
  };
};
