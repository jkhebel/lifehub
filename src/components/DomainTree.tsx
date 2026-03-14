import { useState, useCallback, useMemo, useEffect } from 'react';
import { Area } from '../types';
import { progressToLevel } from '../model/gamification';

export interface DomainTreeProps {
  areas: Area[];
  selectedAreaId: string | null;
  onSelect: (areaId: string | null) => void;
  calculateProgress: (area: Area) => number;
  /** When true, show level (Lv.X) per domain. */
  showGamification?: boolean;
  /** Move area to new parent (null = root) at optional index. */
  onMoveArea?: (areaId: string, newParentId: string | null, index?: number) => void;
  /** When true, render without card border (for use inside CharacterCard). */
  nested?: boolean;
}

interface FlatNode {
  area: Area;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
}

function flattenTree(
  areas: Area[],
  expandedIds: Set<string>,
  depth: number
): FlatNode[] {
  const result: FlatNode[] = [];
  for (const area of areas) {
    const hasChildren = area.children.length > 0;
    const isExpanded = expandedIds.has(area.id);
    result.push({ area, depth, hasChildren, isExpanded });
    if (hasChildren && isExpanded) {
      result.push(...flattenTree(area.children, expandedIds, depth + 1));
    }
  }
  return result;
}

export const DomainTree = ({
  areas,
  selectedAreaId,
  onSelect,
  calculateProgress,
  showGamification = true,
  onMoveArea,
  nested = false,
}: DomainTreeProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const flatNodes = useMemo(
    () => flattenTree(areas, expandedIds, 0),
    [areas, expandedIds]
  );

  const rowCount = 1 + flatNodes.length;

  const toggleExpand = useCallback((areaId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(areaId)) next.delete(areaId);
      else next.add(areaId);
      return next;
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (rowCount === 0) return;
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const next = Math.min(focusedIndex + 1, rowCount - 1);
          setFocusedIndex(next);
          onSelect(next === 0 ? null : flatNodes[next - 1].area.id);
          return;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prev = Math.max(focusedIndex - 1, 0);
          setFocusedIndex(prev);
          onSelect(prev === 0 ? null : flatNodes[prev - 1].area.id);
          return;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          if (focusedIndex === 0) {
            onSelect(null);
            return;
          }
          const node = flatNodes[focusedIndex - 1];
          onSelect(node.area.id);
          return;
        }
        case 'ArrowRight': {
          e.preventDefault();
          if (focusedIndex === 0) return;
          const node = flatNodes[focusedIndex - 1];
          if (node.hasChildren && !node.isExpanded) toggleExpand(node.area.id);
          return;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          if (focusedIndex === 0) return;
          const node = flatNodes[focusedIndex - 1];
          if (node.hasChildren && node.isExpanded) toggleExpand(node.area.id);
          return;
        }
        default:
          break;
      }
    },
    [flatNodes, focusedIndex, onSelect, rowCount, toggleExpand]
  );

  useEffect(() => {
    if (selectedAreaId === null) {
      if (focusedIndex !== 0) setFocusedIndex(0);
      return;
    }
    const idx = flatNodes.findIndex((n) => n.area.id === selectedAreaId);
    if (idx >= 0 && focusedIndex !== idx + 1) setFocusedIndex(idx + 1);
  }, [selectedAreaId, flatNodes]);

  const handleDragStart = useCallback((e: React.DragEvent, areaId: string) => {
    setDragId(areaId);
    e.dataTransfer.setData('text/plain', areaId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetId: string | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragId && dragId !== targetId) setDropTargetId(targetId);
  }, [dragId]);

  const handleDragLeave = useCallback(() => {
    setDropTargetId(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string | null) => {
    e.preventDefault();
    const areaId = e.dataTransfer.getData('text/plain');
    if (!areaId || !onMoveArea) return;
    if (targetId === areaId) return;
    onMoveArea(areaId, targetId);
    setDragId(null);
    setDropTargetId(null);
  }, [onMoveArea]);

  const handleDragEnd = useCallback(() => {
    setDragId(null);
    setDropTargetId(null);
  }, []);

  return (
    <div
      className={
        nested
          ? 'border-t border-indigo-100 overflow-hidden pt-2 -mx-4 px-4'
          : 'rounded-[8px] border-2 border-amber-300/90 bg-white/95 overflow-hidden border-t-amber-200 border-l-amber-200 card-paper'
      }
      role="tree"
      aria-label="Domains"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className={nested ? 'px-0 py-1.5' : 'px-2 py-1.5 border-b border-amber-100 bg-amber-50/80'}>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${nested ? 'text-indigo-700/80' : 'text-amber-800/80'}`}>
            Domains
          </span>
          {!nested && (
            <span className="text-[10px] text-amber-700/60 hidden sm:inline">
              ↑↓ · Enter · Drag to move
            </span>
          )}
        </div>
      </div>
      <ul className={`py-1 overflow-y-auto ${nested ? 'max-h-[320px]' : 'max-h-[380px]'}`} role="group">
        {/* Life root */}
        <li
          role="treeitem"
          aria-selected={selectedAreaId === null}
          className={`
            flex items-center gap-2 py-1.5 px-2 rounded-[4px] cursor-pointer
            ${focusedIndex === 0 ? 'bg-amber-100/80' : ''}
            ${selectedAreaId === null ? 'ring-1 ring-inset ring-amber-400' : ''}
            hover:bg-amber-50
            ${dropTargetId === null && dragId ? 'ring-1 border-2 border-dashed border-amber-400' : ''}
          `}
          onClick={() => { setFocusedIndex(0); onSelect(null); }}
          onDragOver={(e) => handleDragOver(e, null)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, null)}
        >
          <span className="w-5 shrink-0" aria-hidden />
          <span className="shrink-0 text-base" aria-hidden>🎯</span>
          <span className="min-w-0 truncate font-medium text-slate-800">Life</span>
        </li>
        {flatNodes.map((node, index) => {
          const rowIndex = index + 1;
          const isSelected = node.area.id === selectedAreaId;
          const progress = calculateProgress(node.area);
          const level = progressToLevel(progress);
          const isDropTarget = dropTargetId === node.area.id;
          const isDragging = dragId === node.area.id;
          return (
            <li
              key={node.area.id}
              role="treeitem"
              aria-expanded={node.hasChildren ? node.isExpanded : undefined}
              aria-selected={isSelected}
              draggable={!!onMoveArea}
              onDragStart={(e) => onMoveArea && handleDragStart(e, node.area.id)}
              onDragOver={(e) => handleDragOver(e, node.area.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, node.area.id)}
              onDragEnd={handleDragEnd}
              style={{ paddingLeft: `${node.depth * 14 + 8}px` }}
              className={`
                flex items-center gap-2 py-1.5 px-2 rounded-[4px] cursor-pointer
                ${rowIndex === focusedIndex ? 'bg-amber-100/80' : ''}
                ${isSelected ? 'ring-1 ring-inset ring-amber-400' : ''}
                hover:bg-amber-50
                ${isDropTarget ? 'ring-1 border-2 border-dashed border-amber-500 bg-amber-50' : ''}
                ${isDragging ? 'opacity-50' : ''}
              `}
              onClick={() => {
                setFocusedIndex(rowIndex);
                onSelect(node.area.id);
              }}
            >
              {node.hasChildren ? (
                <button
                  type="button"
                  className="shrink-0 p-0.5 text-slate-500 hover:text-slate-800 focus:outline-none"
                  aria-label={node.isExpanded ? 'Collapse' : 'Expand'}
                  onClick={(e) => { e.stopPropagation(); toggleExpand(node.area.id); }}
                >
                  <svg className={`w-3.5 h-3.5 transition-transform ${node.isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <span className="w-[14px] shrink-0" aria-hidden />
              )}
              {node.area.icon && (
                <span className="shrink-0 text-sm" aria-hidden>{node.area.icon}</span>
              )}
              <span
                className="min-w-0 truncate font-medium text-slate-800 text-sm"
                style={isSelected ? { color: node.area.color } : undefined}
              >
                {node.area.name}
              </span>
              {showGamification && (
                <span className="shrink-0 text-[10px] text-amber-700/80 tabular-nums">Lv.{level}</span>
              )}
              <div className="ml-auto flex items-center gap-1.5 shrink-0">
                <span className="text-slate-500 text-[11px] tabular-nums">{Math.round(progress)}%</span>
                <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%`, backgroundColor: node.area.color }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
