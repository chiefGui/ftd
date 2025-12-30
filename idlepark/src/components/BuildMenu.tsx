import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBuildingsByCategory } from '../data/buildings';
import { getPerkById } from '../data/perks';
import { useGameStore } from '../store/gameStore';
import { formatMoney } from '../utils/formatters';
import type { BuildingCategory, BuildingDefinition } from '../core/types';
import { BuildingPreview } from './BuildingPreview';

const CATEGORIES: { id: BuildingCategory; label: string; emoji: string }[] = [
  { id: 'ride', label: 'Rides', emoji: '🎢' },
  { id: 'shop', label: 'Shops', emoji: '🛒' },
  { id: 'infrastructure', label: 'Infra', emoji: '🚻' },
];

type Props = {
  slotIndex: number;
  onClose: () => void;
};

export function BuildMenu({ slotIndex, onClose }: Props) {
  const [activeCategory, setActiveCategory] = useState<BuildingCategory>('ride');
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingDefinition | null>(null);

  const money = useGameStore((s) => s.money);
  const hasPerk = useGameStore((s) => s.hasPerk);

  const filteredBuildings = getBuildingsByCategory(activeCategory);

  const getStatLabel = (building: BuildingDefinition) => {
    if (building.category === 'ride') {
      return `Attracts ${building.prestige} • Fits ${building.rideCapacity}`;
    }
    if (building.category === 'shop') {
      return `Earns ${formatMoney(building.spendingRate ?? 0)}/guest`;
    }
    if (building.category === 'infrastructure') {
      return `Keeps ${building.coverage} guests happy`;
    }
    return '';
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
        className="fixed bottom-0 left-0 right-0 bg-park-card rounded-t-3xl z-40 max-h-[85vh] overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-park-muted/30">
          <div className="w-12 h-1 bg-park-muted/50 rounded-full mx-auto mb-3" />
          <h2 className="text-xl font-bold text-center mb-4">Build</h2>

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
            const isLocked = building.requiredPerk && !hasPerk(building.requiredPerk);
            const canAfford = money >= building.baseCost;
            const requiredPerkData = building.requiredPerk ? getPerkById(building.requiredPerk) : null;

            if (isLocked) {
              return (
                <div
                  key={building.id}
                  className="w-full p-4 rounded-xl text-left flex items-center gap-4 bg-park-bg opacity-40"
                >
                  <span className="text-4xl grayscale">{building.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate text-park-muted">{building.name}</div>
                    <div className="text-sm text-park-muted mt-1 flex items-center gap-1">
                      <span>🔒</span>
                      <span>Requires {requiredPerkData?.name ?? 'upgrade'}</span>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <motion.button
                key={building.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedBuilding(building)}
                className={`w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all ${
                  canAfford
                    ? 'bg-park-bg active:bg-park-muted/30'
                    : 'bg-park-bg opacity-50'
                }`}
              >
                <span className="text-4xl">{building.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{building.name}</div>
                  <div className="text-sm text-park-accent mt-1">
                    {getStatLabel(building)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`font-semibold ${canAfford ? 'text-park-accent' : 'text-park-danger'}`}>
                    {formatMoney(building.baseCost)}
                  </div>
                  <div className="text-xs text-park-muted">
                    -{formatMoney(building.maintenanceCost)}/s
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedBuilding && (
          <BuildingPreview
            building={selectedBuilding}
            slotIndex={slotIndex}
            onClose={() => setSelectedBuilding(null)}
            onBuilt={onClose}
          />
        )}
      </AnimatePresence>
    </>
  );
}
