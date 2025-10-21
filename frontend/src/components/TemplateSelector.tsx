import { FC, useState } from 'react'
import { templates, getTemplatesByCategory, type Template } from '../lib/templates'
import '../styles/TemplateSelector.css'

interface TemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: Template) => void
}

/**
 * Template Selector Modal
 * Shows all available templates organized by category
 */
export const TemplateSelector: FC<TemplateSelectorProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Template['category'] | 'all'>('all')

  if (!isOpen) return null

  const categories: Array<{ id: Template['category'] | 'all', name: string, emoji: string }> = [
    { id: 'all', name: 'All Templates', emoji: '✨' },
    { id: 'animal', name: 'Animals', emoji: '🐾' },
    { id: 'human', name: 'People', emoji: '👤' },
    { id: 'object', name: 'Objects', emoji: '🏠' },
    { id: 'scene', name: 'Scenes', emoji: '🌅' }
  ]

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : getTemplatesByCategory(selectedCategory)

  const handleSelect = (template: Template) => {
    onSelectTemplate(template)
    onClose()
  }

  return (
    <div className="template-modal-overlay" onClick={onClose}>
      <div className="template-modal" onClick={(e) => e.stopPropagation()}>
        <div className="template-modal-header">
          <h2>✨ Choose a Template</h2>
          <button className="template-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Category Filter */}
        <div className="template-categories">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`template-category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="category-emoji">{cat.emoji}</span>
              <span className="category-name">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="template-grid">
          {filteredTemplates.length === 0 ? (
            <div className="template-empty">
              <p>No templates found in this category</p>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="template-card"
                onClick={() => handleSelect(template)}
              >
                <div className="template-thumbnail">
                  <span className="template-emoji">{template.thumbnail}</span>
                </div>
                <div className="template-info">
                  <h3 className="template-name">{template.name}</h3>
                  <p className="template-description">{template.description}</p>
                  <div className="template-meta">
                    <span className="template-count">
                      {template.objects.length} objects
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="template-modal-footer">
          <button className="template-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="template-btn-primary" onClick={onClose}>
            Start Blank Canvas
          </button>
        </div>
      </div>
    </div>
  )
}

