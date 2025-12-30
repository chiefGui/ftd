import { create } from 'zustand';
import type { GameState, GameStore, OwnedAttraction } from '../core/types';
import { getAttractionById } from '../data/attractions';
import {
  STARTING_MONEY,
  UPGRADE_COST_MULTIPLIER,
  INCOME_LEVEL_MULTIPLIER,
  BASE_GUEST_RATE,
  GUEST_PER_CAPACITY,
  MAINTENANCE_RATE,
} from '../data/constants';
import { saveGame, loadGame, clearSave } from './db';

const createInitialState = (): GameState => ({
  money: STARTING_MONEY,
  guests: 0,
  attractions: [],
  lastSaveTime: Date.now(),
  totalEarnings: 0,
  gameStartedAt: Date.now(),
  isGameOver: false,
});

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),

  tick: (deltaSeconds: number) => {
    const state = get();
    if (state.isGameOver) return;

    const income = state.calculateIncome();
    const newMoney = state.money + income * deltaSeconds;
    const newTotalEarnings = state.totalEarnings + Math.max(0, income * deltaSeconds);

    // Calculate guests based on attraction capacity
    const totalCapacity = state.attractions.reduce((sum, a) => {
      const def = getAttractionById(a.id);
      return sum + (def?.capacity ?? 0) * a.level;
    }, 0);
    const guestRate = BASE_GUEST_RATE + totalCapacity * GUEST_PER_CAPACITY;
    const newGuests = Math.max(0, state.guests + guestRate * deltaSeconds);

    // Check for game over
    if (newMoney < 0) {
      set({ money: 0, isGameOver: true });
      return;
    }

    set({
      money: newMoney,
      guests: newGuests,
      totalEarnings: newTotalEarnings,
    });
  },

  calculateIncome: () => {
    const state = get();
    let income = 0;

    for (const attraction of state.attractions) {
      income += state.calculateAttractionIncome(attraction);
    }

    // Maintenance costs (10% of gross income)
    const maintenance = income * MAINTENANCE_RATE;
    return income - maintenance;
  },

  calculateAttractionIncome: (attraction: OwnedAttraction) => {
    const def = getAttractionById(attraction.id);
    if (!def) return 0;

    // Income scales with level
    return def.baseIncome * Math.pow(INCOME_LEVEL_MULTIPLIER, attraction.level - 1);
  },

  calculateUpgradeCost: (id: string) => {
    const state = get();
    const attraction = state.attractions.find((a) => a.id === id);
    const def = getAttractionById(id);

    if (!def) return Infinity;

    if (!attraction) {
      // First purchase cost
      return def.baseCost;
    }

    // Upgrade cost scales with level
    return Math.floor(def.baseCost * Math.pow(UPGRADE_COST_MULTIPLIER, attraction.level));
  },

  buyAttraction: (id: string) => {
    const state = get();
    const def = getAttractionById(id);
    if (!def) return false;

    const cost = def.baseCost;
    if (state.money < cost) return false;

    set({
      money: state.money - cost,
      attractions: [
        ...state.attractions,
        { id, level: 1, purchasedAt: Date.now() },
      ],
    });
    return true;
  },

  upgradeAttraction: (id: string) => {
    const state = get();
    const attraction = state.attractions.find((a) => a.id === id);
    if (!attraction) return false;

    const cost = state.calculateUpgradeCost(id);
    if (state.money < cost) return false;

    set({
      money: state.money - cost,
      attractions: state.attractions.map((a) =>
        a.id === id ? { ...a, level: a.level + 1 } : a
      ),
    });
    return true;
  },

  applyOfflineProgress: () => {
    const state = get();
    const now = Date.now();
    const offlineSeconds = (now - state.lastSaveTime) / 1000;

    if (offlineSeconds <= 0) return 0;

    const income = state.calculateIncome();
    const offlineEarnings = income * offlineSeconds;

    // Apply earnings (can be negative if maintenance > income)
    const newMoney = state.money + offlineEarnings;

    if (newMoney < 0) {
      set({ money: 0, isGameOver: true, lastSaveTime: now });
      return offlineEarnings;
    }

    set({
      money: newMoney,
      totalEarnings: state.totalEarnings + Math.max(0, offlineEarnings),
      lastSaveTime: now,
    });

    return offlineEarnings;
  },

  resetGame: () => {
    clearSave();
    set(createInitialState());
  },

  save: () => {
    const state = get();
    const saveState: GameState = {
      money: state.money,
      guests: state.guests,
      attractions: state.attractions,
      lastSaveTime: Date.now(),
      totalEarnings: state.totalEarnings,
      gameStartedAt: state.gameStartedAt,
      isGameOver: state.isGameOver,
    };
    saveGame(saveState);
  },

  load: async () => {
    const saved = await loadGame();
    if (saved) {
      set({ ...saved });
    }
  },
}));
