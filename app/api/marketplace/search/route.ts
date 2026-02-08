/**
 * Marketplace Search API
 * GET /api/marketplace/search?q={query}&type={type}&category={category}
 * 
 * Searches marketplace extensions with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { marketplaceService } from '@/app/marketplace/services/MarketplaceService';

const SearchSchema = z.object({
  q: z.string().min(1).max(100),
  type: z.enum(['model', 'workflow', 'sop', 'integration', 'dashboard']).optional(),
  category: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const validated = SearchSchema.parse({
      q: searchParams.get('q'),
      type: searchParams.get('type'),
      category: searchParams.get('category'),
      minRating: searchParams.get('minRating'),
      limit: searchParams.get('limit'),
    });

    // Search extensions
    const results = await marketplaceService.searchExtensions(validated.q, {
      type: validated.type,
      category: validated.category,
      minRating: validated.minRating,
    });

    // Limit results
    const limited = results.slice(0, validated.limit);

    return NextResponse.json({
      success: true,
      results: limited.map(ext => ({
        id: ext.id,
        name: ext.name,
        slug: ext.slug,
        type: ext.type,
        description: ext.description,
        publisherName: ext.publisherName,
        category: ext.category,
        tags: ext.tags,
        pricing: ext.pricing,
        stats: ext.stats,
        metadata: {
          icon: ext.metadata.icon,
          screenshots: ext.metadata.screenshots.slice(0, 3),
        },
      })),
      count: limited.length,
      total: results.length,
      query: validated.q,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid search parameters',
        details: error.errors,
      }, { status: 400 });
    }

    console.error('[API] Search error:', error);
    return NextResponse.json({
      success: false,
      error: 'Search failed',
    }, { status: 500 });
  }
}
