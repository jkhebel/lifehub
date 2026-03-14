import { useState } from 'react';
import { Tracker, TRACKER_TYPES, TrackerType } from '../types';

interface AddTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tracker: Omit<Tracker, 'id'>) => void;
}

export const AddTrackerModal = ({ isOpen, onClose, onAdd }: AddTrackerModalProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TrackerType>('number');
  const [value, setValue] = useState('0');
  const [target, setTarget] = useState('');
  const [max, setMax] = useState('');
  const [unit, setUnit] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tracker: Omit<Tracker, 'id'> = {
      name,
      type,
      value: parseFloat(value) || 0,
    };

    if (target) tracker.target = parseFloat(target);
    if (max) tracker.max = parseFloat(max);
    if (unit) tracker.unit = unit;

    onAdd(tracker);

    // Reset form
    setName('');
    setType('number');
    setValue('0');
    setTarget('');
    setMax('');
    setUnit('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-[14px] p-6 w-full max-w-md border-2 border-indigo-100 shadow-[4px_4px_0_0_rgba(129,140,248,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-1 text-slate-900">Add New Tracker</h2>
        <p className="text-sm text-slate-500 mb-4">
          Track something you care about in this area&mdash;levels, hours, sessions, or a simple yes/no.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              Tracker Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
              placeholder="e.g., Kanji Known"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TrackerType)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
            >
              {TRACKER_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">
                Current Value
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
              />
            </div>

            {type !== 'boolean' && (
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">
                  Target (optional)
                </label>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
                  placeholder="e.g., 2136"
                />
              </div>
            )}
          </div>

          {(type === 'level' || type === 'progress') && (
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">
                Maximum (optional)
              </label>
              <input
                type="number"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
                placeholder="e.g., 60"
              />
            </div>
          )}

          {type !== 'percentage' && type !== 'boolean' && (
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">
                Unit (optional)
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
                placeholder="e.g., words, hours, lbs"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors font-medium text-white shadow-[2px_2px_0_0_rgba(56,189,248,0.7)]"
            >
              Add Tracker
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
