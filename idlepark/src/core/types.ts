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
  // Category-specific stats (only one will be set based on category)
  attraction?: number;    // rides: guests attracted per second
  spendingRate?: number;  // shops: $ earned per guest per second
  coverage?: number;      // infrastructure: # of guests it can serve
};

export type Slot = {
  id: string;
  buildingId: string;
  level: number;
  builtAt: number;
};

export type ParkStats = {
  guestCapacity: number;      // max guests (from slots)
  totalAttraction: number;    // guest attraction rate (from rides)
  totalSpendingRate: number;  // $ per guest per second (from shops)
  totalCoverage: number;      // infrastructure coverage
  satisfaction: number;       // 0-1 based on coverage vs guests
  demandMultiplier: number;   // based on ticket price
  potentialGuests: number;    // attraction * demand
  actualGuests: number;       // min(potential, capacity)
  ticketIncome: number;       // guests * ticket price per second
  shopIncome: number;         // guests * spending rate
  totalMaintenance: number;   // sum of all maintenance
  netIncome: number;          // total income - maintenance
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
  // Core actions
  tick: (deltaSeconds: number) => void;

  // Building actions
  buildInSlot: (slotIndex: number, buildingId: string) => boolean;
  upgradeSlot: (slotId: string) => boolean;
  demolishSlot: (slotId: string) => number;

  // Slot actions
  unlockNextSlot: () => boolean;
  getSlotUnlockCost: () => number;

  // Ticket price
  setTicketPrice: (price: number) => void;

  // Calculations
  calculateParkStats: () => ParkStats;
  calculateUpgradeCost: (slotId: string) => number;

  // Persistence
  applyOfflineProgress: () => number;
  resetGame: () => void;
  save: () => void;
  load: () => Promise<void>;
};
