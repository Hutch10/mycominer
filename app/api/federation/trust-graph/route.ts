/**
 * Federation Trust Graph API
 * GET /api/federation/trust-graph
 *
 * Exports the federation trust graph for visualization (authenticated).
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { federationGraphBuilder } from '@/app/federation/services/FederationGraphBuilder';
import { federationRegistry } from '@/app/federation/services/FederationRegistry';
import { withPersistenceAuthOrg } from '@/app/lib/auth/withPersistenceAuth';

const QuerySchema = z.object({
  minTrustScore: z.coerce.number().min(0).max(100).optional(),
  includeTypes: z.string().optional(),
  maxNodes: z.coerce.number().min(10).max(500).default(100),
});

export const GET = withPersistenceAuthOrg(
  async (request) => {
    try {
      const searchParams = new URL(request.url).searchParams;

      const validated = QuerySchema.parse({
        minTrustScore: searchParams.get('minTrustScore'),
        includeTypes: searchParams.get('includeTypes'),
        maxNodes: searchParams.get('maxNodes'),
      });

      const graph = await federationGraphBuilder.exportForVisualization();

      if (validated.minTrustScore !== undefined) {
        graph.nodes = graph.nodes.filter((node) => {
          if (node.type === 'organization') {
            return node.size >= validated.minTrustScore!;
          }
          return true;
        });
      }

      if (validated.includeTypes) {
        const types = validated.includeTypes.split(',');
        graph.nodes = graph.nodes.filter((node) => types.includes(node.type));
      }

      if (graph.nodes.length > validated.maxNodes) {
        graph.nodes.sort((a, b) => b.size - a.size);
        graph.nodes = graph.nodes.slice(0, validated.maxNodes);

        const nodeIds = new Set(graph.nodes.map((n) => n.id));
        graph.edges = graph.edges.filter(
          (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
        );
      }

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
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid query parameters',
            details: error.errors,
          },
          { status: 400 }
        );
      }

      console.error('[API] Trust graph error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate trust graph',
        },
        { status: 500 }
      );
    }
  },
  { rateLimit: 'mutation', rateLimitOnGet: true }
);
