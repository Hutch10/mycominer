import { buildKnowledgeGraph, GraphBuilderInput, BuiltGraph } from './graphBuilder';
import { createGraphIndex, GraphIndex } from './graphIndexer';
import { executeSemanticQuery } from './semanticQueryEngine';
import { KGQuery, KGResult } from './knowledgeGraphTypes';
import { logGraphEvent } from './knowledgeGraphLog';

export interface KnowledgeGraphState {
  graph: BuiltGraph;
  index: GraphIndex;
}

export function initializeKnowledgeGraph(input: GraphBuilderInput): KnowledgeGraphState {
  const graph = buildKnowledgeGraph(input);
  const index = createGraphIndex(graph.nodes, graph.edges);
  logGraphEvent('build', 'Knowledge graph initialized and indexed', { nodes: graph.nodes.length, edges: graph.edges.length });
  return { graph, index };
}

export function runKnowledgeGraphQuery(state: KnowledgeGraphState, query: KGQuery): KGResult {
  const result = executeSemanticQuery(query, { nodes: state.graph.nodes, edges: state.graph.edges, index: state.index });
  return result;
}
