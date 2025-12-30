export type BuildingTier = 'basic' | 'standard' | 'premium';
export type BuildingCategory = 'ride' | 'shop' | 'infrastructure';

export type BuildingDefinition = {
  id: string;
  name: string;
  emoji: string;
  category: BuildingCategory;
  tier: BuildingTier;
  baseCost: number;
  maintenanceCost: number;
  description: string;

  // Ride stats
  prestige?: number;      // How desirable/exciting (adds to park reputation)
  rideCapacity?: number;  // Guests it can handle (affects queues)

  // Shop stats
  spendingRate?: number;  // $ earned per guest per second
  hungerCapacity?: number; // How many guests it can feed (food shops only)

  // Infrastructure stats - specialized needs
  comfortCapacity?: number; // Restrooms, benches, info booth
  safetyCapacity?: number;  // Security, first aid

  // Legacy (deprecated, kept for compatibility)
  coverage?: number;

  // Unlock requirement
  requiredPerk?: string;  // Perk ID required to build
};

export type Slot = {
  id: string;
  buildingId: string;
  level: number;
  builtAt: number;
};

export type ParkStats = {
  // Capacity
  maxGuests: number;          // From unlocked slots
  rideCapacity: number;       // How many guests rides can handle

  // Capacities for each need
  totalHungerCapacity: number;
  totalComfortCapacity: number;
  totalSafetyCapacity: number;

  // Reputation & Demand
  reputation: number;         // Sum of ride prestige
  demandMultiplier: number;   // Based on ticket price (0-1)
  targetGuests: number;       // reputation * demand

  // Guest counts
  currentGuests: number;

  // 4 Core Guest Needs (each 0-1)
  entertainmentSatisfaction: number; // Are rides overcrowded?
  hungerSatisfaction: number;        // Can guests get food?
  comfortSatisfaction: number;       // Restrooms, rest areas?
  safetySatisfaction: number;        // Security, first aid?
  overallSatisfaction: number;       // Weighted average

  // Legacy aliases for compatibility
  rideSatisfaction: number;
  facilitySatisfaction: number;

  // Income
  ticketIncome: number;       // From guests arriving
  shopIncome: number;         // From guests in park
  totalMaintenance: number;
  netIncome: number;
};

export type GameState = {
  money: number;
  guests: number;
  ticketPrice: number;
  slots: Slot[];
  unlockedSlots: number;
  unlockedPerks: string[];
  lastSaveTime: number;
  totalEarnings: number;
  gameStartedAt: number;
  isGameOver: boolean;
};

// ============================================
// MILESTONE TYPES
// ============================================

export type MilestoneRequirement =
  | { type: 'peakGuests'; amount: number };

export type MilestoneReward =
  | { type: 'money'; amount: number };

export type Milestone = {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: MilestoneRequirement;
  reward: MilestoneReward;
};

export type MilestoneProgress = {
  completedMilestones: string[];
  completedAt: Record<string, number>;
  peakGuests: number;
};

export type GameStore = GameState & {
  tick: (deltaSeconds: number) => void;

  buildInSlot: (slotIndex: number, buildingId: string) => boolean;
  upgradeSlot: (slotId: string) => boolean;
  demolishSlot: (slotId: string) => number;

  unlockNextSlot: () => boolean;
  getSlotUnlockCost: () => number;

  buyPerk: (perkId: string) => boolean;
  hasPerk: (perkId: string) => boolean;

  setTicketPrice: (price: number) => void;

  calculateParkStats: () => ParkStats;
  calculateUpgradeCost: (slotId: string) => number;

  applyOfflineProgress: () => { earnings: number; milestones: Milestone[] };
  resetGame: () => void;
  save: () => void;
  load: () => Promise<void>;
};
