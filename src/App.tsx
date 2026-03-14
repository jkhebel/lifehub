import { useState } from 'react';
import {
  BullseyeDiagram,
  Breadcrumbs,
  DomainModal,
  DomainTree,
  CharacterCard,
} from './components';
import { useDashboard } from './hooks/useDashboard';
import type { Area } from './types';

function findAreaById(areas: Area[], id: string): Area | null {
  for (const a of areas) {
    if (a.id === id) return a;
    const found = findAreaById(a.children, id);
    if (found) return found;
  }
  return null;
}

function App() {
  const {
    state,
    currentArea,
    displayAreas,
    navigateToArea,
    navigateUp,
    getBreadcrumbAreas,
    addArea,
    updateArea,
    updateDomainMetric,
    deleteArea,
    moveArea,
    calculateDomainProgress,
    resetData,
    togglePin,
    findArea,
  } = useDashboard();

  const [isAddingArea, setIsAddingArea] = useState(false);
  const [areaToEdit, setAreaToEdit] = useState<Area | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [areaToDeleteId, setAreaToDeleteId] = useState<string | null>(null);

  const breadcrumbs = getBreadcrumbAreas();
  const isDomainModalOpen = isAddingArea || areaToEdit != null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-amber-50 to-pink-50 text-slate-900">
      <header className="border-b border-indigo-100/80 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500 bg-clip-text text-transparent">
                Life Dashboard
              </h1>
              {breadcrumbs.length > 0 && (
                <div className="hidden sm:block">
                  <Breadcrumbs areas={breadcrumbs} onNavigate={navigateToArea} />
                </div>
              )}
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-2 py-1 text-slate-500 hover:text-slate-900 hover:bg-indigo-100 rounded-[6px] border border-indigo-200 transition-colors text-sm"
              type="button"
              aria-haspopup="dialog"
              aria-expanded={showSettings}
              aria-controls="settings-panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
          {breadcrumbs.length > 0 && (
            <div className="sm:hidden mt-3">
              <Breadcrumbs areas={breadcrumbs} onNavigate={navigateToArea} />
            </div>
          )}
        </div>
      </header>

      {showSettings && (
        <div
          id="settings-panel"
          role="dialog"
          aria-modal="false"
          aria-label="Settings"
          className="absolute right-4 top-16 bg-white border border-indigo-100 rounded-xl shadow-lg z-50 p-4 w-72"
        >
          <h3 className="font-medium mb-2">Settings</h3>
          <p className="text-slate-500 text-xs mb-4">
            Changes affect only this browser.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                if (confirm('Reset all domains to the built-in defaults? This cannot be undone.')) {
                  resetData();
                }
                setShowSettings(false);
              }}
              className="w-full text-left px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-[6px] border border-rose-200 transition-colors text-sm"
              type="button"
            >
              Reset to defaults
            </button>
            <p className="text-slate-500 text-xs">
              Your data is stored locally in this browser only.
            </p>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start mb-8">
          <section
            aria-label="Radar chart overview"
            className="lg:col-span-7 flex flex-col items-center order-1"
          >
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 self-start">
              Radar
            </h2>
            {currentArea && (
              <div className="mb-4 text-center">
                <h2 className="text-2xl font-extrabold flex items-center justify-center gap-2 tracking-tight">
                  {currentArea.icon && <span>{currentArea.icon}</span>}
                  <span style={{ color: currentArea.color }}>{currentArea.name}</span>
                </h2>
                {currentArea.description && (
                  <p className="text-slate-500 mt-1">{currentArea.description}</p>
                )}
              </div>
            )}

            <BullseyeDiagram
              areas={
                displayAreas.length > 0
                  ? displayAreas
                  : currentArea
                    ? [currentArea]
                    : []
              }
              onAreaClick={(areaId) => navigateToArea(areaId)}
              calculateProgress={calculateDomainProgress}
              centerLabel={currentArea?.name || 'Life'}
              onCenterClick={currentArea ? navigateUp : undefined}
            />

            <div className="mt-4 text-center">
              <p className="text-slate-500 text-sm">
                {displayAreas.length > 0
                  ? `${displayAreas.length} domain${displayAreas.length !== 1 ? 's' : ''} • Click an axis to focus • Set metrics to see progress`
                  : currentArea
                    ? 'Single domain — add subdomains or set a metric here.'
                    : 'Select a domain in the list or add domains to see your radar.'
                }
              </p>
            </div>
          </section>

          <section
            aria-label="Character and domains"
            className="lg:col-span-5 order-2"
          >
            <CharacterCard
              areas={state.areas}
              calculateProgress={calculateDomainProgress}
            >
              {state.pinnedAreaIds.length > 0 && (
                <div className="mb-3 pb-3 border-b border-indigo-100">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700/80">
                    Pinned
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {state.pinnedAreaIds.map((id) => {
                      const area = findArea(state.areas, id);
                      if (!area) return null;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => navigateToArea(id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100/80 text-indigo-800 transition-colors"
                        >
                          {area.icon && <span>{area.icon}</span>}
                          <span className="truncate max-w-[120px]">{area.name}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePin(id);
                            }}
                            className="p-0.5 -mr-0.5 rounded hover:bg-indigo-200/80 text-amber-600"
                            aria-label="Unpin"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </button>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <DomainTree
                areas={state.areas}
                selectedAreaId={state.currentAreaId}
                onSelect={navigateToArea}
                calculateProgress={calculateDomainProgress}
                showGamification={false}
                onMoveArea={moveArea}
                nested
                onEditArea={(area) => setAreaToEdit(area)}
              />
              <button
                type="button"
                onClick={() => setIsAddingArea(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[6px] border-2 border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100/80 text-indigo-800 text-sm font-medium shadow-[2px_2px_0_rgba(99,102,241,0.35)] active:shadow-[1px_1px_0_rgba(99,102,241,0.5)] transition-all mt-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add domain
              </button>
            </CharacterCard>
          </section>
        </div>
      </main>

      <DomainModal
        isOpen={isDomainModalOpen}
        mode={areaToEdit != null ? 'edit' : 'add'}
        onClose={() => {
          setIsAddingArea(false);
          setAreaToEdit(null);
        }}
        parentName={currentArea?.name}
        parentId={currentArea?.id ?? null}
        area={areaToEdit}
        onAdd={
          isDomainModalOpen && areaToEdit == null
            ? (name, color, initial) => {
                addArea(currentArea?.id ?? null, name, color, initial);
                setIsAddingArea(false);
              }
            : undefined
        }
        onUpdateArea={areaToEdit ? updateArea : undefined}
        onUpdateDomainMetric={areaToEdit ? updateDomainMetric : undefined}
        onDeleteRequest={
          areaToEdit
            ? (id) => {
                setAreaToDeleteId(id);
                setAreaToEdit(null);
              }
            : undefined
        }
        isPinned={areaToEdit ? state.pinnedAreaIds.includes(areaToEdit.id) : false}
        onTogglePin={areaToEdit ? togglePin : undefined}
      />

      {showSettings && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSettings(false)}
          aria-hidden="true"
        />
      )}

      {areaToDeleteId && (() => {
        const areaToDelete = findAreaById(state.areas, areaToDeleteId);
        if (!areaToDelete) return null;
        return (
          <DeleteAreaDialog
            areaName={areaToDelete.name}
            onConfirm={() => {
              deleteArea(areaToDeleteId);
              setAreaToDeleteId(null);
            }}
            onCancel={() => setAreaToDeleteId(null)}
          />
        );
      })()}
    </div>
  );
}

export default App;

interface DeleteAreaDialogProps {
  areaName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteAreaDialog = ({
  areaName,
  onConfirm,
  onCancel,
}: DeleteAreaDialogProps) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
    role="dialog"
    aria-modal="true"
    aria-label="Delete domain"
    onClick={onCancel}
  >
    <div
      className="bg-white border-2 border-slate-200 rounded-xl p-5 w-full max-w-sm shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-lg font-semibold mb-3 text-rose-600">Delete domain</h2>
      <p className="text-sm text-slate-700 mb-2">
        Are you sure you want to delete <span className="font-semibold">{areaName}</span> and
        all of its subdomains?
      </p>
      <p className="text-xs text-slate-500 mb-4">
        This cannot be undone.
      </p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm rounded-lg text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="px-3 py-1.5 text-sm rounded-lg bg-rose-500 hover:bg-rose-600 text-white"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);
