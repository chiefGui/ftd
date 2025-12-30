import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { formatMoney } from '../utils/formatters';

export function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const totalEarnings = useGameStore((s) => s.totalEarnings);
  const resetGame = useGameStore((s) => s.resetGame);

  const handleReset = () => {
    if (confirmReset) {
      resetGame();
      setConfirmReset(false);
      setIsOpen(false);
    } else {
      setConfirmReset(true);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-3 right-4 text-2xl opacity-60 hover:opacity-100 transition-opacity"
      >
        ⚙️
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsOpen(false); setConfirmReset(false); }}
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
                <div className="w-12 h-1 bg-park-muted/50 rounded-full mx-auto mb-3" />
                <h2 className="text-xl font-bold text-center">Settings</h2>
              </div>

              <div className="p-4 space-y-4 pb-8">
                <div className="bg-park-bg rounded-xl p-4">
                  <div className="text-sm text-park-muted mb-1">Total Lifetime Earnings</div>
                  <div className="text-xl font-bold text-park-success">{formatMoney(totalEarnings)}</div>
                </div>

                <div className="bg-park-bg rounded-xl p-4">
                  <div className="text-sm text-park-muted mb-3">Danger Zone</div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                      confirmReset
                        ? 'bg-park-danger text-white'
                        : 'bg-park-danger/20 text-park-danger'
                    }`}
                  >
                    {confirmReset ? 'Tap again to confirm' : 'Reset Game'}
                  </motion.button>
                  {confirmReset && (
                    <p className="text-xs text-park-muted text-center mt-2">
                      This will delete all progress!
                    </p>
                  )}
                </div>

                <button
                  onClick={() => { setIsOpen(false); setConfirmReset(false); }}
                  className="w-full py-3 text-park-muted"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
