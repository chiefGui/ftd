import { create } from 'zustand';
import type { GameState, GameStore, Slot, ParkStats } from '../core/types';
import { getBuildingById } from '../data/buildings';
import {
  STARTING_MONEY,
  STARTING_SLOTS,
  MAX_SLOTS,
  STARTING_TICKET_PRICE,
  GUESTS_PER_SLOT,
  TICKET_PRICE_MIN,
  TICKET_PRICE_MAX,
  SLOT_UNLOCK_COSTS,
  UPGRADE_COST_MULTIPLIER,
  STAT_LEVEL_MULTIPLIER,
  MAINTENANCE_LEVEL_MULTIPLIER,
  DEMOLISH_REFUND_RATE,
  GUEST_ARRIVAL_RATE,
  GUEST_DEPARTURE_RATE,
  GUEST_UNHAPPY_LEAVE_RATE,
  calculateDemand,
} from '../data/constants';
import { saveGame, loadGame, clearSave } from './db';

const createInitialState = (): GameState => ({
  money: STARTING_MONEY,
  guests: 0,
  ticketPrice: STARTING_TICKET_PRICE,
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

    const stats = state.calculateParkStats();

    // === GUEST DYNAMICS ===
    let newGuests = state.guests;

    // Guests arriving: move toward target based on reputation
    if (stats.targetGuests > newGuests) {
      const arriving = (stats.targetGuests - newGuests) * GUEST_ARRIVAL_RATE * deltaSeconds;
      newGuests += arriving;
    }

    // Guests leaving naturally
    const naturalLeaving = newGuests * GUEST_DEPARTURE_RATE * deltaSeconds;
    newGuests -= naturalLeaving;

    // Extra leaving if unhappy
    if (stats.overallSatisfaction < 1) {
      const unhappyRatio = 1 - stats.overallSatisfaction;
      const unhappyLeaving = newGuests * unhappyRatio * GUEST_UNHAPPY_LEAVE_RATE * deltaSeconds;
      newGuests -= unhappyLeaving;
    }

    // Cap at max capacity
    newGuests = Math.max(0, Math.min(newGuests, stats.maxGuests));

    // === INCOME ===
    // Ticket income from arriving guests (only new arrivals pay)
    const arrivingGuests = Math.max(0, newGuests - state.guests + naturalLeaving);
    const ticketIncome = arrivingGuests * state.ticketPrice;

    // Shop income from all guests in park
    const shopIncome = newGuests * stats.shopIncome / Math.max(1, stats.currentGuests) * deltaSeconds;

    const totalIncome = ticketIncome + shopIncome;
    const totalCosts = stats.totalMaintenance * deltaSeconds;
    const netChange = totalIncome - totalCosts;

    const newMoney = state.money + netChange;
    const newTotalEarnings = state.totalEarnings + Math.max(0, netChange);

    // Bankruptcy check
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

    const newSlot: Slot = {
      id: `slot_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      buildingId,
      level: 1,
      builtAt: Date.now(),
    };

    const newSlots = [...state.slots];
    if (slotIndex < newSlots.length) {
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

  setTicketPrice: (price: number) => {
    const clampedPrice = Math.max(TICKET_PRICE_MIN, Math.min(TICKET_PRICE_MAX, price));
    set({ ticketPrice: clampedPrice });
    get().save();
  },

  calculateParkStats: (): ParkStats => {
    const state = get();

    // Max guests from slots
    const maxGuests = state.unlockedSlots * GUESTS_PER_SLOT;

    // Calculate totals from buildings
    let reputation = 0;
    let rideCapacity = 0;
    let totalSpendingRate = 0;
    let infrastructureCoverage = 0;
    let totalMaintenance = 0;

    for (const slot of state.slots) {
      const def = getBuildingById(slot.buildingId);
      if (!def) continue;

      const levelMultiplier = Math.pow(STAT_LEVEL_MULTIPLIER, slot.level - 1);
      const maintenanceMultiplier = Math.pow(MAINTENANCE_LEVEL_MULTIPLIER, slot.level - 1);

      totalMaintenance += def.maintenanceCost * maintenanceMultiplier;

      if (def.category === 'ride') {
        reputation += (def.prestige ?? 0) * levelMultiplier;
        rideCapacity += (def.rideCapacity ?? 0) * levelMultiplier;
      } else if (def.category === 'shop') {
        totalSpendingRate += (def.spendingRate ?? 0) * levelMultiplier;
      } else if (def.category === 'infrastructure') {
        infrastructureCoverage += (def.coverage ?? 0) * levelMultiplier;
      }
    }

    // Demand based on ticket price
    const demandMultiplier = calculateDemand(state.ticketPrice);

    // Target guests: reputation * demand (capped at max)
    const targetGuests = Math.min(reputation * demandMultiplier, maxGuests);

    // Current guests
    const currentGuests = state.guests;

    // === SATISFACTION ===
    // Ride satisfaction: are rides overcrowded?
    // If ride capacity >= guests, satisfaction = 100%
    // Otherwise, ratio of capacity to guests
    const rideSatisfaction = currentGuests > 0
      ? Math.min(1, rideCapacity / currentGuests)
      : 1;

    // Facility satisfaction: enough infrastructure?
    const facilitySatisfaction = currentGuests > 0
      ? Math.min(1, infrastructureCoverage / currentGuests)
      : 1;

    // Overall: average of both (could weight differently)
    const overallSatisfaction = (rideSatisfaction + facilitySatisfaction) / 2;

    // === INCOME RATES (per second) ===
    const ticketIncome = reputation * demandMultiplier * GUEST_ARRIVAL_RATE * state.ticketPrice;
    const shopIncome = currentGuests * totalSpendingRate;
    const netIncome = ticketIncome + shopIncome - totalMaintenance;

    return {
      maxGuests,
      rideCapacity,
      infrastructureCoverage,
      reputation,
      demandMultiplier,
      targetGuests,
      currentGuests,
      rideSatisfaction,
      facilitySatisfaction,
      overallSatisfaction,
      ticketIncome,
      shopIncome,
      totalMaintenance,
      netIncome,
    };
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

    const stats = state.calculateParkStats();

    // Simulate equilibrium guest count
    const equilibriumGuests = stats.overallSatisfaction >= 0.8
      ? Math.min(stats.targetGuests, stats.maxGuests)
      : Math.min(stats.targetGuests * stats.overallSatisfaction, stats.maxGuests);

    // Calculate offline earnings
    const ticketIncome = stats.reputation * stats.demandMultiplier * GUEST_ARRIVAL_RATE * state.ticketPrice;
    const shopIncome = equilibriumGuests * (stats.shopIncome / Math.max(1, stats.currentGuests));
    const netPerSecond = ticketIncome + shopIncome - stats.totalMaintenance;

    const offlineEarnings = netPerSecond * offlineSeconds;
    const newMoney = state.money + offlineEarnings;

    if (newMoney < 0) {
      set({ money: 0, isGameOver: true, lastSaveTime: now, guests: equilibriumGuests });
      return offlineEarnings;
    }

    set({
      money: newMoney,
      guests: equilibriumGuests,
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
      ticketPrice: state.ticketPrice,
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
      const ticketPrice = saved.ticketPrice ?? STARTING_TICKET_PRICE;
      set({ ...saved, ticketPrice });
    }
  },
}));
