// Phase 20: Resource & Inventory Types
// Deterministic resource management with full auditability

// ============================================================================
// RESOURCE CATEGORIES
// ============================================================================

export type ResourceCategory = 
  | 'substrate-material' 
  | 'supplement' 
  | 'container' 
  | 'equipment' 
  | 'energy' 
  | 'labor' 
  | 'consumable';

export type SubstrateMaterial = 
  | 'hardwood-sawdust' 
  | 'straw' 
  | 'corn-cobs' 
  | 'coffee-grounds' 
  | 'soy-hulls' 
  | 'bran' 
  | 'gypsum';

export type SupplementType = 
  | 'wheat-bran' 
  | 'rye-grain' 
  | 'calcium-carbonate' 
  | 'nitrogen-supplement';

export type ContainerType = 
  | 'grow-bag' 
  | 'mason-jar' 
  | 'tray' 
  | 'fruiting-block';

export type ConsumableType = 
  | 'micropore-tape' 
  | 'alcohol' 
  | 'bleach' 
  | 'gloves' 
  | 'masks';

// ============================================================================
// INVENTORY ITEM
// ============================================================================

export interface InventoryItem {
  itemId: string;
  category: ResourceCategory;
  name: string;
  quantityAvailable: number;
  unit: 'kg' | 'L' | 'pieces' | 'kWh' | 'hours';
  location?: string;
  locationRoomId?: string;
  locationFacilityId?: string;
  lowStockThreshold: number;
  reorderQuantity: number;
  costPerUnit: number;
  unitCost: number; // alias for costPerUnit (for UI compatibility)
  expirationDate?: string; // ISO date
  lastUpdated: string; // ISO timestamp
}

// ============================================================================
// RESOURCE REQUIREMENT
// ============================================================================

export interface ResourceRequirement {
  requirementId: string;
  taskId?: string; // from workflow task
  workflowId?: string; // from workflow plan
  category: ResourceCategory;
  resourceName: string;
  quantityNeeded: number;
  unit: 'kg' | 'L' | 'pieces' | 'kWh' | 'hours';
  priority: 'critical' | 'high' | 'normal' | 'low';
  neededBy: string; // ISO date
  rationale: string;
}

// ============================================================================
// ALLOCATION PLAN
// ============================================================================

export interface ResourceAllocation {
  allocationId: string;
  requirementId: string;
  category: ResourceCategory;
  resourceName: string;
  itemId: string; // inventory item
  quantityRequested: number;
  quantityAllocated: number;
  unit: 'kg' | 'L' | 'pieces' | 'kWh' | 'hours';
  allocationDate: string; // ISO timestamp
  status: 'reserved' | 'allocated' | 'consumed' | 'returned';
  source?: string; // where resource is allocated from
  room?: string;
  facility?: string;
}

export interface AllocationPlan {
  planId: string;
  createdAt: string;
  workflowPlanId?: string;
  requirements: ResourceRequirement[];
  allocations: ResourceAllocation[];
  totalCost: number;
  unmetRequirements: ResourceRequirement[];
  conflicts: string[]; // text descriptions of conflicts
  conflictingAllocations: {
    resourceName: string;
    requested: number;
    available: number;
    deficit: number;
  }[];
  confidence: number; // 0-100
  status: 'draft' | 'pending-approval' | 'approved' | 'rejected' | 'active';
  approvalBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

// ============================================================================
// REPLENISHMENT PROPOSAL
// ============================================================================

export interface ReplenishmentProposal {
  proposalId: string;
  createdAt: string;
  itemId: string;
  category: ResourceCategory;
  resourceName: string;
  itemName: string;
  currentQuantity: number;
  orderQuantity: number; // alias for replenishmentQuantity
  targetQuantity: number;
  replenishmentQuantity: number;
  unit: 'kg' | 'L' | 'pieces' | 'kWh' | 'hours';
  estimatedCost: number;
  urgency: 'immediate' | 'high' | 'medium' | 'low';
  forecastedDepletionDate: string | null; // ISO date
  supplier?: string;
  rationale: string;
  status: 'pending' | 'approved' | 'ordered' | 'received' | 'rejected';
  approvalBy?: string;
  approvedAt?: string;
}

// ============================================================================
// RESOURCE FORECAST
// ============================================================================

export interface ResourceForecast {
  forecastId: string;
  createdAt: string;
  resourceName: string;
  category: ResourceCategory;
  currentQuantity: number;
  projectedUsage: {
    date: string; // ISO date
    quantity: number;
    remainingQuantity: number;
  }[];
  depletionDate: string | null; // ISO date or null if sufficient
  confidence: number; // 0-100
  assumptions: string[];
  recommendations: string[];
}

export interface ForecastReport {
  reportId: string;
  createdAt: string;
  workflowPlanId?: string;
  forecasts: ResourceForecast[];
  criticalShortages: string[]; // resource names
  energyBudgetProjection: {
    totalBudgetKwh: number;
    projectedUsageKwh: number;
    remainingKwh: number;
    utilizationPercent: number;
  };
  equipmentMaintenanceWindows: {
    equipmentId: string;
    nextMaintenanceDate: string;
    hoursUntilMaintenance: number;
  }[];
  overallConfidence: number; // 0-100
}

// ============================================================================
// RESOURCE AUDIT
// ============================================================================

export type AuditDecision = 'allow' | 'warn' | 'block';

export interface ResourceAuditResult {
  auditId: string;
  createdAt: string;
  allocationPlanId: string;
  decision: AuditDecision;
  warnings: string[];
  errors: string[];
  rollbackSteps: string[];
  validationGates: {
    inventorySufficiency: boolean;
    equipmentAvailability: boolean;
    energyBudget: boolean;
    contaminationRisk: boolean;
    schedulingAlignment: boolean;
    regressionDetection: boolean;
  };
}

// ============================================================================
// RESOURCE LOG ENTRY
// ============================================================================

export type ResourceLogCategory = 
  | 'requirement-generation'
  | 'allocation-creation'
  | 'forecast-generation'
  | 'inventory-update'
  | 'allocation-plan'
  | 'replenishment-proposal'
  | 'forecast'
  | 'audit'
  | 'approval'
  | 'rejection'
  | 'execution'
  | 'rollback'
  | 'export'
  | 'consumption'
  | 'return';

export interface ResourceLogEntry {
  entryId: string;
  timestamp: string;
  category: ResourceLogCategory;
  message: string;
  context?: any;
}

// ============================================================================
// RESOURCE REQUEST (aggregated from Phase 19 workflow plan)
// ============================================================================

export interface ResourceRequest {
  requestId: string;
  timestamp: string;
  source: 'workflow-plan' | 'strategy-plan' | 'user-submitted';
  workflowPlanId?: string;
  strategyPlanId?: string;
  facilityIds: string[];
  requirements: ResourceRequirement[];
  energyBudgetKwh: number;
  timeWindowDays: number;
  prioritizeEfficiency: boolean;
  prioritizeCost: boolean;
}

// ============================================================================
// RESOURCE STATE (aggregated output)
// ============================================================================

export interface ResourceState {
  stateId: string;
  createdAt: string;
  request: ResourceRequest;
  currentInventory: InventoryItem[];
  generatedRequirements: ResourceRequirement[];
  allocationPlan: AllocationPlan;
  forecastReport: ForecastReport;
  auditResult: ResourceAuditResult;
  replenishmentProposals: ReplenishmentProposal[];
  executionStatus: 'not-started' | 'in-progress' | 'completed' | 'paused' | 'failed';
  rollbackEnabled: boolean;
}

// ============================================================================
// EQUIPMENT STATUS
// ============================================================================

export interface EquipmentStatus {
  equipmentId: string;
  name: string;
  type: string;
  status: 'available' | 'in-use' | 'maintenance' | 'broken';
  location: {
    room?: string;
    facility?: string;
  };
  capacityUsed: number; // percentage
  hoursUsed: number;
  hoursUntilMaintenance: number;
  lastMaintenanceDate: string;
}

// ============================================================================
// SUBSTRATE RECIPE (for species-specific requirements)
// ============================================================================

export interface SubstrateRecipe {
  species: string;
  materials: {
    material: SubstrateMaterial;
    percentageByWeight: number;
  }[];
  supplements: {
    supplement: SupplementType;
    percentageByWeight: number;
  }[];
  moistureContent: number; // percentage
  sterilizationTemp: number; // celsius
  sterilizationDurationHours: number;
  yieldPerKg: number; // kg mushrooms per kg substrate
}
