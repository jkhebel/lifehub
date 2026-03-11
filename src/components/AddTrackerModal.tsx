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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Add New Tracker</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Tracker Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="e.g., Kanji Known"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TrackerType)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              {TRACKER_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Current Value
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            {type !== 'boolean' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Target (optional)
                </label>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="e.g., 2136"
                />
              </div>
            )}
          </div>

          {(type === 'level' || type === 'progress') && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Maximum (optional)
              </label>
              <input
                type="number"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="e.g., 60"
              />
            </div>
          )}

          {type !== 'percentage' && type !== 'boolean' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Unit (optional)
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="e.g., words, hours, lbs"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
            >
              Add Tracker
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
