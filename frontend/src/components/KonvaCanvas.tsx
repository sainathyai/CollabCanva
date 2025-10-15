import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Transformer } from 'react-konva';
import Konva from 'konva';
import { CanvasObject } from '../types';

interface KonvaCanvasProps {
  objects: CanvasObject[];
  selectedIds: Set<string>;
  onSelect: (ids: Set<string>) => void;
  onTransform: (id: string, attrs: Partial<CanvasObject>) => void;
  stageWidth: number;
  stageHeight: number;
}

export function KonvaCanvas({
  objects,
  selectedIds,
  onSelect,
  onTransform,
  stageWidth,
  stageHeight
}: KonvaCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Update transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current) return;

    const stage = stageRef.current;
    if (!stage) return;

    const selectedNodes = Array.from(selectedIds).map(id => 
      stage.findOne(`#${id}`)
    ).filter(Boolean) as Konva.Node[];

    transformerRef.current.nodes(selectedNodes);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedIds]);

  const handleSelect = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      onSelect(new Set());
      return;
    }

    const id = e.target.id();
    if (!id) return;

    const isMultiSelect = e.evt.shiftKey;
    if (isMultiSelect) {
      const newSelection = new Set(selectedIds);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      onSelect(newSelection);
    } else {
      onSelect(new Set([id]));
    }
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

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const id = node.id();
    if (!id) return;

    onTransform(id, {
      x: node.x(),
      y: node.y()
    });
  };

  return (
    <Stage
      ref={stageRef}
      width={stageWidth}
      height={stageHeight}
      onMouseDown={handleSelect}
      onTouchStart={handleSelect}
    >
      <Layer>
        {objects.map(obj => {
          switch (obj.type) {
            case 'rectangle':
              return (
                <Rect
                  key={obj.id}
                  id={obj.id}
                  x={obj.x}
                  y={obj.y}
                  width={obj.width}
                  height={obj.height}
                  rotation={obj.rotation}
                  fill={obj.color}
                  draggable
                  onDragEnd={handleDragEnd}
                  onTransformEnd={handleTransformEnd}
                />
              );

            case 'circle':
              return (
                <Circle
                  key={obj.id}
                  id={obj.id}
                  x={obj.x}
                  y={obj.y}
                  radius={obj.width / 2}
                  rotation={obj.rotation}
                  fill={obj.color}
                  draggable
                  onDragEnd={handleDragEnd}
                  onTransformEnd={handleTransformEnd}
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
                  onDragEnd={handleDragEnd}
                  onTransformEnd={handleTransformEnd}
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
                  onDragEnd={handleDragEnd}
                  onTransformEnd={handleTransformEnd}
                />
              );

            default:
              return null;
          }
        })}

        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize to minimum 5x5
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      </Layer>
    </Stage>
  );
}

