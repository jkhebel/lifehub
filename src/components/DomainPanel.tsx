import { useState, useEffect } from 'react';
import type { Area, DomainMetric, AggregationMode } from '../types';
import { AGGREGATION_MODES } from '../types';

interface DomainPanelProps {
  area: Area | null;
  calculateProgress: (area: Area) => number;
  onUpdateArea: (areaId: string, updates: Partial<Area>) => void;
  onUpdateDomainMetric: (domainId: string, metric: DomainMetric | null) => void;
  onAddArea: (parentId: string | null, name: string, color: string) => void;
  onSelectArea: (areaId: string) => void;
  onDeleteAreaRequest: (areaId: string) => void;
}

function EditDomainModal({
  area,
  onClose,
  onSave,
  onDelete,
}: {
  area: Area;
  onClose: () => void;
  onSave: (name: string, icon: string) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(area.name);
  const [icon, setIcon] = useState(area.icon ?? '');
  useEffect(() => {
    setName(area.name);
    setIcon(area.icon ?? '');
  }, [area.name, area.icon]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      role="dialog"
      aria-modal="true"
      aria-label="Edit domain"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-5 w-full max-w-sm border-2 border-slate-200 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Edit domain</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500"
              placeholder="Domain name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Emoji</label>
            <input
              type="text"
              value={icon}
              onChange={e => setIcon(e.target.value)}
              maxLength={4}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500"
              placeholder="e.g. 🏋️"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm rounded-lg text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(name, icon)}
              disabled={!name.trim()}
              className="px-3 py-1.5 text-sm rounded-lg bg-sky-500 disabled:bg-slate-300 text-white hover:bg-sky-600"
            >
              Save
            </button>
          </div>
          <button
            type="button"
            onClick={onDelete}
            className="mt-2 w-full py-1.5 text-sm rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200"
          >
            Delete this domain
          </button>
        </div>
      </div>
    </div>
  );
}

function SetMetricModal({
  area,
  onClose,
  onSet,
  onClear,
}: {
  area: Area;
  onClose: () => void;
  onSet: (metric: DomainMetric) => void;
  onClear: () => void;
}) {
  const [kind, setKind] = useState<'binary' | 'progress' | 'stages'>(
    area.metric?.type ?? 'binary'
  );
  const [binaryValue, setBinaryValue] = useState(
    area.metric?.type === 'binary' ? area.metric.value : 0
  );
  const [current, setCurrent] = useState(
    area.metric?.type === 'progress' ? area.metric.current : 0
  );
  const [max, setMax] = useState(
    area.metric?.type === 'progress' ? area.metric.max : 10
  );
  const [unit, setUnit] = useState(
    area.metric?.type === 'progress' ? area.metric.unit ?? '' : ''
  );
  const [currentIndex, setCurrentIndex] = useState(
    area.metric?.type === 'stages' ? area.metric.currentIndex : 0
  );
  const [stagesText, setStagesText] = useState(
    area.metric?.type === 'stages' ? area.metric.stages.join(', ') : ''
  );

  const handleSave = () => {
    if (kind === 'binary') {
      onSet({ type: 'binary', value: binaryValue ? 1 : 0 });
    } else if (kind === 'progress') {
      onSet({
        type: 'progress',
        current: Number(current) || 0,
        max: Number(max) || 1,
        unit: unit || undefined,
      });
    } else {
      const stages = stagesText.split(',').map(s => s.trim()).filter(Boolean);
      if (stages.length === 0) return;
      onSet({
        type: 'stages',
        currentIndex: Math.min(currentIndex, stages.length - 1),
        stages,
      });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      role="dialog"
      aria-modal="true"
      aria-label="Set metric"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-5 w-full max-w-sm border-2 border-slate-200 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Set metric</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <div className="flex gap-2 flex-wrap">
              {(['binary', 'progress', 'stages'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setKind(t)}
                  className={`px-3 py-1.5 text-sm rounded-lg border ${
                    kind === t ? 'bg-sky-500 text-white border-sky-500' : 'bg-slate-100 border-slate-300'
                  }`}
                >
                  {t === 'binary' ? 'Done / Not done' : t === 'progress' ? 'Progress' : 'Stages'}
                </button>
              ))}
            </div>
          </div>
          {kind === 'binary' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="binary-done"
                checked={binaryValue === 1}
                onChange={e => setBinaryValue(e.target.checked ? 1 : 0)}
              />
              <label htmlFor="binary-done">Mark as done</label>
            </div>
          )}
          {kind === 'progress' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current</label>
                  <input
                    type="number"
                    min={0}
                    value={current}
                    onChange={e => setCurrent(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max</label>
                  <input
                    type="number"
                    min={1}
                    value={max}
                    onChange={e => setMax(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unit (optional)</label>
                <input
                  type="text"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  placeholder="e.g. levels, chapters"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
            </>
          )}
          {kind === 'stages' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stages (comma-separated, first = start)</label>
                <input
                  type="text"
                  value={stagesText}
                  onChange={e => setStagesText(e.target.value)}
                  placeholder="e.g. N5, N4, N3, N2, N1"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              {stagesText.split(',').map(s => s.trim()).filter(Boolean).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current stage (index)</label>
                  <input
                    type="number"
                    min={0}
                    max={Math.max(0, stagesText.split(',').map(s => s.trim()).filter(Boolean).length - 1)}
                    value={currentIndex}
                    onChange={e => setCurrentIndex(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <button type="button" onClick={onClear} className="px-3 py-1.5 text-sm rounded-lg text-slate-600 hover:bg-slate-100">
            Derive from children
          </button>
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm rounded-lg text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-1.5 text-sm rounded-lg bg-sky-500 text-white hover:bg-sky-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export function DomainPanel({
  area,
  calculateProgress,
  onUpdateArea,
  onUpdateDomainMetric,
  onAddArea,
  onSelectArea,
  onDeleteAreaRequest,
}: DomainPanelProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showMetric, setShowMetric] = useState(false);
  const [showAddArea, setShowAddArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaColor, setNewAreaColor] = useState('#3b82f6');

  if (!area) {
    return (
      <div className="bg-white/95 rounded-[10px] p-6 border-2 border-slate-300 border-t-slate-200 border-l-slate-200 card-paper">
        <p className="text-slate-500 text-sm">
          Select a domain from the list above to view and edit it, add subdomains, or set how it’s measured.
        </p>
      </div>
    );
  }

  const progress = calculateProgress(area);
  const hasChildren = area.children.length > 0;
  const hasMetric = area.metric != null;

  return (
    <div className="bg-white/95 rounded-[10px] border-2 border-slate-300 border-t-slate-200 border-l-slate-200 overflow-hidden card-paper">
      <div
        className="p-4 border-b border-slate-200"
        style={{ backgroundColor: `${area.color}15` }}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowEdit(true)}
            className="text-left flex items-center gap-2 min-w-0"
          >
            {area.icon && <span className="text-xl">{area.icon}</span>}
            <span className="font-semibold text-slate-800 truncate">{area.name}</span>
          </button>
          <span className="text-sm text-slate-500 tabular-nums">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Children */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-slate-700">Subdomains</h4>
            <button
              type="button"
              onClick={() => setShowAddArea(true)}
              className="text-sm text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add subdomain
            </button>
          </div>
          {area.children.length === 0 ? (
            <p className="text-slate-500 text-sm">No subdomains. Add one or set a metric for this domain.</p>
          ) : (
            <ul className="space-y-1">
              {area.children.map(child => {
                const childProgress = calculateProgress(child);
                return (
                  <li key={child.id}>
                    <button
                      type="button"
                      onClick={() => onSelectArea(child.id)}
                      className="w-full flex items-center justify-between gap-2 py-2 px-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        {child.icon && <span>{child.icon}</span>}
                        <span className="truncate font-medium text-slate-800">{child.name}</span>
                      </span>
                      <span className="text-slate-500 text-sm tabular-nums shrink-0">{Math.round(childProgress)}%</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* How measured */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2">How is this domain measured?</h4>
          {hasMetric ? (
            <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-sm text-slate-700">
                {area.metric!.type === 'binary' && (area.metric!.value ? 'Done' : 'Not done')}
                {area.metric!.type === 'progress' && `${area.metric!.current} / ${area.metric!.max}${area.metric!.unit ? ` ${area.metric!.unit}` : ''}`}
                {area.metric!.type === 'stages' && area.metric!.stages[area.metric!.currentIndex]}
              </span>
              <button
                type="button"
                onClick={() => setShowMetric(true)}
                className="text-sm text-sky-600 hover:text-sky-700"
              >
                Edit
              </button>
            </div>
          ) : hasChildren ? (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate-700">Derived from children</span>
                <button
                  type="button"
                  onClick={() => setShowMetric(true)}
                  className="text-sm text-sky-600 hover:text-sky-700"
                >
                  Change
                </button>
              </div>
              <label className="block text-xs text-slate-500">
                Aggregation:{' '}
                <select
                  value={area.aggregation ?? 'average'}
                  onChange={e => onUpdateArea(area.id, { aggregation: e.target.value as AggregationMode })}
                  className="ml-1 border border-slate-300 rounded px-2 py-0.5 bg-white text-slate-700"
                >
                  {AGGREGATION_MODES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-2">No metric set. Add subdomains or set a metric to see progress.</p>
              <button
                type="button"
                onClick={() => setShowMetric(true)}
                className="text-sm text-sky-600 hover:text-sky-700"
              >
                Set metric
              </button>
            </>
          )}
        </div>
      </div>

      {showEdit && (
        <EditDomainModal
          area={area}
          onClose={() => setShowEdit(false)}
          onSave={(name, icon) => {
            onUpdateArea(area.id, { name, icon: icon || undefined });
            setShowEdit(false);
          }}
          onDelete={() => {
            setShowEdit(false);
            onDeleteAreaRequest(area.id);
          }}
        />
      )}

      {showMetric && (
        <SetMetricModal
          area={area}
          onClose={() => setShowMetric(false)}
          onSet={metric => {
            onUpdateDomainMetric(area.id, metric);
            setShowMetric(false);
          }}
          onClear={() => {
            onUpdateDomainMetric(area.id, null);
            setShowMetric(false);
          }}
        />
      )}

      {showAddArea && (
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
          <label className="block text-sm font-medium text-slate-700">New subdomain name</label>
          <input
            type="text"
            value={newAreaName}
            onChange={e => setNewAreaName(e.target.value)}
            placeholder="e.g. Fitness"
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2"
          />
          <label className="block text-sm font-medium text-slate-700">Color</label>
          <input
            type="color"
            value={newAreaColor}
            onChange={e => setNewAreaColor(e.target.value)}
            className="h-9 w-full rounded border border-slate-300"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (newAreaName.trim()) {
                  onAddArea(area.id, newAreaName.trim(), newAreaColor);
                  setNewAreaName('');
                  setNewAreaColor('#3b82f6');
                  setShowAddArea(false);
                }
              }}
              disabled={!newAreaName.trim()}
              className="px-3 py-1.5 text-sm rounded-lg bg-sky-500 text-white disabled:bg-slate-300"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddArea(false)}
              className="px-3 py-1.5 text-sm rounded-lg text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
