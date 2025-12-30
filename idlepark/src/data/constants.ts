// === STARTING VALUES ===
export const STARTING_MONEY = 10000;
export const STARTING_SLOTS = 4;
export const MAX_SLOTS = 12;

// === SLOT UNLOCK COSTS ===
// Exponential curve: $15K → $250K
export const SLOT_UNLOCK_COSTS = [
  15000,   // Slot 5
  25000,   // Slot 6
  40000,   // Slot 7
  60000,   // Slot 8
  90000,   // Slot 9
  130000,  // Slot 10
  180000,  // Slot 11
  250000,  // Slot 12
];

// === UPGRADE SCALING ===
export const UPGRADE_COST_MULTIPLIER = 1.15;  // 15% more per level
export const INCOME_LEVEL_MULTIPLIER = 1.1;   // 10% more income per level
export const MAINTENANCE_LEVEL_MULTIPLIER = 1.05; // 5% more upkeep per level

// === DEMOLISH ===
export const DEMOLISH_REFUND_RATE = 0.5; // 50% refund

// === GUESTS ===
export const BASE_GUEST_RATE = 0.5;
export const GUEST_PER_CAPACITY = 0.1;

// === PERSISTENCE ===
export const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
export const TICK_RATE = 100; // 10 ticks per second
