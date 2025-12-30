import { useState } from 'react';
import { motion } from 'framer-motion';
import { getBuildingsByCategory } from '../data/buildings';
import { useGameStore } from '../store/gameStore';
import { formatMoney } from '../utils/formatters';
import type { AttractionCategory } from '../core/types';

const CATEGORIES: { id: AttractionCategory; label: string; emoji: string }[] = [
  { id: 'ride', label: 'Rides', emoji: '🎢' },
  { id: 'food', label: 'Food', emoji: '🍕' },
  { id: 'shop', label: 'Shops', emoji: '🎁' },
];

type Props = {
  slotIndex: number;
  onClose: () => void;
};

export function BuildMenu({ slotIndex, onClose }: Props) {
  const [activeCategory, setActiveCategory] = useState<AttractionCategory>('ride');

  const money = useGameStore((s) => s.money);
  const buildInSlot = useGameStore((s) => s.buildInSlot);

  const handleBuild = (buildingId: string) => {
    if (buildInSlot(slotIndex, buildingId)) {
      onClose();
    }
  };

  const filteredBuildings = getBuildingsByCategory(activeCategory);

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
        className="fixed bottom-0 left-0 right-0 bg-park-card rounded-t-3xl z-50 max-h-[85vh] overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-park-muted/30">
          <div className="w-12 h-1 bg-park-muted/50 rounded-full mx-auto mb-3" />
          <h2 className="text-xl font-bold text-center mb-4">Build</h2>

          {/* Category tabs */}
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-park-accent text-white'
                    : 'bg-park-bg text-park-muted'
                }`}
              >
                <span className="mr-1">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-8">
          {filteredBuildings.map((building) => {
            const canAfford = money >= building.baseCost;
            const profit = building.baseIncome - building.maintenanceCost;
            const isProfitable = profit >= 0;

            return (
              <motion.button
                key={building.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => canAfford && handleBuild(building.id)}
                disabled={!canAfford}
                className={`w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all ${
                  canAfford
                    ? 'bg-park-bg active:bg-park-muted/30'
                    : 'bg-park-bg opacity-50'
                }`}
              >
                <span className="text-4xl">{building.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{building.name}</div>
                  <div className="text-xs text-park-muted mt-1">
                    Earns {formatMoney(building.baseIncome)}/s • Costs {formatMoney(building.maintenanceCost)}/s
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`font-bold ${isProfitable ? 'text-park-success' : 'text-park-danger'}`}>
                    {isProfitable ? '+' : ''}{formatMoney(profit)}/s
                  </div>
                  <div className={`text-sm ${canAfford ? 'text-park-accent' : 'text-park-danger'}`}>
                    {formatMoney(building.baseCost)}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}
