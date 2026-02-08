/**
 * Licensing Engine
 * 
 * Manages licensing for marketplace extensions:
 * - Free, paid, freemium, subscription, usage-based models
 * - License key generation and validation
 * - Entitlement checking
 * - Trial periods and upgrades
 * - License transfer and revocation
 */

import { ExtensionPricing, ExtensionInstallation } from '../types';

export interface License {
  id: string;
  extensionId: string;
  organizationId: string;
  type: 'free' | 'trial' | 'paid' | 'subscription';
  status: 'active' | 'expired' | 'suspended' | 'revoked';
  key: string;
  issuedAt: Date;
  expiresAt?: Date;
  metadata: {
    tier?: string;
    limits?: Record<string, number>;
    usageTracking?: {
      metric: string;
      used: number;
      limit: number;
    }[];
  };
}

export class LicensingEngine {
  private licenses: Map<string, License> = new Map();

  /**
   * Generate license for installation
   */
  async generateLicense(
    extensionId: string,
    organizationId: string,
    pricing: ExtensionPricing,
    tier?: string
  ): Promise<License> {
    const licenseId = this.generateLicenseId();
    const key = this.generateLicenseKey();

    let type: License['type'];
    let expiresAt: Date | undefined;

    switch (pricing.model) {
      case 'free':
        type = 'free';
        break;
      case 'paid':
        type = 'paid';
        break;
      case 'subscription':
        type = 'subscription';
        expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1); // Monthly by default
        break;
      case 'freemium':
        type = tier ? 'paid' : 'free';
        break;
      case 'usage-based':
        type = 'paid';
        break;
      default:
        type = 'free';
    }

    // Trial period
    if (pricing.trialDays && type !== 'free') {
      type = 'trial';
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + pricing.trialDays);
    }

    const selectedTier = pricing.tiers?.find(t => t.name === tier);

    const license: License = {
      id: licenseId,
      extensionId,
      organizationId,
      type,
      status: 'active',
      key,
      issuedAt: new Date(),
      expiresAt,
      metadata: {
        tier,
        limits: selectedTier?.limits,
        usageTracking: pricing.usageRates?.map(rate => ({
          metric: rate.metric,
          used: 0,
          limit: -1, // Unlimited initially
        })),
      },
    };

    this.licenses.set(licenseId, license);

    await this.logEvent({
      type: 'license-generated',
      licenseId,
      extensionId,
      organizationId,
      licenseType: type,
      timestamp: new Date(),
    });

    return license;
  }

  /**
   * Validate license
   */
  async validateLicense(key: string): Promise<{
    valid: boolean;
    license?: License;
    reason?: string;
  }> {
    for (const license of this.licenses.values()) {
      if (license.key === key) {
        // Check status
        if (license.status !== 'active') {
          return { valid: false, reason: `License is ${license.status}` };
        }

        // Check expiration
        if (license.expiresAt && license.expiresAt < new Date()) {
          license.status = 'expired';
          this.licenses.set(license.id, license);
          return { valid: false, reason: 'License has expired' };
        }

        return { valid: true, license };
      }
    }

    return { valid: false, reason: 'Invalid license key' };
  }

  /**
   * Check entitlement
   */
  async checkEntitlement(
    licenseId: string,
    action: string,
    metadata?: Record<string, unknown>
  ): Promise<boolean> {
    const license = this.licenses.get(licenseId);
    if (!license || license.status !== 'active') {
      return false;
    }

    // Check expiration
    if (license.expiresAt && license.expiresAt < new Date()) {
      return false;
    }

    // Check usage limits
    if (license.metadata.usageTracking && metadata?.metric) {
      const tracking = license.metadata.usageTracking.find(
        t => t.metric === metadata.metric
      );
      
      if (tracking && tracking.limit > 0 && tracking.used >= tracking.limit) {
        return false; // Usage limit reached
      }
    }

    return true;
  }

  /**
   * Track usage
   */
  async trackUsage(licenseId: string, metric: string, amount: number = 1): Promise<void> {
    const license = this.licenses.get(licenseId);
    if (!license || !license.metadata.usageTracking) return;

    const tracking = license.metadata.usageTracking.find(t => t.metric === metric);
    if (tracking) {
      tracking.used += amount;
      this.licenses.set(licenseId, license);
    }
  }

  /**
   * Upgrade license
   */
  async upgradeLicense(licenseId: string, newTier: string): Promise<License> {
    const license = this.licenses.get(licenseId);
    if (!license) {
      throw new Error('License not found');
    }

    // Update to paid type if trial/free
    if (license.type === 'trial' || license.type === 'free') {
      license.type = 'paid';
    }

    license.metadata.tier = newTier;
    
    // Extend expiration if subscription
    if (license.type === 'subscription' && license.expiresAt) {
      const now = new Date();
      if (license.expiresAt < now) {
        license.expiresAt = new Date(now);
      }
      license.expiresAt.setMonth(license.expiresAt.getMonth() + 1);
    }

    this.licenses.set(licenseId, license);

    await this.logEvent({
      type: 'license-upgraded',
      licenseId,
      newTier,
      timestamp: new Date(),
    });

    return license;
  }

  /**
   * Renew subscription license
   */
  async renewLicense(licenseId: string): Promise<License> {
    const license = this.licenses.get(licenseId);
    if (!license) {
      throw new Error('License not found');
    }

    if (license.type !== 'subscription') {
      throw new Error('Only subscription licenses can be renewed');
    }

    // Extend expiration
    if (license.expiresAt) {
      const now = new Date();
      const baseDate = license.expiresAt > now ? license.expiresAt : now;
      license.expiresAt = new Date(baseDate);
      license.expiresAt.setMonth(license.expiresAt.getMonth() + 1);
    }

    license.status = 'active';
    this.licenses.set(licenseId, license);

    await this.logEvent({
      type: 'license-renewed',
      licenseId,
      newExpiration: license.expiresAt,
      timestamp: new Date(),
    });

    return license;
  }

  /**
   * Revoke license
   */
  async revokeLicense(licenseId: string, reason: string): Promise<void> {
    const license = this.licenses.get(licenseId);
    if (!license) {
      throw new Error('License not found');
    }

    license.status = 'revoked';
    this.licenses.set(licenseId, license);

    await this.logEvent({
      type: 'license-revoked',
      licenseId,
      reason,
      timestamp: new Date(),
    });
  }

  /**
   * Transfer license to another organization
   */
  async transferLicense(licenseId: string, newOrganizationId: string): Promise<License> {
    const license = this.licenses.get(licenseId);
    if (!license) {
      throw new Error('License not found');
    }

    const oldOrganizationId = license.organizationId;
    license.organizationId = newOrganizationId;
    
    this.licenses.set(licenseId, license);

    await this.logEvent({
      type: 'license-transferred',
      licenseId,
      fromOrganization: oldOrganizationId,
      toOrganization: newOrganizationId,
      timestamp: new Date(),
    });

    return license;
  }

  /**
   * Get licenses for organization
   */
  async getLicenses(organizationId: string): Promise<License[]> {
    return Array.from(this.licenses.values()).filter(
      lic => lic.organizationId === organizationId
    );
  }

  /**
   * Get license by extension
   */
  async getLicenseByExtension(
    extensionId: string,
    organizationId: string
  ): Promise<License | null> {
    for (const license of this.licenses.values()) {
      if (license.extensionId === extensionId && 
          license.organizationId === organizationId &&
          license.status === 'active') {
        return license;
      }
    }
    return null;
  }

  /**
   * Generate unique license ID
   */
  private generateLicenseId(): string {
    return `lic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate license key
   */
  private generateLicenseKey(): string {
    const segments = [];
    for (let i = 0; i < 4; i++) {
      segments.push(
        Math.random().toString(36).substr(2, 5).toUpperCase()
      );
    }
    return segments.join('-');
  }

  /**
   * Log event
   */
  private async logEvent(event: any): Promise<void> {
    console.log('[LicensingEngine]', event);
  }
}

// Singleton instance
export const licensingEngine = new LicensingEngine();
