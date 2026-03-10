import { useState } from 'react';
import { Area, AggregationMode, Tracker } from '../types';
import { TrackerCard } from './TrackerCard';
import { AddTrackerModal } from './AddTrackerModal';

interface TrackerPanelProps {
  area: Area | null;
  onUpdateArea: (areaId: string, updates: Partial<Area>) => void;
  onUpdateTracker: (areaId: string, trackerId: string, updates: Partial<Tracker>) => void;
  onDeleteTracker: (areaId: string, trackerId: string) => void;
  onAddTracker: (areaId: string, tracker: Omit<Tracker, 'id'>) => void;
  calculateProgress: (area: Area) => number;
}

const AGGREGATION_OPTIONS: { value: AggregationMode; label: string }[] = [
  { value: 'average', label: 'Average' },
  { value: 'weighted', label: 'Weighted' },
  { value: 'minimum', label: 'Minimum' },
];

export const TrackerPanel = ({
  area,
  onUpdateArea,
  onUpdateTracker,
  onDeleteTracker,
  onAddTracker,
  calculateProgress,
}: TrackerPanelProps) => {
  const [isAddingTracker, setIsAddingTracker] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalProgressInput, setGoalProgressInput] = useState('');
  const [goalDateInput, setGoalDateInput] = useState('');

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

        {/* Goal: Current vs Target and On track */}
        {(area.targetProgress != null || isEditingGoal) && (
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            {isEditingGoal ? (
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-slate-400 text-sm">Goal:</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={goalProgressInput}
                  onChange={(e) => setGoalProgressInput(e.target.value)}
                  placeholder="%"
                  className="w-16 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                />
                <span className="text-slate-400 text-sm">%</span>
                <label className="text-slate-400 text-sm ml-2">By:</label>
                <input
                  type="date"
                  value={goalDateInput}
                  onChange={(e) => setGoalDateInput(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => {
                    const p = goalProgressInput.trim() === '' ? null : parseInt(goalProgressInput, 10);
                    if (p === null || (!isNaN(p) && p >= 0 && p <= 100)) {
                      onUpdateArea(area.id, {
                        targetProgress: p ?? undefined,
                        targetDate: goalDateInput || undefined,
                      });
                    }
                    setIsEditingGoal(false);
                  }}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditingGoal(false);
                    setGoalProgressInput(String(area.targetProgress ?? ''));
                    setGoalDateInput(area.targetDate ?? '');
                  }}
                  className="px-2 py-1 text-slate-400 hover:text-white text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">
                    Current {Math.round(progress)}%{area.targetProgress != null ? ` / Goal ${area.targetProgress}%` : ''}
                  </span>
                  {area.targetDate && (
                    <span className="text-slate-500 text-xs">by {new Date(area.targetDate).toLocaleDateString()}</span>
                  )}
                  {area.targetProgress != null && area.targetDate && (
                    <span
                      className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        progress >= area.targetProgress
                          ? 'text-green-400 bg-green-400/20'
                          : 'text-amber-400 bg-amber-400/20'
                      }`}
                    >
                      {progress >= area.targetProgress ? 'On track' : 'Behind'}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setGoalProgressInput(String(area.targetProgress ?? ''));
                    setGoalDateInput(area.targetDate ?? '');
                    setIsEditingGoal(true);
                  }}
                  className="text-slate-500 hover:text-slate-300 p-1"
                  title="Edit goal"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
        {area.targetProgress == null && !isEditingGoal && (
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <button
              onClick={() => {
                setGoalProgressInput('');
                setGoalDateInput('');
                setIsEditingGoal(true);
              }}
              className="text-slate-500 hover:text-slate-300 text-sm"
            >
              + Set goal
            </button>
          </div>
        )}

        {/* Aggregation mode */}
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <span className="text-slate-400 text-sm mr-2">Progress:</span>
          <div className="inline-flex rounded-lg border border-slate-600 overflow-hidden">
            {AGGREGATION_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onUpdateArea(area.id, { aggregation: value })}
                className={`px-3 py-1 text-sm transition-colors ${
                  (area.aggregation ?? 'average') === value
                    ? 'bg-slate-600 text-white'
                    : 'bg-slate-700/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
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
                showWeight={area.aggregation === 'weighted'}
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
