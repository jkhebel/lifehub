import { useState } from 'react';
import { DEFAULT_COLORS } from '../types';

interface AddAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, color: string, icon?: string) => void;
  parentName?: string;
}

export const AddAreaModal = ({ isOpen, onClose, onAdd, parentName }: AddAreaModalProps) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [icon, setIcon] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(name, color, icon || undefined);
    setName('');
    setIcon('');
    setColor(DEFAULT_COLORS[0]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl p-6 w-full max-w-md border-2 border-slate-200 shadow-[4px_4px_0_rgba(148,163,184,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Add New Area</h2>
        {parentName && (
          <p className="text-slate-500 text-sm mb-4">Under: {parentName}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              Area Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500"
              placeholder="e.g., Music, Reading, Cooking"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              Icon (emoji, optional)
            </label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500"
              placeholder="e.g., 🎵, 📚, 🍳"
              maxLength={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-white scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

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
              className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors font-medium text-white shadow-[2px_2px_0_rgba(56,189,248,0.5)]"
            >
              Add Area
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
