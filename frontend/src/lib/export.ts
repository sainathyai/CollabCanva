/**
 * Canvas Export Utilities
 * Handles exporting canvas to various formats (PNG, SVG, etc.)
 */

import html2canvas from 'html2canvas'

export interface ExportOptions {
  filename?: string
  scale?: number
  backgroundColor?: string
  quality?: number
}

/**
 * Export a Konva stage to PNG
 * @param stageRef - Reference to the Konva stage
 * @param options - Export options
 */
export const exportCanvasToPNG = async (
  stageRef: React.RefObject<any>,
  options: ExportOptions = {}
): Promise<void> => {
  const {
    filename = 'canvas-export',
    scale = 2, // Higher scale for better quality
    backgroundColor = '#ffffff',
    quality = 1.0
  } = options

  try {
    const stage = stageRef.current
    if (!stage) {
      throw new Error('Stage reference is not available')
    }

    // Get the stage's container
    const container = stage.container()
    if (!container) {
      throw new Error('Stage container is not available')
    }

    // Use html2canvas to capture the canvas
    const canvas = await html2canvas(container, {
      backgroundColor,
      scale,
      useCORS: true,
      logging: false,
      allowTaint: true
    })

    // Convert canvas to blob
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          throw new Error('Failed to generate image blob')
        }

        // Create download link
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${filename}-${Date.now()}.png`
        
        // Trigger download
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up
        URL.revokeObjectURL(url)
        
        console.log('✅ Canvas exported successfully as PNG')
      },
      'image/png',
      quality
    )
  } catch (error) {
    console.error('Error exporting canvas to PNG:', error)
    throw error
  }
}

/**
 * Export using Konva's native toDataURL (alternative method)
 * @param stageRef - Reference to the Konva stage  
 * @param options - Export options
 */
export const exportCanvasToPNGNative = (
  stageRef: React.RefObject<any>,
  options: ExportOptions = {}
): void => {
  const {
    filename = 'canvas-export',
    quality = 1.0
  } = options

  try {
    const stage = stageRef.current
    if (!stage) {
      throw new Error('Stage reference is not available')
    }

    // Use Konva's built-in export
    const dataURL = stage.toDataURL({
      pixelRatio: 2, // Higher resolution
      mimeType: 'image/png',
      quality
    })

    // Create download link
    const link = document.createElement('a')
    link.href = dataURL
    link.download = `${filename}-${Date.now()}.png`
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log('✅ Canvas exported successfully as PNG (native)')
  } catch (error) {
    console.error('Error exporting canvas to PNG (native):', error)
    throw error
  }
}

/**
 * Get canvas as data URL for preview
 * @param stageRef - Reference to the Konva stage
 * @returns Promise with data URL
 */
export const getCanvasPreview = (
  stageRef: React.RefObject<any>
): string | null => {
  try {
    const stage = stageRef.current
    if (!stage) return null

    return stage.toDataURL({
      pixelRatio: 1,
      mimeType: 'image/png',
      quality: 0.8
    })
  } catch (error) {
    console.error('Error generating canvas preview:', error)
    return null
  }
}

