import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { formatMoney } from '../utils/formatters';

export function GameOverModal() {
  const isGameOver = useGameStore((s) => s.isGameOver);
  const totalEarnings = useGameStore((s) => s.totalEarnings);
  const resetGame = useGameStore((s) => s.resetGame);

  if (!isGameOver) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-park-card rounded-2xl p-6 max-w-sm w-full text-center shadow-xl"
      >
        <div className="text-6xl mb-4">😢</div>
        <h2 className="text-2xl font-bold text-park-danger mb-2">Bankrupt!</h2>
        <p className="text-park-muted mb-4">
          Your park ran out of money. Better luck next time!
        </p>
        <div className="bg-park-bg rounded-lg p-3 mb-6">
          <div className="text-sm text-park-muted">Total Earnings</div>
          <div className="text-xl font-bold text-park-success">
            {formatMoney(totalEarnings)}
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={resetGame}
          className="w-full bg-park-accent text-white py-3 rounded-xl font-semibold"
        >
          Try Again
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
