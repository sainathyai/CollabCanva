import { FC, useState } from 'react'

interface TopToolbarProps {
  isAuthenticated: boolean
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
}

/**
 * Top toolbar with edit controls, zoom, and status
 */
const TopToolbar: FC<TopToolbarProps> = ({
  isAuthenticated,
  objectCount,
  selectedCount,
  hasSelection,
  onDuplicate,
  onColorChange,
  onDeleteSelected,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onPanReset,
  onCreateRandomObjects
}) => {
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
              className="top-tool-btn"
              onClick={onDuplicate}
              disabled={selectedCount === 0 || !isAuthenticated}
              title="Duplicate (Ctrl+D)"
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
              disabled={!hasSelection || !isAuthenticated}
              title="Delete (Del)"
            >
              <svg width="35" height="35" viewBox="0 0 32 32">
                <path d="M12 12 L20 20 M20 12 L12 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <rect x="8" y="10" width="16" height="14" fill="none" stroke="currentColor" strokeWidth="2" rx="2" />
              </svg>
            </button>
            <span className="top-tool-label">Delete</span>
          </div>

          <div className="top-tool-item">
            <div className="top-tool-btn color-tool" title="Change Color">
              <input
                type="color"
                onChange={(e) => onColorChange(e.target.value)}
                disabled={selectedCount === 0}
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
            disabled={!isAuthenticated}
            title="Number of random objects (1-100)"
          />
          <button
            className="btn-create-random"
            onClick={handleCreateRandom}
            disabled={!isAuthenticated || randomCount < 1 || randomCount > 100}
            title="Generate random objects"
          >
            Generate
          </button>
        </div>
      </div>

      {/* Right Section - Canvas Info */}
      <div className="top-toolbar-section top-toolbar-status">
        <div className="status-info">
          <div className="status-info-box">{objectCount}</div>
          <span className="status-info-label">Objects</span>
        </div>
        {selectedCount > 0 && (
          <div className="status-info">
            <div className="status-info-box">{selectedCount}</div>
            <span className="status-info-label">Selected</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default TopToolbar

