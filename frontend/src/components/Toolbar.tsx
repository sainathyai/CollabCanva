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
 * Toolbar component for canvas operations
 * Provides buttons for adding shapes, duplicating, and modifying objects
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
      <div className="toolbar-section">
        <button 
          className="btn-primary" 
          onClick={onAddRectangle}
          disabled={!isAuthenticated}
          title="Add Rectangle"
        >
          Add Rectangle
        </button>
        {onAddShape && (
          <>
            <button 
              className="btn-primary" 
              onClick={() => onAddShape('circle')}
              disabled={!isAuthenticated}
              title="Add Circle"
            >
              Add Circle
            </button>
            <button 
              className="btn-primary" 
              onClick={() => onAddShape('text')}
              disabled={!isAuthenticated}
              title="Add Text"
            >
              Add Text
            </button>
            <button 
              className="btn-primary" 
              onClick={() => onAddShape('line')}
              disabled={!isAuthenticated}
              title="Add Line"
            >
              Add Line
            </button>
          </>
        )}
      </div>

      <div className="toolbar-section">
        {onDuplicate && (
          <button
            className="btn-secondary"
            onClick={onDuplicate}
            disabled={selectedCount === 0 || !isAuthenticated}
            title={selectedCount === 0 ? 'Select objects first' : 'Duplicate (Ctrl+D)'}
          >
            Duplicate
          </button>
        )}
        <button
          className="btn-secondary"
          onClick={onDeleteSelected}
          disabled={!hasSelection || !isAuthenticated}
          title={!hasSelection ? 'Select an object first' : 'Delete Selected'}
        >
          Delete
        </button>
      </div>

      {onColorChange && (
        <div className="toolbar-section">
          <label className="toolbar-label">
            Color:
            <input
              type="color"
              onChange={(e) => onColorChange(e.target.value)}
              disabled={selectedCount === 0}
              className="color-picker"
              title="Change color of selected objects"
            />
          </label>
        </div>
      )}

      <div className="toolbar-info">
        <span className={isConnected && isAuthenticated ? 'status-connected' : 'status-disconnected'}>
          {isConnected && isAuthenticated ? '● Connected' : isConnected ? '○ Authenticating...' : '○ Disconnected'}
        </span>
        <span className="text-muted">
          Objects: {objectCount}
        </span>
        {selectedCount > 0 && (
          <span className="text-muted">
            Selected: {selectedCount}
          </span>
        )}
      </div>
    </div>
  )
}

export default Toolbar


