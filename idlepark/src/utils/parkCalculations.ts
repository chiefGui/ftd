import type { Slot, ParkStats } from '../core/types';
import { getBuildingById } from '../data/buildings';
import {
  GUESTS_PER_SLOT,
  STAT_LEVEL_MULTIPLIER,
  MAINTENANCE_LEVEL_MULTIPLIER,
  GUEST_ARRIVAL_RATE,
  calculateDemand,
} from '../data/constants';

type ParkInputs = {
  slots: Slot[];
  unlockedSlots: number;
  ticketPrice: number;
  currentGuests: number;
};

// Weights for overall satisfaction calculation
const SATISFACTION_WEIGHTS = {
  entertainment: 0.35,  // Rides are most important
  hunger: 0.25,         // Food is essential
  comfort: 0.20,        // Nice to have
  safety: 0.20,         // Peace of mind
};

/**
 * Calculate all park stats from current state.
 * Pure function - no side effects.
 */
export function calculateParkStats(inputs: ParkInputs): ParkStats {
  const { slots, unlockedSlots, ticketPrice, currentGuests } = inputs;

  // Max guests from slots
  const maxGuests = unlockedSlots * GUESTS_PER_SLOT;

  // Calculate totals from buildings
  let reputation = 0;
  let rideCapacity = 0;
  let totalSpendingRate = 0;
  let totalHungerCapacity = 0;
  let totalComfortCapacity = 0;
  let totalSafetyCapacity = 0;
  let totalMaintenance = 0;

  for (const slot of slots) {
    const def = getBuildingById(slot.buildingId);
    if (!def) continue;

    const levelMultiplier = Math.pow(STAT_LEVEL_MULTIPLIER, slot.level - 1);
    const maintenanceMultiplier = Math.pow(MAINTENANCE_LEVEL_MULTIPLIER, slot.level - 1);

    totalMaintenance += def.maintenanceCost * maintenanceMultiplier;

    if (def.category === 'ride') {
      reputation += Math.floor((def.prestige ?? 0) * levelMultiplier);
      rideCapacity += Math.floor((def.rideCapacity ?? 0) * levelMultiplier);
    } else if (def.category === 'shop') {
      totalSpendingRate += (def.spendingRate ?? 0) * levelMultiplier;
      totalHungerCapacity += Math.floor((def.hungerCapacity ?? 0) * levelMultiplier);
    } else if (def.category === 'infrastructure') {
      totalComfortCapacity += Math.floor((def.comfortCapacity ?? 0) * levelMultiplier);
      totalSafetyCapacity += Math.floor((def.safetyCapacity ?? 0) * levelMultiplier);
    }
  }

  // Demand based on ticket price
  const demandMultiplier = calculateDemand(ticketPrice);

  // Target guests: reputation * demand (capped at max)
  const targetGuests = Math.min(reputation * demandMultiplier, maxGuests);

  // === 4 Core Guest Needs ===
  // Each is capacity / guests, capped at 1.0
  // When there are no guests, satisfaction is 100%

  const entertainmentSatisfaction = currentGuests > 0
    ? Math.min(1, rideCapacity / currentGuests)
    : 1;

  const hungerSatisfaction = currentGuests > 0
    ? Math.min(1, totalHungerCapacity / currentGuests)
    : 1;

  const comfortSatisfaction = currentGuests > 0
    ? Math.min(1, totalComfortCapacity / currentGuests)
    : 1;

  const safetySatisfaction = currentGuests > 0
    ? Math.min(1, totalSafetyCapacity / currentGuests)
    : 1;

  // Weighted overall satisfaction
  const overallSatisfaction =
    entertainmentSatisfaction * SATISFACTION_WEIGHTS.entertainment +
    hungerSatisfaction * SATISFACTION_WEIGHTS.hunger +
    comfortSatisfaction * SATISFACTION_WEIGHTS.comfort +
    safetySatisfaction * SATISFACTION_WEIGHTS.safety;

  // Legacy aliases for backward compatibility
  const rideSatisfaction = entertainmentSatisfaction;
  const facilitySatisfaction = (comfortSatisfaction + safetySatisfaction) / 2;

  // Income rates (per second)
  const ticketIncome = reputation * demandMultiplier * GUEST_ARRIVAL_RATE * ticketPrice;
  const shopIncome = currentGuests * totalSpendingRate;
  const netIncome = ticketIncome + shopIncome - totalMaintenance;

  return {
    maxGuests,
    rideCapacity: Math.floor(rideCapacity),
    totalHungerCapacity: Math.floor(totalHungerCapacity),
    totalComfortCapacity: Math.floor(totalComfortCapacity),
    totalSafetyCapacity: Math.floor(totalSafetyCapacity),
    reputation: Math.floor(reputation),
    demandMultiplier,
    targetGuests: Math.floor(targetGuests),
    currentGuests,
    entertainmentSatisfaction,
    hungerSatisfaction,
    comfortSatisfaction,
    safetySatisfaction,
    overallSatisfaction,
    rideSatisfaction,
    facilitySatisfaction,
    ticketIncome,
    shopIncome,
    totalMaintenance,
    netIncome,
  };
}

/**
 * Calculate upgrade cost for a slot
 */
export function calculateUpgradeCost(slot: Slot): number {
  const def = getBuildingById(slot.buildingId);
  if (!def) return Infinity;
  return Math.floor(def.baseCost * Math.pow(1.15, slot.level));
}

/**
 * Calculate demolish refund for a slot
 */
export function calculateDemolishRefund(slot: Slot): number {
  const def = getBuildingById(slot.buildingId);
  if (!def) return 0;

  const totalInvested = def.baseCost +
    Array.from({ length: slot.level - 1 }, (_, i) =>
      Math.floor(def.baseCost * Math.pow(1.15, i + 1))
    ).reduce((a, b) => a + b, 0);

  return Math.floor(totalInvested * 0.5);
}
