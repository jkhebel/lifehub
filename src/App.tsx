import { useState } from 'react';
import {
  BullseyeDiagram,
  TrackerPanel,
  Breadcrumbs,
  AddAreaModal,
  DomainTree,
  CharacterCard,
} from './components';
import { useDashboard } from './hooks/useDashboard';

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
    deleteArea,
    moveArea,
    addTracker,
    updateTracker,
    deleteTracker,
    calculateAreaProgress,
    resetData,
  } = useDashboard();

  const [isAddingArea, setIsAddingArea] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [renameAreaId, setRenameAreaId] = useState<string | null>(null);
  const [areaToDeleteId, setAreaToDeleteId] = useState<string | null>(null);
  const [showGamification, setShowGamification] = useState(true);

  const breadcrumbs = getBreadcrumbAreas();

  const handleAddArea = (name: string, color: string, icon?: string) => {
    addArea(currentArea?.id || null, name, color);
    // If icon provided, update the area (simplified - in real app would pass icon to addArea)
    if (icon) {
      // The addArea creates the area, we'd need to get its ID to update
      // For now, icon is handled in the modal
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-amber-50 to-pink-50 text-slate-900">
      {/* Header */}
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

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddingArea(true)}
                className="flex items-center gap-2 px-3 py-2 bg-sky-500 hover:bg-sky-600 rounded-[6px] border border-sky-600/60 shadow-[3px_3px_0_0_rgba(37,99,235,0.6)] active:shadow-[1px_1px_0_0_rgba(37,99,235,0.6)] text-sm font-semibold text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Add Area</span>
              </button>

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
          </div>

          {/* Mobile breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div className="sm:hidden mt-3">
              <Breadcrumbs areas={breadcrumbs} onNavigate={navigateToArea} />
            </div>
          )}
        </div>
      </header>

      {/* Settings dropdown */}
      {showSettings && (
        <div
          id="settings-panel"
          role="dialog"
          aria-modal="false"
          aria-label="Settings"
          className="absolute right-4 top-16 bg-white border border-indigo-100 rounded-xl shadow-[4px_4px_0_0_rgba(129,140,248,0.6)] z-50 p-4 w-72"
        >
          <h3 className="font-medium mb-2">Settings</h3>
          <p className="text-slate-500 text-xs mb-4">
            Tune how Life Dashboard feels. Changes affect only this browser.
          </p>

          <div className="space-y-3">
            <label className="flex items-start gap-2 text-sm text-slate-800">
              <input
                type="checkbox"
                className="mt-1 rounded border-indigo-300 bg-indigo-50 text-sky-700 focus:ring-sky-500"
                checked={showGamification}
                onChange={(e) => setShowGamification(e.target.checked)}
              />
              <span>
                Show levels and badges
                <span className="block text-xs text-slate-500">
                  Toggle RPG-style elements in the character card while keeping stats intact.
                </span>
              </span>
            </label>

            <button
              onClick={() => {
                if (confirm('Reset all areas and trackers to the built-in defaults? This cannot be undone.')) {
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
              Your configuration and progress are stored locally in this browser only.
            </p>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Top row: radar chart (left) and quick summary (right) */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start mb-8">
          {/* Radar chart section */}
          <section
            aria-label="Radar chart overview"
            className="lg:col-span-7 flex flex-col items-center order-1"
          >
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 self-start">
              Radar
            </h2>
            {/* Current area info */}
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
              areas={displayAreas}
              onAreaClick={(areaId) => navigateToArea(areaId)}
              calculateProgress={calculateAreaProgress}
              centerLabel={currentArea?.name || 'Life'}
              onCenterClick={currentArea ? navigateUp : undefined}
            />

            {/* Legend / Sub-areas count */}
            <div className="mt-4 text-center">
              <p className="text-slate-500 text-sm">
                {displayAreas.length === 0
                  ? 'No sub-areas yet. Use “Add Area” to start mapping this part of your life.'
                  : `${displayAreas.length} area${displayAreas.length !== 1 ? 's' : ''} • Click an axis to focus and log trackers`}
              </p>
            </div>

            {/* Area actions when viewing an area */}
            {currentArea && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setRenameAreaId(currentArea.id)}
                  className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-indigo-50 rounded-[6px] border border-indigo-100 transition-colors"
                >
                  Rename
                </button>
                <button
                  onClick={() => setAreaToDeleteId(currentArea.id)}
                  className="px-3 py-1.5 text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-[6px] border border-rose-200 transition-colors"
                >
                  Delete Area
                </button>
              </div>
            )}
          </section>

          {/* Right column: Character + merged Domains tree */}
          <section
            aria-label="Character and domains"
            className="lg:col-span-5 space-y-4 order-2"
          >
            <CharacterCard
              areas={state.areas}
              calculateProgress={calculateAreaProgress}
              showGamification={showGamification}
            />
            <DomainTree
              areas={state.areas}
              selectedAreaId={state.currentAreaId}
              onSelect={navigateToArea}
              calculateProgress={calculateAreaProgress}
              showGamification={showGamification}
              onMoveArea={moveArea}
            />
          </section>
        </div>

        {/* Lower row: trackers only */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <section
            aria-label="Trackers and editors"
            className="lg:col-span-12"
          >
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Trackers
            </h2>
            <TrackerPanel
              area={currentArea}
              onUpdateArea={updateArea}
              onUpdateTracker={updateTracker}
              onDeleteTracker={deleteTracker}
              onAddTracker={addTracker}
              calculateProgress={calculateAreaProgress}
            />
          </section>
        </div>
      </main>

      {/* Add Area Modal */}
      <AddAreaModal
        isOpen={isAddingArea}
        onClose={() => setIsAddingArea(false)}
        onAdd={handleAddArea}
        parentName={currentArea?.name}
      />

      {/* Click outside to close settings */}
      {showSettings && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSettings(false)}
          aria-hidden="true"
        />
      )}

      {/* Rename area dialog */}
      {renameAreaId && (
        <RenameAreaDialog
          areaId={renameAreaId}
          onClose={() => setRenameAreaId(null)}
          onRename={(newName) => {
            updateArea(renameAreaId, { name: newName });
            setRenameAreaId(null);
          }}
          currentName={currentArea?.id === renameAreaId ? currentArea.name : undefined}
        />
      )}

      {/* Delete area dialog */}
      {areaToDeleteId && currentArea && currentArea.id === areaToDeleteId && (
        <DeleteAreaDialog
          areaName={currentArea.name}
          onConfirm={() => {
            navigateUp();
            deleteArea(currentArea.id);
            setAreaToDeleteId(null);
          }}
          onCancel={() => setAreaToDeleteId(null)}
        />
      )}
    </div>
  );
}

export default App;

interface RenameAreaDialogProps {
  areaId: string;
  currentName?: string;
  onRename: (newName: string) => void;
  onClose: () => void;
}

const RenameAreaDialog = ({
  currentName,
  onRename,
  onClose,
}: RenameAreaDialogProps) => {
  const [value, setValue] = useState(currentName ?? '');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      role="dialog"
      aria-modal="true"
      aria-label="Rename area"
      onClick={onClose}
    >
      <div
        className="bg-white border-2 border-slate-200 rounded-xl p-5 w-full max-w-sm shadow-[4px_4px_0_rgba(148,163,184,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Rename area</h2>
        <p className="text-sm text-slate-500 mb-3">
          Give this part of your life a clearer name. This won&apos;t affect its trackers.
        </p>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-sky-500"
          autoFocus
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!value.trim()}
            onClick={() => {
              const trimmed = value.trim();
              if (trimmed) onRename(trimmed);
            }}
            className="px-3 py-1.5 text-sm rounded-lg bg-sky-500 disabled:bg-slate-300 disabled:text-slate-500 hover:bg-sky-600 text-white transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

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
    aria-label="Delete area"
    onClick={onCancel}
  >
    <div
      className="bg-white border-2 border-slate-200 rounded-xl p-5 w-full max-w-sm shadow-[4px_4px_0_rgba(148,163,184,0.4)]"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-lg font-semibold mb-3 text-rose-600">Delete area</h2>
      <p className="text-sm text-slate-700 mb-2">
        Are you sure you want to delete <span className="font-semibold">{areaName}</span> and
        all of its sub-areas and trackers?
      </p>
      <p className="text-xs text-slate-500 mb-4">
        This action cannot be undone, but you can always recreate the area later.
      </p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="px-3 py-1.5 text-sm rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition-colors"
        >
          Delete area
        </button>
      </div>
    </div>
  </div>
);

