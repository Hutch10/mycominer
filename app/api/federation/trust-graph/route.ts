/**
 * Federation Trust Graph API
 * GET /api/federation/trust-graph
 * 
 * Exports the federation trust graph for visualization
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { federationGraphBuilder } from '@/app/federation/services/FederationGraphBuilder';
import { federationRegistry } from '@/app/federation/services/FederationRegistry';

const QuerySchema = z.object({
  minTrustScore: z.coerce.number().min(0).max(100).optional(),
  includeTypes: z.string().optional(), // Comma-separated node types
  maxNodes: z.coerce.number().min(10).max(500).default(100),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const validated = QuerySchema.parse({
      minTrustScore: searchParams.get('minTrustScore'),
      includeTypes: searchParams.get('includeTypes'),
      maxNodes: searchParams.get('maxNodes'),
    });

    // Export graph
    const graph = await federationGraphBuilder.exportForVisualization();

    // Filter by trust score if specified
    if (validated.minTrustScore !== undefined) {
      graph.nodes = graph.nodes.filter(node => {
        if (node.type === 'organization') {
          return node.size >= validated.minTrustScore!;
        }
        return true;
      });
    }

    // Filter by node types if specified
    if (validated.includeTypes) {
      const types = validated.includeTypes.split(',');
      graph.nodes = graph.nodes.filter(node => types.includes(node.type));
    }

    // Limit nodes
    if (graph.nodes.length > validated.maxNodes) {
      // Keep highest trust score nodes
      graph.nodes.sort((a, b) => b.size - a.size);
      graph.nodes = graph.nodes.slice(0, validated.maxNodes);
      
      // Filter edges to only include nodes in result
      const nodeIds = new Set(graph.nodes.map(n => n.id));
      graph.edges = graph.edges.filter(e => 
        nodeIds.has(e.source) && nodeIds.has(e.target)
      );
    }

    // Get statistics
    const stats = await federationGraphBuilder.getGraphStatistics();
    const federationStats = await federationRegistry.getStatistics();

    return NextResponse.json({
      success: true,
      graph: {
        nodes: graph.nodes,
        edges: graph.edges,
      },
      statistics: {
        nodeCount: graph.nodes.length,
        edgeCount: graph.edges.length,
        density: stats.density,
        avgDegree: stats.avgDegree,
        totalOrganizations: federationStats.totalOrganizations,
        verifiedOrganizations: federationStats.verifiedOrganizations,
      },
      metadata: {
        version: '1.0',
        format: 'd3-force',
        generatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors,
      }, { status: 400 });
    }

    console.error('[API] Trust graph error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate trust graph',
    }, { status: 500 });
  }
}

/**
 * Example Response:
 * 
 * {
 *   "success": true,
 *   "graph": {
 *     "nodes": [
 *       {
 *         "id": "org-123",
 *         "label": "Acme Mushrooms",
 *         "type": "organization",
 *         "size": 85
 *       }
 *     ],
 *     "edges": [
 *       {
 *         "source": "org-123",
 *         "target": "org-456",
 *         "type": "trusts",
 *         "weight": 0.8
 *       }
 *     ]
 *   },
 *   "statistics": {
 *     "nodeCount": 47,
 *     "edgeCount": 112,
 *     "density": 0.12,
 *     "avgDegree": 4.8,
 *     "totalOrganizations": 50,
 *     "verifiedOrganizations": 47
 *   },
 *   "metadata": {
 *     "version": "1.0",
 *     "format": "d3-force",
 *     "generatedAt": "2026-01-22T10:30:00.000Z"
 *   }
 * }
 */
