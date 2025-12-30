import { motion, AnimatePresence } from 'framer-motion';
import type { Milestone } from '../core/types';
import { formatMoney } from '../utils/formatters';
import { useMilestoneStore } from '../store/milestoneStore';

export function MilestoneUnlockModal() {
  const pendingUnlocks = useMilestoneStore((s) => s.pendingUnlocks);
  const clearPendingUnlocks = useMilestoneStore((s) => s.clearPendingUnlocks);

  const milestone = pendingUnlocks[0];

  if (!milestone) return null;

  const handleClose = () => {
    clearPendingUnlocks();
  };

  const getRewardText = (m: Milestone) => {
    if (m.reward.type === 'money') {
      return `+${formatMoney(m.reward.amount)}`;
    }
    return '';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-park-card rounded-2xl p-6 max-w-sm w-full text-center shadow-xl border-2 border-yellow-500/50"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="text-6xl mb-4"
          >
            {milestone.icon}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-yellow-400 text-sm font-semibold mb-1 uppercase tracking-wide">
              Milestone Unlocked!
            </div>
            <h2 className="text-2xl font-bold mb-2">{milestone.name}</h2>
            <p className="text-park-muted mb-4">{milestone.description}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-park-success mb-6"
          >
            {getRewardText(milestone)}
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClose}
            className="w-full bg-yellow-500 text-black py-3 rounded-xl font-semibold"
          >
            {pendingUnlocks.length > 1
              ? `Collect (${pendingUnlocks.length - 1} more)`
              : 'Collect'}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
