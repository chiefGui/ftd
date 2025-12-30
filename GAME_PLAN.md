# Idlepark - Game Plan

## Overview
A mobile-first, browser-based idle game where players build and manage an amusement park. Inspired by Planet Coaster's charm, but designed for casual, commitment-free play with offline progression.

---

## Core Principles
1. **Simplicity first** - Easy to understand, no tutorial needed
2. **Respect player time** - Meaningful offline progress
3. **Visual delight** - Engaging animations and feedback
4. **Clean architecture** - Easy to extend with new features
5. **Grounded numbers** - Real-world scale, no "quintillions"

---

## Tech Stack (Confirmed)

### Framework
- **React + TypeScript** - Type safety, component-based, great tooling
- **Vite** - Fast builds, excellent DX

### Styling
- **Tailwind CSS v4** - Latest version, mobile-first utilities
- **Framer Motion** - Smooth animations for that "juicy" feel

### Art Style
- **Custom pixel art** - Charming, distinctive, works great on mobile

### Sound
- Skip for MVP

### Deployment
- **GitHub Pages** - Static hosting

### State Management
- **Zustand** - Simple, scalable, great for game state
- Separates concerns: game logic vs UI

### Storage
**Recommendation: IndexedDB via Dexie.js**

| Feature | localStorage | IndexedDB |
|---------|-------------|-----------|
| Storage limit | ~5-10MB | ~50MB+ |
| Async operations | No | Yes |
| Structured data | JSON strings | Native objects |
| Scalability | Limited | Excellent |
| Offline support | Basic | Better |

IndexedDB wins for:
- Larger save files as park grows
- Non-blocking saves (won't freeze UI)
- Native object storage (no JSON parse/stringify)
- Future-proof for complex features

---

## Game Architecture

```
src/
├── core/                    # Pure game logic (no React)
│   ├── engine/
│   │   ├── GameEngine.ts    # Main game loop, tick system
│   │   ├── OfflineCalculator.ts
│   │   └── TimeManager.ts
│   ├── entities/
│   │   ├── Attraction.ts    # Rides, shows, etc.
│   │   ├── Facility.ts      # Shops, restaurants
│   │   └── Guest.ts         # Visitor logic
│   ├── systems/
│   │   ├── EconomySystem.ts # Money, pricing, revenue
│   │   ├── HappinessSystem.ts
│   │   └── ProgressionSystem.ts
│   └── types/
│       └── index.ts         # All game types
│
├── data/
│   ├── attractions.ts       # Attraction definitions
│   ├── upgrades.ts          # Upgrade trees
│   └── milestones.ts        # Progression milestones
│
├── store/
│   ├── gameStore.ts         # Zustand store
│   └── persistence.ts       # IndexedDB integration
│
├── components/
│   ├── park/
│   │   ├── ParkView.tsx     # Main park visualization
│   │   ├── AttractionCard.tsx
│   │   └── GuestSprite.tsx
│   ├── ui/
│   │   ├── Header.tsx       # Money, stats bar
│   │   ├── BottomNav.tsx    # Mobile navigation
│   │   ├── ShopModal.tsx    # Buy attractions
│   │   └── OfflineModal.tsx # "While you were away..."
│   └── shared/
│       ├── Button.tsx
│       └── ProgressBar.tsx
│
├── hooks/
│   ├── useGameLoop.ts       # Tick management
│   ├── useOfflineProgress.ts
│   └── useAutoSave.ts
│
└── utils/
    ├── formatters.ts        # Number formatting (1.5M, etc.)
    └── calculations.ts
```

---

## Core Mechanics

### 1. Attractions (Revenue Generators)
Each attraction has:
- **Base income/second**
- **Capacity** (guests it can handle)
- **Happiness contribution**
- **Upgrade path** (levels 1-100+)

```typescript
interface Attraction {
  id: string;
  name: string;
  tier: 'basic' | 'standard' | 'premium' | 'legendary';
  baseIncome: number;
  incomeMultiplier: number; // per level
  baseCost: number;
  costMultiplier: number;   // per purchase
  level: number;
  owned: number;
}
```

**Grounded Economy - Planet Coaster Style:**

Numbers stay real and meaningful. No exponential inflation.

| Tier | Name | Cost | Income/guest | Capacity |
|------|------|------|--------------|----------|
| Basic | Carousel | $3,000 | $2 | 12 |
| Basic | Bumper Cars | $8,000 | $3 | 8 |
| Standard | Ferris Wheel | $25,000 | $5 | 20 |
| Standard | Log Flume | $45,000 | $6 | 12 |
| Premium | Roller Coaster | $150,000 | $10 | 24 |
| Premium | Drop Tower | $200,000 | $12 | 16 |

**Progression feels real:**
- Start with $10,000 seed money
- Early game: $500-5,000 in the bank
- Mid game: $20,000-100,000
- Late game: $200,000-500,000
- Prestige: ~$1-2 million park value

**Depth over inflation:**
- Upgrade quality, not quantity
- Each level = better experience, slight revenue boost
- Prestige unlocks new attraction types, not bigger numbers

### 2. Upgrades (Multipliers)
Global and per-attraction upgrades:
- **Ticket Price** - Increases all income
- **Marketing** - Increases guest flow
- **Maintenance** - Reduces costs, increases efficiency
- **VIP Access** - Premium income boost

### 3. Prestige System (Post-MVP)
*Skipped for MVP - implement later*

### 4. Offline Progression
**No cap** - players earn full income for entire time away. Respects player time.

```typescript
// On app open:
const now = Date.now();
const lastSave = gameState.lastSaveTime;
const offlineSeconds = (now - lastSave) / 1000;

// Full earnings, no cap, no penalty
const offlineEarnings = calculateIncome(gameState) * offlineSeconds;

// Show "While you were away" modal
showOfflineReward(offlineEarnings);
```

---

## Mobile UX Design

### Screen Layout
```
┌─────────────────────────┐
│  $12,345      👥 847    │  <- Header (money + guest count)
│  +$24/sec               │
├─────────────────────────┤
│                         │
│  ┌─────────────────┐    │
│  │ 🎠 Carousel     │    │  <- Attraction cards
│  │ Lvl 3  $8/sec   │    │     (scrollable list)
│  └─────────────────┘    │
│  ┌─────────────────┐    │
│  │ 🎡 Ferris Wheel │    │
│  │ Lvl 1  $15/sec  │    │
│  └─────────────────┘    │
│                         │
├─────────────────────────┤
│     🏗️ Build New        │  <- Bottom action
└─────────────────────────┘
```

### Interaction Patterns
- **Tap attraction** → Quick upgrade/info
- **Long press** → Detailed stats
- **Swipe bottom sheet** → Build menu
- **Pull down** → Force sync/save

### Visual Polish
- Idle animations on attraction cards
- Particle effects on purchases
- Satisfying number animations (money ticking up)
- Haptic feedback on actions
- Smooth card transitions

---

## Data Persistence

### Save Structure
```typescript
interface GameSave {
  version: number;           // For migrations
  lastSaveTime: number;
  resources: {
    money: number;
    stars: number;           // Prestige currency
    tickets: number;         // Premium currency (optional)
  };
  park: {
    name: string;
    level: number;
    attractions: AttractionState[];
    facilities: FacilityState[];
  };
  upgrades: UpgradeState[];
  stats: {
    totalEarnings: number;
    totalGuests: number;
    playTime: number;
    prestigeCount: number;
  };
  settings: {
    musicEnabled: boolean;
    sfxEnabled: boolean;
    hapticEnabled: boolean;
    notificationsEnabled: boolean;
  };
}
```

### Auto-save Strategy
- Save on every purchase/upgrade
- Save every 30 seconds during active play
- Save on visibility change (tab/app switch)
- Save on beforeunload

---

## Implementation Phases

### Phase 1: Core Loop (MVP)
- [ ] Project setup (Vite + React + TS + Tailwind)
- [ ] Basic game state with Zustand
- [ ] 3-4 basic attractions
- [ ] Simple buy/upgrade mechanics
- [ ] Money accumulation
- [ ] localStorage save (upgrade to IndexedDB later)
- [ ] Basic mobile UI

### Phase 2: Polish & Offline
- [ ] IndexedDB migration
- [ ] Offline progress calculation
- [ ] "While you were away" modal
- [ ] Animations (Framer Motion)
- [ ] Visual feedback (particles, haptics)
- [ ] Sound effects

### Phase 3: Depth
- [ ] Full upgrade system
- [ ] Prestige mechanics
- [ ] More attractions (10-15)
- [ ] Achievements
- [ ] Statistics screen

### Phase 4: Engagement
- [ ] Daily rewards
- [ ] Timed events
- [ ] Notifications (optional)
- [ ] Share/export save

---

## Design Decisions (Confirmed)

| Decision | Choice |
|----------|--------|
| Game name | **Idlepark** |
| Art style | Custom pixel art |
| Sound | Skip for MVP |
| Storage | IndexedDB (via Dexie.js) |
| Offline progress | No cap, full earnings |
| Deployment | GitHub Pages |
| Gameplay | Ultra simple, no tutorial needed |
| Economy | Grounded, real-world numbers (Planet Coaster style) |
| Guests | Number display only (no animated sprites) |
| Starting state | $10K, buy first ride yourself |
| Failure | Possible - can run out of money |
| Park layout | Auto-arranged collection (no grid placement) |
| Prestige | Skip for MVP |
| Monetization | TBD (not priority for MVP) |
