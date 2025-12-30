import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { formatMoney, formatMoneyPerSec, formatNumber } from '../utils/formatters';
import { SettingsMenu } from './SettingsMenu';

export function Header() {
  const money = useGameStore((s) => s.money);
  const guests = useGameStore((s) => s.guests);
  const calculateIncome = useGameStore((s) => s.calculateIncome);

  const income = calculateIncome();

  return (
    <header className="sticky top-0 z-10 bg-park-card border-b border-park-muted/30 px-4 py-3 shadow-lg relative">
      <div className="flex items-center justify-between pr-10">
        <div>
          <motion.div
            key={Math.floor(money)}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-park-success"
          >
            {formatMoney(money)}
          </motion.div>
          <div className={`text-sm ${income >= 0 ? 'text-park-success' : 'text-park-danger'}`}>
            {formatMoneyPerSec(income)}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-lg">
            <span>👥</span>
            <span>{formatNumber(guests)}</span>
          </div>
          <div className="text-xs text-park-muted">guests</div>
        </div>
      </div>
      <SettingsMenu />
    </header>
  );
}
