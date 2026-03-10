import { useState, useEffect } from 'react';
import { Tracker } from '../types';
import { getTrackerProgress } from '../model/derivedMetrics';

export interface StatEditorProps {
  tracker: Tracker;
  onUpdate: (updates: Partial<Tracker>) => void;
  color?: string;
  /** When true, show value/target edit form. */
  isEditing?: boolean;
  /** Called when user finishes editing (save or cancel). */
  onEditChange?: (editing: boolean) => void;
}

const INPUT_CLASS =
  'bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500';

export const StatEditor = ({
  tracker,
  onUpdate,
  color = '#3b82f6',
  isEditing: controlledEditing = false,
  onEditChange,
}: StatEditorProps) => {
  const [internalEditing, setInternalEditing] = useState(false);
  const isEditing = onEditChange ? controlledEditing : internalEditing;
  const setEditing = onEditChange ?? setInternalEditing;

  const [editValue, setEditValue] = useState(tracker.value.toString());
  const [editTarget, setEditTarget] = useState(
    tracker.target != null ? tracker.target.toString() : ''
  );

  useEffect(() => {
    setEditValue(tracker.value.toString());
    setEditTarget(tracker.target != null ? tracker.target.toString() : '');
  }, [tracker.value, tracker.target, isEditing]);

  const progress = getTrackerProgress(tracker);

  const formatValue = () => {
    if (tracker.type === 'boolean') return tracker.value ? 'Yes' : 'No';
    if (tracker.type === 'percentage') return `${tracker.value}%`;
    if (tracker.type === 'level') {
      const prefix = tracker.unit || 'Lv.';
      return `${prefix}${tracker.value}${tracker.max ? `/${tracker.max}` : ''}`;
    }
    return `${tracker.value.toLocaleString()}${tracker.unit ? ` ${tracker.unit}` : ''}`;
  };

  const supportsTarget =
    tracker.type !== 'boolean' &&
    tracker.type !== 'percentage';

  const handleSave = () => {
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue)) onUpdate({ value: numValue });
    if (supportsTarget) {
      const trimmed = editTarget.trim();
      if (trimmed === '') {
        onUpdate({ target: undefined });
      } else {
        const numTarget = parseFloat(trimmed);
        if (!isNaN(numTarget) && numTarget >= 0) onUpdate({ target: numTarget });
      }
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setEditValue(tracker.value.toString());
    setEditTarget(tracker.target != null ? tracker.target.toString() : '');
    setEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        {tracker.type === 'boolean' ? (
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => {
                onUpdate({ value: tracker.value ? 0 : 1 });
                setEditing(false);
              }}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                tracker.value
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
            >
              {tracker.value ? 'Yes → No' : 'No → Yes'}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 items-center">
            <label className="text-slate-400 text-sm shrink-0">Value</label>
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className={`${INPUT_CLASS} w-24`}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            {supportsTarget && (
              <>
                <label className="text-slate-400 text-sm shrink-0">Target</label>
                <input
                  type="number"
                  min={0}
                  value={editTarget}
                  onChange={(e) => setEditTarget(e.target.value)}
                  placeholder="Optional"
                  className={`${INPUT_CLASS} w-24`}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
                {tracker.unit && (
                  <span className="text-slate-500 text-sm">{tracker.unit}</span>
                )}
              </>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-sm transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="text-slate-500 hover:text-slate-300 text-sm"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-bold" style={{ color }}>
          {formatValue()}
        </span>
        {tracker.target != null &&
          supportsTarget && (
            <span className="text-slate-500 text-sm">
              / {tracker.target.toLocaleString()}
              {tracker.unit ? ` ${tracker.unit}` : ''}
            </span>
          )}
      </div>
      {(tracker.target != null ||
        tracker.max != null ||
        tracker.type === 'percentage' ||
        tracker.type === 'boolean') && (
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              backgroundColor: color,
              opacity: 0.8,
            }}
          />
        </div>
      )}
    </div>
  );
};
