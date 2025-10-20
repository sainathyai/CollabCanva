import { FC } from 'react'
import '../styles/ShortcutsHelp.css'

interface ShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

interface Shortcut {
  keys: string[]
  description: string
}

interface ShortcutCategory {
  category: string
  shortcuts: Shortcut[]
}

const shortcutData: ShortcutCategory[] = [
  {
    category: 'Edit',
    shortcuts: [
      { keys: ['Cmd', 'Z'], description: 'Undo' },
      { keys: ['Cmd', 'Shift', 'Z'], description: 'Redo' },
      { keys: ['Ctrl', 'D'], description: 'Duplicate selected objects' },
      { keys: ['Del'], description: 'Delete selected objects' },
      { keys: ['Backspace'], description: 'Delete selected objects' },
      { keys: ['Ctrl', 'C'], description: 'Copy selected objects' },
      { keys: ['Ctrl', 'X'], description: 'Cut selected objects' },
      { keys: ['Ctrl', 'V'], description: 'Paste objects' },
      { keys: ['Ctrl', 'A'], description: 'Select all objects' },
      { keys: ['Ctrl', 'Shift', 'C'], description: 'Align selected to center' },
      { keys: ['Esc'], description: 'Deselect all' }
    ]
  },
  {
    category: 'View',
    shortcuts: [
      { keys: ['+', '='], description: 'Zoom in' },
      { keys: ['-'], description: 'Zoom out' },
      { keys: ['Home'], description: 'Reset zoom and pan' },
      { keys: ['F'], description: 'Fit all objects in view' },
      { keys: ['G'], description: 'Toggle grid' },
      { keys: ['S'], description: 'Toggle snap to grid' },
      { keys: ['Space'], description: 'Pan mode (hold)' }
    ]
  },
  {
    category: 'Movement',
    shortcuts: [
      { keys: ['↑'], description: 'Move selected up (1px)' },
      { keys: ['↓'], description: 'Move selected down (1px)' },
      { keys: ['←'], description: 'Move selected left (1px)' },
      { keys: ['→'], description: 'Move selected right (1px)' },
      { keys: ['Shift', '↑↓←→'], description: 'Move selected (10px)' }
    ]
  },
  {
    category: 'Help',
    shortcuts: [
      { keys: ['?'], description: 'Show this help dialog' }
    ]
  }
]

export const ShortcutsHelp: FC<ShortcutsHelpProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2>⌨️ Keyboard Shortcuts</h2>
          <button className="shortcuts-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="shortcuts-content">
          {shortcutData.map((category) => (
            <div key={category.category} className="shortcuts-category">
              <h3 className="shortcuts-category-title">{category.category}</h3>
              <div className="shortcuts-list">
                {category.shortcuts.map((shortcut, index) => (
                  <div key={index} className="shortcut-item">
                    <div className="shortcut-keys">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex}>
                          <kbd className="shortcut-key">{key}</kbd>
                          {keyIndex < shortcut.keys.length - 1 && <span className="shortcut-plus">+</span>}
                        </span>
                      ))}
                    </div>
                    <div className="shortcut-description">{shortcut.description}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="shortcuts-footer">
          <p>Press <kbd className="shortcut-key">?</kbd> or <kbd className="shortcut-key">Esc</kbd> to close</p>
        </div>
      </div>
    </div>
  )
}

