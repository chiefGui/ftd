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
  rideCapacity?: number;  // Guests it can handle per minute (affects queues)
  // Shop stats
  spendingRate?: number;  // $ earned per guest per second
  // Infrastructure stats
  coverage?: number;      // # of guests it can support
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
  infrastructureCoverage: number;

  // Reputation & Demand
  reputation: number;         // Sum of ride prestige
  demandMultiplier: number;   // Based on ticket price (0-1)
  targetGuests: number;       // reputation * demand

  // Guest counts
  currentGuests: number;

  // Satisfaction breakdown (each 0-1, combined into overall)
  rideSatisfaction: number;   // Are rides overcrowded?
  facilitySatisfaction: number; // Enough restrooms, etc?
  overallSatisfaction: number;  // Combined

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
