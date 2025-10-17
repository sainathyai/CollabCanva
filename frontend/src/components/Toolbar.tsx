import { FC } from 'react'
import type { ShapeType } from '../types'

interface ToolbarProps {
  isAuthenticated: boolean
  isViewer?: boolean
  onAddRectangle: () => void
  onAddShape?: (type: ShapeType) => void
}

/**
 * Left floating toolbar with create tools only
 */
const Toolbar: FC<ToolbarProps> = ({
  isAuthenticated,
  isViewer = false,
  onAddRectangle,
  onAddShape
}) => {
  const isDisabled = !isAuthenticated || isViewer
  return (
    <div className="canvas-toolbar">
      {/* Create Tools */}
      <div className="toolbar-panel">
        <div className="toolbar-panel-title">Create</div>
        <div className="tool-grid">
          <div className="tool-item">
            <button
              className="tool-btn"
              onClick={onAddRectangle}
              disabled={isDisabled}
              title={isViewer ? "Viewers cannot create objects" : "Rectangle"}
            >
              <svg width="32" height="32" viewBox="0 0 32 32">
                <rect x="6" y="10" width="20" height="12" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" rx="2" />
              </svg>
            </button>
            <span className="tool-label">Rectangle</span>
          </div>

          {onAddShape && (
            <>
              <div className="tool-item">
                <button
                  className="tool-btn"
                  onClick={() => onAddShape('circle')}
                  disabled={isDisabled}
                  title="Circle"
                >
                  <svg width="32" height="32" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="9" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
                <span className="tool-label">Circle</span>
              </div>

              <div className="tool-item">
                <button
                  className="tool-btn"
                  onClick={() => onAddShape('text')}
                  disabled={isDisabled}
                  title="Text"
                >
                  <svg width="32" height="32" viewBox="0 0 32 32">
                    <text x="16" y="22" fontSize="18" fill="currentColor" textAnchor="middle" fontWeight="bold">A</text>
                  </svg>
                </button>
                <span className="tool-label">Text</span>
              </div>

              <div className="tool-item">
                <button
                  className="tool-btn"
                  onClick={() => onAddShape('line')}
                  disabled={isDisabled}
                  title="Line"
                >
                  <svg width="32" height="32" viewBox="0 0 32 32">
                    <line x1="8" y1="24" x2="24" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                <span className="tool-label">Line</span>
              </div>

              <div className="tool-item">
                <button
                  className="tool-btn"
                  onClick={() => onAddShape('triangle')}
                  disabled={isDisabled}
                  title="Triangle"
                >
                  <svg width="32" height="32" viewBox="0 0 32 32">
                    <polygon points="16,8 26,24 6,24" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
                <span className="tool-label">Triangle</span>
              </div>

              <div className="tool-item">
                <button
                  className="tool-btn"
                  onClick={() => onAddShape('star')}
                  disabled={isDisabled}
                  title="Star"
                >
                  <svg width="32" height="32" viewBox="0 0 32 32">
                    <polygon points="16,6 19,14 28,14 21,19 24,28 16,23 8,28 11,19 4,14 13,14" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
                <span className="tool-label">Star</span>
              </div>

              <div className="tool-item">
                <button
                  className="tool-btn"
                  onClick={() => onAddShape('polygon')}
                  disabled={isDisabled}
                  title="Hexagon"
                >
                  <svg width="32" height="32" viewBox="0 0 32 32">
                    <polygon points="16,6 24,11 24,21 16,26 8,21 8,11" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
                <span className="tool-label">Hexagon</span>
              </div>

              <div className="tool-item">
                <button
                  className="tool-btn"
                  onClick={() => onAddShape('arrow')}
                  disabled={isDisabled}
                  title="Arrow"
                >
                  <svg width="32" height="32" viewBox="0 0 32 32">
                    <line x1="6" y1="16" x2="24" y2="16" stroke="currentColor" strokeWidth="2" />
                    <polyline points="20,12 24,16 20,20" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
                <span className="tool-label">Arrow</span>
              </div>

              <div className="tool-item">
                <button
                  className="tool-btn"
                  onClick={() => onAddShape('ellipse')}
                  disabled={isDisabled}
                  title="Ellipse"
                >
                  <svg width="32" height="32" viewBox="0 0 32 32">
                    <ellipse cx="16" cy="16" rx="10" ry="6" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
                <span className="tool-label">Ellipse</span>
              </div>

              <div className="tool-item">
                <button
                  className="tool-btn"
                  onClick={() => onAddShape('roundedRect')}
                  disabled={isDisabled}
                  title="Rounded Rectangle"
                >
                  <svg width="32" height="32" viewBox="0 0 32 32">
                    <rect x="6" y="10" width="20" height="12" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" rx="4" />
                  </svg>
                </button>
                <span className="tool-label">Rounded</span>
              </div>

              <div className="tool-item">
                <button
                  className="tool-btn"
                  onClick={() => onAddShape('diamond')}
                  disabled={isDisabled}
                  title="Diamond"
                >
                  <svg width="32" height="32" viewBox="0 0 32 32">
                    <polygon points="16,6 26,16 16,26 6,16" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
                <span className="tool-label">Diamond</span>
              </div>

              <div className="tool-item">
                <button
                  className="tool-btn"
                  onClick={() => onAddShape('pentagon')}
                  disabled={isDisabled}
                  title="Pentagon"
                >
                  <svg width="32" height="32" viewBox="0 0 32 32">
                    <polygon points="16,6 27,13 23,25 9,25 5,13" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
                <span className="tool-label">Pentagon</span>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  )
}

export default Toolbar
