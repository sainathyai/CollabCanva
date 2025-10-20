import { FC, useState } from 'react'

interface TopToolbarProps {
  isAuthenticated: boolean
  isViewer?: boolean
  objectCount: number
  selectedCount: number
  hasSelection: boolean
  onDuplicate: () => void
  onColorChange: (color: string) => void
  onDeleteSelected: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onPanReset: () => void
  onCreateRandomObjects: (count: number) => void
  showGrid: boolean
  onToggleGrid: () => void
  snapToGrid: boolean
  onToggleSnap: () => void
  isPanning: boolean
  onTogglePan: () => void
  onFitAll: () => void
  onExportPNG: () => void
  onOpenTemplates: () => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onSave: () => void
  hasUnsavedChanges: boolean
  isSaving: boolean
}

/**
 * Top toolbar with edit controls, zoom, and status
 */
const TopToolbar: FC<TopToolbarProps> = ({
  isAuthenticated,
  isViewer = false,
  objectCount,
  selectedCount,
  hasSelection,
  onDuplicate,
  onColorChange,
  onDeleteSelected,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onPanReset: _onPanReset,
  onCreateRandomObjects,
  showGrid,
  onToggleGrid,
  snapToGrid,
  onToggleSnap,
  isPanning,
  onTogglePan,
  onFitAll,
  onExportPNG,
  onOpenTemplates,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  hasUnsavedChanges,
  isSaving
}) => {
  const isDisabled = !isAuthenticated || isViewer
  const [randomCount, setRandomCount] = useState(5)

  const handleCreateRandom = () => {
    if (randomCount > 0 && randomCount <= 100) {
      onCreateRandomObjects(randomCount)
    }
  }
  return (
    <div className="top-toolbar">
      {/* Left Section - Edit Tools */}
      <div className="top-toolbar-section">
        <span className="top-toolbar-label">Edit</span>
        <div className="top-toolbar-group">
          <div className="top-tool-item">
            <button
              className={`top-tool-btn ${isSaving ? 'saving' : ''} ${hasUnsavedChanges ? 'unsaved' : 'saved'}`}
              onClick={onSave}
              disabled={isDisabled || isSaving}
              title={isViewer ? "Viewers cannot save" : hasUnsavedChanges ? "Save Changes (Cmd+S)" : "All Changes Saved"}
            >
              <svg width="35" height="35" viewBox="0 0 32 32">
                {isSaving ? (
                  <g className="saving-spinner">
                    <circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="15 50" />
                  </g>
                ) : hasUnsavedChanges ? (
                  <>
                    <rect x="8" y="6" width="16" height="20" fill="none" stroke="currentColor" strokeWidth="2" rx="1" />
                    <rect x="8" y="6" width="16" height="6" fill="currentColor" opacity="0.3" />
                    <line x1="11" y1="16" x2="21" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="11" y1="20" x2="21" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="24" cy="8" r="3" fill="#ff4444" stroke="white" strokeWidth="1.5" />
                  </>
                ) : (
                  <>
                    <rect x="8" y="6" width="16" height="20" fill="none" stroke="currentColor" strokeWidth="2" rx="1" />
                    <rect x="8" y="6" width="16" height="6" fill="currentColor" opacity="0.3" />
                    <line x1="11" y1="16" x2="21" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="11" y1="20" x2="21" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M23 10 L20 13 L18 11" fill="none" stroke="#44ff44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </>
                )}
              </svg>
            </button>
            <span className="top-tool-label">
              {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save' : 'Saved'}
            </span>
          </div>

          <div className="top-tool-item">
            <button
              className="top-tool-btn"
              onClick={onUndo}
              disabled={!canUndo || isDisabled}
              title={isViewer ? "Viewers cannot undo" : "Undo (Cmd+Z)"}
            >
              <svg width="35" height="35" viewBox="0 0 32 32">
                <path d="M20 10 L10 16 L20 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 16 L24 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <span className="top-tool-label">Undo</span>
          </div>

          <div className="top-tool-item">
            <button
              className="top-tool-btn"
              onClick={onRedo}
              disabled={!canRedo || isDisabled}
              title={isViewer ? "Viewers cannot redo" : "Redo (Cmd+Shift+Z)"}
            >
              <svg width="35" height="35" viewBox="0 0 32 32">
                <path d="M12 10 L22 16 L12 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 16 L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <span className="top-tool-label">Redo</span>
          </div>

          <div className="top-tool-item">
            <button
              className="top-tool-btn"
              onClick={onDuplicate}
              disabled={selectedCount === 0 || isDisabled}
              title={isViewer ? "Viewers cannot edit" : "Duplicate (Ctrl+D)"}
            >
              <svg width="35" height="35" viewBox="0 0 32 32">
                <rect x="8" y="8" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" rx="1" />
                <rect x="12" y="12" width="12" height="12" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" rx="1" />
              </svg>
            </button>
            <span className="top-tool-label">Duplicate</span>
          </div>

          <div className="top-tool-item">
            <button
              className="top-tool-btn"
              onClick={onDeleteSelected}
              disabled={!hasSelection || isDisabled}
              title={isViewer ? "Viewers cannot delete" : "Delete (Del)"}
            >
              <svg width="35" height="35" viewBox="0 0 32 32">
                <path d="M12 12 L20 20 M20 12 L12 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <rect x="8" y="10" width="16" height="14" fill="none" stroke="currentColor" strokeWidth="2" rx="2" />
              </svg>
            </button>
            <span className="top-tool-label">Delete</span>
          </div>

          <div className="top-tool-item">
            <div className="top-tool-btn color-tool" title={isViewer ? "Viewers cannot edit colors" : "Change Color"}>
              <input
                type="color"
                onChange={(e) => onColorChange(e.target.value)}
                disabled={selectedCount === 0 || isDisabled}
                className="color-input"
                id="top-color-picker"
              />
              <label htmlFor="top-color-picker" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                <svg width="35" height="35" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="8" fill="currentColor" opacity="0.8" />
                  <circle cx="16" cy="16" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </label>
            </div>
            <span className="top-tool-label">Color</span>
          </div>
        </div>
      </div>

      {/* Center Section - View Controls */}
      <div className="top-toolbar-section">
        <span className="top-toolbar-label">View</span>
        <div className="top-toolbar-group">
          <div className="top-tool-item">
            <button
              className="top-tool-btn"
              onClick={onZoomIn}
              title="Zoom In (+)"
            >
              <svg width="35" height="35" viewBox="0 0 32 32">
                <circle cx="14" cy="14" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                <line x1="14" y1="10" x2="14" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="10" y1="14" x2="18" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="20" x2="26" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <span className="top-tool-label">Zoom In</span>
          </div>

          <div className="top-tool-item">
            <button
              className="top-tool-btn"
              onClick={onZoomOut}
              title="Zoom Out (-)"
            >
              <svg width="35" height="35" viewBox="0 0 32 32">
                <circle cx="14" cy="14" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                <line x1="10" y1="14" x2="18" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="20" x2="26" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <span className="top-tool-label">Zoom Out</span>
          </div>

          <div className="top-tool-item">
            <button
              className="top-tool-btn"
              onClick={onZoomReset}
              title="Reset Zoom & Pan (Home)"
            >
              <svg width="35" height="35" viewBox="0 0 32 32">
                <path d="M16 6 L6 14 L6 26 L12 26 L12 20 L20 20 L20 26 L26 26 L26 14 Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="top-tool-label">Home</span>
          </div>

          <div className="top-tool-item">
            <button
              className={`top-tool-btn ${showGrid ? 'active' : ''}`}
              onClick={onToggleGrid}
              title="Toggle Grid (G)"
            >
              <svg width="35" height="35" viewBox="0 0 32 32">
                <rect x="8" y="8" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x="17" y="8" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x="8" y="17" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x="17" y="17" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            <span className="top-tool-label">Grid</span>
          </div>

          <div className="top-tool-item">
            <button
              className={`top-tool-btn ${snapToGrid ? 'active' : ''}`}
              onClick={onToggleSnap}
              title="Snap to Grid (S)"
            >
              <svg width="35" height="35" viewBox="0 0 32 32">
                <rect x="8" y="8" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x="17" y="8" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x="8" y="17" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x="17" y="17" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="16" cy="16" r="3" fill="currentColor" />
              </svg>
            </button>
            <span className="top-tool-label">Snap</span>
          </div>

          <div className="top-tool-item">
            <button
              className={`top-tool-btn ${isPanning ? 'active' : ''}`}
              onClick={onTogglePan}
              title="Pan Mode (Space)"
            >
              <svg width="35" height="35" viewBox="0 0 32 32">
                <path d="M16 8 L16 18 M16 18 L20 14 M16 18 L12 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="16" cy="22" r="2" fill="currentColor" />
                <path d="M10 8 L10 15 M22 8 L22 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <span className="top-tool-label">Pan</span>
          </div>

          <div className="top-tool-item">
            <button
              className="top-tool-btn"
              onClick={onFitAll}
              title="Fit All Objects (F)"
              disabled={objectCount === 0}
            >
              <svg width="35" height="35" viewBox="0 0 32 32">
                <rect x="8" y="8" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
                <path d="M4 4 L4 8 M4 4 L8 4 M28 4 L28 8 M28 4 L24 4 M4 28 L4 24 M4 28 L8 28 M28 28 L28 24 M28 28 L24 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <span className="top-tool-label">Fit All</span>
          </div>

          <div className="top-tool-item">
            <button
              className="top-tool-btn"
              onClick={onExportPNG}
              title="Export Canvas as PNG (Cmd+Shift+E)"
              disabled={objectCount === 0}
            >
              <svg width="35" height="35" viewBox="0 0 32 32">
                <path d="M16 4 L16 18 M16 18 L12 14 M16 18 L20 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="6" y="22" width="20" height="6" fill="none" stroke="currentColor" strokeWidth="2" rx="1" />
                <line x1="10" y1="25" x2="22" y2="25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <span className="top-tool-label">Export PNG</span>
          </div>

          <div className="top-tool-item">
            <button
              className="top-tool-btn"
              onClick={onOpenTemplates}
              title="Load Template (Cmd+Shift+T)"
              disabled={isDisabled}
            >
              <svg width="35" height="35" viewBox="0 0 32 32">
                <rect x="6" y="6" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" rx="2" />
                <line x1="12" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="16" x2="18" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="20" x2="16" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="24" cy="24" r="4" fill="#FFD700" stroke="white" strokeWidth="1.5" />
                <text x="24" y="27" textAnchor="middle" fontSize="5" fill="white">✨</text>
              </svg>
            </button>
            <span className="top-tool-label">Templates</span>
          </div>

        </div>
      </div>

      {/* Random Objects Generator */}
      <div className="top-toolbar-section">
        <div className="top-toolbar-group random-generator">
          <input
            type="number"
            min="1"
            max="100"
            value={randomCount}
            onChange={(e) => setRandomCount(Number(e.target.value))}
            className="random-count-input"
            disabled={isDisabled}
            title="Number of random objects (1-100)"
          />
          <button
            className="btn-create-random"
            onClick={handleCreateRandom}
            disabled={isDisabled || randomCount < 1 || randomCount > 100}
            title={isViewer ? "Viewers cannot create objects" : "Generate random objects"}
          >
            Generate
          </button>
        </div>
      </div>

      {/* Right Section - Canvas Info */}
      <div className="top-toolbar-section top-toolbar-status">
        <div className="status-info-stacked">
          <div className="status-info-row">
            <span className="status-info-label-inline">Objects:</span>
            <span className="status-info-value">{objectCount}</span>
          </div>
          <div className="status-info-row">
            <span className="status-info-label-inline">Selected:</span>
            <span className="status-info-value">{selectedCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopToolbar

