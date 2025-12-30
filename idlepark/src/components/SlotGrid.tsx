import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { getBuildingById } from '../data/buildings';
import { formatMoney } from '../utils/formatters';
import { MAX_SLOTS } from '../data/constants';
import { SlotDetail } from './SlotDetail';
import { BuildMenu } from './BuildMenu';

export function SlotGrid() {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [buildingSlotIndex, setBuildingSlotIndex] = useState<number | null>(null);

  const slots = useGameStore((s) => s.slots);
  const unlockedSlots = useGameStore((s) => s.unlockedSlots);
  const money = useGameStore((s) => s.money);
  const unlockNextSlot = useGameStore((s) => s.unlockNextSlot);
  const getSlotUnlockCost = useGameStore((s) => s.getSlotUnlockCost);
  const calculateSlotIncome = useGameStore((s) => s.calculateSlotIncome);

  const unlockCost = getSlotUnlockCost();
  const canUnlock = money >= unlockCost && unlockedSlots < MAX_SLOTS;

  const handleSlotClick = (index: number) => {
    if (index < slots.length) {
      // Filled slot - show detail
      setSelectedSlotIndex(index);
    } else if (index < unlockedSlots) {
      // Empty slot - open build menu
      setBuildingSlotIndex(index);
    }
  };

  const handleUnlockSlot = () => {
    if (canUnlock) {
      unlockNextSlot();
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-3 p-4">
        {Array.from({ length: MAX_SLOTS }).map((_, index) => {
          const slot = slots[index];
          const isUnlocked = index < unlockedSlots;
          const isEmpty = !slot && isUnlocked;
          const isLocked = !isUnlocked;

          if (slot) {
            const building = getBuildingById(slot.buildingId);
            const income = calculateSlotIncome(slot);

            return (
              <motion.button
                key={index}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSlotClick(index)}
                className="aspect-square bg-park-card rounded-2xl p-3 flex flex-col items-center justify-center border-2 border-park-muted/20 active:border-park-accent"
              >
                <motion.span
                  animate={{ rotate: [0, 3, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-3xl mb-1"
                >
                  {building?.emoji}
                </motion.span>
                <span className="text-xs text-park-muted truncate w-full text-center">
                  Lv.{slot.level}
                </span>
                <span className={`text-xs font-medium ${income.net >= 0 ? 'text-park-success' : 'text-park-danger'}`}>
                  {income.net >= 0 ? '+' : ''}{formatMoney(income.net)}/s
                </span>
              </motion.button>
            );
          }

          if (isEmpty) {
            return (
              <motion.button
                key={index}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSlotClick(index)}
                className="aspect-square bg-park-bg rounded-2xl border-2 border-dashed border-park-muted/40 flex items-center justify-center"
              >
                <span className="text-3xl text-park-muted/60">+</span>
              </motion.button>
            );
          }

          if (isLocked) {
            const isNextToUnlock = index === unlockedSlots;
            return (
              <motion.button
                key={index}
                whileTap={isNextToUnlock ? { scale: 0.95 } : {}}
                onClick={isNextToUnlock ? handleUnlockSlot : undefined}
                disabled={!isNextToUnlock || !canUnlock}
                className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center ${
                  isNextToUnlock
                    ? canUnlock
                      ? 'bg-park-accent/20 border-park-accent/50'
                      : 'bg-park-bg border-park-muted/30'
                    : 'bg-park-bg/50 border-park-muted/20'
                }`}
              >
                <span className="text-2xl mb-1">{isNextToUnlock ? '🔓' : '🔒'}</span>
                {isNextToUnlock && (
                  <span className={`text-xs ${canUnlock ? 'text-park-accent' : 'text-park-muted'}`}>
                    {formatMoney(unlockCost)}
                  </span>
                )}
              </motion.button>
            );
          }

          return null;
        })}
      </div>

      {/* Slot Detail Modal */}
      <AnimatePresence>
        {selectedSlotIndex !== null && slots[selectedSlotIndex] && (
          <SlotDetail
            slot={slots[selectedSlotIndex]}
            onClose={() => setSelectedSlotIndex(null)}
          />
        )}
      </AnimatePresence>

      {/* Build Menu */}
      <AnimatePresence>
        {buildingSlotIndex !== null && (
          <BuildMenu
            slotIndex={buildingSlotIndex}
            onClose={() => setBuildingSlotIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
