import { motion } from 'framer-motion';
import type { OwnedAttraction } from '../core/types';
import { getAttractionById } from '../data/attractions';
import { useGameStore } from '../store/gameStore';
import { formatMoney, formatMoneyPerSec } from '../utils/formatters';

interface Props {
  attraction: OwnedAttraction;
}

export function AttractionCard({ attraction }: Props) {
  const money = useGameStore((s) => s.money);
  const upgradeAttraction = useGameStore((s) => s.upgradeAttraction);
  const calculateUpgradeCost = useGameStore((s) => s.calculateUpgradeCost);
  const calculateAttractionIncome = useGameStore((s) => s.calculateAttractionIncome);

  const def = getAttractionById(attraction.id);
  if (!def) return null;

  const upgradeCost = calculateUpgradeCost(attraction.id);
  const income = calculateAttractionIncome(attraction);
  const canAfford = money >= upgradeCost;

  const handleUpgrade = () => {
    if (canAfford) {
      upgradeAttraction(attraction.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-park-card rounded-xl p-4 shadow-lg border border-park-muted/20"
    >
      <div className="flex items-center gap-3">
        <motion.span
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-4xl"
        >
          {def.emoji}
        </motion.span>
        <div className="flex-1">
          <div className="font-semibold text-park-text">{def.name}</div>
          <div className="text-sm text-park-muted">Level {attraction.level}</div>
        </div>
        <div className="text-right">
          <div className="text-park-success font-medium">
            {formatMoneyPerSec(income)}
          </div>
        </div>
      </div>

      <button
        onClick={handleUpgrade}
        disabled={!canAfford}
        className={`
          mt-3 w-full py-2 px-4 rounded-lg font-medium text-sm
          transition-all active:scale-95
          ${canAfford
            ? 'bg-park-accent text-white hover:bg-park-accent/80'
            : 'bg-park-muted/30 text-park-muted cursor-not-allowed'
          }
        `}
      >
        Upgrade • {formatMoney(upgradeCost)}
      </button>
    </motion.div>
  );
}
