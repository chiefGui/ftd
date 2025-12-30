import { motion } from 'framer-motion';
import type { BuildingDefinition } from '../core/types';
import { useGameStore } from '../store/gameStore';
import { formatMoney } from '../utils/formatters';

type Props = {
  building: BuildingDefinition;
  slotIndex: number;
  onClose: () => void;
  onBuilt: () => void;
};

export function BuildingPreview({ building, slotIndex, onClose, onBuilt }: Props) {
  const money = useGameStore((s) => s.money);
  const buildInSlot = useGameStore((s) => s.buildInSlot);

  const canAfford = money >= building.baseCost;

  const handleBuy = () => {
    if (buildInSlot(slotIndex, building.id)) {
      onBuilt();
    }
  };

  const getStats = () => {
    if (building.category === 'ride') {
      return [
        { label: 'Prestige', value: `⭐ ${building.prestige}`, desc: 'Attracts guests to your park' },
        { label: 'Capacity', value: `${building.rideCapacity} guests`, desc: 'How many can ride (affects queues)' },
      ];
    }
    if (building.category === 'shop') {
      return [
        { label: 'Earns', value: `${formatMoney(building.spendingRate ?? 0)}/guest/s`, desc: 'Income per guest in park' },
      ];
    }
    if (building.category === 'infrastructure') {
      return [
        { label: 'Coverage', value: `${building.coverage} guests`, desc: 'Keeps this many guests happy' },
      ];
    }
    return [];
  };

  const getCategoryDescription = () => {
    switch (building.category) {
      case 'ride':
        return 'Rides attract guests and keep them entertained';
      case 'shop':
        return 'Shops earn money from guests in your park';
      case 'infrastructure':
        return 'Facilities keep guests satisfied';
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-50"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-park-card rounded-2xl z-50 p-5 max-w-sm mx-auto"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{building.emoji}</span>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{building.name}</h2>
            <p className="text-sm text-park-muted">{building.description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-park-bg rounded-xl p-4 mb-4 space-y-3">
          {getStats().map((stat, i) => (
            <div key={i}>
              <div className="flex justify-between items-center">
                <span className="text-park-muted">{stat.label}</span>
                <span className="font-semibold text-park-accent">{stat.value}</span>
              </div>
              <p className="text-xs text-park-muted mt-1">{stat.desc}</p>
            </div>
          ))}
          <div className="border-t border-park-muted/30 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-park-muted">Upkeep</span>
              <span className="text-park-danger font-medium">-{formatMoney(building.maintenanceCost)}/s</span>
            </div>
          </div>
        </div>

        {/* Category hint */}
        <p className="text-xs text-park-muted text-center mb-4">{getCategoryDescription()}</p>

        {/* Price */}
        <div className="text-center mb-4">
          <span className="text-park-muted text-sm">Price: </span>
          <span className={`text-xl font-bold ${canAfford ? 'text-park-text' : 'text-park-danger'}`}>
            {formatMoney(building.baseCost)}
          </span>
          {!canAfford && (
            <p className="text-park-danger text-sm mt-1">Not enough money</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-medium bg-park-bg text-park-muted"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleBuy}
            disabled={!canAfford}
            className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
              canAfford
                ? 'bg-park-accent text-white'
                : 'bg-park-muted/30 text-park-muted'
            }`}
          >
            Buy
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
