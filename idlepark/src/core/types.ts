export type AttractionTier = 'basic' | 'standard' | 'premium';
export type AttractionCategory = 'ride' | 'food' | 'shop';

export type BuildingDefinition = {
  id: string;
  name: string;
  emoji: string;
  category: AttractionCategory;
  tier: AttractionTier;
  baseCost: number;
  baseIncome: number;
  maintenanceCost: number;
  capacity: number;
  description: string;
};

export type Slot = {
  id: string;
  buildingId: string;
  level: number;
  builtAt: number;
};

export type GameState = {
  money: number;
  guests: number;
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
  demolishSlot: (slotId: string) => number; // returns refund amount

  // Slot actions
  unlockNextSlot: () => boolean;
  getSlotUnlockCost: () => number;

  // Calculations
  calculateIncome: () => { gross: number; maintenance: number; net: number };
  calculateSlotIncome: (slot: Slot) => { gross: number; maintenance: number; net: number };
  calculateUpgradeCost: (slotId: string) => number;

  // Persistence
  applyOfflineProgress: () => number;
  resetGame: () => void;
  save: () => void;
  load: () => Promise<void>;
};
