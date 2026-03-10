import { useState } from 'react';
import { Tracker } from '../types';
import { StatEditor } from './StatEditor';

interface TrackerCardProps {
  tracker: Tracker;
  onUpdate: (updates: Partial<Tracker>) => void;
  onDelete: () => void;
  color?: string;
  /** Show weight input when parent area aggregation is 'weighted'. */
  showWeight?: boolean;
}

export const TrackerCard = ({
  tracker,
  onUpdate,
  onDelete,
  color = '#3b82f6',
  showWeight = false,
}: TrackerCardProps) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600 transition-all">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-sm font-medium text-slate-200">{tracker.name}</h4>
          {showWeight && (
            <span className="flex items-center gap-1">
              <label className="text-slate-500 text-xs">Weight:</label>
              <input
                type="number"
                min={0.5}
                max={10}
                step={0.5}
                value={tracker.weight ?? 1}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (!isNaN(v) && v >= 0.5 && v <= 10) onUpdate({ weight: v });
                }}
                className="w-12 bg-slate-700 border border-slate-600 rounded px-1 py-0.5 text-xs focus:outline-none focus:border-blue-500"
              />
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
            title="Edit value and target"
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

      <StatEditor
        tracker={tracker}
        onUpdate={onUpdate}
        color={color}
        isEditing={isEditing}
        onEditChange={setIsEditing}
      />
    </div>
  );
};
