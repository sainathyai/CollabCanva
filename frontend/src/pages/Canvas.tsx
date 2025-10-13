import { useEffect, useState } from 'react'
import type { CanvasObject } from '../types'

function Canvas() {
  const [objects] = useState<CanvasObject[]>([])

  useEffect(() => {
    // TODO: Connect to WebSocket in PR5
    console.log('WebSocket connection - to be implemented in PR5')
  }, [])

  const handleAddRectangle = () => {
    // TODO: Send object.create message via WebSocket in PR6
    console.log('Add rectangle - to be implemented in PR6')
  }

  return (
    <div className="canvas-page">
      <div className="canvas-toolbar">
        <button className="btn-primary" onClick={handleAddRectangle}>
          Add Rectangle
        </button>
        <div className="toolbar-info">
          <span className="text-muted">
            Canvas functionality will be implemented in PR5-PR6
          </span>
        </div>
      </div>

      <div className="canvas-container">
        <div className="canvas-placeholder">
          <h2>Canvas Area</h2>
          <p>Real-time collaborative canvas</p>
          <p className="text-muted">Objects: {objects.length}</p>
        </div>
      </div>
    </div>
  )
}

export default Canvas

