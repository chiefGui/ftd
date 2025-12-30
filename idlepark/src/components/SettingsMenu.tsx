import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { formatMoney } from '../utils/formatters';

export function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const totalEarnings = useGameStore((s) => s.totalEarnings);
  const gameStartedAt = useGameStore((s) => s.gameStartedAt);
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

  const formatPlayTime = () => {
    const seconds = Math.floor((Date.now() - gameStartedAt) / 1000);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 -mr-2 flex flex-col gap-1 opacity-70 active:opacity-100"
      >
        <span className="w-5 h-0.5 bg-park-text rounded-full" />
        <span className="w-5 h-0.5 bg-park-text rounded-full" />
        <span className="w-5 h-0.5 bg-park-text rounded-full" />
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
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-park-card z-50 shadow-2xl"
            >
              {/* Header */}
              <div className="p-4 border-b border-park-muted/30 flex items-center justify-between">
                <h2 className="text-lg font-bold">Menu</h2>
                <button
                  onClick={() => { setIsOpen(false); setConfirmReset(false); }}
                  className="text-2xl text-park-muted"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-park-muted">Play time</span>
                    <span className="font-medium">{formatPlayTime()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-park-muted">Total earned</span>
                    <span className="font-medium text-park-success">{formatMoney(totalEarnings)}</span>
                  </div>
                </div>

                <div className="border-t border-park-muted/30 pt-4">
                  <div className="text-xs text-park-muted uppercase tracking-wide mb-3">Danger Zone</div>
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
              </div>

              {/* Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-park-muted/30">
                <p className="text-xs text-park-muted text-center">
                  Idlepark v0.1
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
