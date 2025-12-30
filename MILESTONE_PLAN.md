# Milestone System Implementation Plan

## Executive Summary

Design a **highly scalable, decoupled, and AI-maintainable** milestone system for Idlepark that supports:
- Flexible requirements (any game condition)
- Flexible rewards (money, unlocks, cosmetics, etc.)
- Offline progress tracking (milestones unlock even when browser is closed)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MILESTONE SYSTEM                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐    ┌──────────────────┐    ┌───────────────────────┐ │
│  │ milestones.ts│───▶│ milestoneStore.ts│───▶│ MilestoneModal.tsx    │ │
│  │  (DATA)      │    │  (LOGIC)         │    │  (DISPLAY)            │ │
│  └──────────────┘    └──────────────────┘    └───────────────────────┘ │
│         │                    │                         │               │
│         ▼                    ▼                         ▼               │
│  ┌──────────────┐    ┌──────────────────┐    ┌───────────────────────┐ │
│  │ Requirement  │    │ Reward Applier   │    │ notificationStore     │ │
│  │ Evaluators   │    │ (polymorphic)    │    │ (existing)            │ │
│  └──────────────┘    └──────────────────┘    └───────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Core Design Principles

### 1. Data-Driven Milestones
All milestones defined in a single data file. Adding a new milestone = adding an object to an array. No code changes needed.

### 2. Pure Requirement Evaluators
Requirement checking is a **pure function**: `(snapshot) => boolean`. No side effects, easily testable, works for both online and offline evaluation.

### 3. Polymorphic Rewards
Rewards are objects with a `type` discriminator. The reward applier handles each type. Adding new reward types = adding a handler function.

### 4. Snapshot-Based Evaluation
Instead of tracking every event, we evaluate milestones against a **state snapshot**. This enables:
- Offline milestone checking (reconstruct state, evaluate all milestones)
- Idempotent checks (same snapshot = same results)
- Easy debugging (snapshot is serializable)

---

## File Structure

```
src/
├── data/
│   └── milestones.ts          # NEW: Milestone definitions (data only)
├── store/
│   ├── gameStore.ts           # MODIFY: Add milestone tracking fields
│   └── milestoneStore.ts      # NEW: Milestone evaluation & rewards
├── core/
│   └── types.ts               # MODIFY: Add milestone types
├── components/
│   └── MilestoneUnlockModal.tsx # NEW: Celebration UI
└── hooks/
    └── useMilestoneCheck.ts   # NEW: Periodic milestone evaluation
```

---

## Type Definitions

### Core Types (add to `src/core/types.ts`)

```typescript
// ============================================
// MILESTONE REQUIREMENT TYPES
// ============================================

// Base interface - all requirements have a type discriminator
export type MilestoneRequirement =
  | GuestCountRequirement
  | TotalEarningsRequirement
  | BuildingCountRequirement
  | BuildingTypeRequirement
  | UpgradeLevelRequirement
  | PlayTimeRequirement
  | PeakGuestsRequirement
  | SimultaneousBuildingsRequirement
  | CompoundRequirement;

// "Have X guests at once"
export interface GuestCountRequirement {
  type: 'guestCount';
  amount: number;
}

// "Earn $X total"
export interface TotalEarningsRequirement {
  type: 'totalEarnings';
  amount: number;
}

// "Own X buildings"
export interface BuildingCountRequirement {
  type: 'buildingCount';
  count: number;
}

// "Own X buildings of type Y"
export interface BuildingTypeRequirement {
  type: 'buildingType';
  category: 'ride' | 'shop' | 'infrastructure';
  count: number;
}

// "Have a building at level X"
export interface UpgradeLevelRequirement {
  type: 'upgradeLevel';
  level: number;
  count?: number; // optional: "have X buildings at level Y"
}

// "Play for X seconds"
export interface PlayTimeRequirement {
  type: 'playTime';
  seconds: number;
}

// "Had X guests at once (historical peak)"
export interface PeakGuestsRequirement {
  type: 'peakGuests';
  amount: number;
}

// "Have X different building types simultaneously"
export interface SimultaneousBuildingsRequirement {
  type: 'simultaneousBuildings';
  buildingIds: string[];
}

// Compound: ALL or ANY of sub-requirements
export interface CompoundRequirement {
  type: 'compound';
  operator: 'AND' | 'OR';
  requirements: MilestoneRequirement[];
}

// ============================================
// MILESTONE REWARD TYPES
// ============================================

export type MilestoneReward =
  | MoneyReward
  | UnlockSlotReward
  | MultiplierReward
  | CosmeticReward
  | NoReward;

// Grant flat money bonus
export interface MoneyReward {
  type: 'money';
  amount: number;
}

// Unlock a building slot for free
export interface UnlockSlotReward {
  type: 'unlockSlot';
}

// Permanent multiplier (e.g., +5% income)
export interface MultiplierReward {
  type: 'multiplier';
  target: 'income' | 'shopIncome' | 'ticketIncome' | 'guestArrival';
  percentage: number; // e.g., 5 for +5%
}

// Cosmetic unlock (badge, theme, etc.)
export interface CosmeticReward {
  type: 'cosmetic';
  cosmeticId: string;
}

// No reward (achievement only)
export interface NoReward {
  type: 'none';
}

// ============================================
// MILESTONE DEFINITION
// ============================================

export interface Milestone {
  id: string;                      // Unique identifier
  name: string;                    // Display name
  description: string;             // Flavor text
  icon: string;                    // Emoji
  category: MilestoneCategory;     // For UI grouping
  requirement: MilestoneRequirement;
  reward: MilestoneReward;
  hidden?: boolean;                // Hidden until unlocked
  order?: number;                  // Display order within category
}

export type MilestoneCategory =
  | 'guests'
  | 'earnings'
  | 'buildings'
  | 'upgrades'
  | 'time'
  | 'special';

// ============================================
// MILESTONE STATE (persisted)
// ============================================

export interface MilestoneProgress {
  completedMilestones: string[];   // Array of milestone IDs
  completedAt: Record<string, number>; // milestoneId -> timestamp
  pendingRewards: MilestoneReward[]; // Rewards to show on next session
}

// ============================================
// GAME STATE SNAPSHOT (for evaluation)
// ============================================

export interface GameSnapshot {
  // Current state
  money: number;
  guests: number;
  ticketPrice: number;
  slots: Slot[];
  unlockedSlots: number;

  // Historical/cumulative (key for offline)
  totalEarnings: number;
  peakGuests: number;              // NEW: Track highest guest count ever
  totalPlayTimeSeconds: number;    // NEW: Track total play time

  // Derived (calculated from slots)
  buildingCount: number;
  rideCount: number;
  shopCount: number;
  infrastructureCount: number;
  maxBuildingLevel: number;
  buildingsAtLevel3: number;
  uniqueBuildingTypes: string[];
}
```

---

## Milestone Data File (`src/data/milestones.ts`)

```typescript
import { Milestone } from '../core/types';

export const MILESTONES: Milestone[] = [
  // ============================================
  // GUEST MILESTONES
  // ============================================
  {
    id: 'first_visitor',
    name: 'Grand Opening',
    description: 'Welcome your first guest to the park',
    icon: '🎉',
    category: 'guests',
    requirement: { type: 'guestCount', amount: 1 },
    reward: { type: 'money', amount: 100 },
    order: 1,
  },
  {
    id: 'guests_10',
    name: 'Getting Busy',
    description: 'Have 10 guests in your park at once',
    icon: '👥',
    category: 'guests',
    requirement: { type: 'guestCount', amount: 10 },
    reward: { type: 'money', amount: 500 },
    order: 2,
  },
  {
    id: 'guests_50',
    name: 'Popular Destination',
    description: 'Have 50 guests in your park at once',
    icon: '🏟️',
    category: 'guests',
    requirement: { type: 'guestCount', amount: 50 },
    reward: { type: 'money', amount: 2000 },
    order: 3,
  },
  {
    id: 'guests_100',
    name: 'Crowd Pleaser',
    description: 'Have 100 guests in your park at once',
    icon: '🎢',
    category: 'guests',
    requirement: { type: 'guestCount', amount: 100 },
    reward: { type: 'money', amount: 5000 },
    order: 4,
  },
  {
    id: 'guests_500',
    name: 'Theme Park Tycoon',
    description: 'Have 500 guests in your park at once',
    icon: '👑',
    category: 'guests',
    requirement: { type: 'guestCount', amount: 500 },
    reward: { type: 'multiplier', target: 'ticketIncome', percentage: 5 },
    order: 5,
  },
  {
    id: 'peak_1000',
    name: 'Legendary Status',
    description: 'Reach 1,000 guests at once (historical peak)',
    icon: '🏆',
    category: 'guests',
    requirement: { type: 'peakGuests', amount: 1000 },
    reward: { type: 'multiplier', target: 'income', percentage: 10 },
    order: 6,
    hidden: true,
  },

  // ============================================
  // EARNINGS MILESTONES
  // ============================================
  {
    id: 'earnings_1k',
    name: 'First Thousand',
    description: 'Earn $1,000 total',
    icon: '💵',
    category: 'earnings',
    requirement: { type: 'totalEarnings', amount: 1000 },
    reward: { type: 'money', amount: 100 },
    order: 1,
  },
  {
    id: 'earnings_10k',
    name: 'Money Maker',
    description: 'Earn $10,000 total',
    icon: '💰',
    category: 'earnings',
    requirement: { type: 'totalEarnings', amount: 10000 },
    reward: { type: 'money', amount: 1000 },
    order: 2,
  },
  {
    id: 'earnings_100k',
    name: 'Six Figures',
    description: 'Earn $100,000 total',
    icon: '🤑',
    category: 'earnings',
    requirement: { type: 'totalEarnings', amount: 100000 },
    reward: { type: 'money', amount: 5000 },
    order: 3,
  },
  {
    id: 'earnings_1m',
    name: 'Millionaire',
    description: 'Earn $1,000,000 total',
    icon: '💎',
    category: 'earnings',
    requirement: { type: 'totalEarnings', amount: 1000000 },
    reward: { type: 'multiplier', target: 'shopIncome', percentage: 10 },
    order: 4,
  },
  {
    id: 'earnings_10m',
    name: 'Mega Mogul',
    description: 'Earn $10,000,000 total',
    icon: '🏦',
    category: 'earnings',
    requirement: { type: 'totalEarnings', amount: 10000000 },
    reward: { type: 'multiplier', target: 'income', percentage: 15 },
    order: 5,
    hidden: true,
  },

  // ============================================
  // BUILDING MILESTONES
  // ============================================
  {
    id: 'first_building',
    name: 'Groundbreaking',
    description: 'Build your first attraction',
    icon: '🏗️',
    category: 'buildings',
    requirement: { type: 'buildingCount', count: 1 },
    reward: { type: 'money', amount: 200 },
    order: 1,
  },
  {
    id: 'buildings_5',
    name: 'Growing Park',
    description: 'Own 5 buildings',
    icon: '🏘️',
    category: 'buildings',
    requirement: { type: 'buildingCount', count: 5 },
    reward: { type: 'money', amount: 1000 },
    order: 2,
  },
  {
    id: 'buildings_10',
    name: 'Full House',
    description: 'Own 10 buildings',
    icon: '🏙️',
    category: 'buildings',
    requirement: { type: 'buildingCount', count: 10 },
    reward: { type: 'unlockSlot' },
    order: 3,
  },
  {
    id: 'all_rides',
    name: 'Thrill Seeker',
    description: 'Own at least 3 rides',
    icon: '🎢',
    category: 'buildings',
    requirement: { type: 'buildingType', category: 'ride', count: 3 },
    reward: { type: 'money', amount: 3000 },
    order: 4,
  },
  {
    id: 'all_shops',
    name: 'Retail Therapy',
    description: 'Own at least 3 shops',
    icon: '🛍️',
    category: 'buildings',
    requirement: { type: 'buildingType', category: 'shop', count: 3 },
    reward: { type: 'multiplier', target: 'shopIncome', percentage: 5 },
    order: 5,
  },
  {
    id: 'infrastructure_king',
    name: 'Well Maintained',
    description: 'Own at least 3 infrastructure buildings',
    icon: '🚽',
    category: 'buildings',
    requirement: { type: 'buildingType', category: 'infrastructure', count: 3 },
    reward: { type: 'multiplier', target: 'guestArrival', percentage: 5 },
    order: 6,
  },

  // ============================================
  // UPGRADE MILESTONES
  // ============================================
  {
    id: 'first_upgrade',
    name: 'Level Up',
    description: 'Upgrade any building to level 2',
    icon: '⬆️',
    category: 'upgrades',
    requirement: { type: 'upgradeLevel', level: 2 },
    reward: { type: 'money', amount: 500 },
    order: 1,
  },
  {
    id: 'max_upgrade',
    name: 'Maxed Out',
    description: 'Upgrade any building to level 3 (★★★)',
    icon: '⭐',
    category: 'upgrades',
    requirement: { type: 'upgradeLevel', level: 3 },
    reward: { type: 'money', amount: 2000 },
    order: 2,
  },
  {
    id: 'triple_max',
    name: 'Perfectionist',
    description: 'Have 3 buildings at max level',
    icon: '✨',
    category: 'upgrades',
    requirement: { type: 'upgradeLevel', level: 3, count: 3 },
    reward: { type: 'multiplier', target: 'income', percentage: 5 },
    order: 3,
  },

  // ============================================
  // TIME MILESTONES
  // ============================================
  {
    id: 'playtime_1h',
    name: 'Getting Started',
    description: 'Play for 1 hour total',
    icon: '⏰',
    category: 'time',
    requirement: { type: 'playTime', seconds: 3600 },
    reward: { type: 'money', amount: 1000 },
    order: 1,
  },
  {
    id: 'playtime_1d',
    name: 'Dedicated Manager',
    description: 'Play for 24 hours total',
    icon: '📅',
    category: 'time',
    requirement: { type: 'playTime', seconds: 86400 },
    reward: { type: 'money', amount: 10000 },
    order: 2,
  },
  {
    id: 'playtime_1w',
    name: 'Park Veteran',
    description: 'Play for 1 week total',
    icon: '🗓️',
    category: 'time',
    requirement: { type: 'playTime', seconds: 604800 },
    reward: { type: 'multiplier', target: 'income', percentage: 10 },
    order: 3,
    hidden: true,
  },

  // ============================================
  // SPECIAL/COMPOUND MILESTONES
  // ============================================
  {
    id: 'balanced_park',
    name: 'Balanced Park',
    description: 'Own at least 2 rides, 2 shops, and 2 infrastructure',
    icon: '⚖️',
    category: 'special',
    requirement: {
      type: 'compound',
      operator: 'AND',
      requirements: [
        { type: 'buildingType', category: 'ride', count: 2 },
        { type: 'buildingType', category: 'shop', count: 2 },
        { type: 'buildingType', category: 'infrastructure', count: 2 },
      ],
    },
    reward: { type: 'money', amount: 5000 },
    order: 1,
  },
];

// Helper to get milestone by ID
export const getMilestoneById = (id: string): Milestone | undefined =>
  MILESTONES.find((m) => m.id === id);

// Helper to get milestones by category
export const getMilestonesByCategory = (category: string): Milestone[] =>
  MILESTONES.filter((m) => m.category === category);
```

---

## Milestone Store (`src/store/milestoneStore.ts`)

```typescript
import { create } from 'zustand';
import {
  Milestone,
  MilestoneRequirement,
  MilestoneReward,
  MilestoneProgress,
  GameSnapshot,
} from '../core/types';
import { MILESTONES } from '../data/milestones';
import { useGameStore } from './gameStore';
import { useNotificationStore } from './notificationStore';

// ============================================
// REQUIREMENT EVALUATORS (Pure Functions)
// ============================================

const evaluateRequirement = (
  req: MilestoneRequirement,
  snapshot: GameSnapshot
): boolean => {
  switch (req.type) {
    case 'guestCount':
      return snapshot.guests >= req.amount;

    case 'totalEarnings':
      return snapshot.totalEarnings >= req.amount;

    case 'buildingCount':
      return snapshot.buildingCount >= req.count;

    case 'buildingType':
      switch (req.category) {
        case 'ride':
          return snapshot.rideCount >= req.count;
        case 'shop':
          return snapshot.shopCount >= req.count;
        case 'infrastructure':
          return snapshot.infrastructureCount >= req.count;
      }
      return false;

    case 'upgradeLevel':
      if (req.count) {
        // "Have X buildings at level Y"
        const countAtLevel = snapshot.slots.filter(
          (s) => s.building && s.level >= req.level
        ).length;
        return countAtLevel >= req.count;
      }
      // "Have any building at level Y"
      return snapshot.maxBuildingLevel >= req.level;

    case 'playTime':
      return snapshot.totalPlayTimeSeconds >= req.seconds;

    case 'peakGuests':
      return snapshot.peakGuests >= req.amount;

    case 'simultaneousBuildings':
      return req.buildingIds.every((id) =>
        snapshot.uniqueBuildingTypes.includes(id)
      );

    case 'compound':
      if (req.operator === 'AND') {
        return req.requirements.every((r) => evaluateRequirement(r, snapshot));
      }
      return req.requirements.some((r) => evaluateRequirement(r, snapshot));

    default:
      return false;
  }
};

// ============================================
// REWARD APPLIERS
// ============================================

const applyReward = (reward: MilestoneReward): void => {
  const gameStore = useGameStore.getState();

  switch (reward.type) {
    case 'money':
      gameStore.addMoney(reward.amount);
      break;

    case 'unlockSlot':
      gameStore.unlockSlotFree();
      break;

    case 'multiplier':
      gameStore.addMultiplier(reward.target, reward.percentage);
      break;

    case 'cosmetic':
      gameStore.unlockCosmetic(reward.cosmeticId);
      break;

    case 'none':
      // No reward, just the achievement
      break;
  }
};

// ============================================
// SNAPSHOT BUILDER
// ============================================

export const buildGameSnapshot = (): GameSnapshot => {
  const state = useGameStore.getState();
  const buildings = state.slots.filter((s) => s.building);

  return {
    money: state.money,
    guests: state.guests,
    ticketPrice: state.ticketPrice,
    slots: state.slots,
    unlockedSlots: state.unlockedSlots,
    totalEarnings: state.totalEarnings,
    peakGuests: state.peakGuests,
    totalPlayTimeSeconds: state.totalPlayTimeSeconds,
    buildingCount: buildings.length,
    rideCount: buildings.filter((s) => s.building?.type === 'ride').length,
    shopCount: buildings.filter((s) => s.building?.type === 'shop').length,
    infrastructureCount: buildings.filter(
      (s) => s.building?.type === 'infrastructure'
    ).length,
    maxBuildingLevel: Math.max(0, ...buildings.map((s) => s.level)),
    buildingsAtLevel3: buildings.filter((s) => s.level >= 3).length,
    uniqueBuildingTypes: [...new Set(buildings.map((s) => s.building!.id))],
  };
};

// ============================================
// MILESTONE STORE
// ============================================

interface MilestoneStore {
  // State
  completedMilestones: string[];
  completedAt: Record<string, number>;
  pendingUnlocks: Milestone[]; // Milestones unlocked this session (for UI)

  // Actions
  checkMilestones: () => Milestone[];
  checkMilestonesOffline: (snapshot: GameSnapshot) => Milestone[];
  markComplete: (milestoneId: string) => void;
  clearPendingUnlocks: () => void;
  isCompleted: (milestoneId: string) => boolean;
  getProgress: () => MilestoneProgress;
  loadProgress: (progress: MilestoneProgress) => void;
}

export const useMilestoneStore = create<MilestoneStore>((set, get) => ({
  completedMilestones: [],
  completedAt: {},
  pendingUnlocks: [],

  checkMilestones: () => {
    const snapshot = buildGameSnapshot();
    return get().checkMilestonesOffline(snapshot);
  },

  checkMilestonesOffline: (snapshot: GameSnapshot) => {
    const { completedMilestones } = get();
    const newlyCompleted: Milestone[] = [];

    for (const milestone of MILESTONES) {
      // Skip already completed
      if (completedMilestones.includes(milestone.id)) continue;

      // Evaluate requirement
      if (evaluateRequirement(milestone.requirement, snapshot)) {
        newlyCompleted.push(milestone);

        // Apply reward
        applyReward(milestone.reward);

        // Mark as complete
        get().markComplete(milestone.id);
      }
    }

    // Add to pending unlocks for UI display
    if (newlyCompleted.length > 0) {
      set((state) => ({
        pendingUnlocks: [...state.pendingUnlocks, ...newlyCompleted],
      }));

      // Also send notifications
      const notificationStore = useNotificationStore.getState();
      for (const m of newlyCompleted) {
        notificationStore.addNotification({
          name: 'Achievement',
          emoji: m.icon,
          text: `${m.name} unlocked!`,
          type: 'positive',
        });
      }
    }

    return newlyCompleted;
  },

  markComplete: (milestoneId: string) => {
    set((state) => ({
      completedMilestones: [...state.completedMilestones, milestoneId],
      completedAt: {
        ...state.completedAt,
        [milestoneId]: Date.now(),
      },
    }));
  },

  clearPendingUnlocks: () => {
    set({ pendingUnlocks: [] });
  },

  isCompleted: (milestoneId: string) => {
    return get().completedMilestones.includes(milestoneId);
  },

  getProgress: () => ({
    completedMilestones: get().completedMilestones,
    completedAt: get().completedAt,
    pendingRewards: [],
  }),

  loadProgress: (progress: MilestoneProgress) => {
    set({
      completedMilestones: progress.completedMilestones,
      completedAt: progress.completedAt,
    });
  },
}));
```

---

## Game Store Modifications

### New Fields to Add to GameState

```typescript
// In gameStore.ts, add to GameState interface:
interface GameState {
  // ... existing fields ...

  // NEW: For milestone tracking
  peakGuests: number;              // Highest guest count ever achieved
  totalPlayTimeSeconds: number;    // Total play time in seconds

  // NEW: For multiplier rewards
  multipliers: {
    income: number;      // Base: 1.0 (100%)
    shopIncome: number;
    ticketIncome: number;
    guestArrival: number;
  };

  // NEW: Cosmetic unlocks
  unlockedCosmetics: string[];
}
```

### New Actions to Add

```typescript
// Add these actions to the gameStore:

addMoney: (amount: number) => {
  set((state) => ({
    money: state.money + amount,
    totalEarnings: state.totalEarnings + amount,
  }));
  get().save();
},

unlockSlotFree: () => {
  set((state) => ({
    unlockedSlots: Math.min(state.unlockedSlots + 1, MAX_SLOTS),
  }));
  get().save();
},

addMultiplier: (target: string, percentage: number) => {
  set((state) => ({
    multipliers: {
      ...state.multipliers,
      [target]: state.multipliers[target] + percentage / 100,
    },
  }));
  get().save();
},

unlockCosmetic: (cosmeticId: string) => {
  set((state) => ({
    unlockedCosmetics: [...state.unlockedCosmetics, cosmeticId],
  }));
  get().save();
},

updatePeakGuests: (current: number) => {
  set((state) => ({
    peakGuests: Math.max(state.peakGuests, current),
  }));
},

incrementPlayTime: (seconds: number) => {
  set((state) => ({
    totalPlayTimeSeconds: state.totalPlayTimeSeconds + seconds,
  }));
},
```

### Modify tick() to Track Peaks

```typescript
tick: (deltaSeconds: number) => {
  // ... existing tick logic ...

  // NEW: Update peak guests
  get().updatePeakGuests(newGuests);

  // NEW: Increment play time
  get().incrementPlayTime(deltaSeconds);
},
```

---

## Offline Milestone Checking

### Modify `applyOfflineProgress()` in gameStore.ts

```typescript
applyOfflineProgress: () => {
  const state = get();
  const now = Date.now();
  const offlineSeconds = (now - state.lastSaveTime) / 1000;

  if (offlineSeconds < 1) return { earnings: 0, newMilestones: [] };

  // ... existing offline earnings calculation ...

  // NEW: Calculate offline play time
  const newTotalPlayTime = state.totalPlayTimeSeconds + offlineSeconds;

  // NEW: Build snapshot for offline milestone check
  const offlineSnapshot: GameSnapshot = {
    money: newMoney,
    guests: equilibriumGuests, // Use equilibrium, not peak
    ticketPrice: state.ticketPrice,
    slots: state.slots,
    unlockedSlots: state.unlockedSlots,
    totalEarnings: state.totalEarnings + Math.max(0, offlineEarnings),
    peakGuests: state.peakGuests, // Peak doesn't change offline
    totalPlayTimeSeconds: newTotalPlayTime,
    // ... derived fields ...
  };

  // NEW: Check milestones against offline snapshot
  const milestoneStore = useMilestoneStore.getState();
  const newMilestones = milestoneStore.checkMilestonesOffline(offlineSnapshot);

  // Update state (including new play time)
  set({
    money: newMoney,
    lastSaveTime: now,
    totalEarnings: state.totalEarnings + Math.max(0, offlineEarnings),
    totalPlayTimeSeconds: newTotalPlayTime,
    // ... rest of updates ...
  });

  return {
    earnings: offlineEarnings,
    newMilestones
  };
},
```

---

## Integration Points

### 1. Real-time Milestone Checking (useMilestoneCheck.ts)

```typescript
import { useEffect } from 'react';
import { useMilestoneStore } from '../store/milestoneStore';

const MILESTONE_CHECK_INTERVAL = 1000; // Check every second

export const useMilestoneCheck = () => {
  const checkMilestones = useMilestoneStore((s) => s.checkMilestones);

  useEffect(() => {
    const interval = setInterval(() => {
      checkMilestones();
    }, MILESTONE_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [checkMilestones]);
};
```

### 2. App.tsx Integration

```tsx
// In App.tsx
import { useMilestoneCheck } from './hooks/useMilestoneCheck';
import { MilestoneUnlockModal } from './components/MilestoneUnlockModal';

function App() {
  useMilestoneCheck(); // Enable real-time checking

  // On mount, check offline milestones
  useEffect(() => {
    const { earnings, newMilestones } = useGameStore.getState().applyOfflineProgress();

    if (earnings > 0 || newMilestones.length > 0) {
      setShowOfflineModal(true);
      setOfflineData({ earnings, milestones: newMilestones });
    }
  }, []);

  return (
    <>
      {/* ... existing components ... */}
      <MilestoneUnlockModal />
    </>
  );
}
```

### 3. OfflineModal Enhancement

Show milestones unlocked while offline alongside earnings:

```tsx
// In OfflineModal.tsx
interface OfflineModalProps {
  earnings: number;
  milestones: Milestone[];
}

// Display:
// "While you were away..."
// "💵 You earned $12,345"
// "🏆 Unlocked: Money Maker, Growing Park"
```

---

## Persistence

### Modify db.ts

```typescript
// Add milestone progress to save structure
interface SaveData {
  gameState: GameState;
  milestoneProgress: MilestoneProgress; // NEW
}

// Modify save/load functions
export const saveGame = async (
  gameState: GameState,
  milestoneProgress: MilestoneProgress
) => {
  await db.saves.put({ key: 'main', gameState, milestoneProgress });
};

export const loadGame = async (): Promise<SaveData | null> => {
  return await db.saves.get('main');
};
```

---

## Adding New Milestones (Future-Proof)

To add a new milestone, just add an entry to `milestones.ts`:

```typescript
// Example: Add a new milestone for owning specific buildings together
{
  id: 'food_court',
  name: 'Food Court',
  description: "Own Nathan's, Starbucks, and McDonald's at the same time",
  icon: '🍔',
  category: 'special',
  requirement: {
    type: 'simultaneousBuildings',
    buildingIds: ['nathans', 'starbucks', 'mcdonalds'],
  },
  reward: { type: 'multiplier', target: 'shopIncome', percentage: 15 },
},
```

No code changes needed - just data!

---

## Adding New Reward Types (Future-Proof)

1. Add type to `MilestoneReward` union in `types.ts`
2. Add handler in `applyReward()` function
3. Add corresponding action in `gameStore.ts`

Example: Add "unlock building" reward:

```typescript
// In types.ts
export interface UnlockBuildingReward {
  type: 'unlockBuilding';
  buildingId: string;
}

// In milestoneStore.ts applyReward()
case 'unlockBuilding':
  gameStore.unlockBuilding(reward.buildingId);
  break;

// In gameStore.ts
unlockBuilding: (buildingId: string) => {
  set((state) => ({
    unlockedBuildings: [...state.unlockedBuildings, buildingId],
  }));
},
```

---

## Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Add milestone types to `core/types.ts`
- [ ] Create `data/milestones.ts` with initial milestones
- [ ] Create `store/milestoneStore.ts` with evaluators and reward appliers
- [ ] Modify `gameStore.ts` to add tracking fields (peakGuests, totalPlayTime, multipliers)
- [ ] Add new actions to `gameStore.ts` (addMoney, unlockSlotFree, addMultiplier)

### Phase 2: Integration
- [ ] Create `hooks/useMilestoneCheck.ts` for real-time checking
- [ ] Modify `tick()` to update peak guests and play time
- [ ] Modify `applyOfflineProgress()` to check milestones
- [ ] Update `db.ts` to persist milestone progress

### Phase 3: UI
- [ ] Create `MilestoneUnlockModal.tsx` for celebration
- [ ] Enhance `OfflineModal.tsx` to show unlocked milestones
- [ ] Add milestone list to `SettingsMenu.tsx` or new `MilestonesPanel.tsx`

### Phase 4: Polish
- [ ] Add animations for milestone unlocks
- [ ] Add sounds (optional)
- [ ] Balance milestone thresholds with game economy
- [ ] Add more milestones based on playtesting

---

## Key Benefits of This Architecture

1. **Scalable**: Add milestones by editing data file only
2. **Decoupled**: Requirements, rewards, and UI are all separate
3. **Testable**: Pure functions for evaluation, no side effects
4. **Offline-Ready**: Snapshot-based evaluation works for any point in time
5. **Type-Safe**: Full TypeScript coverage with discriminated unions
6. **AI-Maintainable**: Clear patterns, single responsibility, predictable structure
7. **Extensible**: New requirement/reward types follow established patterns
