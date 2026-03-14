import { useState } from 'react';
import {
  BullseyeDiagram,
  TrackerPanel,
  Breadcrumbs,
  AddAreaModal,
  DomainTree,
  CharacterCard,
  AchievementsPanel,
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
    deleteArea,
    moveArea,
    addTracker,
    updateTracker,
    deleteTracker,
    addAchievement,
    completeAchievement,
    getCompletionCount,
    isAchievementCompleted,
    setSelectedAvatar,
    setSelectedTitle,
    calculateAreaProgress,
    calculateMilestoneProgress,
    resetData,
  } = useDashboard();

  const [isAddingArea, setIsAddingArea] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [areaToDeleteId, setAreaToDeleteId] = useState<string | null>(null);
  const [showGamification, setShowGamification] = useState(true);
  const [radarView, setRadarView] = useState<'trackers' | 'milestones'>('trackers');
  const [xpToast, setXpToast] = useState<number | null>(null);

  const breadcrumbs = getBreadcrumbAreas();

  const handleXpGained = (amount: number) => {
    setXpToast(amount);
    setTimeout(() => setXpToast(null), 2000);
  };

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
            <div className="flex items-center justify-between w-full mb-3">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Radar
              </h2>
              <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden" role="group" aria-label="Radar progress view">
                <button
                  type="button"
                  onClick={() => setRadarView('trackers')}
                  className={`px-3 py-1.5 text-sm transition-colors ${
                    radarView === 'trackers'
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  By trackers
                </button>
                <button
                  type="button"
                  onClick={() => setRadarView('milestones')}
                  className={`px-3 py-1.5 text-sm transition-colors ${
                    radarView === 'milestones'
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  By milestones
                </button>
              </div>
            </div>
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
              areas={
                displayAreas.length > 0
                  ? displayAreas
                  : currentArea
                    ? [currentArea]
                    : []
              }
              onAreaClick={(areaId) => navigateToArea(areaId)}
              calculateProgress={radarView === 'milestones' ? calculateMilestoneProgress : calculateAreaProgress}
              centerLabel={currentArea?.name || 'Life'}
              onCenterClick={currentArea ? navigateUp : undefined}
            />

            {/* Legend / Sub-areas count */}
            <div className="mt-4 text-center space-y-1">
              <p className="text-slate-500 text-sm">
                {displayAreas.length > 0
                  ? `${displayAreas.length} area${displayAreas.length !== 1 ? 's' : ''} • Click an axis to focus and log trackers`
                  : currentArea
                    ? 'Single domain — add sub-areas or log trackers here.'
                    : 'Select a domain in the list or add areas to see your radar.'
                }
              </p>
              {radarView === 'milestones' && (
                <p className="text-slate-400 text-xs">
                  Add milestones in each domain (Milestones & tasks panel) to see progress here.
                </p>
              )}
            </div>

          </section>

          {/* Right column: Character card (with Domains + Add Area inside) */}
          <section
            aria-label="Character and domains"
            className="lg:col-span-5 order-2"
          >
            <CharacterCard
              areas={state.areas}
              calculateProgress={calculateAreaProgress}
              showGamification={showGamification}
              gamification={state.gamification}
              onSelectAvatar={setSelectedAvatar}
              onSelectTitle={setSelectedTitle}
            >
              <DomainTree
                areas={state.areas}
                selectedAreaId={state.currentAreaId}
                onSelect={navigateToArea}
                calculateProgress={calculateAreaProgress}
                showGamification={showGamification}
                onMoveArea={moveArea}
                nested
              />
              <button
                type="button"
                onClick={() => setIsAddingArea(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[6px] border-2 border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100/80 text-indigo-800 text-sm font-medium shadow-[2px_2px_0_rgba(99,102,241,0.35)] active:shadow-[1px_1px_0_rgba(99,102,241,0.5)] transition-all mt-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Area
              </button>
            </CharacterCard>
          </section>
        </div>

        {/* Lower row: trackers and achievements */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <section
            aria-label="Trackers and editors"
            className="lg:col-span-7"
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
              onDeleteAreaRequest={(id) => setAreaToDeleteId(id)}
            />
          </section>
          <section
            aria-label="Milestones and tasks"
            className="lg:col-span-5"
          >
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Milestones & tasks
            </h2>
            <AchievementsPanel
              area={currentArea}
              onAddAchievement={addAchievement}
              onCompleteAchievement={completeAchievement}
              getCompletionCount={getCompletionCount}
              isAchievementCompleted={isAchievementCompleted}
              onXpGained={handleXpGained}
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

      {/* XP gained toast */}
      {xpToast !== null && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold shadow-lg animate-fade-in"
        >
          +{xpToast} XP
        </div>
      )}

      {/* Click outside to close settings */}
      {showSettings && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSettings(false)}
          aria-hidden="true"
        />
      )}

      {/* Delete area dialog */}
      {areaToDeleteId && (() => {
        const areaToDelete = findAreaById(state.areas, areaToDeleteId);
        if (!areaToDelete) return null;
        return (
          <DeleteAreaDialog
            areaName={areaToDelete.name}
            onConfirm={() => {
              if (currentArea?.id === areaToDeleteId) navigateUp();
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

