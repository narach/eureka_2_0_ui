import { useState, useRef, useEffect, useCallback } from 'react';
import { Entity } from '../types';

interface HypothesisGraphProps {
  entities: Entity[];
  onEntityMove: (id: string, x: number, y: number) => void;
  onConnectionSelect?: (connection: { from: Entity; to: Entity } | null) => void;
  onEntitySelect?: (entity: Entity | null) => void;
}

const getEntityColor = (type: Entity['type']) => {
  switch (type) {
    case 'disease':
      return 'bg-orange-200'; // Peach color
    case 'target':
      return 'bg-green-300';
    case 'drug':
      return 'bg-blue-400';
    default:
      return 'bg-gray-400';
  }
};

const HypothesisGraph = ({ entities, onEntityMove, onConnectionSelect, onEntitySelect }: HypothesisGraphProps) => {
  const [draggedEntity, setDraggedEntity] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggedEntityRef = useRef<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent, entityId: string) => {
    const entity = entities.find(e => e.id === entityId);
    if (!entity) return;

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    isDraggingRef.current = false;
    setDraggedEntity(entityId);
    draggedEntityRef.current = entityId;
    const offset = {
      x: e.clientX - containerRect.left - entity.x,
      y: e.clientY - containerRect.top - entity.y,
    };
    dragOffsetRef.current = offset;
  };

  const handleEntityClick = (e: React.MouseEvent, entityId: string) => {
    // Only trigger click if we didn't drag
    if (!isDraggingRef.current) {
      const entity = entities.find(e => e.id === entityId);
      if (entity && onEntitySelect) {
        const newSelection = selectedEntity === entityId ? null : entityId;
        setSelectedEntity(newSelection);
        // Clear connection selection when selecting an entity
        setSelectedConnection(null);
        if (onConnectionSelect) {
          onConnectionSelect(null);
        }
        onEntitySelect(newSelection ? entity : null);
      }
    }
    isDraggingRef.current = false;
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedEntityRef.current || !containerRef.current) return;

    isDraggingRef.current = true;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragOffsetRef.current.x;
    const newY = e.clientY - containerRect.top - dragOffsetRef.current.y;

    // Constrain to container bounds
    const maxX = containerRect.width - 120;
    const maxY = containerRect.height - 80;
    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));

    onEntityMove(draggedEntityRef.current, constrainedX, constrainedY);
  }, [onEntityMove]);

  const handleMouseUp = useCallback(() => {
    setDraggedEntity(null);
    draggedEntityRef.current = null;
    // Reset dragging flag after a short delay to allow click handler to check it
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);
  }, []);

  useEffect(() => {
    if (draggedEntity) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedEntity, handleMouseMove, handleMouseUp]);

  // Create connections based on entity order (Obesity <- GLP-1 receptor <- Ozempic)
  // For vertical layout: bottom card (higher y) -> top card (lower y)
  const connections: Array<{ from: Entity; to: Entity; id: number }> = [];
  const sortedEntities = [...entities].sort((a, b) => {
    // Sort by y position (top to bottom) for vertical layout
    return a.y - b.y;
  });

  for (let i = 0; i < sortedEntities.length - 1; i++) {
    // Bottom card (higher y) connects to top card (lower y)
    connections.push({
      from: sortedEntities[i + 1], // Bottom card
      to: sortedEntities[i], // Top card
      id: i,
    });
  }

  const handleConnectionClick = (connectionId: number) => {
    const newSelection = selectedConnection === connectionId ? null : connectionId;
    setSelectedConnection(newSelection);
    // Clear entity selection when selecting a connection
    setSelectedEntity(null);
    if (onEntitySelect) {
      onEntitySelect(null);
    }
    
    // Notify parent about connection selection
    if (onConnectionSelect) {
      if (newSelection !== null) {
        const conn = connections[newSelection];
        onConnectionSelect({ from: conn.from, to: conn.to });
      } else {
        onConnectionSelect(null);
      }
    }
  };

  const isEntitySelected = (entityId: string) => {
    if (selectedConnection === null) return false;
    const conn = connections[selectedConnection];
    return conn.from.id === entityId || conn.to.id === entityId;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ cursor: draggedEntity ? 'grabbing' : 'default' }}
    >
      {/* SVG for connections */}
      <svg className="absolute inset-0 w-full h-full">
        {connections.map((conn) => {
          const fromX = conn.from.x + 60;
          const fromY = conn.from.y + 40;
          const toX = conn.to.x + 60;
          const toY = conn.to.y + 40;
          const isSelected = selectedConnection === conn.id;

          // Create a wider clickable area for the connection
          const clickableWidth = 20; // Width of clickable area

          return (
            <g key={conn.id}>
              {/* Clickable area (invisible but wider) */}
              <line
                x1={fromX}
                y1={fromY}
                x2={toX}
                y2={toY}
                stroke="transparent"
                strokeWidth={clickableWidth}
                cursor="pointer"
                onClick={() => handleConnectionClick(conn.id)}
              />
              {/* Visible connection line */}
              <line
                x1={fromX}
                y1={fromY}
                x2={toX}
                y2={toY}
                stroke={isSelected ? "#EAB308" : "#4B5563"}
                strokeWidth={isSelected ? "4" : "2"}
                markerEnd={isSelected ? "url(#arrowhead-yellow)" : "url(#arrowhead-gray)"}
                pointerEvents="none"
              />
            </g>
          );
        })}
        <defs>
          <marker
            id="arrowhead-gray"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="5"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#4B5563" />
          </marker>
          <marker
            id="arrowhead-yellow"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="5"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#EAB308" />
          </marker>
        </defs>
      </svg>

      {/* Entity cards */}
      {entities.map((entity) => {
        const isSelected = isEntitySelected(entity.id);
        const isEntitySelectedForNew = selectedEntity === entity.id;
        return (
          <div
            key={entity.id}
            className={`absolute ${getEntityColor(entity.type)} rounded-lg shadow-lg p-4 cursor-grab active:cursor-grabbing min-w-[120px] text-center transition-transform ${
              draggedEntity === entity.id ? 'scale-105 z-10' : 'z-0'
            }`}
            style={{
              left: `${entity.x}px`,
              top: `${entity.y}px`,
              borderWidth: isSelected ? '5px' : isEntitySelectedForNew ? '5px' : '2px',
              borderColor: isSelected ? '#DC2626' : isEntitySelectedForNew ? '#DC2626' : '#374151',
              borderStyle: 'solid',
            }}
            onMouseDown={(e) => handleMouseDown(e, entity.id)}
            onClick={(e) => handleEntityClick(e, entity.id)}
          >
            <div className="font-semibold text-black text-sm">
              {entity.name}
            </div>
            <div className="text-xs text-black/80 mt-1 capitalize">
              {entity.type}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HypothesisGraph;

