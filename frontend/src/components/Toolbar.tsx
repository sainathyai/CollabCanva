import { FC } from 'react'
import type { ShapeType } from '../types'

interface ToolbarProps {
  isConnected: boolean
  isAuthenticated: boolean
  objectCount: number
  hasSelection: boolean
  onAddRectangle: () => void
  onDeleteSelected: () => void
  onAddShape?: (type: ShapeType) => void
  onDuplicate?: () => void
  onColorChange?: (color: string) => void
  selectedCount?: number
}

/**
 * Toolbar component with visual icons for canvas operations
 */
const Toolbar: FC<ToolbarProps> = ({
  isConnected,
  isAuthenticated,
  objectCount,
  hasSelection,
  onAddRectangle,
  onDeleteSelected,
  onAddShape,
  onDuplicate,
  onColorChange,
  selectedCount = 0
}) => {
  return (
    <div className="canvas-toolbar">
      {/* Create Tools */}
      <div className="toolbar-panel">
        <div className="toolbar-panel-title">Create</div>
        <div className="tool-grid">
          <button
            className="tool-btn"
            onClick={onAddRectangle}
            disabled={!isAuthenticated}
            title="Rectangle"
          >
            <svg width="32" height="32" viewBox="0 0 32 32">
              <rect x="6" y="10" width="20" height="12" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" rx="2" />
            </svg>
            <span className="tool-label">Rectangle</span>
          </button>

          {onAddShape && (
            <>
              <button
                className="tool-btn"
                onClick={() => onAddShape('circle')}
                disabled={!isAuthenticated}
                title="Circle"
              >
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="9" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span className="tool-label">Circle</span>
              </button>

              <button
                className="tool-btn"
                onClick={() => onAddShape('text')}
                disabled={!isAuthenticated}
                title="Text"
              >
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <text x="16" y="22" fontSize="18" fill="currentColor" textAnchor="middle" fontWeight="bold">A</text>
                </svg>
                <span className="tool-label">Text</span>
              </button>

              <button
                className="tool-btn"
                onClick={() => onAddShape('line')}
                disabled={!isAuthenticated}
                title="Line"
              >
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <line x1="8" y1="24" x2="24" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="tool-label">Line</span>
              </button>

              <button
                className="tool-btn"
                onClick={() => onAddShape('triangle')}
                disabled={!isAuthenticated}
                title="Triangle"
              >
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <polygon points="16,8 26,24 6,24" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span className="tool-label">Triangle</span>
              </button>

              <button
                className="tool-btn"
                onClick={() => onAddShape('star')}
                disabled={!isAuthenticated}
                title="Star"
              >
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <polygon points="16,6 19,14 28,14 21,19 24,28 16,23 8,28 11,19 4,14 13,14" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span className="tool-label">Star</span>
              </button>

              <button
                className="tool-btn"
                onClick={() => onAddShape('polygon')}
                disabled={!isAuthenticated}
                title="Hexagon"
              >
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <polygon points="16,6 24,11 24,21 16,26 8,21 8,11" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span className="tool-label">Hexagon</span>
              </button>

              <button
                className="tool-btn"
                onClick={() => onAddShape('arrow')}
                disabled={!isAuthenticated}
                title="Arrow"
              >
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <line x1="6" y1="16" x2="24" y2="16" stroke="currentColor" strokeWidth="2" />
                  <polyline points="20,12 24,16 20,20" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span className="tool-label">Arrow</span>
              </button>

              <button
                className="tool-btn"
                onClick={() => onAddShape('ellipse')}
                disabled={!isAuthenticated}
                title="Ellipse"
              >
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <ellipse cx="16" cy="16" rx="10" ry="6" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span className="tool-label">Ellipse</span>
              </button>

              <button
                className="tool-btn"
                onClick={() => onAddShape('roundedRect')}
                disabled={!isAuthenticated}
                title="Rounded Rectangle"
              >
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <rect x="6" y="10" width="20" height="12" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" rx="4" />
                </svg>
                <span className="tool-label">Rounded</span>
              </button>

              <button
                className="tool-btn"
                onClick={() => onAddShape('diamond')}
                disabled={!isAuthenticated}
                title="Diamond"
              >
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <polygon points="16,6 26,16 16,26 6,16" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span className="tool-label">Diamond</span>
              </button>

              <button
                className="tool-btn"
                onClick={() => onAddShape('pentagon')}
                disabled={!isAuthenticated}
                title="Pentagon"
              >
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <polygon points="16,6 27,13 23,25 9,25 5,13" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span className="tool-label">Pentagon</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Edit Tools */}
      <div className="toolbar-panel">
        <div className="toolbar-panel-title">Edit</div>
        <div className="tool-grid">
          {onDuplicate && (
            <button
              className="tool-btn"
              onClick={onDuplicate}
              disabled={selectedCount === 0 || !isAuthenticated}
              title="Duplicate (Ctrl+D)"
            >
              <svg width="32" height="32" viewBox="0 0 32 32">
                <rect x="8" y="8" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" rx="1" />
                <rect x="12" y="12" width="12" height="12" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" rx="1" />
              </svg>
              <span className="tool-label">Duplicate</span>
            </button>
          )}

          <button
            className="tool-btn"
            onClick={onDeleteSelected}
            disabled={!hasSelection || !isAuthenticated}
            title="Delete (Del)"
          >
            <svg width="32" height="32" viewBox="0 0 32 32">
              <path d="M12 12 L20 20 M20 12 L12 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <rect x="8" y="10" width="16" height="14" fill="none" stroke="currentColor" strokeWidth="2" rx="2" />
            </svg>
            <span className="tool-label">Delete</span>
          </button>

          {onColorChange && (
            <div className="tool-btn color-tool" title="Change Color">
              <input
                type="color"
                onChange={(e) => onColorChange(e.target.value)}
                disabled={selectedCount === 0}
                className="color-input"
                id="color-picker"
              />
              <label htmlFor="color-picker" className="color-label">
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="8" fill="currentColor" opacity="0.8" />
                  <circle cx="16" cy="16" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span className="tool-label">Color</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Status Info */}
      <div className="toolbar-info">
        <span className={isConnected && isAuthenticated ? 'status-connected' : 'status-disconnected'}>
          {isConnected && isAuthenticated ? '● Connected' : isConnected ? '○ Authenticating...' : '○ Disconnected'}
        </span>
        <span className="text-muted">Objects: {objectCount}</span>
        {selectedCount > 0 && (
          <span className="text-muted">Selected: {selectedCount}</span>
        )}
      </div>
    </div>
  )
}

export default Toolbar


