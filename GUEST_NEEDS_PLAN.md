# Guest Needs System - Implementation Plan

## Overview

Transform the current generic "satisfaction" system into a rich, multi-dimensional guest needs simulation that makes each building type matter.

---

## Current State Analysis

### Current Buildings
| Category | Buildings | Current Stat |
|----------|-----------|--------------|
| **Rides** | Carousel, Bumper Cars, Ferris Wheel, Splash Mountain, Steel Vengeance, Tower of Terror | `prestige`, `rideCapacity` |
| **Shops** | Balloon Cart, Nathan's, Ben & Jerry's, Starbucks, Disney Store, McDonald's, Dave & Buster's, Nike | `spendingRate` |
| **Infrastructure** | Benches, Trash Cans, Restrooms, First Aid, Info Booth, Security | `coverage` (generic) |

### Current Satisfaction
```
rideSatisfaction = rideCapacity / guests
facilitySatisfaction = coverage / guests  ← All infrastructure lumped together
overallSatisfaction = average(ride, facility)
```

**Problem:** All infrastructure buildings do the same thing. No reason to choose trash cans over security.

---

## Proposed: 4 Core Guest Needs

### 1. Entertainment (🎢)
- **What:** Are guests having fun? Are ride queues manageable?
- **Provided by:** Rides (rideCapacity)
- **Formula:** `entertainmentSatisfaction = rideCapacity / guests`
- **Already exists** as `rideSatisfaction`

### 2. Hunger (🍔)
- **What:** Are guests fed? Do they have access to food?
- **Provided by:** Food shops only (Nathan's, Ben & Jerry's, McDonald's, Starbucks)
- **New stat on buildings:** `hungerCapacity` (guests it can feed)
- **Formula:** `hungerSatisfaction = totalHungerCapacity / guests`

### 3. Comfort (🚻)
- **What:** Can guests rest and use facilities?
- **Provided by:** Restrooms, Benches, Info Booth
- **New stat on buildings:** `comfortCapacity`
- **Formula:** `comfortSatisfaction = totalComfortCapacity / guests`

### 4. Safety (🛡️)
- **What:** Do guests feel safe? Is help available if needed?
- **Provided by:** Security Station, First Aid
- **New stat on buildings:** `safetyCapacity`
- **Formula:** `safetySatisfaction = totalSafetyCapacity / guests`

### 5. Cleanliness (🧹) - Optional/Later
- **What:** Is the park clean?
- **Provided by:** Trash Cans (primarily), Restrooms (secondary)
- Could add as a 5th need or merge into Comfort

---

## Overall Satisfaction Calculation

```typescript
overallSatisfaction = (
  entertainment * 0.35 +   // Rides are most important
  hunger * 0.25 +          // Food is essential
  comfort * 0.20 +         // Nice to have
  safety * 0.20            // Peace of mind
)
```

Weights can be tuned for balance.

---

## Building Stat Updates

### Rides (unchanged)
| Building | Prestige | Ride Capacity |
|----------|----------|---------------|
| Carousel | 20 | 30 |
| Bumper Cars | 35 | 25 |
| Ferris Wheel | 60 | 50 |
| Splash Mountain | 100 | 40 |
| Steel Vengeance | 200 | 60 |
| Tower of Terror | 250 | 45 |

### Shops - Add Hunger Capacity
| Building | Spending Rate | Hunger Capacity | Notes |
|----------|---------------|-----------------|-------|
| Balloon Cart 🎈 | $0.08 | 0 | Not food |
| Nathan's 🌭 | $0.12 | 25 | Quick food |
| Ben & Jerry's 🍦 | $0.15 | 15 | Snack/treat |
| Starbucks ☕ | $0.20 | 20 | Drinks + snacks |
| Disney Store 🏰 | $0.35 | 0 | Not food |
| McDonald's 🍔 | $0.50 | 50 | Full meals |
| Dave & Buster's 🕹️ | $0.80 | 30 | Has food + games |
| Nike 👟 | $1.20 | 0 | Not food |

### Infrastructure - Specialized Stats
| Building | Old Coverage | New Stats |
|----------|--------------|-----------|
| Benches 🪑 | 20 | comfort: 25 |
| Trash Cans 🗑️ | 15 | comfort: 10 (cleanliness aspect) |
| Restrooms 🚻 | 40 | comfort: 50 |
| First Aid 🏥 | 80 | safety: 60, comfort: 20 |
| Info Booth ℹ️ | 60 | comfort: 40 |
| Security 👮 | 150 | safety: 100 |

---

## Type Updates

### BuildingDefinition
```typescript
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
  prestige?: number;
  rideCapacity?: number;

  // Shop stats
  spendingRate?: number;
  hungerCapacity?: number;      // NEW: How many guests it can feed

  // Infrastructure stats (replaces generic 'coverage')
  comfortCapacity?: number;     // NEW: Restrooms, benches, info
  safetyCapacity?: number;      // NEW: Security, first aid
};
```

### ParkStats
```typescript
export type ParkStats = {
  // ... existing fields ...

  // NEW: Detailed satisfaction breakdown
  entertainmentSatisfaction: number;  // Renamed from rideSatisfaction
  hungerSatisfaction: number;         // NEW
  comfortSatisfaction: number;        // NEW
  safetySatisfaction: number;         // NEW

  // Capacities for UI display
  totalHungerCapacity: number;
  totalComfortCapacity: number;
  totalSafetyCapacity: number;
};
```

---

## UI Updates

### Header - Quick Status Icons
Show 4 icons with color-coded status:
```
🎢 😊  🍔 😐  🚻 😟  🛡️ 😊
```
- Green (80%+): Guests happy
- Yellow (50-80%): Needs attention
- Red (<50%): Critical

### Stats Dashboard - Needs Tab
Add a "Needs" section showing:
```
┌─────────────────────────────────┐
│ 👥 Guest Needs                  │
├─────────────────────────────────┤
│ 🎢 Entertainment    ████████ 85%│
│ 🍔 Hunger          ██████░░ 62%│ ← Build more food shops!
│ 🚻 Comfort         █████░░░ 55%│
│ 🛡️ Safety          ███████░ 78%│
├─────────────────────────────────┤
│ 😊 Overall: 70%                 │
└─────────────────────────────────┘
```

### Build Menu Hints
When a need is low, hint which buildings help:
- "Guests are hungry! 🍔" → Highlight food shops
- "Guests need rest! 🪑" → Highlight benches, restrooms

---

## Gameplay Impact

### Strategic Decisions
Players now must balance:
1. **Revenue** - Rides bring guests, shops make money
2. **Sustainability** - Low needs = guests leave faster
3. **Specialization** - Can't just spam one building type

### Guest Departure Rate
```typescript
// Current: guests leave faster when unsatisfied
const unhappyLeaving = guests * (1 - overallSatisfaction) * LEAVE_RATE;

// Enhanced: each unmet need has specific impact
const entertainmentPenalty = (1 - entertainment) * 0.05;
const hungerPenalty = (1 - hunger) * 0.08;  // Hungry guests leave faster
const comfortPenalty = (1 - comfort) * 0.03;
const safetyPenalty = (1 - safety) * 0.02;

const totalPenalty = entertainmentPenalty + hungerPenalty + comfortPenalty + safetyPenalty;
const unhappyLeaving = guests * totalPenalty * LEAVE_RATE;
```

### Spending Rate Modifier
Hungry/uncomfortable guests spend less:
```typescript
const spendingModifier = Math.min(1, (hunger + comfort) / 2 + 0.5);
const actualShopIncome = baseShopIncome * spendingModifier;
```

---

## Implementation Phases

### Phase 1: Core Data Changes
1. Update `BuildingDefinition` type with new stats
2. Update `buildings.ts` with new stat values
3. Update `ParkStats` type with new satisfaction fields

### Phase 2: Calculation Logic
1. Update `parkCalculations.ts` to calculate all 4 needs
2. Update `gameStore.ts` tick() to use new satisfaction
3. Adjust guest departure and spending rates

### Phase 3: UI Updates
1. Add needs breakdown to StatsDashboard
2. Add quick status indicators to Header (optional)
3. Update insights to reference specific needs

### Phase 4: Polish
1. Add tooltips explaining each need
2. Balance the numbers through playtesting
3. Add "low need" warnings/notifications

---

## Backward Compatibility

- Existing saves will work (new fields have defaults)
- Old `coverage` field can be ignored (deprecated)
- `rideSatisfaction` renamed to `entertainmentSatisfaction` (alias for transition)
- `facilitySatisfaction` becomes average of comfort + safety

---

## Summary

This change transforms the game from "build random stuff" to **strategic park management** where every building choice matters. Players will need to:

1. **Watch their guests' needs** - Not just income
2. **Balance building types** - Can't ignore food or safety
3. **React to problems** - "Guests are hungry!" prompts action

The UI will clearly show what's wrong and hint at solutions, making it accessible while adding depth.
