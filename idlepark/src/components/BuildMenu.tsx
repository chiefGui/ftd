import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ATTRACTIONS } from '../data/attractions';
import { useGameStore } from '../store/gameStore';
import { formatMoney, formatMoneyPerSec } from '../utils/formatters';

export function BuildMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const money = useGameStore((s) => s.money);
  const attractions = useGameStore((s) => s.attractions);
  const buyAttraction = useGameStore((s) => s.buyAttraction);

  const handleBuy = (id: string) => {
    if (buyAttraction(id)) {
      setIsOpen(false);
    }
  };

  const ownedIds = new Set(attractions.map((a) => a.id));

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-park-accent text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-park-accent/30 flex items-center gap-2"
      >
        <span>🏗️</span>
        <span>Build New</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-park-card rounded-t-3xl z-50 max-h-[80vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-park-card p-4 border-b border-park-muted/30">
                <div className="w-12 h-1 bg-park-muted/50 rounded-full mx-auto mb-3" />
                <h2 className="text-xl font-bold text-center">Build Attraction</h2>
              </div>

              <div className="p-4 space-y-3 pb-8">
                {ATTRACTIONS.map((def) => {
                  const owned = ownedIds.has(def.id);
                  const canAfford = money >= def.baseCost;

                  return (
                    <motion.button
                      key={def.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => !owned && canAfford && handleBuy(def.id)}
                      disabled={owned || !canAfford}
                      className={`
                        w-full p-4 rounded-xl text-left flex items-center gap-4
                        transition-all
                        ${owned
                          ? 'bg-park-muted/20 opacity-50'
                          : canAfford
                            ? 'bg-park-bg active:bg-park-muted/30'
                            : 'bg-park-bg opacity-60'
                        }
                      `}
                    >
                      <span className="text-4xl">{def.emoji}</span>
                      <div className="flex-1">
                        <div className="font-semibold">{def.name}</div>
                        <div className="text-sm text-park-muted">{def.description}</div>
                        <div className="text-sm text-park-success mt-1">
                          {formatMoneyPerSec(def.baseIncome)}
                        </div>
                      </div>
                      <div className="text-right">
                        {owned ? (
                          <span className="text-park-muted text-sm">Owned</span>
                        ) : (
                          <span className={canAfford ? 'text-park-accent' : 'text-park-danger'}>
                            {formatMoney(def.baseCost)}
                          </span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
