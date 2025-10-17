import { useRef, useEffect, useState, useMemo, memo } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, RegularPolygon, Star, Arrow, Ellipse } from 'react-konva';
import Konva from 'konva';
import { CanvasObject } from '../types';
import { getVisibleObjects, getViewportStats } from '../lib/viewport';

interface KonvaCanvasProps {
  objects: CanvasObject[];
  selectedIds: Set<string>;
  onSelect: (ids: Set<string>) => void;
  onTransform: (id: string, attrs: Partial<CanvasObject>) => void;
  stageWidth: number;
  stageHeight: number;
  scale: number;
  position: { x: number; y: number };
  isPanning: boolean;
  onPositionChange: (position: { x: number; y: number }) => void;
  showGrid?: boolean;
  isViewer?: boolean;
}

// 🚀 OPTIMIZATION: Memoized shape components to prevent unnecessary re-renders
// Only re-render when the specific object properties change
const MemoizedRect = memo(Rect, (prevProps, nextProps) => {
  return (
    prevProps.x === nextProps.x &&
    prevProps.y === nextProps.y &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.rotation === nextProps.rotation &&
    prevProps.fill === nextProps.fill
  );
});

const MemoizedCircle = memo(Circle, (prevProps, nextProps) => {
  return (
    prevProps.x === nextProps.x &&
    prevProps.y === nextProps.y &&
    prevProps.radius === nextProps.radius &&
    prevProps.rotation === nextProps.rotation &&
    prevProps.fill === nextProps.fill
  );
});

const MemoizedEllipse = memo(Ellipse, (prevProps, nextProps) => {
  return (
    prevProps.x === nextProps.x &&
    prevProps.y === nextProps.y &&
    prevProps.radiusX === nextProps.radiusX &&
    prevProps.radiusY === nextProps.radiusY &&
    prevProps.rotation === nextProps.rotation &&
    prevProps.fill === nextProps.fill
  );
});

export function KonvaCanvas({
  objects,
  selectedIds,
  onSelect,
  onTransform,
  stageWidth,
  stageHeight,
  scale,
  position,
  isPanning,
  onPositionChange,
  showGrid = true
}: KonvaCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const dragStartPositions = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const selectionStart = useRef<{ x: number; y: number } | null>(null);
  const transformersRef = useRef<Map<string, Konva.Transformer>>(new Map());
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [textareaValue, setTextareaValue] = useState('');
  const [textareaPosition, setTextareaPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 🚀 OPTIMIZATION: Object Virtualization - Only render visible objects
  const visibleObjects = useMemo(() => {
    const viewport = {
      x: position.x,
      y: position.y,
      width: stageWidth,
      height: stageHeight
    };

    const visible = getVisibleObjects(objects, viewport, scale);

    // Log stats in development for monitoring
    if (process.env.NODE_ENV === 'development' && objects.length > 50) {
      const stats = getViewportStats(objects, viewport, scale);
      console.log(`🎨 Viewport: Rendering ${stats.visible}/${stats.total} objects (${stats.cullingRatio} culled)`);
    }

    return visible;
  }, [objects, position.x, position.y, scale, stageWidth, stageHeight]);

  // Create individual transformers for each selected shape
  useEffect(() => {
    const stage = stageRef.current;
    const layer = layerRef.current;
    if (!stage || !layer) return;

    // Clean up old transformers
    transformersRef.current.forEach(tr => tr.destroy());
    transformersRef.current.clear();

    // Create transformer for each selected shape
    selectedIds.forEach(id => {
      const node = stage.findOne(`#${id}`);
      if (node) {
        const transformer = new Konva.Transformer({
          nodes: [node],
          enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
          rotateEnabled: true,
          borderStroke: '#66B3FF',
          borderStrokeWidth: 2,
          borderDash: [5, 5],
          anchorStroke: '#66B3FF',
          anchorFill: '#FFFFFF',
          anchorSize: 8,
          anchorCornerRadius: 2,
        });
        layer.add(transformer);
        transformersRef.current.set(id, transformer);
      }
    });

    layer.batchDraw(); // Use batchDraw for better performance

    return () => {
      transformersRef.current.forEach(tr => tr.destroy());
      transformersRef.current.clear();
    };
  }, [selectedIds]);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();

    if (clickedOnEmpty) {
      // If panning mode, don't start selection
      if (isPanning) {
        return;
      }

      // Start area selection
      const stage = stageRef.current;
      if (!stage) return;

      // Use relative position to account for zoom/pan transformations
      const pos = stage.getRelativePointerPosition();
      if (!pos) return;

      setIsSelecting(true);
      selectionStart.current = pos;
      setSelectionRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
      return;
    }

    // Clicked on a shape
    const id = e.target.id();
    if (!id) return;

    const isMultiSelect = 'shiftKey' in e.evt && e.evt.shiftKey;
    if (isMultiSelect) {
      // Toggle shape in selection
      const newSelection = new Set(selectedIds);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      onSelect(newSelection);
    } else {
      // Single select (or select if not already selected)
      if (!selectedIds.has(id)) {
        onSelect(new Set([id]));
      }
    }
  };

  const handleMouseMove = () => {
    if (!isSelecting) return;

    const stage = stageRef.current;
    if (!stage || !selectionStart.current) return;

    // Use relative position to account for zoom/pan transformations
    const pos = stage.getRelativePointerPosition();
    if (!pos) return;

    const x = Math.min(selectionStart.current.x, pos.x);
    const y = Math.min(selectionStart.current.y, pos.y);
    const width = Math.abs(pos.x - selectionStart.current.x);
    const height = Math.abs(pos.y - selectionStart.current.y);

    setSelectionRect({ x, y, width, height });
  };

  const handleMouseUp = () => {
    if (!isSelecting) return;

    setIsSelecting(false);

    if (!selectionRect) {
      setSelectionRect(null);
      return;
    }

    // Select all shapes within the selection rectangle
    const stage = stageRef.current;
    if (!stage) {
      setSelectionRect(null);
      return;
    }

    const selected = new Set<string>();
    objects.forEach(obj => {
      const node = stage.findOne(`#${obj.id}`);
      if (!node) return;

      // Get the node's bounding box in screen space
      const box = node.getClientRect();

      // Convert screen coordinates to canvas coordinates
      // Screen to canvas: (screenX - position.x) / scale
      const canvasBox = {
        x: (box.x - position.x) / scale,
        y: (box.y - position.y) / scale,
        width: box.width / scale,
        height: box.height / scale
      };

      // Check if shape intersects with selection rectangle (both in canvas space)
      if (
        canvasBox.x < selectionRect.x + selectionRect.width &&
        canvasBox.x + canvasBox.width > selectionRect.x &&
        canvasBox.y < selectionRect.y + selectionRect.height &&
        canvasBox.y + canvasBox.height > selectionRect.y
      ) {
        selected.add(obj.id);
      }
    });

    onSelect(selected);
    setSelectionRect(null);
    selectionStart.current = null;
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const id = node.id();
    if (!id) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale to 1 (apply to width/height instead)
    node.scaleX(1);
    node.scaleY(1);

    onTransform(id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(node.width() * scaleX, 5),
      height: Math.max(node.height() * scaleY, 5),
      rotation: node.rotation()
    });
  };

  const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const id = node.id();
    if (!id) return;

    // Store starting positions for all selected shapes
    const stage = stageRef.current;
    if (!stage) return;

    dragStartPositions.current.clear();
    selectedIds.forEach(selectedId => {
      const selectedNode = stage.findOne(`#${selectedId}`);
      if (selectedNode) {
        dragStartPositions.current.set(selectedId, {
          x: selectedNode.x(),
          y: selectedNode.y()
        });
      }
    });
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const id = node.id();
    if (!id) return;

    // If multiple shapes selected, move all of them in real-time
    if (selectedIds.size > 1 && selectedIds.has(id)) {
      const stage = stageRef.current;
      if (!stage) return;

      const startPos = dragStartPositions.current.get(id);
      if (!startPos) return;

      const deltaX = node.x() - startPos.x;
      const deltaY = node.y() - startPos.y;

      // Move all other selected shapes by the same delta
      selectedIds.forEach(selectedId => {
        if (selectedId === id) return; // Skip the dragged shape

        const startPosition = dragStartPositions.current.get(selectedId);
        if (startPosition) {
          const selectedNode = stage.findOne(`#${selectedId}`);
          if (selectedNode) {
            selectedNode.x(startPosition.x + deltaX);
            selectedNode.y(startPosition.y + deltaY);
          }
        }
      });

      stage.batchDraw();
    }
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const id = node.id();
    if (!id) return;

    const stage = stageRef.current;
    if (!stage) return;

    // Send final positions to backend for all selected shapes
    selectedIds.forEach(selectedId => {
      const selectedNode = stage.findOne(`#${selectedId}`);
      if (selectedNode) {
        onTransform(selectedId, {
          x: selectedNode.x(),
          y: selectedNode.y()
        });
      }
    });

    dragStartPositions.current.clear();
  };

  const handleStageDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (isPanning) {
      onPositionChange({
        x: e.target.x(),
        y: e.target.y()
      });
    }
  };

  // 🚀 OPTIMIZATION: Adaptive Grid - Show/hide minor grid based on zoom level
  // Memoize grid generation to prevent recalculation during object drag/transform
  const gridLines = useMemo(() => {
    if (!showGrid) return null;

    const majorGridSize = 50; // Major: 50px squares
    const minorGridSize = 5; // Minor: 5px subdivisions (10 per major square)
    const lines: JSX.Element[] = [];

    // Calculate visible area - align to major grid to ensure complete squares
    const padding = majorGridSize * 2;
    const viewStartX = -position.x / scale - padding;
    const viewEndX = (stageWidth - position.x) / scale + padding;
    const viewStartY = -position.y / scale - padding;
    const viewEndY = (stageHeight - position.y) / scale + padding;

    // Align to major grid boundaries to ensure we draw complete squares
    const startX = Math.floor(viewStartX / majorGridSize) * majorGridSize;
    const endX = Math.ceil(viewEndX / majorGridSize) * majorGridSize;
    const startY = Math.floor(viewStartY / majorGridSize) * majorGridSize;
    const endY = Math.ceil(viewEndY / majorGridSize) * majorGridSize;

    // 🚀 OPTIMIZATION: Only show minor grid when zoomed in enough
    // At low zoom levels, minor grid is too dense and impacts performance
    const showMinorGrid = scale > 0.5;

    // Draw minor grid lines (5px subdivisions) - only when zoomed in
    if (showMinorGrid) {
      for (let x = startX; x <= endX; x += minorGridSize) {
        // Use Math.abs to handle negative coordinates properly
        if (Math.abs(x % majorGridSize) > 0.001) { // Skip major grid positions (with floating point tolerance)
          lines.push(
            <Line
              key={`minor-v-${x}`}
              points={[x, startY, x, endY]}
              stroke="#DCDCDC"
              strokeWidth={0.5 / scale}
              listening={false}
            />
          );
        }
      }

      for (let y = startY; y <= endY; y += minorGridSize) {
        if (Math.abs(y % majorGridSize) > 0.001) { // Skip major grid positions (with floating point tolerance)
          lines.push(
            <Line
              key={`minor-h-${y}`}
              points={[startX, y, endX, y]}
              stroke="#DCDCDC"
              strokeWidth={0.5 / scale}
              listening={false}
            />
          );
        }
      }
    }

    // Draw major grid lines (50px) - always visible
    for (let x = startX; x <= endX; x += majorGridSize) {
      lines.push(
        <Line
          key={`major-v-${x}`}
          points={[x, startY, x, endY]}
          stroke="#D0D0D0"
          strokeWidth={1 / scale}
          listening={false}
        />
      );
    }

    for (let y = startY; y <= endY; y += majorGridSize) {
      lines.push(
        <Line
          key={`major-h-${y}`}
          points={[startX, y, endX, y]}
          stroke="#D0D0D0"
          strokeWidth={1 / scale}
          listening={false}
        />
      );
    }

    // Log grid stats in development
    if (process.env.NODE_ENV === 'development') {
      const minorCount = showMinorGrid ? lines.length - ((endX - startX) / majorGridSize + 1) * 2 : 0;
      const majorCount = lines.length - minorCount;
      console.log(`📐 Grid: ${majorCount} major + ${minorCount} minor lines (scale: ${scale.toFixed(2)})`);
    }

    return lines;
  }, [showGrid, position.x, position.y, scale, stageWidth, stageHeight]); // Only recalculate when grid params change, NOT when objects change

  return (
    <>
      <Stage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable={isPanning}
        onDragEnd={handleStageDragEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        style={{ cursor: isPanning ? 'grab' : 'default' }}
        // GPU Optimizations
        pixelRatio={window.devicePixelRatio} // Enable retina/high-DPI support
      >
        {/* Grid Layer - Non-interactive, memoized for performance */}
        {showGrid && (
          <Layer listening={false}>
            {gridLines}
          </Layer>
        )}

        {/* Objects Layer */}
        <Layer ref={layerRef}>
          {visibleObjects.map(obj => {
            switch (obj.type) {
              case 'rectangle':
                return (
                  <MemoizedRect
                    key={obj.id}
                    id={obj.id}
                    x={obj.x}
                    y={obj.y}
                    width={obj.width}
                    height={obj.height}
                    rotation={obj.rotation}
                    fill={obj.color}
                    draggable
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    onTransformEnd={handleTransformEnd}
                    // GPU Performance optimizations
                    perfectDrawEnabled={false} // Faster rendering
                    shadowForStrokeEnabled={false} // Avoid expensive shadow calc
                  />
                );

              case 'circle':
                return (
                  <MemoizedCircle
                    key={obj.id}
                    id={obj.id}
                    x={obj.x}
                    y={obj.y}
                    radius={obj.width / 2}
                    rotation={obj.rotation}
                    fill={obj.color}
                    draggable
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    onTransformEnd={handleTransformEnd}
                    // GPU Performance optimizations
                    perfectDrawEnabled={false}
                    shadowForStrokeEnabled={false}
                  />
                );

              case 'text':
                return (
                  <Text
                    key={obj.id}
                    id={obj.id}
                    x={obj.x}
                    y={obj.y}
                    text={obj.text || ''}
                    fontSize={obj.fontSize || 16}
                    fontFamily={obj.fontFamily || 'Arial'}
                    fill={obj.color}
                    rotation={obj.rotation}
                    draggable
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    onTransformEnd={handleTransformEnd}
                    onDblClick={() => {
                      const stage = stageRef.current;
                      if (!stage) return;

                      // Get text position on screen
                      const textNode = stage.findOne(`#${obj.id}`) as Konva.Text;
                      if (!textNode) return;

                      const textPosition = textNode.getAbsolutePosition();
                      const stageBox = stage.container().getBoundingClientRect();

                      setEditingTextId(obj.id);
                      setTextareaValue(obj.text || '');
                      setTextareaPosition({
                        x: stageBox.left + textPosition.x * scale + position.x,
                        y: stageBox.top + textPosition.y * scale + position.y
                      });
                    }}
                  />
                );

              case 'line':
                return (
                  <Line
                    key={obj.id}
                    id={obj.id}
                    points={obj.points || [0, 0, 100, 100]}
                    stroke={obj.color}
                    strokeWidth={3}
                    rotation={obj.rotation}
                    draggable
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    onTransformEnd={handleTransformEnd}
                  />
                );

              case 'triangle':
                return (
                  <RegularPolygon
                    key={obj.id}
                    id={obj.id}
                    x={obj.x}
                    y={obj.y}
                    sides={3}
                    radius={obj.width / 2}
                    fill={obj.color}
                    rotation={obj.rotation}
                    draggable
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    onTransformEnd={handleTransformEnd}
                  />
                );

              case 'polygon':
                return (
                  <RegularPolygon
                    key={obj.id}
                    id={obj.id}
                    x={obj.x}
                    y={obj.y}
                    sides={6}
                    radius={obj.width / 2}
                    fill={obj.color}
                    rotation={obj.rotation}
                    draggable
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    onTransformEnd={handleTransformEnd}
                  />
                );

              case 'star':
                return (
                  <Star
                    key={obj.id}
                    id={obj.id}
                    x={obj.x}
                    y={obj.y}
                    numPoints={5}
                    innerRadius={obj.width / 4}
                    outerRadius={obj.width / 2}
                    fill={obj.color}
                    rotation={obj.rotation}
                    draggable
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    onTransformEnd={handleTransformEnd}
                  />
                );

              case 'arrow':
                return (
                  <Arrow
                    key={obj.id}
                    id={obj.id}
                    points={[0, 0, obj.width, 0]}
                    x={obj.x}
                    y={obj.y}
                    pointerLength={10}
                    pointerWidth={10}
                    fill={obj.color}
                    stroke={obj.color}
                    strokeWidth={3}
                    rotation={obj.rotation}
                    draggable
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    onTransformEnd={handleTransformEnd}
                  />
                );

              case 'ellipse':
                return (
                  <MemoizedEllipse
                    key={obj.id}
                    id={obj.id}
                    x={obj.x}
                    y={obj.y}
                    radiusX={obj.width / 2}
                    radiusY={obj.height / 2}
                    fill={obj.color}
                    rotation={obj.rotation}
                    draggable
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    onTransformEnd={handleTransformEnd}
                    // GPU Performance optimizations
                    perfectDrawEnabled={false}
                    shadowForStrokeEnabled={false}
                  />
                );

              case 'roundedRect':
                return (
                  <Rect
                    key={obj.id}
                    id={obj.id}
                    x={obj.x}
                    y={obj.y}
                    width={obj.width}
                    height={obj.height}
                    cornerRadius={10}
                    rotation={obj.rotation}
                    fill={obj.color}
                    draggable
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    onTransformEnd={handleTransformEnd}
                  />
                );

              case 'diamond':
                return (
                  <RegularPolygon
                    key={obj.id}
                    id={obj.id}
                    x={obj.x}
                    y={obj.y}
                    sides={4}
                    radius={obj.width / 2}
                    fill={obj.color}
                    rotation={obj.rotation + 45}
                    draggable
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    onTransformEnd={handleTransformEnd}
                  />
                );

              case 'pentagon':
                return (
                  <RegularPolygon
                    key={obj.id}
                    id={obj.id}
                    x={obj.x}
                    y={obj.y}
                    sides={5}
                    radius={obj.width / 2}
                    fill={obj.color}
                    rotation={obj.rotation}
                    draggable
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    onTransformEnd={handleTransformEnd}
                  />
                );

              default:
                return null;
            }
          })}

          {/* Area selection rectangle */}
          {selectionRect && (
            <Rect
              x={selectionRect.x}
              y={selectionRect.y}
              width={selectionRect.width}
              height={selectionRect.height}
              fill="rgba(0, 102, 255, 0.1)"
              stroke="#0066FF"
              strokeWidth={2}
              dash={[5, 5]}
              listening={false}
            />
          )}
        </Layer>
      </Stage>

      {/* Text editing textarea overlay */}
      {editingTextId && (
        <textarea
          autoFocus
          value={textareaValue}
          onChange={(e) => setTextareaValue(e.target.value)}
          onBlur={() => {
            // Save the edited text
            if (editingTextId) {
              onTransform(editingTextId, {
                text: textareaValue
              });
            }
            setEditingTextId(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setEditingTextId(null);
            } else if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              // Save and close
              if (editingTextId) {
                onTransform(editingTextId, {
                  text: textareaValue
                });
              }
              setEditingTextId(null);
            }
          }}
          style={{
            position: 'fixed',
            left: `${textareaPosition.x}px`,
            top: `${textareaPosition.y}px`,
            fontSize: `${(objects.find(obj => obj.id === editingTextId)?.fontSize || 16) * scale}px`,
            fontFamily: objects.find(obj => obj.id === editingTextId)?.fontFamily || 'Arial',
            color: objects.find(obj => obj.id === editingTextId)?.color || '#000',
            border: '2px solid #4A90E2',
            borderRadius: '4px',
            padding: '4px 8px',
            background: 'white',
            resize: 'both',
            minWidth: '100px',
            minHeight: '30px',
            zIndex: 1000,
            outline: 'none'
          }}
        />
      )}
    </>
  );
}

