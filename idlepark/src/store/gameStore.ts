import { create } from 'zustand';
import type { GameState, GameStore, Slot } from '../core/types';
import { getBuildingById } from '../data/buildings';
import {
  STARTING_MONEY,
  STARTING_SLOTS,
  MAX_SLOTS,
  SLOT_UNLOCK_COSTS,
  UPGRADE_COST_MULTIPLIER,
  INCOME_LEVEL_MULTIPLIER,
  MAINTENANCE_LEVEL_MULTIPLIER,
  DEMOLISH_REFUND_RATE,
  BASE_GUEST_RATE,
  GUEST_PER_CAPACITY,
} from '../data/constants';
import { saveGame, loadGame, clearSave } from './db';

const createInitialState = (): GameState => ({
  money: STARTING_MONEY,
  guests: 0,
  slots: [],
  unlockedSlots: STARTING_SLOTS,
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

    const { net } = state.calculateIncome();
    const newMoney = state.money + net * deltaSeconds;
    const newTotalEarnings = state.totalEarnings + Math.max(0, net * deltaSeconds);

    // Calculate guests based on total capacity
    const totalCapacity = state.slots.reduce((sum, slot) => {
      const def = getBuildingById(slot.buildingId);
      return sum + (def?.capacity ?? 0) * slot.level;
    }, 0);
    const guestRate = state.slots.length > 0
      ? BASE_GUEST_RATE + totalCapacity * GUEST_PER_CAPACITY
      : 0;
    const newGuests = Math.max(0, state.guests + guestRate * deltaSeconds);

    // Check for bankruptcy
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

  buildInSlot: (slotIndex: number, buildingId: string) => {
    const state = get();
    const def = getBuildingById(buildingId);
    if (!def) return false;
    if (slotIndex >= state.unlockedSlots) return false;
    if (state.money < def.baseCost) return false;

    // Check if slot is already occupied
    const existingSlot = state.slots.find((_, i) => i === slotIndex);
    if (existingSlot && state.slots.indexOf(existingSlot) === slotIndex) {
      // Slot position logic - we use array indices
    }

    const newSlot: Slot = {
      id: `slot_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      buildingId,
      level: 1,
      builtAt: Date.now(),
    };

    // Insert at the correct position or append
    const newSlots = [...state.slots];
    if (slotIndex < newSlots.length) {
      // Replace existing slot (shouldn't happen if UI is correct)
      newSlots[slotIndex] = newSlot;
    } else {
      newSlots.push(newSlot);
    }

    set({
      money: state.money - def.baseCost,
      slots: newSlots,
    });
    get().save();
    return true;
  },

  upgradeSlot: (slotId: string) => {
    const state = get();
    const slotIndex = state.slots.findIndex((s) => s.id === slotId);
    if (slotIndex === -1) return false;

    const cost = state.calculateUpgradeCost(slotId);
    if (state.money < cost) return false;

    const newSlots = state.slots.map((s) =>
      s.id === slotId ? { ...s, level: s.level + 1 } : s
    );

    set({
      money: state.money - cost,
      slots: newSlots,
    });
    get().save();
    return true;
  },

  demolishSlot: (slotId: string) => {
    const state = get();
    const slot = state.slots.find((s) => s.id === slotId);
    if (!slot) return 0;

    const def = getBuildingById(slot.buildingId);
    if (!def) return 0;

    // Calculate refund: base cost * refund rate * level factor
    const totalInvested = def.baseCost +
      Array.from({ length: slot.level - 1 }, (_, i) =>
        Math.floor(def.baseCost * Math.pow(UPGRADE_COST_MULTIPLIER, i + 1))
      ).reduce((a, b) => a + b, 0);
    const refund = Math.floor(totalInvested * DEMOLISH_REFUND_RATE);

    set({
      money: state.money + refund,
      slots: state.slots.filter((s) => s.id !== slotId),
    });
    get().save();
    return refund;
  },

  unlockNextSlot: () => {
    const state = get();
    if (state.unlockedSlots >= MAX_SLOTS) return false;

    const cost = state.getSlotUnlockCost();
    if (state.money < cost) return false;

    set({
      money: state.money - cost,
      unlockedSlots: state.unlockedSlots + 1,
    });
    get().save();
    return true;
  },

  getSlotUnlockCost: () => {
    const state = get();
    const index = state.unlockedSlots - STARTING_SLOTS;
    if (index < 0 || index >= SLOT_UNLOCK_COSTS.length) return Infinity;
    return SLOT_UNLOCK_COSTS[index];
  },

  calculateIncome: () => {
    const state = get();
    let gross = 0;
    let maintenance = 0;

    for (const slot of state.slots) {
      const slotIncome = state.calculateSlotIncome(slot);
      gross += slotIncome.gross;
      maintenance += slotIncome.maintenance;
    }

    return { gross, maintenance, net: gross - maintenance };
  },

  calculateSlotIncome: (slot: Slot) => {
    const def = getBuildingById(slot.buildingId);
    if (!def) return { gross: 0, maintenance: 0, net: 0 };

    const gross = def.baseIncome * Math.pow(INCOME_LEVEL_MULTIPLIER, slot.level - 1);
    const maintenance = def.maintenanceCost * Math.pow(MAINTENANCE_LEVEL_MULTIPLIER, slot.level - 1);
    return { gross, maintenance, net: gross - maintenance };
  },

  calculateUpgradeCost: (slotId: string) => {
    const state = get();
    const slot = state.slots.find((s) => s.id === slotId);
    if (!slot) return Infinity;

    const def = getBuildingById(slot.buildingId);
    if (!def) return Infinity;

    return Math.floor(def.baseCost * Math.pow(UPGRADE_COST_MULTIPLIER, slot.level));
  },

  applyOfflineProgress: () => {
    const state = get();
    const now = Date.now();
    const offlineSeconds = (now - state.lastSaveTime) / 1000;

    if (offlineSeconds <= 0) return 0;

    const { net } = state.calculateIncome();
    const offlineEarnings = net * offlineSeconds;

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
      slots: state.slots,
      unlockedSlots: state.unlockedSlots,
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
