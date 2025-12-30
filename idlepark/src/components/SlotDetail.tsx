import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Slot } from '../core/types';
import { useGameStore } from '../store/gameStore';
import { getBuildingById } from '../data/buildings';
import { formatMoney } from '../utils/formatters';
import { DEMOLISH_REFUND_RATE, STAT_LEVEL_MULTIPLIER, MAINTENANCE_LEVEL_MULTIPLIER } from '../data/constants';

type Props = {
  slot: Slot;
  onClose: () => void;
};

export function SlotDetail({ slot, onClose }: Props) {
  const [confirmDemolish, setConfirmDemolish] = useState(false);

  const money = useGameStore((s) => s.money);
  const upgradeSlot = useGameStore((s) => s.upgradeSlot);
  const demolishSlot = useGameStore((s) => s.demolishSlot);
  const calculateUpgradeCost = useGameStore((s) => s.calculateUpgradeCost);

  const building = getBuildingById(slot.buildingId);
  if (!building) return null;

  const upgradeCost = calculateUpgradeCost(slot.id);
  const canUpgrade = money >= upgradeCost;

  // Calculate current stats with level
  const levelMultiplier = Math.pow(STAT_LEVEL_MULTIPLIER, slot.level - 1);
  const maintenanceMultiplier = Math.pow(MAINTENANCE_LEVEL_MULTIPLIER, slot.level - 1);
  const currentMaintenance = building.maintenanceCost * maintenanceMultiplier;

  const getMainStat = () => {
    if (building.category === 'ride' && building.attraction) {
      const value = building.attraction * levelMultiplier;
      return { label: 'Attracts', value: `+${value.toFixed(1)} guests/s`, color: 'text-park-accent' };
    }
    if (building.category === 'shop' && building.spendingRate) {
      const value = building.spendingRate * levelMultiplier;
      return { label: 'Earns', value: `${formatMoney(value)}/guest/s`, color: 'text-park-success' };
    }
    if (building.category === 'infrastructure' && building.coverage) {
      const value = Math.floor(building.coverage * levelMultiplier);
      return { label: 'Covers', value: `${value} guests`, color: 'text-park-accent' };
    }
    return null;
  };

  const mainStat = getMainStat();

  // Estimate refund
  const estimatedRefund = Math.floor(building.baseCost * (1 + (slot.level - 1) * 0.5) * DEMOLISH_REFUND_RATE);

  const handleUpgrade = () => {
    if (canUpgrade) {
      upgradeSlot(slot.id);
    }
  };

  const handleDemolish = () => {
    if (confirmDemolish) {
      demolishSlot(slot.id);
      onClose();
    } else {
      setConfirmDemolish(true);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-40"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-park-card rounded-t-3xl z-50"
      >
        <div className="p-4 border-b border-park-muted/30">
          <div className="w-12 h-1 bg-park-muted/50 rounded-full mx-auto mb-4" />

          {/* Header */}
          <div className="flex items-center gap-4">
            <motion.span
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl"
            >
              {building.emoji}
            </motion.span>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{building.name}</h2>
              <p className="text-sm text-park-muted">Level {slot.level}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4 pb-8">
          {/* Stats breakdown */}
          <div className="bg-park-bg rounded-xl p-4 space-y-3">
            {mainStat && (
              <div className="flex justify-between items-center">
                <span className="text-park-muted">{mainStat.label}</span>
                <span className={`font-semibold ${mainStat.color}`}>{mainStat.value}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-park-muted">Upkeep</span>
              <span className="text-park-danger font-medium">-{formatMoney(currentMaintenance)}/s</span>
            </div>
          </div>

          {/* Upgrade button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleUpgrade}
            disabled={!canUpgrade}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
              canUpgrade
                ? 'bg-park-accent text-white'
                : 'bg-park-muted/30 text-park-muted'
            }`}
          >
            Upgrade to Lv.{slot.level + 1} • {formatMoney(upgradeCost)}
          </motion.button>

          {/* Demolish button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleDemolish}
            className={`w-full py-3 rounded-xl font-medium transition-colors ${
              confirmDemolish
                ? 'bg-park-danger text-white'
                : 'bg-park-danger/20 text-park-danger'
            }`}
          >
            {confirmDemolish
              ? 'Tap again to confirm'
              : `Demolish • Get ${formatMoney(estimatedRefund)} back`
            }
          </motion.button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-3 text-park-muted"
          >
            Close
          </button>
        </div>
      </motion.div>
    </>
  );
}
