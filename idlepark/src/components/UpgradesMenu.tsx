import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { PERKS } from '../data/perks';
import { formatMoney } from '../utils/formatters';

interface Props {
  onClose: () => void;
}

export function UpgradesMenu({ onClose }: Props) {
  const money = useGameStore((s) => s.money);
  const unlockedPerks = useGameStore((s) => s.unlockedPerks);
  const buyPerk = useGameStore((s) => s.buyPerk);

  const handleBuy = (perkId: string) => {
    buyPerk(perkId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-park-card rounded-2xl p-6 max-w-sm w-full shadow-xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">Upgrades</h2>
          <p className="text-park-muted text-sm mt-1">
            Expand your park to unlock new attractions
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {PERKS.map((perk) => {
            const owned = unlockedPerks.includes(perk.id);
            const canAfford = money >= perk.cost;

            return (
              <div
                key={perk.id}
                className={`p-4 rounded-xl ${
                  owned
                    ? 'bg-park-success/20 border border-park-success/30'
                    : 'bg-park-bg'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{perk.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold">{perk.name}</div>
                    <div className="text-sm text-park-muted">{perk.description}</div>
                  </div>
                </div>

                {owned ? (
                  <div className="mt-3 text-center text-park-success font-medium">
                    Owned
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBuy(perk.id)}
                    disabled={!canAfford}
                    className={`mt-3 w-full py-2 rounded-lg font-semibold ${
                      canAfford
                        ? 'bg-park-accent text-white'
                        : 'bg-park-muted/30 text-park-muted'
                    }`}
                  >
                    {formatMoney(perk.cost)}
                  </motion.button>
                )}
              </div>
            );
          })}
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="w-full bg-park-bg py-3 rounded-xl font-semibold"
        >
          Close
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
