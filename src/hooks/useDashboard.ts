import { useState, useCallback, useEffect } from 'react';
import type { Area, DashboardState, DomainMetric } from '../types';
import { getDefaultAreas } from '../config/loadConfig';
import { getResetAreas } from '../data/initialData';
import { v4 as uuidv4 } from 'uuid';
import { calculateDomainProgress as calculateDomainProgressModel } from '../model/derivedMetrics';
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
      pinnedAreaIds: [],
    }))
  );

  useEffect(() => {
    persistDashboardState(state);
  }, [state]);

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

  const updateArea = useCallback((areaId: string, updates: Partial<Pick<Area, 'name' | 'color' | 'icon' | 'description' | 'aggregation'>>) => {
    setState(prev => ({
      ...prev,
      areas: updateAreasRecursively(prev.areas, areaId, area => ({
        ...area,
        ...updates,
      })),
    }));
  }, []);

  const updateDomainMetric = useCallback((domainId: string, metric: DomainMetric | null) => {
    setState(prev => ({
      ...prev,
      areas: updateAreasRecursively(prev.areas, domainId, area => ({
        ...area,
        metric: metric ?? undefined,
      })),
    }));
  }, []);

  const deleteArea = useCallback((areaId: string) => {
    const removeArea = (areas: Area[]): Area[] => {
      return areas
        .filter(a => a.id !== areaId)
        .map(a => ({ ...a, children: removeArea(a.children) }));
    };
    setState(prev => {
      const isCurrentOrDescendant = prev.currentAreaId === areaId || prev.breadcrumbs.includes(areaId);
      return {
        ...prev,
        areas: removeArea(prev.areas),
        currentAreaId: isCurrentOrDescendant ? null : prev.currentAreaId,
        breadcrumbs: isCurrentOrDescendant ? [] : prev.breadcrumbs,
      };
    });
  }, []);

  const subtreeIds = useCallback((area: Area): Set<string> => {
    const ids = new Set<string>([area.id]);
    area.children.forEach(c => subtreeIds(c).forEach(id => ids.add(id)));
    return ids;
  }, []);

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

  const resetData = useCallback(() => {
    setState({
      areas: getResetAreas(),
      currentAreaId: null,
      breadcrumbs: [],
      pinnedAreaIds: [],
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
    findArea,
    resetData,
    togglePin,
  };
};
