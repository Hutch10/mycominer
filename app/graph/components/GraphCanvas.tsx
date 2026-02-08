'use client';

import { useEffect, useRef, useState } from 'react';
import { GraphNode, GraphEdge, GraphData } from '../utils/graphData';

interface GraphCanvasProps {
  data: GraphData;
  width: number;
  height: number;
  visibleNodeIds?: Set<string>;
  highlightedNodeId?: string;
  highlightedPath?: string[];
  onNodeHover?: (nodeId: string | null) => void;
  onNodeClick?: (nodeId: string) => void;
}

interface Position {
  x: number;
  y: number;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

export default function GraphCanvas({
  data,
  width,
  height,
  visibleNodeIds,
  highlightedNodeId,
  highlightedPath = [],
  onNodeHover,
  onNodeClick
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [positions, setPositions] = useState<Map<string, Position>>(new Map());
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const animationRef = useRef<number | null>(null);
  const transformRef = useRef<Transform>({ x: 0, y: 0, scale: 1 });
  const positionsRef = useRef<Map<string, Position>>(new Map());

  // Initialize positions and animation
  useEffect(() => {
    // Simple layout: distribute nodes in circles per cluster
    const newPositions = new Map<string, Position>();
    const clusters = new Map<string, GraphNode[]>();

    // Group nodes by cluster
    data.nodes.forEach(node => {
      if (!clusters.has(node.cluster)) {
        clusters.set(node.cluster, []);
      }
      clusters.get(node.cluster)!.push(node);
    });

    // Position nodes in clusters
    let clusterIndex = 0;
    for (const [cluster, nodes] of clusters.entries()) {
      const angle = (clusterIndex / clusters.size) * Math.PI * 2;
      const centerX = width / 2 + Math.cos(angle) * 150;
      const centerY = height / 2 + Math.sin(angle) * 150;
      const radius = Math.max(60, 40 + nodes.length * 3);

      nodes.forEach((node, nodeIndex) => {
        const nodeAngle = (nodeIndex / nodes.length) * Math.PI * 2;
        newPositions.set(node.id, {
          x: centerX + Math.cos(nodeAngle) * radius,
          y: centerY + Math.sin(nodeAngle) * radius
        });
      });

      clusterIndex++;
    }

    setPositions(newPositions);
    positionsRef.current = newPositions;
  }, [data.nodes, width, height]);

  // Handle canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = 'rgb(255, 255, 255)';
      ctx.fillRect(0, 0, width, height);

      const t = transformRef.current;

      // Draw edges
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
      ctx.lineWidth = 1;

      data.edges.forEach(edge => {
        if (visibleNodeIds && !visibleNodeIds.has(edge.source) && !visibleNodeIds.has(edge.target)) {
          return;
        }

        const pos1 = positionsRef.current.get(edge.source);
        const pos2 = positionsRef.current.get(edge.target);

        if (!pos1 || !pos2) return;

        const x1 = (pos1.x + t.x) * t.scale;
        const y1 = (pos1.y + t.y) * t.scale;
        const x2 = (pos2.x + t.x) * t.scale;
        const y2 = (pos2.y + t.y) * t.scale;

        // Check if path should be highlighted
        const isHighlighted = highlightedPath.includes(edge.source) && highlightedPath.includes(edge.target);
        if (isHighlighted) {
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
          ctx.lineWidth = edge.strength;
        }

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // Draw nodes
      data.nodes.forEach(node => {
        if (visibleNodeIds && !visibleNodeIds.has(node.id)) {
          return;
        }

        const pos = positionsRef.current.get(node.id);
        if (!pos) return;

        const x = (pos.x + t.x) * t.scale;
        const y = (pos.y + t.y) * t.scale;
        const size = node.size * t.scale;

        // Draw node circle
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Highlight border if hovered or in path
        if (hoveredNodeId === node.id || highlightedNodeId === node.id || highlightedPath.includes(node.id)) {
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw label (simplified)
        if (size > 5) {
          ctx.fillStyle = '#000';
          ctx.font = `${Math.max(10, size * 0.8)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const label = node.label.length > 15 ? node.label.substring(0, 12) + '...' : node.label;
          if (size > 10) {
            ctx.fillText(label, x, y);
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [data, visibleNodeIds, highlightedNodeId, highlightedPath, hoveredNodeId, width, height]);

  // Handle mouse interactions
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const t = transformRef.current;

    let hoveredId: string | null = null;

    // Check which node is hovered
    for (const node of data.nodes) {
      if (visibleNodeIds && !visibleNodeIds.has(node.id)) continue;

      const pos = positionsRef.current.get(node.id);
      if (!pos) continue;

      const x = (pos.x + t.x) * t.scale;
      const y = (pos.y + t.y) * t.scale;
      const size = node.size * t.scale;

      const distance = Math.hypot(mouseX - x, mouseY - y);
      if (distance < size + 5) {
        hoveredId = node.id;
        break;
      }
    }

    setHoveredNodeId(hoveredId);
    onNodeHover?.(hoveredId);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredNodeId) {
      onNodeClick?.(hoveredNodeId);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    const zoomSpeed = 0.1;
    const newScale = Math.max(0.5, Math.min(3, transformRef.current.scale + (e.deltaY > 0 ? -zoomSpeed : zoomSpeed)));
    
    transformRef.current = {
      ...transformRef.current,
      scale: newScale
    };
    setTransform({ ...transformRef.current });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startTransform = { ...transformRef.current };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startX) / transformRef.current.scale;
      const deltaY = (moveEvent.clientY - startY) / transformRef.current.scale;

      transformRef.current = {
        ...startTransform,
        x: startTransform.x + deltaX,
        y: startTransform.y + deltaY
      };
      setTransform({ ...transformRef.current });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      className="border border-gray-300 dark:border-gray-600 rounded-lg cursor-grab active:cursor-grabbing bg-white dark:bg-gray-900"
      style={{ display: 'block' }}
    />
  );
}
