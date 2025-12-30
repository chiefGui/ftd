export type AttractionTier = 'basic' | 'standard' | 'premium';
export type AttractionCategory = 'ride' | 'food' | 'shop';

export interface AttractionDefinition {
  id: string;
  name: string;
  emoji: string;
  category: AttractionCategory;
  tier: AttractionTier;
  baseCost: number;
  baseIncome: number; // per second at level 1
  maintenanceCost: number; // fixed cost per second (can cause bankruptcy!)
  capacity: number;
  description: string;
}

export interface OwnedAttraction {
  id: string;
  level: number;
  purchasedAt: number;
}

export interface GameState {
  money: number;
  guests: number;
  attractions: OwnedAttraction[];
  lastSaveTime: number;
  totalEarnings: number;
  gameStartedAt: number;
  isGameOver: boolean;
}

export interface GameStore extends GameState {
  // Actions
  tick: (deltaSeconds: number) => void;
  buyAttraction: (id: string) => boolean;
  upgradeAttraction: (id: string) => boolean;
  calculateIncome: () => number;
  calculateUpgradeCost: (id: string) => number;
  calculateAttractionIncome: (attraction: OwnedAttraction) => number;
  applyOfflineProgress: () => number;
  resetGame: () => void;
  save: () => void;
  load: () => Promise<void>;
}
