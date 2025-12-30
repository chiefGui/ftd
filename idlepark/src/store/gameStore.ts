import { create } from 'zustand';
import type { GameState, GameStore, Slot } from '../core/types';
import { getBuildingById } from '../data/buildings';
import { getPerkById, getBonusSlots } from '../data/perks';
import {
  STARTING_MONEY,
  STARTING_SLOTS,
  MAX_SLOTS,
  STARTING_TICKET_PRICE,
  TICKET_PRICE_MIN,
  TICKET_PRICE_MAX,
  SLOT_UNLOCK_COSTS,
  MAX_BUILDING_LEVEL,
  GUEST_ARRIVAL_RATE,
  GUEST_DEPARTURE_RATE,
  GUEST_UNHAPPY_LEAVE_RATE,
} from '../data/constants';
import { saveGame, loadGame, clearSave } from './db';
import {
  calculateParkStats as calcStats,
  calculateUpgradeCost as calcUpgradeCost,
  calculateDemolishRefund,
} from '../utils/parkCalculations';
import { useMilestoneStore } from './milestoneStore';

const createInitialState = (): GameState => ({
  money: STARTING_MONEY,
  guests: 0,
  ticketPrice: STARTING_TICKET_PRICE,
  slots: [],
  unlockedSlots: STARTING_SLOTS,
  unlockedPerks: [],
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

    // Update peak guests and check milestones
    const milestoneStore = useMilestoneStore.getState();
    milestoneStore.updatePeakGuests(newGuests);
    const newMilestones = milestoneStore.checkMilestones();

    // Apply rewards for newly completed milestones
    if (newMilestones.length > 0) {
      let bonusMoney = 0;
      for (const m of newMilestones) {
        if (m.reward.type === 'money') {
          bonusMoney += m.reward.amount;
        }
      }
      if (bonusMoney > 0) {
        set((s) => ({
          money: s.money + bonusMoney,
          totalEarnings: s.totalEarnings + bonusMoney,
        }));
      }
    }
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
    const slot = state.slots.find((s) => s.id === slotId);
    if (!slot) return false;

    // Check max level
    if (slot.level >= MAX_BUILDING_LEVEL) return false;

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

    const refund = calculateDemolishRefund(slot);

    set({
      money: state.money + refund,
      slots: state.slots.filter((s) => s.id !== slotId),
    });
    get().save();
    return refund;
  },

  unlockNextSlot: () => {
    const state = get();
    const maxSlots = MAX_SLOTS + getBonusSlots(state.unlockedPerks);
    if (state.unlockedSlots >= maxSlots) return false;

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

  buyPerk: (perkId: string) => {
    const state = get();
    const perk = getPerkById(perkId);
    if (!perk) return false;
    if (state.unlockedPerks.includes(perkId)) return false;
    if (state.money < perk.cost) return false;

    set({
      money: state.money - perk.cost,
      unlockedPerks: [...state.unlockedPerks, perkId],
    });
    get().save();
    return true;
  },

  hasPerk: (perkId: string) => {
    return get().unlockedPerks.includes(perkId);
  },

  setTicketPrice: (price: number) => {
    const clampedPrice = Math.max(TICKET_PRICE_MIN, Math.min(TICKET_PRICE_MAX, price));
    set({ ticketPrice: clampedPrice });
    get().save();
  },

  calculateParkStats: () => {
    const state = get();
    return calcStats({
      slots: state.slots,
      unlockedSlots: state.unlockedSlots,
      ticketPrice: state.ticketPrice,
      currentGuests: state.guests,
    });
  },

  calculateUpgradeCost: (slotId: string) => {
    const state = get();
    const slot = state.slots.find((s) => s.id === slotId);
    if (!slot) return Infinity;
    return calcUpgradeCost(slot);
  },

  applyOfflineProgress: () => {
    const state = get();
    const now = Date.now();
    const offlineSeconds = (now - state.lastSaveTime) / 1000;

    if (offlineSeconds <= 0) return { earnings: 0, milestones: [] };

    const stats = state.calculateParkStats();

    // Calculate what guests would stabilize to at equilibrium
    // But cap it - don't let offline guests exceed what player actually had by too much
    const theoreticalEquilibrium = stats.overallSatisfaction >= 0.8
      ? Math.min(stats.targetGuests, stats.maxGuests)
      : Math.min(stats.targetGuests * stats.overallSatisfaction, stats.maxGuests);

    // Cap equilibrium: don't jump more than 20% above saved guests (gradual growth feels more natural)
    // But allow it to drop if park would lose guests
    const equilibriumGuests = Math.min(
      theoreticalEquilibrium,
      Math.max(state.guests * 1.2, state.guests) // At most 20% increase from saved
    );

    // Calculate offline earnings using EQUILIBRIUM rates
    // At equilibrium: guests arriving ≈ guests leaving (to maintain stable count)
    // Guest turnover rate = equilibriumGuests * GUEST_DEPARTURE_RATE
    const guestTurnoverRate = equilibriumGuests * GUEST_DEPARTURE_RATE;
    const ticketIncomePerSecond = guestTurnoverRate * state.ticketPrice;

    // Shop income: guests in park * total spending rate
    // We need totalSpendingRate, extract it from stats
    const totalSpendingRate = stats.currentGuests > 0
      ? stats.shopIncome / stats.currentGuests
      : 0;
    const shopIncomePerSecond = equilibriumGuests * totalSpendingRate;

    const netPerSecond = ticketIncomePerSecond + shopIncomePerSecond - stats.totalMaintenance;

    const offlineEarnings = netPerSecond * offlineSeconds;
    let newMoney = state.money + offlineEarnings;

    // Check milestones based on equilibrium guests during offline
    const milestoneStore = useMilestoneStore.getState();
    milestoneStore.updatePeakGuests(equilibriumGuests);
    const newMilestones = milestoneStore.checkMilestones();

    // Apply milestone rewards
    let bonusMoney = 0;
    for (const m of newMilestones) {
      if (m.reward.type === 'money') {
        bonusMoney += m.reward.amount;
      }
    }
    newMoney += bonusMoney;

    if (newMoney < 0) {
      set({ money: 0, isGameOver: true, lastSaveTime: now, guests: equilibriumGuests });
      return { earnings: offlineEarnings, milestones: newMilestones };
    }

    set({
      money: newMoney,
      guests: equilibriumGuests,
      totalEarnings: state.totalEarnings + Math.max(0, offlineEarnings) + bonusMoney,
      lastSaveTime: now,
    });

    return { earnings: offlineEarnings, milestones: newMilestones };
  },

  resetGame: () => {
    clearSave();
    useMilestoneStore.getState().reset();
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
      unlockedPerks: state.unlockedPerks,
      lastSaveTime: Date.now(),
      totalEarnings: state.totalEarnings,
      gameStartedAt: state.gameStartedAt,
      isGameOver: state.isGameOver,
    };
    const milestoneProgress = useMilestoneStore.getState().getProgress();
    saveGame(saveState, milestoneProgress);
  },

  load: async () => {
    const saved = await loadGame();
    if (saved) {
      const ticketPrice = saved.state.ticketPrice ?? STARTING_TICKET_PRICE;
      const unlockedPerks = saved.state.unlockedPerks ?? [];
      set({ ...saved.state, ticketPrice, unlockedPerks });
      if (saved.milestones) {
        useMilestoneStore.getState().loadProgress(saved.milestones);
      }
    }
  },
}));
