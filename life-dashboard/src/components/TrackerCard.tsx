import { useState } from 'react';
import { Tracker } from '../types';

interface TrackerCardProps {
  tracker: Tracker;
  onUpdate: (updates: Partial<Tracker>) => void;
  onDelete: () => void;
  color?: string;
}

export const TrackerCard = ({ tracker, onUpdate, onDelete, color = '#3b82f6' }: TrackerCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(tracker.value.toString());

  const handleSave = () => {
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue)) {
      onUpdate({ value: numValue });
    }
    setIsEditing(false);
  };

  const getProgressPercentage = () => {
    if (tracker.type === 'boolean') return tracker.value ? 100 : 0;
    if (tracker.type === 'percentage') return tracker.value;
    if (tracker.target) return Math.min((tracker.value / tracker.target) * 100, 100);
    if (tracker.max) return (tracker.value / tracker.max) * 100;
    return 50;
  };

  const formatValue = () => {
    if (tracker.type === 'boolean') return tracker.value ? 'Yes' : 'No';
    if (tracker.type === 'percentage') return `${tracker.value}%`;
    if (tracker.type === 'level') {
      const prefix = tracker.unit || 'Lv.';
      return `${prefix}${tracker.value}${tracker.max ? `/${tracker.max}` : ''}`;
    }
    return `${tracker.value.toLocaleString()}${tracker.unit ? ` ${tracker.unit}` : ''}`;
  };

  const progress = getProgressPercentage();

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600 transition-all">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-medium text-slate-200">{tracker.name}</h4>
        <div className="flex gap-1">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
            title="Edit value"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="text-slate-500 hover:text-red-400 transition-colors p-1"
            title="Delete tracker"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="flex gap-2 items-center">
          {tracker.type === 'boolean' ? (
            <button
              onClick={() => {
                onUpdate({ value: tracker.value ? 0 : 1 });
                setIsEditing(false);
              }}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                tracker.value
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
            >
              {tracker.value ? 'Yes → No' : 'No → Yes'}
            </button>
          ) : (
            <>
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm w-24 focus:outline-none focus:border-blue-500"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-sm transition-colors"
              >
                Save
              </button>
            </>
          )}
          <button
            onClick={() => setIsEditing(false)}
            className="text-slate-500 hover:text-slate-300 text-sm"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold" style={{ color }}>
              {formatValue()}
            </span>
            {tracker.target && tracker.type !== 'boolean' && tracker.type !== 'percentage' && (
              <span className="text-slate-500 text-sm">
                / {tracker.target.toLocaleString()}{tracker.unit ? ` ${tracker.unit}` : ''}
              </span>
            )}
          </div>

          {/* Progress bar */}
          {(tracker.target || tracker.max || tracker.type === 'percentage' || tracker.type === 'boolean') && (
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
        </>
      )}
    </div>
  );
};
