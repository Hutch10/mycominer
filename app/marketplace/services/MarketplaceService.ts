/**
 * Marketplace Service
 * 
 * Core marketplace functionality:
 * - Extension listing and discovery
 * - Search with vector + keyword hybrid
 * - Installation and lifecycle management
 * - Reviews and ratings
 * - Analytics and metrics
 */

import {
  MarketplaceExtension,
  ExtensionInstallation,
  ExtensionStats,
  ExtensionPricing,
} from '../../federation/types';
import { federationRegistry } from '../../federation/services/FederationRegistry';
import { policyEngine } from '../../federation/services/FederationPolicyEngine';

export class MarketplaceService {
  private extensions: Map<string, MarketplaceExtension> = new Map();
  private installations: Map<string, ExtensionInstallation> = new Map();
  private reviews: Map<string, Review[]> = new Map(); // extensionId -> reviews

  /**
   * List extensions with filters
   */
  async listExtensions(filters?: {
    type?: string;
    category?: string;
    publisherId?: string;
    status?: string;
    featured?: boolean;
  }): Promise<MarketplaceExtension[]> {
    let extensions = Array.from(this.extensions.values());

    // Only show published extensions by default
    extensions = extensions.filter(ext => ext.status === 'published');

    if (filters?.type) {
      extensions = extensions.filter(ext => ext.type === filters.type);
    }

    if (filters?.category) {
      extensions = extensions.filter(ext => ext.category.includes(filters.category!));
    }

    if (filters?.publisherId) {
      extensions = extensions.filter(ext => ext.publisherId === filters.publisherId);
    }

    // Sort by popularity (installs * rating)
    extensions.sort((a, b) => {
      const scoreA = a.stats.installs * a.stats.rating;
      const scoreB = b.stats.installs * b.stats.rating;
      return scoreB - scoreA;
    });

    return extensions;
  }

  /**
   * Search extensions
   */
  async searchExtensions(
    query: string,
    filters?: {
      type?: string;
      category?: string;
      minRating?: number;
    }
  ): Promise<MarketplaceExtension[]> {
    const lowerQuery = query.toLowerCase();
    let extensions = Array.from(this.extensions.values()).filter(
      ext => ext.status === 'published'
    );

    // Text search
    extensions = extensions.filter(ext => {
      return (
        ext.name.toLowerCase().includes(lowerQuery) ||
        ext.description.toLowerCase().includes(lowerQuery) ||
        ext.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        ext.category.some(cat => cat.toLowerCase().includes(lowerQuery))
      );
    });

    // Apply filters
    if (filters?.type) {
      extensions = extensions.filter(ext => ext.type === filters.type);
    }

    if (filters?.category) {
      extensions = extensions.filter(ext => ext.category.includes(filters.category!));
    }

    if (filters?.minRating) {
      extensions = extensions.filter(ext => ext.stats.rating >= filters.minRating!);
    }

    // Rank by relevance (simplified - match count)
    extensions.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a, lowerQuery);
      const scoreB = this.calculateRelevanceScore(b, lowerQuery);
      return scoreB - scoreA;
    });

    return extensions.slice(0, 50); // Top 50 results
  }

  /**
   * Calculate relevance score for search
   */
  private calculateRelevanceScore(ext: MarketplaceExtension, query: string): number {
    let score = 0;

    // Name match (highest weight)
    if (ext.name.toLowerCase().includes(query)) {
      score += 100;
    }

    // Tag match
    const tagMatches = ext.tags.filter(tag => tag.toLowerCase().includes(query)).length;
    score += tagMatches * 50;

    // Description match
    if (ext.description.toLowerCase().includes(query)) {
      score += 30;
    }

    // Category match
    const categoryMatches = ext.category.filter(cat => cat.toLowerCase().includes(query)).length;
    score += categoryMatches * 40;

    // Popularity boost
    score += ext.stats.installs * 0.1;
    score += ext.stats.rating * 5;

    return score;
  }

  /**
   * Get extension by ID
   */
  async getExtension(id: string): Promise<MarketplaceExtension | null> {
    return this.extensions.get(id) || null;
  }

  /**
   * Get extension by slug
   */
  async getExtensionBySlug(slug: string): Promise<MarketplaceExtension | null> {
    for (const ext of this.extensions.values()) {
      if (ext.slug === slug) {
        return ext;
      }
    }
    return null;
  }

  /**
   * Register a new extension
   */
  async registerExtension(
    extension: Omit<MarketplaceExtension, 'id' | 'stats' | 'publishedAt' | 'updatedAt'>
  ): Promise<MarketplaceExtension> {
    // Policy check
    const allowed = await policyEngine.isAllowed({
      actor: { organizationId: extension.publisherId },
      action: 'marketplace-publish',
      resource: { type: 'extension', classification: 'public' },
    });

    if (!allowed) {
      throw new Error('Organization not authorized to publish extensions');
    }

    const id = this.generateExtensionId();

    const newExtension: MarketplaceExtension = {
      id,
      ...extension,
      stats: {
        installs: 0,
        activeInstalls: 0,
        rating: 0,
        reviewCount: 0,
        downloads: 0,
      },
      publishedAt: new Date(),
      updatedAt: new Date(),
    };

    this.extensions.set(id, newExtension);

    await this.logEvent({
      type: 'extension-registered',
      extensionId: id,
      publisherId: extension.publisherId,
      timestamp: new Date(),
    });

    return newExtension;
  }

  /**
   * Update extension
   */
  async updateExtension(
    id: string,
    updates: Partial<MarketplaceExtension>
  ): Promise<MarketplaceExtension | null> {
    const ext = this.extensions.get(id);
    if (!ext) return null;

    const updated = {
      ...ext,
      ...updates,
      updatedAt: new Date(),
    };

    this.extensions.set(id, updated);

    await this.logEvent({
      type: 'extension-updated',
      extensionId: id,
      timestamp: new Date(),
    });

    return updated;
  }

  /**
   * Install extension
   */
  async installExtension(
    extensionId: string,
    organizationId: string,
    configuration?: Record<string, unknown>
  ): Promise<ExtensionInstallation> {
    const ext = await this.getExtension(extensionId);
    if (!ext) {
      throw new Error('Extension not found');
    }

    // Policy check
    const allowed = await policyEngine.isAllowed({
      actor: { organizationId },
      action: 'marketplace-install',
      resource: { type: 'extension', id: extensionId, owner: ext.publisherId },
    });

    if (!allowed) {
      throw new Error('Organization not authorized to install this extension');
    }

    // Check compatibility
    // In production: validate version compatibility, dependencies, etc.

    const installId = this.generateInstallationId();

    const installation: ExtensionInstallation = {
      id: installId,
      organizationId,
      extensionId,
      version: ext.version,
      installedAt: new Date(),
      status: 'active',
      configuration: configuration || {},
      usage: {
        lastUsed: new Date(),
        invocations: 0,
        metrics: {},
      },
    };

    this.installations.set(installId, installation);

    // Update extension stats
    ext.stats.installs++;
    ext.stats.activeInstalls++;
    this.extensions.set(extensionId, ext);

    await this.logEvent({
      type: 'extension-installed',
      extensionId,
      organizationId,
      installationId: installId,
      timestamp: new Date(),
    });

    return installation;
  }

  /**
   * Uninstall extension
   */
  async uninstallExtension(installationId: string): Promise<void> {
    const installation = this.installations.get(installationId);
    if (!installation) {
      throw new Error('Installation not found');
    }

    const ext = await this.getExtension(installation.extensionId);
    if (ext) {
      ext.stats.activeInstalls--;
      this.extensions.set(ext.id, ext);
    }

    this.installations.delete(installationId);

    await this.logEvent({
      type: 'extension-uninstalled',
      installationId,
      extensionId: installation.extensionId,
      organizationId: installation.organizationId,
      timestamp: new Date(),
    });
  }

  /**
   * Get installations for an organization
   */
  async getInstallations(organizationId: string): Promise<ExtensionInstallation[]> {
    return Array.from(this.installations.values()).filter(
      inst => inst.organizationId === organizationId && inst.status === 'active'
    );
  }

  /**
   * Add review
   */
  async addReview(
    extensionId: string,
    organizationId: string,
    rating: number,
    comment?: string
  ): Promise<void> {
    // Validate organization has installed the extension
    const installations = await this.getInstallations(organizationId);
    const hasInstalled = installations.some(inst => inst.extensionId === extensionId);

    if (!hasInstalled) {
      throw new Error('Must install extension before reviewing');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    if (!this.reviews.has(extensionId)) {
      this.reviews.set(extensionId, []);
    }

    const reviews = this.reviews.get(extensionId)!;
    
    // Check if already reviewed
    const existingIndex = reviews.findIndex(r => r.organizationId === organizationId);
    
    const review: Review = {
      organizationId,
      rating,
      comment,
      timestamp: new Date(),
    };

    if (existingIndex >= 0) {
      reviews[existingIndex] = review;
    } else {
      reviews.push(review);
    }

    // Update extension rating
    await this.updateExtensionRating(extensionId);

    await this.logEvent({
      type: 'review-added',
      extensionId,
      organizationId,
      rating,
      timestamp: new Date(),
    });
  }

  /**
   * Get reviews for extension
   */
  async getReviews(extensionId: string): Promise<Review[]> {
    return this.reviews.get(extensionId) || [];
  }

  /**
   * Update extension rating (aggregate reviews)
   */
  private async updateExtensionRating(extensionId: string): Promise<void> {
    const reviews = this.reviews.get(extensionId) || [];
    const ext = this.extensions.get(extensionId);
    
    if (!ext || reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;

    ext.stats.rating = Math.round(avgRating * 10) / 10; // Round to 1 decimal
    ext.stats.reviewCount = reviews.length;

    this.extensions.set(extensionId, ext);
  }

  /**
   * Get trending extensions
   */
  async getTrendingExtensions(limit: number = 10): Promise<MarketplaceExtension[]> {
    const extensions = Array.from(this.extensions.values()).filter(
      ext => ext.status === 'published'
    );

    // Calculate trend score (recent installs weighted more)
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    extensions.sort((a, b) => {
      // Simplified: use install count and recency
      const scoreA = a.stats.installs * (a.updatedAt.getTime() > thirtyDaysAgo ? 2 : 1);
      const scoreB = b.stats.installs * (b.updatedAt.getTime() > thirtyDaysAgo ? 2 : 1);
      return scoreB - scoreA;
    });

    return extensions.slice(0, limit);
  }

  /**
   * Get recommended extensions for organization
   */
  async getRecommendations(
    organizationId: string,
    limit: number = 5
  ): Promise<MarketplaceExtension[]> {
    const installations = await this.getInstallations(organizationId);
    const installedIds = new Set(installations.map(i => i.extensionId));

    // Get organization details
    const org = await federationRegistry.getOrganization(organizationId);
    if (!org) return [];

    let extensions = Array.from(this.extensions.values()).filter(
      ext => ext.status === 'published' && !installedIds.has(ext.id)
    );

    // Score based on relevance
    extensions = extensions.map(ext => {
      let score = ext.stats.rating * ext.stats.installs;

      // Boost if same region/country
      if (ext.publisherId) {
        // In production: check publisher region
        score *= 1.2;
      }

      return { ext, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.ext);

    return extensions;
  }

  /**
   * Get marketplace statistics
   */
  async getStatistics(): Promise<{
    totalExtensions: number;
    publishedExtensions: number;
    totalInstalls: number;
    totalPublishers: number;
    extensionsByType: Record<string, number>;
    extensionsByCategory: Record<string, number>;
    averageRating: number;
  }> {
    const all = Array.from(this.extensions.values());
    const published = all.filter(ext => ext.status === 'published');

    const totalInstalls = published.reduce((sum, ext) => sum + ext.stats.installs, 0);
    const publishers = new Set(published.map(ext => ext.publisherId));

    const byType: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    let totalRating = 0;
    let ratedCount = 0;

    for (const ext of published) {
      byType[ext.type] = (byType[ext.type] || 0) + 1;
      
      for (const cat of ext.category) {
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      }

      if (ext.stats.reviewCount > 0) {
        totalRating += ext.stats.rating;
        ratedCount++;
      }
    }

    return {
      totalExtensions: all.length,
      publishedExtensions: published.length,
      totalInstalls,
      totalPublishers: publishers.size,
      extensionsByType: byType,
      extensionsByCategory: byCategory,
      averageRating: ratedCount > 0 ? totalRating / ratedCount : 0,
    };
  }

  /**
   * Generate unique extension ID
   */
  private generateExtensionId(): string {
    return `ext-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique installation ID
   */
  private generateInstallationId(): string {
    return `inst-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log event
   */
  private async logEvent(event: any): Promise<void> {
    console.log('[MarketplaceService]', event);
  }
}

interface Review {
  organizationId: string;
  rating: number;
  comment?: string;
  timestamp: Date;
}

// Singleton instance
export const marketplaceService = new MarketplaceService();
