import { useState } from 'react';
import { Area, Tracker } from '../types';
import { TrackerCard } from './TrackerCard';
import { AddTrackerModal } from './AddTrackerModal';

interface TrackerPanelProps {
  area: Area | null;
  onUpdateTracker: (areaId: string, trackerId: string, updates: Partial<Tracker>) => void;
  onDeleteTracker: (areaId: string, trackerId: string) => void;
  onAddTracker: (areaId: string, tracker: Omit<Tracker, 'id'>) => void;
  calculateProgress: (area: Area) => number;
}

export const TrackerPanel = ({
  area,
  onUpdateTracker,
  onDeleteTracker,
  onAddTracker,
  calculateProgress,
}: TrackerPanelProps) => {
  const [isAddingTracker, setIsAddingTracker] = useState(false);

  if (!area) {
    return (
      <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-300 mb-4">Welcome to Life Dashboard</h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          Click on an area in the bullseye diagram to view and manage its trackers.
          Each area can have multiple metrics that contribute to your overall progress.
        </p>
        <div className="mt-4 p-4 bg-slate-700/30 rounded-lg">
          <p className="text-slate-500 text-xs">
            Tip: Progress from trackers and sub-areas automatically aggregates
            into the parent area's progress ring.
          </p>
        </div>
      </div>
    );
  }

  const progress = calculateProgress(area);

  return (
    <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Area Header */}
      <div
        className="p-4 border-b border-slate-700/50"
        style={{ backgroundColor: `${area.color}15` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {area.icon && <span className="text-2xl">{area.icon}</span>}
            <div>
              <h3 className="text-lg font-semibold" style={{ color: area.color }}>
                {area.name}
              </h3>
              {area.description && (
                <p className="text-slate-400 text-sm">{area.description}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: area.color }}>
              {Math.round(progress)}%
            </div>
            <div className="text-slate-500 text-xs">Overall Progress</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              backgroundColor: area.color,
            }}
          />
        </div>
      </div>

      {/* Trackers */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-slate-400">
            Trackers ({area.trackers.length})
          </h4>
          <button
            onClick={() => setIsAddingTracker(true)}
            className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Tracker
          </button>
        </div>

        {area.trackers.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p className="mb-2">No trackers yet</p>
            <button
              onClick={() => setIsAddingTracker(true)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Add your first tracker
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {area.trackers.map((tracker) => (
              <TrackerCard
                key={tracker.id}
                tracker={tracker}
                color={area.color}
                onUpdate={(updates) => onUpdateTracker(area.id, tracker.id, updates)}
                onDelete={() => onDeleteTracker(area.id, tracker.id)}
              />
            ))}
          </div>
        )}

        {/* Sub-areas info */}
        {area.children.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-slate-500 text-sm">
              This area has {area.children.length} sub-area{area.children.length !== 1 ? 's' : ''}
              that also contribute to progress.
            </p>
          </div>
        )}
      </div>

      <AddTrackerModal
        isOpen={isAddingTracker}
        onClose={() => setIsAddingTracker(false)}
        onAdd={(tracker) => onAddTracker(area.id, tracker)}
      />
    </div>
  );
};
