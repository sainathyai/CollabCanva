import { FC } from 'react'
import type { Presence } from '../types'

interface CursorOverlayProps {
  presences: Presence[]
  currentUserId?: string
}

/**
 * Renders remote user cursors with name labels
 */
const CursorOverlay: FC<CursorOverlayProps> = ({ presences, currentUserId }) => {
  return (
    <div className="cursor-overlay">
      {presences.map((presence) => {
        // Don't show current user's cursor
        if (presence.userId === currentUserId) {
          return null
        }

        return (
          <div
            key={presence.userId}
            className="remote-cursor"
            style={{
              position: 'absolute',
              left: `${presence.x}px`,
              top: `${presence.y}px`,
              pointerEvents: 'none',
              zIndex: 1000,
              transition: 'left 0.1s ease-out, top 0.1s ease-out'
            }}
          >
            {/* Cursor SVG */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
              }}
            >
              <path
                d="M5.65376 12.3673L13.5644 20.2779L15.0158 17.1823L20.3268 18.0012L18.2567 12.1836L21.3523 10.7322L13.4417 2.82153L5.65376 12.3673Z"
                fill={presence.color}
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>

            {/* User name label */}
            <div
              className="cursor-label"
              style={{
                position: 'absolute',
                left: '20px',
                top: '20px',
                background: presence.color,
                color: 'white',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              {presence.displayName}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CursorOverlay

