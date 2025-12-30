# Idle Amusement Park - Game Plan

## Overview
A mobile-first, browser-based idle game where players build and manage an amusement park. Inspired by Planet Coaster's charm, but designed for casual, commitment-free play with offline progression.

---

## Core Principles
1. **Simplicity first** - Easy to understand, no tutorial needed
2. **Respect player time** - Meaningful offline progress
3. **Visual delight** - Engaging animations and feedback
4. **Clean architecture** - Easy to extend with new features

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

**Example attractions:**
| Tier | Name | Base Income | Base Cost |
|------|------|-------------|-----------|
| Basic | Carousel | $1/s | $50 |
| Basic | Bumper Cars | $5/s | $250 |
| Standard | Ferris Wheel | $25/s | $1,500 |
| Standard | Log Flume | $100/s | $10K |
| Premium | Roller Coaster | $500/s | $75K |
| Premium | Drop Tower | $2K/s | $500K |
| Legendary | Mega Coaster | $10K/s | $5M |

### 2. Upgrades (Multipliers)
Global and per-attraction upgrades:
- **Ticket Price** - Increases all income
- **Marketing** - Increases guest flow
- **Maintenance** - Reduces costs, increases efficiency
- **VIP Access** - Premium income boost

### 3. Prestige System (Long-term loop)
- "Expand to new location" = prestige reset
- Earn **Stars** based on total earnings
- Stars provide permanent multipliers
- Unlock new attraction types

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
│  $1,234,567   ⭐ 5      │  <- Header (sticky)
│  $123/sec               │
├─────────────────────────┤
│                         │
│    ┌───┐  ┌───┐        │
│    │🎠 │  │🎡 │        │  <- Park View (scrollable)
│    └───┘  └───┘        │
│  ┌───┐  ┌───┐  ┌───┐   │
│  │🎢 │  │🏪 │  │🍕 │   │
│  └───┘  └───┘  └───┘   │
│       👥 👥 👥          │  <- Animated guests
│                         │
├─────────────────────────┤
│  🏗️    📊    🎁    ⚙️   │  <- Bottom Nav
│ Build  Stats  Gifts  More│
└─────────────────────────┘
```

### Interaction Patterns
- **Tap attraction** → Quick upgrade/info
- **Long press** → Detailed stats
- **Swipe bottom sheet** → Build menu
- **Pull down** → Force sync/save

### Visual Polish
- Idle animations on all attractions
- Guest sprites walking around
- Particle effects on purchases
- Satisfying number animations
- Haptic feedback on actions

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
| Art style | Custom pixel art |
| Sound | Skip for MVP |
| Storage | IndexedDB (via Dexie.js) |
| Offline progress | No cap, full earnings |
| Deployment | GitHub Pages |
| Gameplay | Ultra simple, no tutorial needed |

## Open Questions

1. **Monetization**: Purely free, ads, or IAP? (affects design)
2. **Prestige depth**: Simple reset or complex meta-progression?
3. **Social features**: Leaderboards, sharing, none?
