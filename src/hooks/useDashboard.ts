import { useState, useCallback, useEffect } from 'react';
import { Area, Tracker, DashboardState } from '../types';
import { createInitialData } from '../data/initialData';
import { v4 as uuidv4 } from 'uuid';
import { calculateAreaProgress as calculateAreaProgressModel } from '../model/derivedMetrics';
import {
  loadDashboardState,
  persistDashboardState,
} from '../persistence/localStorage';

export const useDashboard = () => {
  const [state, setState] = useState<DashboardState>(() =>
    loadDashboardState<DashboardState>(() => ({
      areas: createInitialData(),
      currentAreaId: null,
      breadcrumbs: [],
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

  // Calculate progress for an area (including children) based on aggregation mode
  const calculateAreaProgress = useCallback((area: Area): number => {
    return calculateAreaProgressModel(area);
  }, []);

  // Reset to initial data
  const resetData = useCallback(() => {
    setState({
      areas: createInitialData(),
      currentAreaId: null,
      breadcrumbs: [],
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
    addTracker,
    updateTracker,
    deleteTracker,
    calculateAreaProgress,
    findArea,
    resetData,
  };
};
