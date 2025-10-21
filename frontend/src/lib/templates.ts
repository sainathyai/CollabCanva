/**
 * Canvas Templates Library
 * Pre-made designs for animals, humans, objects, and scenes
 */

import type { CanvasObject } from '../types'

export interface Template {
  id: string
  name: string
  description: string
  category: 'animal' | 'human' | 'object' | 'scene'
  thumbnail: string // Emoji for quick reference
  objects: Omit<CanvasObject, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'zIndex' | 'createdBy'>[]
}

/**
 * All available templates
 */
export const templates: Template[] = [
  // =======================
  // 🐾 ANIMALS
  // =======================
  {
    id: 'cat',
    name: 'Cat',
    description: 'Cute geometric cat with ears, eyes, and paws',
    category: 'animal',
    thumbnail: '🐱',
    objects: [
      // Body
      { type: 'ellipse', x: 150, y: 180, width: 90, height: 100, color: '#FFA500', rotation: 0 },
      // Head
      { type: 'circle', x: 150, y: 100, width: 70, height: 70, color: '#FFA500', rotation: 0 },
      // Left ear
      { type: 'triangle', x: 120, y: 70, width: 30, height: 35, color: '#FFA500', rotation: 0 },
      // Right ear
      { type: 'triangle', x: 180, y: 70, width: 30, height: 35, color: '#FFA500', rotation: 0 },
      // Left eye
      { type: 'circle', x: 135, y: 95, width: 12, height: 12, color: '#000000', rotation: 0 },
      // Right eye
      { type: 'circle', x: 165, y: 95, width: 12, height: 12, color: '#000000', rotation: 0 },
      // Nose
      { type: 'triangle', x: 150, y: 115, width: 12, height: 10, color: '#FF6B9D', rotation: 180 },
      // Front left leg
      { type: 'rectangle', x: 130, y: 240, width: 15, height: 35, color: '#FFA500', rotation: 0 },
      // Front right leg
      { type: 'rectangle', x: 170, y: 240, width: 15, height: 35, color: '#FFA500', rotation: 0 },
      // Back left leg
      { type: 'rectangle', x: 115, y: 235, width: 15, height: 35, color: '#FFA500', rotation: 0 },
      // Back right leg
      { type: 'rectangle', x: 185, y: 235, width: 15, height: 35, color: '#FFA500', rotation: 0 },
      // Tail
      { type: 'ellipse', x: 210, y: 160, width: 18, height: 75, color: '#FFA500', rotation: 45 }
    ]
  },
  {
    id: 'dog',
    name: 'Dog',
    description: 'Friendly geometric dog with floppy ears and legs',
    category: 'animal',
    thumbnail: '🐶',
    objects: [
      // Body
      { type: 'ellipse', x: 150, y: 190, width: 100, height: 120, color: '#8B4513', rotation: 0 },
      // Head
      { type: 'circle', x: 150, y: 100, width: 80, height: 80, color: '#8B4513', rotation: 0 },
      // Left ear (floppy)
      { type: 'ellipse', x: 110, y: 90, width: 25, height: 50, color: '#654321', rotation: -30 },
      // Right ear (floppy)
      { type: 'ellipse', x: 190, y: 90, width: 25, height: 50, color: '#654321', rotation: 30 },
      // Snout
      { type: 'ellipse', x: 150, y: 125, width: 45, height: 35, color: '#D2691E', rotation: 0 },
      // Left eye
      { type: 'circle', x: 135, y: 90, width: 15, height: 15, color: '#000000', rotation: 0 },
      // Right eye
      { type: 'circle', x: 165, y: 90, width: 15, height: 15, color: '#000000', rotation: 0 },
      // Nose
      { type: 'circle', x: 150, y: 125, width: 15, height: 15, color: '#000000', rotation: 0 },
      // Front left leg
      { type: 'rectangle', x: 125, y: 260, width: 18, height: 40, color: '#8B4513', rotation: 0 },
      // Front right leg
      { type: 'rectangle', x: 175, y: 260, width: 18, height: 40, color: '#8B4513', rotation: 0 },
      // Back left leg
      { type: 'rectangle', x: 110, y: 255, width: 18, height: 40, color: '#8B4513', rotation: 0 },
      // Back right leg
      { type: 'rectangle', x: 190, y: 255, width: 18, height: 40, color: '#8B4513', rotation: 0 },
      // Tail (wagging up)
      { type: 'ellipse', x: 205, y: 170, width: 20, height: 65, color: '#8B4513', rotation: 55 }
    ]
  },
  {
    id: 'bird',
    name: 'Bird',
    description: 'Simple bird with wings and beak',
    category: 'animal',
    thumbnail: '🐦',
    objects: [
      // Body
      { type: 'ellipse', x: 150, y: 150, width: 80, height: 100, color: '#4FC3F7', rotation: 0 },
      // Head
      { type: 'circle', x: 150, y: 90, width: 50, height: 50, color: '#4FC3F7', rotation: 0 },
      // Eye
      { type: 'circle', x: 160, y: 85, width: 10, height: 10, color: '#000000', rotation: 0 },
      // Beak
      { type: 'triangle', x: 185, y: 90, width: 25, height: 15, color: '#FFA500', rotation: 90 },
      // Left wing
      { type: 'ellipse', x: 110, y: 150, width: 35, height: 70, color: '#29B6F6', rotation: -25 },
      // Right wing
      { type: 'ellipse', x: 190, y: 150, width: 35, height: 70, color: '#29B6F6', rotation: 25 },
      // Tail feathers
      { type: 'triangle', x: 150, y: 210, width: 40, height: 50, color: '#29B6F6', rotation: 180 }
    ]
  },
  {
    id: 'fish',
    name: 'Fish',
    description: 'Colorful tropical fish',
    category: 'animal',
    thumbnail: '🐟',
    objects: [
      // Body
      { type: 'ellipse', x: 150, y: 150, width: 120, height: 80, color: '#FF6B9D', rotation: 0 },
      // Tail
      { type: 'triangle', x: 90, y: 150, width: 40, height: 60, color: '#FF1744', rotation: -90 },
      // Top fin
      { type: 'triangle', x: 150, y: 110, width: 35, height: 40, color: '#FF6B9D', rotation: 0 },
      // Bottom fin
      { type: 'triangle', x: 150, y: 190, width: 30, height: 35, color: '#FF6B9D', rotation: 180 },
      // Eye
      { type: 'circle', x: 180, y: 140, width: 15, height: 15, color: '#FFFFFF', rotation: 0 },
      // Pupil
      { type: 'circle', x: 180, y: 140, width: 8, height: 8, color: '#000000', rotation: 0 }
    ]
  },
  {
    id: 'rabbit',
    name: 'Rabbit',
    description: 'Cute bunny with long ears',
    category: 'animal',
    thumbnail: '🐰',
    objects: [
      // Body
      { type: 'ellipse', x: 150, y: 180, width: 80, height: 90, color: '#E0E0E0', rotation: 0 },
      // Head
      { type: 'circle', x: 150, y: 110, width: 65, height: 65, color: '#E0E0E0', rotation: 0 },
      // Left ear
      { type: 'ellipse', x: 130, y: 50, width: 20, height: 65, color: '#E0E0E0', rotation: -10 },
      // Right ear
      { type: 'ellipse', x: 170, y: 50, width: 20, height: 65, color: '#E0E0E0', rotation: 10 },
      // Left ear inner
      { type: 'ellipse', x: 130, y: 55, width: 12, height: 45, color: '#FFB6C1', rotation: -10 },
      // Right ear inner
      { type: 'ellipse', x: 170, y: 55, width: 12, height: 45, color: '#FFB6C1', rotation: 10 },
      // Left eye
      { type: 'circle', x: 138, y: 105, width: 10, height: 10, color: '#000000', rotation: 0 },
      // Right eye
      { type: 'circle', x: 162, y: 105, width: 10, height: 10, color: '#000000', rotation: 0 },
      // Nose
      { type: 'circle', x: 150, y: 120, width: 8, height: 8, color: '#FFB6C1', rotation: 0 },
      // Front left leg
      { type: 'ellipse', x: 135, y: 235, width: 18, height: 30, color: '#E0E0E0', rotation: 0 },
      // Front right leg
      { type: 'ellipse', x: 165, y: 235, width: 18, height: 30, color: '#E0E0E0', rotation: 0 },
      // Tail
      { type: 'circle', x: 195, y: 195, width: 25, height: 25, color: '#FFFFFF', rotation: 0 }
    ]
  },
  {
    id: 'butterfly',
    name: 'Butterfly',
    description: 'Colorful butterfly with wings',
    category: 'animal',
    thumbnail: '🦋',
    objects: [
      // Body
      { type: 'ellipse', x: 150, y: 150, width: 15, height: 60, color: '#654321', rotation: 0 },
      // Head
      { type: 'circle', x: 150, y: 115, width: 18, height: 18, color: '#654321', rotation: 0 },
      // Top left wing
      { type: 'ellipse', x: 105, y: 125, width: 50, height: 55, color: '#FF6B9D', rotation: -30 },
      // Top right wing
      { type: 'ellipse', x: 195, y: 125, width: 50, height: 55, color: '#FF6B9D', rotation: 30 },
      // Bottom left wing
      { type: 'ellipse', x: 110, y: 175, width: 45, height: 50, color: '#FFD700', rotation: -25 },
      // Bottom right wing
      { type: 'ellipse', x: 190, y: 175, width: 45, height: 50, color: '#FFD700', rotation: 25 },
      // Wing spots (left)
      { type: 'circle', x: 105, y: 125, width: 12, height: 12, color: '#FFFFFF', rotation: 0 },
      { type: 'circle', x: 110, y: 175, width: 10, height: 10, color: '#FFFFFF', rotation: 0 },
      // Wing spots (right)
      { type: 'circle', x: 195, y: 125, width: 12, height: 12, color: '#FFFFFF', rotation: 0 },
      { type: 'circle', x: 190, y: 175, width: 10, height: 10, color: '#FFFFFF', rotation: 0 }
    ]
  },
  {
    id: 'bear',
    name: 'Bear',
    description: 'Friendly teddy bear',
    category: 'animal',
    thumbnail: '🐻',
    objects: [
      // Body
      { type: 'ellipse', x: 150, y: 200, width: 110, height: 130, color: '#8B4513', rotation: 0 },
      // Head
      { type: 'circle', x: 150, y: 100, width: 85, height: 85, color: '#8B4513', rotation: 0 },
      // Left ear
      { type: 'circle', x: 115, y: 70, width: 35, height: 35, color: '#8B4513', rotation: 0 },
      // Right ear
      { type: 'circle', x: 185, y: 70, width: 35, height: 35, color: '#8B4513', rotation: 0 },
      // Snout
      { type: 'ellipse', x: 150, y: 115, width: 50, height: 40, color: '#D2691E', rotation: 0 },
      // Left eye
      { type: 'circle', x: 133, y: 95, width: 12, height: 12, color: '#000000', rotation: 0 },
      // Right eye
      { type: 'circle', x: 167, y: 95, width: 12, height: 12, color: '#000000', rotation: 0 },
      // Nose
      { type: 'circle', x: 150, y: 118, width: 15, height: 15, color: '#000000', rotation: 0 },
      // Front left leg
      { type: 'rectangle', x: 120, y: 275, width: 25, height: 45, color: '#8B4513', rotation: 0 },
      // Front right leg
      { type: 'rectangle', x: 180, y: 275, width: 25, height: 45, color: '#8B4513', rotation: 0 }
    ]
  },

  // =======================
  // 👤 HUMANS
  // =======================
  {
    id: 'stick-figure',
    name: 'Stick Figure',
    description: 'Classic stick figure human',
    category: 'human',
    thumbnail: '🧍',
    objects: [
      // Head
      { type: 'circle', x: 150, y: 80, width: 40, height: 40, color: '#FFD700', rotation: 0 },
      // Body (line simulated with thin rectangle)
      { type: 'line', x: 150, y: 100, width: 0, height: 80, color: '#000000', rotation: 0, points: [150, 100, 150, 180] },
      // Left arm
      { type: 'line', x: 150, y: 120, width: 0, height: 0, color: '#000000', rotation: 0, points: [150, 120, 120, 150] },
      // Right arm
      { type: 'line', x: 150, y: 120, width: 0, height: 0, color: '#000000', rotation: 0, points: [150, 120, 180, 150] },
      // Left leg
      { type: 'line', x: 150, y: 180, width: 0, height: 0, color: '#000000', rotation: 0, points: [150, 180, 130, 230] },
      // Right leg
      { type: 'line', x: 150, y: 180, width: 0, height: 0, color: '#000000', rotation: 0, points: [150, 180, 170, 230] }
    ]
  },
  {
    id: 'emoji-face',
    name: 'Happy Face',
    description: 'Smiley emoji face',
    category: 'human',
    thumbnail: '😊',
    objects: [
      // Face
      { type: 'circle', x: 150, y: 150, width: 120, height: 120, color: '#FFD700', rotation: 0 },
      // Left eye
      { type: 'circle', x: 130, y: 135, width: 15, height: 15, color: '#000000', rotation: 0 },
      // Right eye
      { type: 'circle', x: 170, y: 135, width: 15, height: 15, color: '#000000', rotation: 0 },
      // Smile (arc using ellipse segment)
      { type: 'ellipse', x: 150, y: 165, width: 60, height: 40, color: '#8B4513', rotation: 0 },
      // Cover top half of ellipse for smile effect
      { type: 'ellipse', x: 150, y: 155, width: 70, height: 30, color: '#FFD700', rotation: 0 }
    ]
  },
  {
    id: 'simple-person',
    name: 'Simple Person',
    description: 'Block-style person figure',
    category: 'human',
    thumbnail: '👤',
    objects: [
      // Head
      { type: 'circle', x: 150, y: 80, width: 50, height: 50, color: '#FFDBAC', rotation: 0 },
      // Body
      { type: 'rectangle', x: 150, y: 145, width: 60, height: 80, color: '#4A90E2', rotation: 0 },
      // Left arm
      { type: 'rectangle', x: 115, y: 155, width: 15, height: 60, color: '#4A90E2', rotation: -15 },
      // Right arm
      { type: 'rectangle', x: 185, y: 155, width: 15, height: 60, color: '#4A90E2', rotation: 15 },
      // Left leg
      { type: 'rectangle', x: 135, y: 210, width: 18, height: 70, color: '#2C3E50', rotation: 0 },
      // Right leg
      { type: 'rectangle', x: 165, y: 210, width: 18, height: 70, color: '#2C3E50', rotation: 0 }
    ]
  },

  // =======================
  // 🏠 OBJECTS & BUILDINGS
  // =======================
  {
    id: 'house',
    name: 'House',
    description: 'Simple house with roof and windows',
    category: 'object',
    thumbnail: '🏠',
    objects: [
      // Walls
      { type: 'rectangle', x: 150, y: 180, width: 120, height: 100, color: '#FF6B6B', rotation: 0 },
      // Roof
      { type: 'triangle', x: 150, y: 115, width: 140, height: 70, color: '#8B4513', rotation: 0 },
      // Door
      { type: 'rectangle', x: 150, y: 210, width: 30, height: 50, color: '#654321', rotation: 0 },
      // Left window
      { type: 'rectangle', x: 120, y: 170, width: 25, height: 25, color: '#87CEEB', rotation: 0 },
      // Right window
      { type: 'rectangle', x: 180, y: 170, width: 25, height: 25, color: '#87CEEB', rotation: 0 }
    ]
  },
  {
    id: 'tree',
    name: 'Tree',
    description: 'Simple tree with leaves',
    category: 'object',
    thumbnail: '🌲',
    objects: [
      // Trunk
      { type: 'rectangle', x: 150, y: 200, width: 25, height: 80, color: '#8B4513', rotation: 0 },
      // Leaves (3 triangle layers)
      { type: 'triangle', x: 150, y: 90, width: 80, height: 60, color: '#228B22', rotation: 0 },
      { type: 'triangle', x: 150, y: 120, width: 90, height: 65, color: '#228B22', rotation: 0 },
      { type: 'triangle', x: 150, y: 150, width: 100, height: 70, color: '#228B22', rotation: 0 }
    ]
  },
  {
    id: 'car',
    name: 'Car',
    description: 'Simple car with wheels',
    category: 'object',
    thumbnail: '🚗',
    objects: [
      // Body
      { type: 'rectangle', x: 150, y: 150, width: 140, height: 50, color: '#FF6B6B', rotation: 0 },
      // Cabin
      { type: 'rectangle', x: 150, y: 120, width: 80, height: 35, color: '#87CEEB', rotation: 0 },
      // Left wheel
      { type: 'circle', x: 110, y: 175, width: 30, height: 30, color: '#000000', rotation: 0 },
      // Right wheel
      { type: 'circle', x: 190, y: 175, width: 30, height: 30, color: '#000000', rotation: 0 },
      // Left wheel center
      { type: 'circle', x: 110, y: 175, width: 15, height: 15, color: '#C0C0C0', rotation: 0 },
      // Right wheel center
      { type: 'circle', x: 190, y: 175, width: 15, height: 15, color: '#C0C0C0', rotation: 0 }
    ]
  },
  {
    id: 'sun',
    name: 'Sun',
    description: 'Bright sun with rays',
    category: 'object',
    thumbnail: '☀️',
    objects: [
      // Center circle
      { type: 'circle', x: 150, y: 150, width: 80, height: 80, color: '#FFD700', rotation: 0 },
      // Top ray
      { type: 'triangle', x: 150, y: 80, width: 20, height: 30, color: '#FFD700', rotation: 0 },
      // Top-right ray
      { type: 'triangle', x: 195, y: 95, width: 20, height: 30, color: '#FFD700', rotation: 45 },
      // Right ray
      { type: 'triangle', x: 220, y: 150, width: 20, height: 30, color: '#FFD700', rotation: 90 },
      // Bottom-right ray
      { type: 'triangle', x: 195, y: 205, width: 20, height: 30, color: '#FFD700', rotation: 135 },
      // Bottom ray
      { type: 'triangle', x: 150, y: 220, width: 20, height: 30, color: '#FFD700', rotation: 180 },
      // Bottom-left ray
      { type: 'triangle', x: 105, y: 205, width: 20, height: 30, color: '#FFD700', rotation: 225 },
      // Left ray
      { type: 'triangle', x: 80, y: 150, width: 20, height: 30, color: '#FFD700', rotation: 270 },
      // Top-left ray
      { type: 'triangle', x: 105, y: 95, width: 20, height: 30, color: '#FFD700', rotation: 315 }
    ]
  },
  {
    id: 'rocket',
    name: 'Rocket',
    description: 'Space rocket ready to launch',
    category: 'object',
    thumbnail: '🚀',
    objects: [
      // Body
      { type: 'rectangle', x: 150, y: 160, width: 50, height: 100, color: '#FF6B6B', rotation: 0 },
      // Nose cone
      { type: 'triangle', x: 150, y: 95, width: 50, height: 65, color: '#FFD700', rotation: 0 },
      // Left fin
      { type: 'triangle', x: 115, y: 210, width: 35, height: 50, color: '#4A90E2', rotation: -30 },
      // Right fin
      { type: 'triangle', x: 185, y: 210, width: 35, height: 50, color: '#4A90E2', rotation: 30 },
      // Window
      { type: 'circle', x: 150, y: 145, width: 20, height: 20, color: '#87CEEB', rotation: 0 },
      // Left engine flame
      { type: 'triangle', x: 135, y: 235, width: 15, height: 30, color: '#FFA500', rotation: 180 },
      // Right engine flame
      { type: 'triangle', x: 165, y: 235, width: 15, height: 30, color: '#FFA500', rotation: 180 }
    ]
  },
  {
    id: 'flower',
    name: 'Flower',
    description: 'Colorful flower with petals',
    category: 'object',
    thumbnail: '🌸',
    objects: [
      // Stem
      { type: 'rectangle', x: 150, y: 210, width: 8, height: 80, color: '#228B22', rotation: 0 },
      // Center
      { type: 'circle', x: 150, y: 140, width: 35, height: 35, color: '#FFD700', rotation: 0 },
      // Top petal
      { type: 'circle', x: 150, y: 115, width: 30, height: 30, color: '#FF6B9D', rotation: 0 },
      // Right petal
      { type: 'circle', x: 175, y: 140, width: 30, height: 30, color: '#FF6B9D', rotation: 0 },
      // Bottom petal
      { type: 'circle', x: 150, y: 165, width: 30, height: 30, color: '#FF6B9D', rotation: 0 },
      // Left petal
      { type: 'circle', x: 125, y: 140, width: 30, height: 30, color: '#FF6B9D', rotation: 0 },
      // Top-right petal
      { type: 'circle', x: 168, y: 122, width: 25, height: 25, color: '#FFB6C1', rotation: 0 },
      // Bottom-right petal
      { type: 'circle', x: 168, y: 158, width: 25, height: 25, color: '#FFB6C1', rotation: 0 },
      // Bottom-left petal
      { type: 'circle', x: 132, y: 158, width: 25, height: 25, color: '#FFB6C1', rotation: 0 },
      // Top-left petal
      { type: 'circle', x: 132, y: 122, width: 25, height: 25, color: '#FFB6C1', rotation: 0 },
      // Leaf left
      { type: 'ellipse', x: 135, y: 230, width: 20, height: 35, color: '#228B22', rotation: -45 },
      // Leaf right
      { type: 'ellipse', x: 165, y: 230, width: 20, height: 35, color: '#228B22', rotation: 45 }
    ]
  },
  {
    id: 'heart',
    name: 'Heart',
    description: 'Romantic heart shape',
    category: 'object',
    thumbnail: '❤️',
    objects: [
      // Left circle
      { type: 'circle', x: 130, y: 130, width: 60, height: 60, color: '#FF1744', rotation: 0 },
      // Right circle
      { type: 'circle', x: 170, y: 130, width: 60, height: 60, color: '#FF1744', rotation: 0 },
      // Bottom triangle
      { type: 'triangle', x: 150, y: 205, width: 100, height: 75, color: '#FF1744', rotation: 180 }
    ]
  },
  {
    id: 'cloud',
    name: 'Cloud',
    description: 'Fluffy white cloud',
    category: 'object',
    thumbnail: '☁️',
    objects: [
      // Main body
      { type: 'ellipse', x: 150, y: 150, width: 120, height: 60, color: '#FFFFFF', rotation: 0 },
      // Left puff
      { type: 'circle', x: 110, y: 145, width: 50, height: 50, color: '#FFFFFF', rotation: 0 },
      // Right puff
      { type: 'circle', x: 190, y: 145, width: 50, height: 50, color: '#FFFFFF', rotation: 0 },
      // Top puff
      { type: 'circle', x: 150, y: 135, width: 60, height: 60, color: '#FFFFFF', rotation: 0 }
    ]
  },
  {
    id: 'moon',
    name: 'Moon',
    description: 'Crescent moon',
    category: 'object',
    thumbnail: '🌙',
    objects: [
      // Main circle
      { type: 'circle', x: 150, y: 150, width: 100, height: 100, color: '#FFD700', rotation: 0 },
      // Shadow circle (creates crescent)
      { type: 'circle', x: 170, y: 145, width: 90, height: 90, color: '#282c34', rotation: 0 }
    ]
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    description: 'Colorful rainbow arc',
    category: 'object',
    thumbnail: '🌈',
    objects: [
      // Red (outer)
      { type: 'ellipse', x: 150, y: 220, width: 220, height: 140, color: '#FF0000', rotation: 0 },
      // Orange
      { type: 'ellipse', x: 150, y: 220, width: 190, height: 120, color: '#FF7F00', rotation: 0 },
      // Yellow
      { type: 'ellipse', x: 150, y: 220, width: 160, height: 100, color: '#FFFF00', rotation: 0 },
      // Green
      { type: 'ellipse', x: 150, y: 220, width: 130, height: 80, color: '#00FF00', rotation: 0 },
      // Blue
      { type: 'ellipse', x: 150, y: 220, width: 100, height: 60, color: '#0000FF', rotation: 0 },
      // Indigo
      { type: 'ellipse', x: 150, y: 220, width: 70, height: 40, color: '#4B0082', rotation: 0 },
      // Violet (inner)
      { type: 'ellipse', x: 150, y: 220, width: 40, height: 20, color: '#9400D3', rotation: 0 },
      // Sky cover (hides bottom half)
      { type: 'rectangle', x: 150, y: 260, width: 250, height: 80, color: '#282c34', rotation: 0 }
    ]
  },

  // =======================
  // 🌅 SCENES
  // =======================
  {
    id: 'park-scene',
    name: 'Park Scene',
    description: 'Outdoor scene with sun, tree, and grass',
    category: 'scene',
    thumbnail: '🌳',
    objects: [
      // Sun
      { type: 'circle', x: 250, y: 60, width: 50, height: 50, color: '#FFD700', rotation: 0 },
      // Ground
      { type: 'rectangle', x: 150, y: 250, width: 300, height: 100, color: '#90EE90', rotation: 0 },
      // Tree trunk
      { type: 'rectangle', x: 100, y: 220, width: 20, height: 60, color: '#8B4513', rotation: 0 },
      // Tree leaves
      { type: 'circle', x: 100, y: 180, width: 60, height: 60, color: '#228B22', rotation: 0 },
      // Another tree
      { type: 'rectangle', x: 200, y: 220, width: 20, height: 60, color: '#8B4513', rotation: 0 },
      { type: 'circle', x: 200, y: 180, width: 60, height: 60, color: '#228B22', rotation: 0 }
    ]
  },
  {
    id: 'city-scene',
    name: 'City Scene',
    description: 'Simple cityscape with buildings',
    category: 'scene',
    thumbnail: '🏙️',
    objects: [
      // Sky
      { type: 'rectangle', x: 150, y: 100, width: 300, height: 150, color: '#87CEEB', rotation: 0 },
      // Ground
      { type: 'rectangle', x: 150, y: 250, width: 300, height: 50, color: '#808080', rotation: 0 },
      // Building 1 (tall)
      { type: 'rectangle', x: 70, y: 180, width: 50, height: 120, color: '#4A5568', rotation: 0 },
      // Building 2 (short)
      { type: 'rectangle', x: 140, y: 210, width: 60, height: 90, color: '#718096', rotation: 0 },
      // Building 3 (medium)
      { type: 'rectangle', x: 220, y: 190, width: 55, height: 110, color: '#2D3748', rotation: 0 },
      // Windows on building 1
      { type: 'rectangle', x: 60, y: 150, width: 15, height: 15, color: '#FFD700', rotation: 0 },
      { type: 'rectangle', x: 80, y: 150, width: 15, height: 15, color: '#FFD700', rotation: 0 },
      // Windows on building 2
      { type: 'rectangle', x: 130, y: 190, width: 15, height: 15, color: '#FFD700', rotation: 0 },
      { type: 'rectangle', x: 150, y: 190, width: 15, height: 15, color: '#FFD700', rotation: 0 }
    ]
  },
  {
    id: 'beach-scene',
    name: 'Beach Scene',
    description: 'Tropical beach with sun and ocean',
    category: 'scene',
    thumbnail: '🏖️',
    objects: [
      // Sky
      { type: 'rectangle', x: 150, y: 100, width: 300, height: 150, color: '#87CEEB', rotation: 0 },
      // Sun
      { type: 'circle', x: 250, y: 70, width: 50, height: 50, color: '#FFD700', rotation: 0 },
      // Ocean
      { type: 'rectangle', x: 150, y: 210, width: 300, height: 60, color: '#1E90FF', rotation: 0 },
      // Sand
      { type: 'rectangle', x: 150, y: 260, width: 300, height: 40, color: '#F4A460', rotation: 0 },
      // Palm tree trunk
      { type: 'rectangle', x: 80, y: 235, width: 12, height: 50, color: '#8B4513', rotation: 0 },
      // Palm leaves
      { type: 'ellipse', x: 60, y: 210, width: 35, height: 15, color: '#228B22', rotation: -30 },
      { type: 'ellipse', x: 100, y: 210, width: 35, height: 15, color: '#228B22', rotation: 30 },
      { type: 'ellipse', x: 80, y: 195, width: 15, height: 40, color: '#228B22', rotation: 0 },
      // Umbrella pole
      { type: 'rectangle', x: 200, y: 255, width: 4, height: 40, color: '#654321', rotation: 0 },
      // Umbrella top
      { type: 'ellipse', x: 200, y: 230, width: 60, height: 30, color: '#FF6B6B', rotation: 0 },
      // Beach ball
      { type: 'circle', x: 140, y: 270, width: 20, height: 20, color: '#FF6B9D', rotation: 0 }
    ]
  }
]

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (category: Template['category']): Template[] => {
  return templates.filter(t => t.category === category)
}

/**
 * Get template by ID
 */
export const getTemplateById = (id: string): Template | undefined => {
  return templates.find(t => t.id === id)
}

/**
 * Get all template categories
 */
export const getCategories = (): Template['category'][] => {
  return ['animal', 'human', 'object', 'scene']
}

