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
  lastSaveTime: number;
  totalEarnings: number;
  gameStartedAt: number;
  isGameOver: boolean;
};

export type GameStore = GameState & {
  tick: (deltaSeconds: number) => void;

  buildInSlot: (slotIndex: number, buildingId: string) => boolean;
  upgradeSlot: (slotId: string) => boolean;
  demolishSlot: (slotId: string) => number;

  unlockNextSlot: () => boolean;
  getSlotUnlockCost: () => number;

  setTicketPrice: (price: number) => void;

  calculateParkStats: () => ParkStats;
  calculateUpgradeCost: (slotId: string) => number;

  applyOfflineProgress: () => number;
  resetGame: () => void;
  save: () => void;
  load: () => Promise<void>;
};
