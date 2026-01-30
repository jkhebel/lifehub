import { useState } from 'react';
import { BullseyeDiagram, TrackerPanel, Breadcrumbs, AddAreaModal } from './components';
import { useDashboard } from './hooks/useDashboard';

function App() {
  const {
    currentArea,
    displayAreas,
    navigateToArea,
    navigateUp,
    getBreadcrumbAreas,
    addArea,
    updateArea,
    deleteArea,
    addTracker,
    updateTracker,
    deleteTracker,
    calculateAreaProgress,
    resetData,
  } = useDashboard();

  const [isAddingArea, setIsAddingArea] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
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
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Add Area</span>
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
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
        <div className="absolute right-4 top-16 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 p-4 w-64">
          <h3 className="font-medium mb-3">Settings</h3>
          <button
            onClick={() => {
              if (confirm('Reset all data to defaults? This cannot be undone.')) {
                resetData();
              }
              setShowSettings(false);
            }}
            className="w-full text-left px-3 py-2 text-red-400 hover:bg-slate-700 rounded transition-colors text-sm"
          >
            Reset to Defaults
          </button>
          <p className="text-slate-500 text-xs mt-3">
            Data is stored in your browser's local storage.
          </p>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Bullseye section */}
          <div className="flex flex-col items-center">
            {/* Current area info */}
            {currentArea && (
              <div className="mb-4 text-center">
                <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                  {currentArea.icon && <span>{currentArea.icon}</span>}
                  <span style={{ color: currentArea.color }}>{currentArea.name}</span>
                </h2>
                {currentArea.description && (
                  <p className="text-slate-400 mt-1">{currentArea.description}</p>
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
            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                {displayAreas.length === 0
                  ? 'No sub-areas. Click "Add Area" to create one.'
                  : `${displayAreas.length} area${displayAreas.length !== 1 ? 's' : ''} • Click to navigate`
                }
              </p>
            </div>

            {/* Area actions when viewing an area */}
            {currentArea && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    const newName = prompt('New name:', currentArea.name);
                    if (newName && newName !== currentArea.name) {
                      updateArea(currentArea.id, { name: newName });
                    }
                  }}
                  className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                >
                  Rename
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${currentArea.name}" and all its contents?`)) {
                      navigateUp();
                      deleteArea(currentArea.id);
                    }
                  }}
                  className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700 rounded transition-colors"
                >
                  Delete Area
                </button>
              </div>
            )}
          </div>

          {/* Tracker panel */}
          <div>
            <TrackerPanel
              area={currentArea}
              onUpdateTracker={updateTracker}
              onDeleteTracker={deleteTracker}
              onAddTracker={addTracker}
              calculateProgress={calculateAreaProgress}
            />

            {/* Quick stats when no area selected */}
            {!currentArea && displayAreas.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4">
                {displayAreas.slice(0, 4).map((area) => {
                  const progress = calculateAreaProgress(area);
                  return (
                    <button
                      key={area.id}
                      onClick={() => navigateToArea(area.id)}
                      className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600 transition-all text-left"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {area.icon && <span>{area.icon}</span>}
                        <span className="font-medium" style={{ color: area.color }}>
                          {area.name}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {Math.round(progress)}%
                      </div>
                      <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${progress}%`, backgroundColor: area.color }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
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
        />
      )}
    </div>
  );
}

export default App;
