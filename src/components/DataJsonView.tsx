import { useState, useEffect } from 'react';
import type { DashboardState } from '../types';
import { validateAreas } from '../model/validation';

export interface DataJsonViewProps {
  state: DashboardState;
  onApply: (newState: DashboardState) => void;
  onClose: () => void;
}

export function DataJsonView({ state, onApply, onClose }: DataJsonViewProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(JSON.stringify(state, null, 2));
    setError(null);
  }, [state]);

  const handleApply = () => {
    setError(null);
    try {
      const parsed = JSON.parse(text) as unknown;
      if (!parsed || typeof parsed !== 'object') {
        setError('Invalid JSON: must be an object');
        return;
      }
      const areas = (parsed as { areas?: unknown }).areas;
      const validation = validateAreas(areas);
      if (!validation.ok) {
        setError(validation.errors.join('. '));
        return;
      }
      const newState: DashboardState = {
        areas: validation.data,
        currentAreaId: typeof (parsed as DashboardState).currentAreaId === 'string' || (parsed as DashboardState).currentAreaId === null
          ? (parsed as DashboardState).currentAreaId
          : state.currentAreaId,
        breadcrumbs: Array.isArray((parsed as DashboardState).breadcrumbs)
          ? (parsed as DashboardState).breadcrumbs
          : state.breadcrumbs,
        pinnedAreaIds: Array.isArray((parsed as DashboardState).pinnedAreaIds)
          ? (parsed as DashboardState).pinnedAreaIds
          : state.pinnedAreaIds,
        gamification:
          (parsed as DashboardState).gamification &&
          typeof (parsed as DashboardState).gamification?.totalXp === 'number' &&
          Array.isArray((parsed as DashboardState).gamification?.completionLog)
            ? (parsed as DashboardState).gamification
            : state.gamification,
      };
      onApply(newState);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" role="dialog" aria-modal="true" aria-label="Edit data as JSON">
      <div className="bg-white rounded-xl border-2 border-slate-200 shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col m-4">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Data (JSON)</h2>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-slate-100 text-slate-500" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <p className="px-4 py-2 text-xs text-slate-500 border-b border-slate-100">
          Edit the JSON below and click Apply. Areas are validated; invalid data will show an error. Current area, breadcrumbs, and pinned IDs are preserved if not present in JSON.
        </p>
        <div className="flex-1 min-h-0 p-4">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            className="w-full h-full min-h-[280px] font-mono text-sm bg-slate-50 border border-slate-300 rounded-lg p-3 focus:outline-none focus:border-sky-500"
            spellCheck={false}
          />
          {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
        </div>
        <div className="px-4 py-3 border-t border-slate-200 flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700">
            Cancel
          </button>
          <button type="button" onClick={handleApply} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg text-white font-medium">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
