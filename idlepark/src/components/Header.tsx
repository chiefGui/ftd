import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { formatMoney } from '../utils/formatters';
import { SettingsMenu } from './SettingsMenu';

export function Header() {
  const money = useGameStore((s) => s.money);
  const slots = useGameStore((s) => s.slots);
  const unlockedSlots = useGameStore((s) => s.unlockedSlots);
  const calculateIncome = useGameStore((s) => s.calculateIncome);

  const { net } = calculateIncome();

  return (
    <header className="sticky top-0 z-10 bg-park-card border-b border-park-muted/30 px-4 py-3 shadow-lg relative">
      <div className="flex items-center justify-between pr-10">
        <div>
          <motion.div
            key={Math.floor(money)}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-park-text"
          >
            {formatMoney(money)}
          </motion.div>
          <div className={`text-sm font-medium ${net >= 0 ? 'text-park-success' : 'text-park-danger'}`}>
            {net >= 0 ? '+' : ''}{formatMoney(net)}/s
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-medium">
            {slots.length}/{unlockedSlots}
          </div>
          <div className="text-xs text-park-muted">slots</div>
        </div>
      </div>
      <SettingsMenu />
    </header>
  );
}
