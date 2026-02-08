'use client';

import { useState, useEffect } from 'react';
import GraphCanvas from './components/GraphCanvas';
import GraphSidebar from './components/GraphSidebar';
import NodeTooltip from './components/NodeTooltip';
import ClusterLegend from './components/ClusterLegend';
import FilterPanel from './components/FilterPanel';
import {
  generateGraphData,
  filterGraphNodes,
  getUniqueCategories,
  getUniqueTags,
  type GraphNode,
  type GraphData
} from './utils/graphData';

export default function GraphPageClient() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [visibleNodeIds, setVisibleNodeIds] = useState<Set<string>>(new Set());
  const [selectedClusters, setSelectedClusters] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  // Initialize graph data
  useEffect(() => {
    const data = generateGraphData();
    setGraphData(data);
    
    // Select all clusters by default
    const clusterIds = new Set(data.clusters.map(c => c.id));
    setSelectedClusters(clusterIds);
    
    // Get all categories and tags
    const categories = getUniqueCategories(data.nodes);
    const tags = getUniqueTags(data.nodes);
    setAllCategories(categories);
    setAllTags(tags);
    
    // Show all nodes by default
    setVisibleNodeIds(new Set(data.nodes.map(n => n.id)));
  }, []);

  // Update visible nodes when filters change
  useEffect(() => {
    if (!graphData) return;

    const filters = {
      categories: selectedCategories.size > 0 ? Array.from(selectedCategories) : undefined,
      clusters: selectedClusters.size > 0 ? Array.from(selectedClusters) : undefined,
      tags: selectedTags.size > 0 ? Array.from(selectedTags) : undefined,
      searchTerm: searchTerm || undefined
    };

    const filteredNodes = filterGraphNodes(graphData.nodes, filters);
    setVisibleNodeIds(new Set(filteredNodes.map(n => n.id)));
  }, [graphData, selectedCategories, selectedClusters, selectedTags, searchTerm]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvasContainer = document.getElementById('graph-container');
      if (canvasContainer) {
        setWindowSize({
          width: canvasContainer.clientWidth,
          height: canvasContainer.clientHeight
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCategoryToggle = (category: string) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setSelectedCategories(newSet);
  };

  const handleClusterToggle = (clusterId: string) => {
    const newSet = new Set(selectedClusters);
    if (newSet.has(clusterId)) {
      newSet.delete(clusterId);
    } else {
      newSet.add(clusterId);
    }
    setSelectedClusters(newSet);
  };

  const handleTagToggle = (tag: string) => {
    const newSet = new Set(selectedTags);
    if (newSet.has(tag)) {
      newSet.delete(tag);
    } else {
      newSet.add(tag);
    }
    setSelectedTags(newSet);
  };

  const handleClearAll = () => {
    setSelectedCategories(new Set());
    setSelectedTags(new Set());
    setSearchTerm('');
  };

  const hoveredNode = graphData?.nodes.find(n => n.id === hoveredNodeId) || null;

  if (!graphData || windowSize.width === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-600 dark:text-gray-400">
        <p>Loading knowledge graph...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          🕸️ Interactive Knowledge Network
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          Explore how content is connected through semantic relationships. Use filters to focus on specific topics, hover to see details, and click to navigate.
        </p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">{visibleNodeIds.size}</div>
            <div className="text-gray-600 dark:text-gray-400">Visible Nodes</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {graphData.edges.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Relationships</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {graphData.clusters.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Clusters</div>
          </div>
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <GraphSidebar
            nodeCount={visibleNodeIds.size}
            edgeCount={graphData.edges.length}
            clusterCount={graphData.clusters.length}
            selectedNode={hoveredNode ? { label: hoveredNode.label, category: hoveredNode.category } : null}
          />

          <ClusterLegend
            clusters={graphData.clusters}
            selectedClusters={selectedClusters}
            onToggleCluster={handleClusterToggle}
          />

          <FilterPanel
            categories={allCategories}
            tags={allTags}
            selectedCategories={selectedCategories}
            selectedTags={selectedTags}
            searchTerm={searchTerm}
            onCategoryToggle={handleCategoryToggle}
            onTagToggle={handleTagToggle}
            onSearchChange={setSearchTerm}
            onClearAll={handleClearAll}
          />
        </div>

        {/* Graph Canvas */}
        <div className="lg:col-span-3">
          <div
            id="graph-container"
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            style={{ height: '600px' }}
            onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
          >
            {windowSize.width > 0 && (
              <GraphCanvas
                data={graphData}
                width={windowSize.width}
                height={600}
                visibleNodeIds={visibleNodeIds}
                onNodeHover={(nodeId) => setHoveredNodeId(nodeId)}
                onNodeClick={(nodeId) => {
                  const node = graphData.nodes.find(n => n.id === nodeId);
                  if (node) {
                    window.location.href = node.path;
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Node Tooltip */}
      <NodeTooltip node={hoveredNode} x={mousePos.x} y={mousePos.y} />

      {/* Information Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 How to Use</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>• <strong>Scroll:</strong> Zoom in and out</li>
            <li>• <strong>Drag:</strong> Pan around the graph</li>
            <li>• <strong>Hover:</strong> See node details</li>
            <li>• <strong>Click:</strong> Navigate to page</li>
            <li>• <strong>Filter:</strong> Focus on topics</li>
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-lg">
          <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2">🎯 What You See</h3>
          <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
            <li>• <strong>Nodes:</strong> Pages and concepts</li>
            <li>• <strong>Edges:</strong> Semantic relationships</li>
            <li>• <strong>Colors:</strong> Knowledge clusters</li>
            <li>• <strong>Size:</strong> Content importance</li>
            <li>• <strong>Density:</strong> Topic interconnection</li>
          </ul>
        </div>
      </div>

      {/* Cluster Descriptions */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <span>🔬</span> Knowledge Clusters Explained
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {graphData.clusters.map((cluster) => (
            <div key={cluster.id} className="flex gap-3">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                style={{ backgroundColor: cluster.color }}
              />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  {cluster.name}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {cluster.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
