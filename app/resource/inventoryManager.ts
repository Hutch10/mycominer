// Phase 20: Inventory Manager
// Tracks inventory levels, detects shortages, generates replenishment proposals

'use client';

import {
  InventoryItem,
  ReplenishmentProposal,
  ResourceRequirement,
} from '@/app/resource/resourceTypes';

// ============================================================================
// INVENTORY MANAGER
// ============================================================================

class InventoryManager {
  private inventory: Map<string, InventoryItem> = new Map();
  private proposalCounter = 0;

  /**
   * Initialize default inventory
   */
  constructor() {
    this.initializeDefaultInventory();
  }

  /**
   * Initialize with common substrate materials and consumables
   */
  private initializeDefaultInventory() {
    const defaultItems: InventoryItem[] = [
      // Substrate materials
      {
        itemId: 'item-hardwood-sawdust',
        category: 'substrate-material',
        name: 'hardwood-sawdust',
        quantityAvailable: 100,
        unit: 'kg',
        location: 'Storage Room A',
        lowStockThreshold: 20,
        reorderQuantity: 100,
        costPerUnit: 0.5,
        unitCost: 0.5,
        lastUpdated: new Date().toISOString(),
      },
      {
        itemId: 'item-straw',
        category: 'substrate-material',
        name: 'straw',
        quantityAvailable: 50,
        unit: 'kg',
        location: 'Storage Room A',
        lowStockThreshold: 10,
        reorderQuantity: 50,
        costPerUnit: 0.3,
        unitCost: 0.3,
        lastUpdated: new Date().toISOString(),
      },
      {
        itemId: 'item-bran',
        category: 'substrate-material',
        name: 'bran',
        quantityAvailable: 25,
        unit: 'kg',
        location: 'Storage Room A',
        lowStockThreshold: 5,
        reorderQuantity: 25,
        costPerUnit: 1.0,
        unitCost: 1.0,
        lastUpdated: new Date().toISOString(),
      },
      {
        itemId: 'item-gypsum',
        category: 'substrate-material',
        name: 'gypsum',
        quantityAvailable: 10,
        unit: 'kg',
        location: 'Storage Room A',
        lowStockThreshold: 2,
        reorderQuantity: 10,
        costPerUnit: 0.8,
        unitCost: 0.8,
        lastUpdated: new Date().toISOString(),
      },
      {
        itemId: 'item-soy-hulls',
        category: 'substrate-material',
        name: 'soy-hulls',
        quantityAvailable: 20,
        unit: 'kg',
        location: 'Storage Room A',
        lowStockThreshold: 5,
        reorderQuantity: 20,
        costPerUnit: 1.2,
        unitCost: 1.2,
        lastUpdated: new Date().toISOString(),
      },
      {
        itemId: 'item-corn-cobs',
        category: 'substrate-material',
        name: 'corn-cobs',
        quantityAvailable: 30,
        unit: 'kg',
        location: 'Storage Room A',
        lowStockThreshold: 10,
        reorderQuantity: 30,
        costPerUnit: 0.4,
        unitCost: 0.4,
        lastUpdated: new Date().toISOString(),
      },
      // Supplements
      {
        itemId: 'item-wheat-bran',
        category: 'supplement',
        name: 'wheat-bran',
        quantityAvailable: 15,
        unit: 'kg',
        location: 'Storage Room B',
        lowStockThreshold: 3,
        reorderQuantity: 15,
        costPerUnit: 1.5,
        unitCost: 1.5,
        lastUpdated: new Date().toISOString(),
      },
      {
        itemId: 'item-calcium-carbonate',
        category: 'supplement',
        name: 'calcium-carbonate',
        quantityAvailable: 5,
        unit: 'kg',
        location: 'Storage Room B',
        lowStockThreshold: 1,
        reorderQuantity: 5,
        costPerUnit: 2.0,
        unitCost: 2.0,
        lastUpdated: new Date().toISOString(),
      },
      // Containers
      {
        itemId: 'item-grow-bag',
        category: 'container',
        name: 'grow-bag',
        quantityAvailable: 200,
        unit: 'pieces',
        location: 'Supply Closet',
        lowStockThreshold: 50,
        reorderQuantity: 200,
        costPerUnit: 0.25,
        unitCost: 0.25,
        lastUpdated: new Date().toISOString(),
      },
      // Consumables
      {
        itemId: 'item-micropore-tape',
        category: 'consumable',
        name: 'micropore-tape',
        quantityAvailable: 10,
        unit: 'pieces',
        location: 'Supply Closet',
        lowStockThreshold: 3,
        reorderQuantity: 10,
        costPerUnit: 5.0,
        unitCost: 5.0,
        lastUpdated: new Date().toISOString(),
      },
      {
        itemId: 'item-alcohol',
        category: 'consumable',
        name: 'alcohol',
        quantityAvailable: 5,
        unit: 'L',
        location: 'Supply Closet',
        lowStockThreshold: 1,
        reorderQuantity: 5,
        costPerUnit: 10.0,
        unitCost: 10.0,
        lastUpdated: new Date().toISOString(),
      },
      {
        itemId: 'item-gloves',
        category: 'consumable',
        name: 'gloves',
        quantityAvailable: 100,
        unit: 'pieces',
        location: 'Supply Closet',
        lowStockThreshold: 20,
        reorderQuantity: 100,
        costPerUnit: 0.15,
        unitCost: 0.15,
        lastUpdated: new Date().toISOString(),
      },
    ];

    for (const item of defaultItems) {
      this.inventory.set(item.itemId, item);
    }
  }

  /**
   * Get all inventory items
   */
  getAllInventory(): InventoryItem[] {
    return Array.from(this.inventory.values());
  }

  /**
   * Get inventory item by name
   */
  getItemByName(name: string): InventoryItem | undefined {
    return Array.from(this.inventory.values()).find(item => item.name === name);
  }

  /**
   * Update inventory quantity
   */
  updateInventory(itemId: string, quantityChange: number): InventoryItem | null {
    const item = this.inventory.get(itemId);
    if (!item) return null;

    item.quantityAvailable += quantityChange;
    item.lastUpdated = new Date().toISOString();

    this.inventory.set(itemId, item);
    return item;
  }

  /**
   * Check if requirements can be met with current inventory
   */
  checkAvailability(requirements: ResourceRequirement[]): {
    canMeet: boolean;
    shortages: { resourceName: string; needed: number; available: number; deficit: number }[];
  } {
    const shortages: { resourceName: string; needed: number; available: number; deficit: number }[] = [];

    for (const req of requirements) {
      if (req.category === 'energy' || req.category === 'labor') continue; // Skip non-inventory items

      const item = this.getItemByName(req.resourceName);
      if (!item) {
        shortages.push({
          resourceName: req.resourceName,
          needed: req.quantityNeeded,
          available: 0,
          deficit: req.quantityNeeded,
        });
      } else if (item.quantityAvailable < req.quantityNeeded) {
        shortages.push({
          resourceName: req.resourceName,
          needed: req.quantityNeeded,
          available: item.quantityAvailable,
          deficit: req.quantityNeeded - item.quantityAvailable,
        });
      }
    }

    return {
      canMeet: shortages.length === 0,
      shortages,
    };
  }

  /**
   * Detect low stock items
   */
  detectLowStock(): InventoryItem[] {
    return Array.from(this.inventory.values()).filter(
      item => item.quantityAvailable <= item.lowStockThreshold
    );
  }

  /**
   * Generate replenishment proposals for low stock items
   */
  generateReplenishmentProposals(
    lowStockItems: InventoryItem[],
    upcomingRequirements: ResourceRequirement[] = []
  ): ReplenishmentProposal[] {
    const proposals: ReplenishmentProposal[] = [];

    for (const item of lowStockItems) {
      // Calculate urgency based on current stock and upcoming requirements
      const upcomingNeed = upcomingRequirements
        .filter(req => req.resourceName === item.name)
        .reduce((sum, req) => sum + req.quantityNeeded, 0);

      const daysUntilDepletion = this.estimateDaysUntilDepletion(item, upcomingNeed);
      
      let urgency: 'immediate' | 'high' | 'medium' | 'low' = 'medium';
      if (daysUntilDepletion < 3) urgency = 'immediate';
      else if (daysUntilDepletion < 7) urgency = 'high';
      else if (daysUntilDepletion < 14) urgency = 'medium';
      else urgency = 'low';

      const replenishmentQty = Math.max(item.reorderQuantity, upcomingNeed - item.quantityAvailable);
      const forecastedDepletionDate = daysUntilDepletion < 365
        ? new Date(Date.now() + daysUntilDepletion * 24 * 3600000).toISOString().split('T')[0]
        : null;

      proposals.push({
        proposalId: `replenish-${++this.proposalCounter}`,
        createdAt: new Date().toISOString(),
        itemId: item.itemId,
        category: item.category,
        resourceName: item.name,
        itemName: item.name,
        currentQuantity: item.quantityAvailable,
        orderQuantity: replenishmentQty,
        targetQuantity: item.reorderQuantity,
        replenishmentQuantity: replenishmentQty,
        unit: item.unit,
        estimatedCost: replenishmentQty * item.costPerUnit,
        urgency,
        forecastedDepletionDate,
        supplier: this.getSuggestedSupplier(item),
        rationale: `Current stock (${item.quantityAvailable}${item.unit}) below threshold (${item.lowStockThreshold}${item.unit}). Upcoming need: ${upcomingNeed.toFixed(1)}${item.unit}. Estimated ${daysUntilDepletion} days until depletion.`,
        status: 'pending',
      });
    }

    return proposals;
  }

  /**
   * Get suggested supplier for an item
   */
  private getSuggestedSupplier(item: InventoryItem): string {
    // Mock supplier suggestions based on category
    const supplierMap: Record<string, string> = {
      'substrate-material': 'Bulk Organics Supplier Co.',
      'supplement': 'Agricultural Nutrients Inc.',
      'container': 'Mushroom Supply Warehouse',
      'consumable': 'Lab Supplies Direct',
    };

    return supplierMap[item.category] || 'General Supplier';
  }

  /**
   * Estimate days until item depletion
   */
  private estimateDaysUntilDepletion(item: InventoryItem, dailyUsage: number): number {
    if (dailyUsage === 0) return 999; // No usage predicted
    return Math.ceil(item.quantityAvailable / dailyUsage);
  }

  /**
   * Reserve inventory for allocation
   */
  reserveInventory(itemId: string, quantity: number): boolean {
    const item = this.inventory.get(itemId);
    if (!item || item.quantityAvailable < quantity) return false;

    // For now, just reduce availability (full allocation system would track reservations separately)
    item.quantityAvailable -= quantity;
    item.lastUpdated = new Date().toISOString();
    this.inventory.set(itemId, item);

    return true;
  }

  /**
   * Get inventory summary statistics
   */
  getSummary() {
    const items = this.getAllInventory();
    const totalValue = items.reduce((sum, item) => sum + item.quantityAvailable * item.costPerUnit, 0);
    const lowStockCount = this.detectLowStock().length;

    return {
      totalItems: items.length,
      totalValue: totalValue.toFixed(2),
      lowStockCount,
      byCategory: items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const inventoryManager = new InventoryManager();
