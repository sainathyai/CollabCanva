import type { CanvasObject } from '../types';

// AI Function Definitions for OpenAI Function Calling
// These define what operations the AI can perform on the canvas

export const canvasFunctions = [
  {
    name: 'load_template',
    description: 'Load a predefined template onto the canvas. Templates include animals (cat, dog, bird, fish), humans (stick-figure, emoji-face, simple-person), objects (house, tree, car, sun, rocket, flower), and scenes. Use this when user asks to "create a cat", "add a house", "draw a person", etc.',
    parameters: {
      type: 'object',
      properties: {
        templateName: {
          type: 'string',
          enum: ['cat', 'dog', 'bird', 'fish', 'stick-figure', 'emoji-face', 'simple-person', 'house', 'tree', 'car', 'sun', 'rocket', 'flower', 'rainbow', 'park-scene', 'beach-scene'],
          description: 'The name of the template to load'
        },
        x: {
          type: 'number',
          description: 'X position where the template should be placed (default: center)',
          minimum: 0
        },
        y: {
          type: 'number',
          description: 'Y position where the template should be placed (default: center)',
          minimum: 0
        }
      },
      required: ['templateName']
    }
  },
  {
    name: 'export_canvas',
    description: 'Export the current canvas as a PNG image file. Use this when user asks to "save as image", "download as PNG", "export canvas", "save my work", etc.',
    parameters: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          description: 'Name for the exported file (without extension)',
          default: 'canvas-export'
        },
        quality: {
          type: 'number',
          description: 'Image quality from 0.1 to 1.0 (default: 1.0)',
          minimum: 0.1,
          maximum: 1.0
        }
      },
      required: []
    }
  },
  {
    name: 'generate_random_objects',
    description: 'Generate multiple random shapes with random colors and positions. Use this when user asks for "random objects", "surprise me", or wants variety without specifying exact shape types.',
    parameters: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of random objects to generate (default: 5)',
          minimum: 1,
          maximum: 100
        }
      },
      required: ['count']
    }
  },
  {
    name: 'create_shape',
    description: 'Create one or more shapes of a SPECIFIC type. Use this when user specifies the exact shape type (e.g., "create 3 circles", "add a rectangle").',
    parameters: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['rectangle', 'circle', 'triangle', 'star', 'ellipse', 'roundedRect', 'diamond', 'pentagon', 'polygon', 'arrow', 'line', 'text'],
          description: 'The type of shape to create'
        },
        count: {
          type: 'number',
          description: 'Number of shapes to create (default: 1)',
          minimum: 1,
          maximum: 50
        },
        color: {
          type: 'string',
          description: 'Color of the shape in hex format (e.g., #FF0000). If not provided, will use random color'
        },
        text: {
          type: 'string',
          description: 'Text content (only for text shapes)'
        },
        width: {
          type: 'number',
          description: 'Width of the shape in pixels',
          minimum: 10,
          maximum: 500
        },
        height: {
          type: 'number',
          description: 'Height of the shape in pixels',
          minimum: 10,
          maximum: 500
        }
      },
      required: ['type']
    }
  },
  {
    name: 'modify_color',
    description: 'Change the color of objects on the canvas',
    parameters: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          enum: ['all', 'selected', 'rectangle', 'circle', 'triangle', 'star', 'ellipse', 'text'],
          description: 'Which objects to modify: all, selected, or specific shape type'
        },
        color: {
          type: 'string',
          description: 'New color in hex format (e.g., #0000FF)'
        }
      },
      required: ['selector', 'color']
    }
  },
  {
    name: 'move_objects',
    description: 'Move objects on the canvas',
    parameters: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          enum: ['all', 'selected', 'rectangle', 'circle', 'triangle', 'star', 'ellipse', 'text'],
          description: 'Which objects to move'
        },
        dx: {
          type: 'number',
          description: 'Horizontal movement in pixels (positive = right, negative = left)'
        },
        dy: {
          type: 'number',
          description: 'Vertical movement in pixels (positive = down, negative = up)'
        }
      },
      required: ['selector', 'dx', 'dy']
    }
  },
  {
    name: 'resize_objects',
    description: 'Resize objects on the canvas',
    parameters: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          enum: ['all', 'selected', 'rectangle', 'circle', 'triangle', 'star', 'ellipse', 'text'],
          description: 'Which objects to resize'
        },
        scale: {
          type: 'number',
          description: 'Scale multiplier (e.g., 2 = double size, 0.5 = half size)',
          minimum: 0.1,
          maximum: 5
        }
      },
      required: ['selector', 'scale']
    }
  },
  {
    name: 'rotate_objects',
    description: 'Rotate objects on the canvas',
    parameters: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          enum: ['all', 'selected', 'rectangle', 'circle', 'triangle', 'star', 'ellipse', 'text'],
          description: 'Which objects to rotate'
        },
        degrees: {
          type: 'number',
          description: 'Rotation angle in degrees (positive = clockwise, negative = counter-clockwise)'
        }
      },
      required: ['selector', 'degrees']
    }
  },
  {
    name: 'delete_objects',
    description: 'Delete objects from the canvas',
    parameters: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          enum: ['all', 'selected', 'rectangle', 'circle', 'triangle', 'star', 'ellipse', 'text'],
          description: 'Which objects to delete'
        }
      },
      required: ['selector']
    }
  },
  {
    name: 'arrange_objects',
    description: 'Arrange objects in a specific layout pattern',
    parameters: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          enum: ['all', 'selected'],
          description: 'Which objects to arrange'
        },
        arrangement: {
          type: 'string',
          enum: ['grid', 'circle', 'line-horizontal', 'line-vertical', 'align-left', 'align-center', 'align-right'],
          description: 'How to arrange the objects'
        },
        spacing: {
          type: 'number',
          description: 'Spacing between objects in pixels',
          minimum: 0,
          maximum: 200
        }
      },
      required: ['selector', 'arrangement']
    }
  },
  {
    name: 'duplicate_objects',
    description: 'Duplicate selected objects with optional offset',
    parameters: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          enum: ['selected', 'all'],
          description: 'Which objects to duplicate'
        },
        count: {
          type: 'number',
          description: 'Number of times to duplicate',
          minimum: 1,
          maximum: 10
        },
        offset: {
          type: 'number',
          description: 'Offset in pixels for each duplicate',
          minimum: 0,
          maximum: 100
        }
      },
      required: ['selector']
    }
  },
  {
    name: 'delete_random_objects',
    description: 'Randomly select and delete a specified number of objects from the canvas. Use this when user wants to reduce clutter or randomly remove objects.',
    parameters: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of random objects to delete',
          minimum: 1,
          maximum: 100
        }
      },
      required: ['count']
    }
  },
  {
    name: 'count_objects',
    description: 'Count the number of objects on the canvas. Can count all objects or filter by specific shape type. Use this when user asks "how many circles?", "count all objects", etc.',
    parameters: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['all', 'rectangle', 'circle', 'triangle', 'star', 'ellipse', 'roundedRect', 'diamond', 'pentagon', 'polygon', 'arrow', 'line', 'text'],
          description: 'Type of objects to count. Use "all" to count all objects regardless of type.'
        }
      },
      required: ['type']
    }
  }
];

// Type definitions for function parameters
export type GenerateRandomObjectsParams = {
  count: number;
};

export type CreateShapeParams = {
  type: CanvasObject['type'];
  count?: number;
  color?: string;
  text?: string;
  width?: number;
  height?: number;
};

export type ModifyColorParams = {
  selector: 'all' | 'selected' | CanvasObject['type'];
  color: string;
};

export type MoveObjectsParams = {
  selector: 'all' | 'selected' | CanvasObject['type'];
  dx: number;
  dy: number;
};

export type ResizeObjectsParams = {
  selector: 'all' | 'selected' | CanvasObject['type'];
  scale: number;
};

export type RotateObjectsParams = {
  selector: 'all' | 'selected' | CanvasObject['type'];
  degrees: number;
};

export type DeleteObjectsParams = {
  selector: 'all' | 'selected' | CanvasObject['type'];
};

export type ArrangeObjectsParams = {
  selector: 'all' | 'selected';
  arrangement: 'grid' | 'circle' | 'line-horizontal' | 'line-vertical' | 'align-left' | 'align-center' | 'align-right';
  spacing?: number;
};

export type DuplicateObjectsParams = {
  selector: 'selected' | 'all';
  count?: number;
  offset?: number;
};

export type DeleteRandomObjectsParams = {
  count: number;
};

export type CountObjectsParams = {
  type: 'all' | CanvasObject['type'];
};

export type LoadTemplateParams = {
  templateName: string;
  x?: number;
  y?: number;
};

export type ExportCanvasParams = {
  filename?: string;
  quality?: number;
};

export type AIFunctionName =
  | 'load_template'
  | 'export_canvas'
  | 'generate_random_objects'
  | 'create_shape'
  | 'modify_color'
  | 'move_objects'
  | 'resize_objects'
  | 'rotate_objects'
  | 'delete_objects'
  | 'arrange_objects'
  | 'duplicate_objects'
  | 'delete_random_objects'
  | 'count_objects';

export type AIFunctionParams =
  | LoadTemplateParams
  | ExportCanvasParams
  | GenerateRandomObjectsParams
  | CreateShapeParams
  | ModifyColorParams
  | MoveObjectsParams
  | ResizeObjectsParams
  | RotateObjectsParams
  | DeleteObjectsParams
  | ArrangeObjectsParams
  | DuplicateObjectsParams
  | DeleteRandomObjectsParams
  | CountObjectsParams;

