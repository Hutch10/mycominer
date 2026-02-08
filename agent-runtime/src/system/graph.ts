/**
 * Graph System - Explainability and reasoning chains
 */

export interface GraphNode {
  id: string;
  type: 'agent' | 'decision' | 'policy' | 'data' | 'outcome';
  label: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  weight?: number;
}

export interface ReasoningGraph {
  sessionId: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  createdAt: string;
  lastUpdate: string;
}

class GraphSystem {
  private graphs: Map<string, ReasoningGraph> = new Map();
  private maxNodesPerGraph: number = 300;

  initializeGraph(sessionId: string): void {
    if (!this.graphs.has(sessionId)) {
      this.graphs.set(sessionId, {
        sessionId,
        nodes: [],
        edges: [],
        createdAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
      });
    }
  }

  addNode(sessionId: string, node: Omit<GraphNode, 'id' | 'timestamp'>): string {
    this.initializeGraph(sessionId);
    const graph = this.graphs.get(sessionId)!;

    const nodeId = `node_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newNode: GraphNode = {
      ...node,
      id: nodeId,
      timestamp: new Date().toISOString(),
    };

    graph.nodes.push(newNode);
    graph.lastUpdate = new Date().toISOString();

    if (graph.nodes.length > this.maxNodesPerGraph) {
      const overflow = graph.nodes.length - this.maxNodesPerGraph;
      const removedNodes = graph.nodes.splice(0, overflow);
      const removedIds = new Set(removedNodes.map(node => node.id));
      graph.edges = graph.edges.filter(edge =>
        !removedIds.has(edge.source) && !removedIds.has(edge.target)
      );
    }

    return nodeId;
  }

  addEdge(sessionId: string, source: string, target: string, label?: string, weight?: number): string {
    this.initializeGraph(sessionId);
    const graph = this.graphs.get(sessionId)!;

    const edgeId = `edge_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newEdge: GraphEdge = {
      id: edgeId,
      source,
      target,
      label,
      weight,
    };

    graph.edges.push(newEdge);
    graph.lastUpdate = new Date().toISOString();

    return edgeId;
  }

  getGraph(sessionId: string): ReasoningGraph | undefined {
    return this.graphs.get(sessionId);
  }

  getReasoningPath(sessionId: string, startNodeId: string, endNodeId: string): GraphNode[] {
    const graph = this.graphs.get(sessionId);
    if (!graph) return [];

    // Simple BFS to find path
    const visited = new Set<string>();
    const queue: { nodeId: string; path: GraphNode[] }[] = [];
    
    const startNode = graph.nodes.find(n => n.id === startNodeId);
    if (!startNode) return [];

    queue.push({ nodeId: startNodeId, path: [startNode] });
    visited.add(startNodeId);

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;

      if (nodeId === endNodeId) {
        return path;
      }

      const outgoingEdges = graph.edges.filter(e => e.source === nodeId);
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          const targetNode = graph.nodes.find(n => n.id === edge.target);
          if (targetNode) {
            visited.add(edge.target);
            queue.push({ nodeId: edge.target, path: [...path, targetNode] });
          }
        }
      }
    }

    return [];
  }

  getNodesByType(sessionId: string, type: GraphNode['type']): GraphNode[] {
    const graph = this.graphs.get(sessionId);
    if (!graph) return [];

    return graph.nodes.filter(n => n.type === type);
  }

  clearGraph(sessionId: string): void {
    this.graphs.delete(sessionId);
  }

  getAllGraphs(): string[] {
    return Array.from(this.graphs.keys());
  }

  getStats() {
    let totalNodes = 0;
    let totalEdges = 0;

    for (const graph of this.graphs.values()) {
      totalNodes += graph.nodes.length;
      totalEdges += graph.edges.length;
    }

    return {
      totalGraphs: this.graphs.size,
      totalNodes,
      totalEdges,
      averageNodesPerGraph: this.graphs.size > 0 ? totalNodes / this.graphs.size : 0,
      averageEdgesPerGraph: this.graphs.size > 0 ? totalEdges / this.graphs.size : 0,
    };
  }

  exportGraph(sessionId: string): ReasoningGraph | undefined {
    return this.getGraph(sessionId);
  }
}

const graphSystem = new GraphSystem();
export default graphSystem;
