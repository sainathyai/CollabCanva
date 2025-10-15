import { FC } from 'react'

interface ToolbarProps {
  isConnected: boolean
  isAuthenticated: boolean
  objectCount: number
  hasSelection: boolean
  onAddRectangle: () => void
  onDeleteSelected: () => void
}

/**
 * Toolbar component for canvas operations
 * Provides buttons for adding rectangles and deleting selected objects
 */
const Toolbar: FC<ToolbarProps> = ({
  isConnected,
  isAuthenticated,
  objectCount,
  hasSelection,
  onAddRectangle,
  onDeleteSelected
}) => {
  return (
    <div className="canvas-toolbar">
      <button 
        className="btn-primary" 
        onClick={onAddRectangle}
        disabled={!isAuthenticated}
        title={!isAuthenticated ? 'Please wait for authentication' : 'Add a new rectangle to the canvas'}
      >
        Add Rectangle
      </button>
      <button
        className="btn-secondary"
        onClick={onDeleteSelected}
        disabled={!hasSelection || !isAuthenticated}
        title={!hasSelection ? 'Select an object first' : 'Delete the selected object'}
      >
        Delete Selected
      </button>
      <div className="toolbar-info">
        <span className={isConnected && isAuthenticated ? 'status-connected' : 'status-disconnected'}>
          {isConnected && isAuthenticated ? '● Connected' : isConnected ? '○ Authenticating...' : '○ Disconnected'}
        </span>
        <span className="text-muted">
          Objects: {objectCount}
        </span>
      </div>
    </div>
  )
}

export default Toolbar


