/**
 * Graph Data Generator
 * 
 * Transforms platform content (pages, tags, clusters) into a network graph
 * with nodes and edges suitable for visualization.
 */

import { searchIndex } from '../../searchIndex';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface GraphNode {
  id: string;
  label: string;
  category: string;
  path: string;
  tags: string[];
  cluster: string;
  color: string;
  size: number;
  type: 'page' | 'concept' | 'cluster';
}

export interface GraphEdge {
  source: string;
  target: string;
  strength: number; // 0-1, determines edge thickness
  type: 'tag-based' | 'category-progression' | 'cluster-based';
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: ClusterInfo[];
}

export interface ClusterInfo {
  id: string;
  name: string;
  color: string;
  tags: string[];
  description: string;
}

// ============================================================================
// CLUSTER DEFINITIONS
// ============================================================================

export const CLUSTERS: Record<string, ClusterInfo> = {
  'foundations': {
    id: 'foundations',
    name: 'Foundations Core',
    color: '#8B5CF6',
    tags: ['foundations', 'mindset', 'ecology', 'mycelium', 'systems-thinking'],
    description: 'Fundamental concepts and theory'
  },
  'environmental': {
    id: 'environmental',
    name: 'Environment–Symptom',
    color: '#06B6D4',
    tags: ['environmental-control', 'temperature', 'humidity', 'fae', 'co2', 'light', 'troubleshooting'],
    description: 'Environmental factors and symptoms'
  },
  'species-substrate': {
    id: 'species-substrate',
    name: 'Species–Substrate',
    color: '#10B981',
    tags: ['oyster', 'shiitake', 'lions-mane', 'reishi', 'substrates', 'grain', 'sawdust'],
    description: 'Species and substrate relationships'
  },
  'tools': {
    id: 'tools',
    name: 'Tool Integration',
    color: '#F59E0B',
    tags: ['tools', 'systems-map', 'comparison', 'selector', 'decision-tree'],
    description: 'Interactive tools and utilities'
  },
  'beginner': {
    id: 'beginner',
    name: 'Beginner Pathway',
    color: '#EC4899',
    tags: ['beginner', 'pathway', 'step', 'learning-path'],
    description: 'Structured beginner learning path'
  },
  'advanced': {
    id: 'advanced',
    name: 'Advanced Modules',
    color: '#EF4444',
    tags: ['advanced', 'expert', 'optimization', 'engineering'],
    description: 'Advanced cultivation techniques'
  },
  'medicinal': {
    id: 'medicinal',
    name: 'Medicinal Mushrooms',
    color: '#84CC16',
    tags: ['medicinal', 'beta-glucans', 'triterpenes', 'preparation'],
    description: 'Medicinal properties and preparation'
  }
};

// ============================================================================
// GRAPH DATA GENERATOR
// ============================================================================

/**
 * Determine which cluster a page belongs to (primary cluster)
 */
function getPageCluster(tags: string[]): string {
  for (const [clusterId, clusterInfo] of Object.entries(CLUSTERS)) {
    if (tags.some(tag => clusterInfo.tags.includes(tag))) {
      return clusterId;
    }
  }
  return 'foundations'; // Default
}

/**
 * Calculate node size based on page importance
 */
function calculateNodeSize(category: string, tags: string[]): number {
  const baseSize = 20;
  const categoryBoost: Record<string, number> = {
    'Foundations': 30,
    'Beginner Pathway': 25,
    'Growing Guides': 22,
    'Advanced': 26,
    'Tools': 24,
    'Troubleshooting': 23,
  };
  
  const tagCount = Math.min(tags.length / 10, 5);
  return baseSize + (categoryBoost[category] || 20) + tagCount;
}

/**
 * Calculate edge strength based on shared tags and clusters
 */
function calculateEdgeStrength(tags1: string[], tags2: string[], cluster1: string, cluster2: string): number {
  let strength = 0;
  
  // Tag overlap
  const commonTags = tags1.filter(t => tags2.includes(t)).length;
  strength += (commonTags / Math.max(tags1.length, tags2.length)) * 0.6;
  
  // Cluster match
  if (cluster1 === cluster2) {
    strength += 0.4;
  }
  
  return Math.min(strength, 1);
}

/**
 * Generate graph data from searchIndex
 */
export function generateGraphData(): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const nodeMap = new Map<string, GraphNode>();

  // Create nodes from searchIndex
  for (const page of searchIndex) {
    const cluster = getPageCluster(page.tags);
    const clusterInfo = CLUSTERS[cluster];
    
    const node: GraphNode = {
      id: page.path,
      label: page.title,
      category: page.category,
      path: page.path,
      tags: page.tags,
      cluster,
      color: clusterInfo.color,
      size: calculateNodeSize(page.category, page.tags),
      type: 'page'
    };
    
    nodes.push(node);
    nodeMap.set(page.path, node);
  }

  // Create edges based on tag overlap and progression
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const node1 = nodes[i];
      const node2 = nodes[j];
      
      // Skip if too different (avoid clutter)
      const strength = calculateEdgeStrength(node1.tags, node2.tags, node1.cluster, node2.cluster);
      
      if (strength > 0.15) {
        edges.push({
          source: node1.id,
          target: node2.id,
          strength,
          type: node1.cluster === node2.cluster ? 'cluster-based' : 'tag-based'
        });
      }
    }
  }

  return {
    nodes,
    edges,
    clusters: Object.values(CLUSTERS)
  };
}

/**
 * Filter graph nodes by criteria
 */
export function filterGraphNodes(
  nodes: GraphNode[],
  filters: {
    categories?: string[];
    clusters?: string[];
    tags?: string[];
    searchTerm?: string;
  }
): GraphNode[] {
  return nodes.filter(node => {
    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(node.category)) {
        return false;
      }
    }

    // Cluster filter
    if (filters.clusters && filters.clusters.length > 0) {
      if (!filters.clusters.includes(node.cluster)) {
        return false;
      }
    }

    // Tag filter
    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.some(tag => node.tags.includes(tag))) {
        return false;
      }
    }

    // Search filter
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const term = filters.searchTerm.toLowerCase();
      if (!node.label.toLowerCase().includes(term) && 
          !node.tags.some(tag => tag.toLowerCase().includes(term))) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get related nodes (connected via edges)
 */
export function getRelatedNodes(
  nodeId: string,
  edges: GraphEdge[],
  maxDepth: number = 1
): Set<string> {
  const relatedIds = new Set<string>();
  const queue: Array<{ id: string; depth: number }> = [{ id: nodeId, depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (current.depth > maxDepth) continue;

    const connectedEdges = edges.filter(
      e => e.source === current.id || e.target === current.id
    );

    for (const edge of connectedEdges) {
      const nextId = edge.source === current.id ? edge.target : edge.source;
      
      if (!relatedIds.has(nextId)) {
        relatedIds.add(nextId);
        queue.push({ id: nextId, depth: current.depth + 1 });
      }
    }
  }

  return relatedIds;
}

/**
 * Get cluster statistics
 */
export function getClusterStats(nodes: GraphNode[]): Record<string, number> {
  const stats: Record<string, number> = {};
  
  for (const cluster of Object.keys(CLUSTERS)) {
    stats[cluster] = nodes.filter(n => n.cluster === cluster).length;
  }
  
  return stats;
}

/**
 * Get unique tags from nodes
 */
export function getUniqueTags(nodes: GraphNode[]): string[] {
  const tags = new Set<string>();
  for (const node of nodes) {
    node.tags.forEach(tag => tags.add(tag));
  }
  return Array.from(tags).sort();
}

/**
 * Get categories from nodes
 */
export function getUniqueCategories(nodes: GraphNode[]): string[] {
  const categories = new Set<string>();
  for (const node of nodes) {
    categories.add(node.category);
  }
  return Array.from(categories).sort();
}

/**
 * Find shortest path between two nodes (for highlighting)
 */
export function findShortestPath(
  startId: string,
  endId: string,
  edges: GraphEdge[]
): string[] | null {
  if (startId === endId) return [startId];

  const queue: Array<{ id: string; path: string[] }> = [{
    id: startId,
    path: [startId]
  }];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (visited.has(current.id)) continue;
    visited.add(current.id);

    const connectedEdges = edges.filter(
      e => e.source === current.id || e.target === current.id
    );

    for (const edge of connectedEdges) {
      const nextId = edge.source === current.id ? edge.target : edge.source;
      
      if (nextId === endId) {
        return [...current.path, endId];
      }

      if (!visited.has(nextId)) {
        queue.push({
          id: nextId,
          path: [...current.path, nextId]
        });
      }
    }
  }

  return null;
}

/**
 * Calculate layout positions using force-directed algorithm (Fruchterman-Reingold)
 * Returns positions for each node
 */
export function calculateLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
  iterations: number = 50
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const velocities = new Map<string, { x: number; y: number }>();

  // Initialize random positions
  for (const node of nodes) {
    positions.set(node.id, {
      x: Math.random() * width,
      y: Math.random() * height
    });
    velocities.set(node.id, { x: 0, y: 0 });
  }

  const k = Math.sqrt((width * height) / nodes.length); // Optimal distance
  const maxRepulsiveForce = 5;

  // Iterate force calculation
  for (let iter = 0; iter < iterations; iter++) {
    // Reset velocities
    for (const node of nodes) {
      velocities.set(node.id, { x: 0, y: 0 });
    }

    // Repulsive forces
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const pos1 = positions.get(nodes[i].id)!;
        const pos2 = positions.get(nodes[j].id)!;
        
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const distance = Math.hypot(dx, dy) || 0.1;
        
        const force = Math.min(maxRepulsiveForce, (k * k) / distance);
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        const vel1 = velocities.get(nodes[i].id)!;
        const vel2 = velocities.get(nodes[j].id)!;
        vel1.x -= fx;
        vel1.y -= fy;
        vel2.x += fx;
        vel2.y += fy;
      }
    }

    // Attractive forces
    for (const edge of edges) {
      const pos1 = positions.get(edge.source)!;
      const pos2 = positions.get(edge.target)!;
      
      const dx = pos2.x - pos1.x;
      const dy = pos2.y - pos1.y;
      const distance = Math.hypot(dx, dy) || 0.1;
      
      const force = (distance * distance) / k * edge.strength;
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;

      const vel1 = velocities.get(edge.source)!;
      const vel2 = velocities.get(edge.target)!;
      vel1.x += fx;
      vel1.y += fy;
      vel2.x -= fx;
      vel2.y -= fy;
    }

    // Update positions
    for (const node of nodes) {
      const pos = positions.get(node.id)!;
      const vel = velocities.get(node.id)!;
      
      pos.x += vel.x * 0.1;
      pos.y += vel.y * 0.1;
      
      // Keep within bounds
      pos.x = Math.max(0, Math.min(width, pos.x));
      pos.y = Math.max(0, Math.min(height, pos.y));
    }
  }

  return positions;
}
