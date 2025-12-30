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
  let infrastructureCoverage = 0;
  let totalMaintenance = 0;

  for (const slot of slots) {
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
  const demandMultiplier = calculateDemand(ticketPrice);

  // Target guests: reputation * demand (capped at max)
  const targetGuests = Math.min(reputation * demandMultiplier, maxGuests);

  // Satisfaction calculations
  const rideSatisfaction = currentGuests > 0
    ? Math.min(1, rideCapacity / currentGuests)
    : 1;

  const facilitySatisfaction = currentGuests > 0
    ? Math.min(1, infrastructureCoverage / currentGuests)
    : 1;

  const overallSatisfaction = (rideSatisfaction + facilitySatisfaction) / 2;

  // Income rates (per second)
  const ticketIncome = reputation * demandMultiplier * GUEST_ARRIVAL_RATE * ticketPrice;
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
