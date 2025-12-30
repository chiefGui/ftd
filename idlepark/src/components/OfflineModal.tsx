import { motion } from 'framer-motion';
import { formatMoney } from '../utils/formatters';

interface Props {
  earnings: number;
  onClose: () => void;
}

export function OfflineModal({ earnings, onClose }: Props) {
  const isPositive = earnings >= 0;

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
        className="bg-park-card rounded-2xl p-6 max-w-sm w-full text-center shadow-xl"
      >
        <div className="text-5xl mb-4">{isPositive ? '🎉' : '😰'}</div>
        <h2 className="text-xl font-bold mb-2">While you were away...</h2>
        <p className="text-park-muted mb-4">
          {isPositive ? 'Your park earned money!' : 'Maintenance costs exceeded income...'}
        </p>
        <div className={`text-3xl font-bold mb-6 ${isPositive ? 'text-park-success' : 'text-park-danger'}`}>
          {isPositive ? '+' : ''}{formatMoney(earnings)}
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="w-full bg-park-accent text-white py-3 rounded-xl font-semibold"
        >
          Awesome!
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
