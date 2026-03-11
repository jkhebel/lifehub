import { useState, useCallback, useMemo, useEffect } from 'react';
import { Area } from '../types';

export interface DomainTreeProps {
  /** Root areas (top-level domains). */
  areas: Area[];
  /** Currently selected area id, or null for "Life" root. */
  selectedAreaId: string | null;
  /** Called when user selects an area (or null to go to root). */
  onSelect: (areaId: string | null) => void;
  /** Compute progress for an area (0–100). */
  calculateProgress: (area: Area) => number;
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
}: DomainTreeProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const flatNodes = useMemo(
    () => flattenTree(areas, expandedIds, 0),
    [areas, expandedIds]
  );

  /** Row 0 = "Life" root, rows 1..n = flatNodes. */
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
          if (node.hasChildren) toggleExpand(node.area.id);
          else onSelect(node.area.id);
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

  return (
    <div
      className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden"
      role="tree"
      aria-label="Domain tree"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="p-2 border-b border-slate-700/50">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Domains
        </span>
      </div>
      <ul className="py-1 max-h-[400px] overflow-y-auto" role="group">
        {/* Root row: "Life" */}
        <li
          role="treeitem"
          aria-selected={selectedAreaId === null}
          className={`
            flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer
            ${focusedIndex === 0 ? 'bg-slate-700/50' : ''}
            ${selectedAreaId === null ? 'ring-1 ring-inset ring-slate-500' : ''}
            hover:bg-slate-700/30
          `}
          onClick={() => {
            setFocusedIndex(0);
            onSelect(null);
          }}
        >
          <span className="w-5 shrink-0" aria-hidden />
          <span className="shrink-0 text-base" aria-hidden>
            🎯
          </span>
          <span className="min-w-0 truncate font-medium text-slate-200">
            Life
          </span>
        </li>
        {flatNodes.map((node, index) => {
          const rowIndex = index + 1;
          const isSelected = node.area.id === selectedAreaId;
          const progress = calculateProgress(node.area);
          return (
            <li
              key={node.area.id}
              role="treeitem"
              aria-expanded={node.hasChildren ? node.isExpanded : undefined}
              aria-selected={isSelected}
              style={{ paddingLeft: `${node.depth * 16 + 8}px` }}
              className={`
                flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer
                ${rowIndex === focusedIndex ? 'bg-slate-700/50' : ''}
                ${isSelected ? 'ring-1 ring-inset ring-slate-500' : ''}
                hover:bg-slate-700/30
              `}
              onClick={() => {
                setFocusedIndex(rowIndex);
                if (node.hasChildren) toggleExpand(node.area.id);
                else onSelect(node.area.id);
              }}
            >
              {node.hasChildren ? (
                <button
                  type="button"
                  className="shrink-0 p-0.5 text-slate-400 hover:text-white focus:outline-none"
                  aria-label={node.isExpanded ? 'Collapse' : 'Expand'}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(node.area.id);
                  }}
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${node.isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <span className="w-5 shrink-0" aria-hidden />
              )}
              {node.area.icon && (
                <span className="shrink-0 text-base" aria-hidden>
                  {node.area.icon}
                </span>
              )}
              <span
                className="min-w-0 truncate font-medium text-slate-200"
                style={isSelected ? { color: node.area.color } : undefined}
              >
                {node.area.name}
              </span>
              <span className="shrink-0 text-slate-500 text-sm tabular-nums">
                {Math.round(progress)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
