import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Slot } from '../core/types';
import { useGameStore } from '../store/gameStore';
import { useNotificationStore } from '../store/notificationStore';
import { getBuildingById } from '../data/buildings';
import { formatMoney } from '../utils/formatters';
import { DEMOLISH_REFUND_RATE, STAT_LEVEL_MULTIPLIER, MAINTENANCE_LEVEL_MULTIPLIER, MAX_BUILDING_LEVEL } from '../data/constants';
import { randomGuestProfile } from '../data/guestMessages';

type Props = {
  slot: Slot;
  onClose: () => void;
};

export function SlotDetail({ slot, onClose }: Props) {
  const [confirmDemolish, setConfirmDemolish] = useState(false);
  const [justUpgraded, setJustUpgraded] = useState(false);

  const money = useGameStore((s) => s.money);
  const upgradeSlot = useGameStore((s) => s.upgradeSlot);
  const demolishSlot = useGameStore((s) => s.demolishSlot);
  const calculateUpgradeCost = useGameStore((s) => s.calculateUpgradeCost);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const building = getBuildingById(slot.buildingId);
  if (!building) return null;

  const isMaxLevel = slot.level >= MAX_BUILDING_LEVEL;
  const upgradeCost = calculateUpgradeCost(slot.id);
  const canUpgrade = !isMaxLevel && money >= upgradeCost;

  const currentMultiplier = Math.pow(STAT_LEVEL_MULTIPLIER, slot.level - 1);
  const nextMultiplier = Math.pow(STAT_LEVEL_MULTIPLIER, slot.level);
  const maintenanceMultiplier = Math.pow(MAINTENANCE_LEVEL_MULTIPLIER, slot.level - 1);
  const currentMaintenance = building.maintenanceCost * maintenanceMultiplier;

  // Calculate current and next level stats
  const getStatsComparison = () => {
    if (building.category === 'ride') {
      const currentPrestige = Math.floor((building.prestige ?? 0) * currentMultiplier);
      const nextPrestige = Math.floor((building.prestige ?? 0) * nextMultiplier);
      const currentCap = Math.floor((building.rideCapacity ?? 0) * currentMultiplier);
      const nextCap = Math.floor((building.rideCapacity ?? 0) * nextMultiplier);
      return {
        current: [
          { label: '⭐ Prestige', value: currentPrestige, unit: '' },
          { label: '🎠 Entertainment', value: currentCap, unit: ' guests' },
        ],
        gains: [
          { label: 'Prestige', gain: nextPrestige - currentPrestige, isMoney: false },
          { label: 'Entertainment', gain: nextCap - currentCap, isMoney: false },
        ],
      };
    }
    if (building.category === 'shop') {
      const currentRate = (building.spendingRate ?? 0) * currentMultiplier;
      const nextRate = (building.spendingRate ?? 0) * nextMultiplier;
      const current: { label: string; value: string | number; unit: string }[] = [];
      const gains: { label: string; gain: number; isMoney: boolean }[] = [];

      if (building.hungerCapacity) {
        const currentHunger = Math.floor(building.hungerCapacity * currentMultiplier);
        const nextHunger = Math.floor(building.hungerCapacity * nextMultiplier);
        current.push({ label: '🍔 Feeds', value: currentHunger, unit: ' guests' });
        gains.push({ label: 'Feeds', gain: nextHunger - currentHunger, isMoney: false });
      }
      current.push({ label: '💵 Earns', value: formatMoney(currentRate), unit: '/guest' });
      gains.push({ label: 'Earns', gain: nextRate - currentRate, isMoney: true });

      return { current, gains };
    }
    if (building.category === 'infrastructure') {
      const current: { label: string; value: string | number; unit: string }[] = [];
      const gains: { label: string; gain: number; isMoney: boolean }[] = [];

      if (building.comfortCapacity) {
        const currentComfort = Math.floor(building.comfortCapacity * currentMultiplier);
        const nextComfort = Math.floor(building.comfortCapacity * nextMultiplier);
        current.push({ label: '🚻 Comfort', value: currentComfort, unit: ' guests' });
        gains.push({ label: 'Comfort', gain: nextComfort - currentComfort, isMoney: false });
      }
      if (building.safetyCapacity) {
        const currentSafety = Math.floor(building.safetyCapacity * currentMultiplier);
        const nextSafety = Math.floor(building.safetyCapacity * nextMultiplier);
        current.push({ label: '🛡️ Safety', value: currentSafety, unit: ' guests' });
        gains.push({ label: 'Safety', gain: nextSafety - currentSafety, isMoney: false });
      }

      return { current, gains };
    }
    return { current: [], gains: [] };
  };

  const stats = getStatsComparison();
  const estimatedRefund = Math.floor(building.baseCost * (1 + (slot.level - 1) * 0.5) * DEMOLISH_REFUND_RATE);
  const levelStars = '★'.repeat(Math.min(slot.level, 5)) + (slot.level > 5 ? '+' : '');

  const handleUpgrade = () => {
    if (canUpgrade) {
      upgradeSlot(slot.id);
      setJustUpgraded(true);

      // Send celebration notification
      const messages = [
        `the ${building.name} got an upgrade, nice!`,
        `they improved the ${building.name}!`,
        `${building.name} looking even better now`,
        `love that they're investing in the ${building.name}`,
      ];
      const guest = randomGuestProfile();
      addNotification({
        name: guest.name,
        visitorId: guest.visitorId,
        emoji: '⬆️',
        text: messages[Math.floor(Math.random() * messages.length)],
        type: 'positive',
      });

      setTimeout(() => setJustUpgraded(false), 1500);
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

          <div className="flex items-center gap-4">
            <motion.span
              animate={justUpgraded ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : { rotate: [0, 5, -5, 0] }}
              transition={{ duration: justUpgraded ? 0.5 : 2, repeat: justUpgraded ? 0 : Infinity }}
              className="text-5xl"
            >
              {building.emoji}
            </motion.span>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{building.name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-sm">{levelStars}</span>
                <span className="text-sm text-park-muted">Level {slot.level}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4 pb-8">
          {/* Current Stats */}
          <div className="bg-park-bg rounded-xl p-4 space-y-2">
            {stats.current.map((stat, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-park-muted text-sm">{stat.label}</span>
                <span className="font-semibold text-park-accent">
                  {typeof stat.value === 'number' ? stat.value : stat.value}{stat.unit}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 border-t border-park-muted/20">
              <span className="text-park-muted text-sm">Running cost</span>
              <span className="text-park-danger font-medium">-{formatMoney(currentMaintenance)}/s</span>
            </div>
          </div>

          {/* Upgrade Button or MAX badge */}
          {isMaxLevel ? (
            <div className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/50 text-center">
              <span className="text-yellow-400 font-bold text-lg">★★★ MAX LEVEL</span>
            </div>
          ) : (
            <div className="space-y-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleUpgrade}
                disabled={!canUpgrade}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors relative overflow-hidden ${
                  canUpgrade
                    ? 'bg-park-accent text-white'
                    : 'bg-park-muted/30 text-park-muted'
                }`}
              >
                {justUpgraded ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    ✨ Upgraded!
                  </motion.span>
                ) : (
                  <>⬆️ Upgrade • {formatMoney(upgradeCost)}</>
                )}
              </motion.button>

              {/* What you'll get */}
              {canUpgrade && !justUpgraded && (
                <div className="flex justify-center gap-4 text-xs">
                  {stats.gains.map((g, i) => (
                    <span key={i} className="text-park-success">
                      +{g.isMoney ? formatMoney(g.gain) : g.gain} {g.label.toLowerCase()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

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
