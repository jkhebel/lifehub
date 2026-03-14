import { useState, useEffect } from 'react';
import type { Area, DomainMetric, AggregationMode, LevelsParameter } from '../types';
import { DEFAULT_COLORS, AGGREGATION_MODES } from '../types';

export type DomainModalMode = 'add' | 'edit';

export interface DomainModalProps {
  isOpen: boolean;
  mode: DomainModalMode;
  onClose: () => void;
  /** For add mode: parent context */
  parentName?: string;
  parentId?: string | null;
  /** For edit mode: the domain being edited */
  area?: Area | null;
  /** Add mode: create domain with optional icon and metric */
  onAdd?: (name: string, color: string, initial?: { icon?: string; metric?: DomainMetric }) => void;
  /** Edit mode: update name/icon */
  onUpdateArea?: (areaId: string, updates: Partial<Pick<Area, 'name' | 'icon' | 'aggregation'>>) => void;
  /** Edit mode: set or clear metric */
  onUpdateDomainMetric?: (domainId: string, metric: DomainMetric | null) => void;
  /** Edit mode: request delete (opens confirmation dialog) */
  onDeleteRequest?: (areaId: string) => void;
  /** Edit mode: whether this domain is pinned to favorites */
  isPinned?: boolean;
  /** Edit mode: toggle pin for this domain */
  onTogglePin?: (areaId: string) => void;
}

function MetricFields({
  kind,
  binaryValue,
  setBinaryValue,
  current,
  setCurrent,
  max,
  setMax,
  unit,
  setUnit,
  levelNames,
  setLevelNames,
  levelParams,
  setLevelParams,
  children: childAreas,
}: {
  kind: 'binary' | 'progress' | 'levels';
  binaryValue: 0 | 1;
  setBinaryValue: (v: 0 | 1) => void;
  current: number;
  setCurrent: (v: number) => void;
  max: number;
  setMax: (v: number) => void;
  unit: string;
  setUnit: (v: string) => void;
  levelNames: string[];
  setLevelNames: (v: string[] | ((prev: string[]) => string[])) => void;
  levelParams: LevelsParameter[];
  setLevelParams: (v: LevelsParameter[] | ((prev: LevelsParameter[]) => LevelsParameter[])) => void;
  children: Area[];
}) {
  return (
    <>
      {kind === 'binary' && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="domain-modal-binary"
            checked={binaryValue === 1}
            onChange={e => setBinaryValue(e.target.checked ? 1 : 0)}
          />
          <label htmlFor="domain-modal-binary">Mark as done</label>
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
      {kind === 'levels' && (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Named levels</label>
            <p className="text-xs text-slate-500 mb-2">Add levels (e.g. A1, A2, B1). Progress is derived from child parameters below.</p>
            <div className="space-y-2">
              {levelNames.map((levelName, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-slate-500 text-sm w-16">Level {i + 1}:</span>
                  <input
                    type="text"
                    value={levelName}
                    onChange={e => {
                      const next = [...levelNames];
                      next[i] = e.target.value;
                      setLevelNames(next);
                    }}
                    placeholder={`e.g. A1`}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setLevelNames((prev) => prev.filter((_, j) => j !== i))}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    aria-label={`Remove level ${i + 1}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setLevelNames((prev) => [...prev, `Level ${prev.length + 1}`])}
                className="text-sm text-sky-600 hover:text-sky-700 font-medium"
              >
                + Add level
              </button>
            </div>
          </div>
          {levelNames.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Parameters (child → level bounds)</label>
              <p className="text-xs text-slate-500 mb-2">Pick a child domain; set numeric bounds for each level (one more value than levels). Value comes from that child.</p>
              {childAreas.length === 0 ? (
                <p className="text-sm text-slate-500">Add child domains first, then edit this domain again to add parameters.</p>
              ) : (
                <>
                  <div className="space-y-3">
                    {levelParams.map((param, pi) => {
                      const child = childAreas.find((c) => c.id === param.childId);
                      const boundsLen = levelNames.length + 1;
                      const bounds = param.bounds.length === boundsLen ? param.bounds : Array.from({ length: boundsLen }, () => 0);
                      return (
                        <div key={pi} className="border border-slate-200 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <select
                              value={param.childId}
                              onChange={e => {
                                const next = [...levelParams];
                                next[pi] = { ...next[pi]!, childId: e.target.value, bounds };
                                setLevelParams(next);
                              }}
                              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                            >
                              {childAreas.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => setLevelParams((prev) => prev.filter((_, j) => j !== pi))}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              aria-label="Remove parameter"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                            {bounds.map((b, bi) => (
                              <div key={bi}>
                                <label className="text-[10px] text-slate-500 block">
                                  {bi === 0 ? 'Min' : bi === bounds.length - 1 ? 'Max' : levelNames[bi - 1] ?? `L${bi}`}
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  value={b}
                                  onChange={e => {
                                    const v = Number(e.target.value);
                                    const nextBounds = [...bounds];
                                    nextBounds[bi] = Number.isNaN(v) ? 0 : v;
                                    const next = [...levelParams];
                                    next[pi] = { ...next[pi]!, bounds: nextBounds };
                                    setLevelParams(next);
                                  }}
                                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        const firstChildId = childAreas[0]?.id;
                        if (!firstChildId) return;
                        const boundsLen = levelNames.length + 1;
                        const usedIds = new Set(levelParams.map((p) => p.childId));
                        const childId = childAreas.find((c) => !usedIds.has(c.id))?.id ?? firstChildId;
                        const bounds = Array.from({ length: boundsLen }, (_, i) => i);
                        setLevelParams((prev) => [...prev, { childId, bounds }]);
                      }}
                      className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                    >
                      + Add parameter
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}

export function DomainModal({
  isOpen,
  mode,
  onClose,
  parentName,
  area,
  onAdd,
  onUpdateArea,
  onUpdateDomainMetric,
  onDeleteRequest,
  isPinned = false,
  onTogglePin,
}: DomainModalProps) {
  const isEdit = mode === 'edit';

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [hasMetric, setHasMetric] = useState(false);
  const [kind, setKind] = useState<'binary' | 'progress' | 'stages'>('binary');
  const [binaryValue, setBinaryValue] = useState<0 | 1>(0);
  const [current, setCurrent] = useState(0);
  const [max, setMax] = useState(10);
  const [unit, setUnit] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stagesText, setStagesText] = useState('');
  const [stageBoundsText, setStageBoundsText] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [levelNames, setLevelNames] = useState<string[]>([]);
  const [levelParams, setLevelParams] = useState<LevelsParameter[]>([]);
  const [aggregation, setAggregation] = useState<AggregationMode>('average');

  useEffect(() => {
    if (!isOpen || kind !== 'levels') return;
    const wantLen = levelNames.length + 1;
    setLevelParams((prev) =>
      prev.map((p) => {
        if (p.bounds.length === wantLen) return p;
        const b = [...p.bounds];
        while (b.length < wantLen) b.push((b[b.length - 1] ?? 0) + 1);
        while (b.length > wantLen) b.pop();
        return { ...p, bounds: b };
      })
    );
  }, [isOpen, kind, levelNames.length]);

  useEffect(() => {
    if (!isOpen) return;
    if (isEdit && area) {
      setName(area.name);
      setIcon(area.icon ?? '');
      setHasMetric(area.metric != null);
      setAggregation(area.aggregation ?? 'average');
      if (area.metric) {
        const metricType = area.metric.type === 'levels' || area.metric.type === 'stages' ? 'levels' : area.metric.type;
        setKind(metricType);
        if (area.metric.type === 'binary') setBinaryValue(area.metric.value);
        if (area.metric.type === 'progress') {
          setCurrent(area.metric.current);
          setMax(area.metric.max);
          setUnit(area.metric.unit ?? '');
        }
        if (area.metric.type === 'stages') {
          setLevelNames(area.metric.stages);
          setLevelParams([]);
          setCurrentIndex(0);
          setStagesText('');
          setStageBoundsText('');
          setCurrentValue('');
        }
        if (area.metric.type === 'levels') {
          setLevelNames(area.metric.levels);
          setLevelParams(area.metric.parameters.map((p) => ({ childId: p.childId, bounds: [...p.bounds] })));
        }
      } else {
        setKind('binary');
        setBinaryValue(0);
        setCurrent(0);
        setMax(10);
        setUnit('');
        setCurrentIndex(0);
        setStagesText('');
        setLevelNames([]);
        setLevelParams([]);
      }
    } else {
      setName('');
      setIcon('');
      setColor(DEFAULT_COLORS[0]);
      setHasMetric(false);
      setKind('binary');
      setBinaryValue(0);
      setCurrent(0);
      setMax(10);
      setUnit('');
      setCurrentIndex(0);
      setStagesText('');
      setStageBoundsText('');
      setCurrentValue('');
      setLevelNames([]);
      setLevelParams([]);
    }
  }, [isOpen, isEdit, area]);

  const buildMetric = (): DomainMetric | null => {
    if (!hasMetric) return null;
    if (kind === 'binary') return { type: 'binary', value: binaryValue };
    if (kind === 'progress') return { type: 'progress', current: Number(current) || 0, max: Number(max) || 1, unit: unit || undefined };
    if (kind === 'levels') {
      const levels = levelNames.map((n) => n.trim()).filter(Boolean);
      if (levels.length === 0) return null;
      const parameters = levelParams
        .filter((p) => p.bounds.length === levels.length + 1)
        .map((p) => ({ childId: p.childId, bounds: p.bounds }));
      return { type: 'levels', levels, parameters };
    }
    return null;
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAdd || !name.trim()) return;
    const metric = buildMetric();
    onAdd(name.trim(), color, { icon: icon || undefined, metric: metric ?? undefined });
    onClose();
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!area || !onUpdateArea || !onUpdateDomainMetric) return;
    onUpdateArea(area.id, { name: name.trim(), icon: icon || undefined, aggregation });
    const metric = buildMetric();
    onUpdateDomainMetric(area.id, metric);
    onClose();
  };

  const handleDelete = () => {
    if (!area || !onDeleteRequest) return;
    onDeleteRequest(area.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Edit domain' : 'Add domain'}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-md border-2 border-slate-200 shadow-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-slate-900 mb-1">
          {isEdit ? 'Edit domain' : 'Add domain'}
        </h2>
        {!isEdit && parentName && (
          <p className="text-slate-500 text-sm mb-4">Under: {parentName}</p>
        )}

        <form onSubmit={isEdit ? handleSubmitEdit : handleSubmitAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500"
              placeholder="e.g., Music, Reading"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">Emoji (optional)</label>
            <input
              type="text"
              value={icon}
              onChange={e => setIcon(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
              placeholder="e.g. 🎵, 📚"
              maxLength={4}
            />
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {DEFAULT_COLORS.map(c => (
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
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">How is this domain measured?</label>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setHasMetric(false)}
                className={`px-3 py-1.5 text-sm rounded-lg border ${!hasMetric ? 'bg-sky-500 text-white border-sky-500' : 'bg-slate-100 border-slate-300'}`}
              >
                No metric
              </button>
              <button
                type="button"
                onClick={() => setHasMetric(true)}
                className={`px-3 py-1.5 text-sm rounded-lg border ${hasMetric ? 'bg-sky-500 text-white border-sky-500' : 'bg-slate-100 border-slate-300'}`}
              >
                Metric
              </button>
            </div>
          </div>

          {hasMetric && (
            <div className="space-y-3 pl-0">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <div className="flex gap-2 flex-wrap">
                  {(['binary', 'progress', 'levels'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setKind(t)}
                      className={`px-3 py-1.5 text-sm rounded-lg border ${
                        kind === t ? 'bg-sky-500 text-white border-sky-500' : 'bg-slate-100 border-slate-300'
                      }`}
                    >
                      {t === 'binary' ? 'Done / Not done' : t === 'progress' ? 'Progress' : 'Levels'}
                    </button>
                  ))}
                </div>
              </div>
              <MetricFields
                kind={kind}
                binaryValue={binaryValue}
                setBinaryValue={setBinaryValue}
                current={current}
                setCurrent={setCurrent}
                max={max}
                setMax={setMax}
                unit={unit}
                setUnit={setUnit}
                levelNames={levelNames}
                setLevelNames={setLevelNames}
                levelParams={levelParams}
                setLevelParams={setLevelParams}
                children={area?.children ?? []}
              />
            </div>
          )}

          {isEdit && area && area.children.length > 0 && !hasMetric && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Derived from children</label>
              <select
                value={aggregation}
                onChange={e => setAggregation(e.target.value as AggregationMode)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
              >
                {AGGREGATION_MODES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          )}

          {isEdit && area && onTogglePin && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="domain-modal-pinned"
                checked={isPinned}
                onChange={() => onTogglePin(area.id)}
              />
              <label htmlFor="domain-modal-pinned" className="text-sm text-slate-700">
                Pin to favorites
              </label>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 text-slate-700">
                Cancel
              </button>
              <button type="submit" className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg font-medium text-white">
                {isEdit ? 'Save' : 'Add domain'}
              </button>
            </div>
            {isEdit && onDeleteRequest && area && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full py-1.5 text-sm rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200"
              >
                Delete this domain
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
