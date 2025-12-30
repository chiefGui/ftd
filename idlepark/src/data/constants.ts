// === STARTING VALUES ===
export const STARTING_MONEY = 10000;
export const STARTING_SLOTS = 4;
export const MAX_SLOTS = 12;
export const STARTING_TICKET_PRICE = 10;

// === GUEST CAPACITY ===
export const GUESTS_PER_SLOT = 50; // Each slot adds 50 guest capacity

// === GUEST DYNAMICS ===
// How fast guests arrive/leave (per second rates)
export const GUEST_ARRIVAL_RATE = 0.15;    // 15% toward target per second
export const GUEST_DEPARTURE_RATE = 0.05;  // 5% leave naturally per second
export const GUEST_UNHAPPY_LEAVE_RATE = 0.20; // Extra 20% leave if unhappy

// === TICKET PRICING ===
export const TICKET_PRICE_MIN = 5;
export const TICKET_PRICE_MAX = 100;
export const TICKET_PRICE_STEP = 5;

// Demand curve: higher price = fewer guests want to come
export const calculateDemand = (ticketPrice: number): number => {
  // At $5 = 100% demand, at $50 = ~25% demand, at $100 = ~5% demand
  const normalized = (ticketPrice - TICKET_PRICE_MIN) / (TICKET_PRICE_MAX - TICKET_PRICE_MIN);
  return Math.max(0.05, 1 - Math.pow(normalized, 0.7));
};

// === SATISFACTION ===
// Ride satisfaction: ratio of ride capacity to guests
// Facility satisfaction: ratio of infrastructure coverage to guests
// Both contribute equally to overall satisfaction

// === SLOT UNLOCK COSTS ===
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
export const UPGRADE_COST_MULTIPLIER = 1.15;
export const STAT_LEVEL_MULTIPLIER = 1.12;        // 12% more prestige/capacity/coverage per level
export const MAINTENANCE_LEVEL_MULTIPLIER = 1.05; // 5% more upkeep per level

// === DEMOLISH ===
export const DEMOLISH_REFUND_RATE = 0.5;

// === PERSISTENCE ===
export const AUTO_SAVE_INTERVAL = 30000;
export const TICK_RATE = 100;
