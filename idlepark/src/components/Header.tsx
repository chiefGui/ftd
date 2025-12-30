import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { formatMoney } from '../utils/formatters';
import { SettingsMenu } from './SettingsMenu';
import { TicketControl } from './TicketControl';

export function Header() {
  const money = useGameStore((s) => s.money);
  const guests = useGameStore((s) => s.guests);
  const calculateParkStats = useGameStore((s) => s.calculateParkStats);

  const stats = calculateParkStats();
  const satisfactionPercent = Math.round(stats.satisfaction * 100);

  return (
    <header className="sticky top-0 z-10 bg-park-card border-b border-park-muted/30 shadow-lg">
      {/* Top row: Money and income */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex-1">
          <motion.div
            key={Math.floor(money)}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-park-text"
          >
            {formatMoney(money)}
          </motion.div>
          <div className={`text-sm font-medium ${stats.netIncome >= 0 ? 'text-park-success' : 'text-park-danger'}`}>
            {stats.netIncome >= 0 ? '+' : ''}{formatMoney(stats.netIncome)}/s
          </div>
        </div>
        <SettingsMenu />
      </div>

      {/* Bottom row: Stats bar */}
      <div className="px-4 pb-3 flex items-center gap-4 text-sm">
        {/* Guests */}
        <div className="flex items-center gap-1.5">
          <span className="text-lg">👥</span>
          <span className="font-medium">{Math.floor(guests)}</span>
          <span className="text-park-muted">/ {stats.guestCapacity}</span>
        </div>

        {/* Satisfaction */}
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{satisfactionPercent >= 80 ? '😊' : satisfactionPercent >= 50 ? '😐' : '😟'}</span>
          <span className={`font-medium ${
            satisfactionPercent >= 80 ? 'text-park-success' :
            satisfactionPercent >= 50 ? 'text-park-text' : 'text-park-danger'
          }`}>
            {satisfactionPercent}%
          </span>
        </div>

        {/* Ticket Price Control */}
        <div className="flex-1 flex justify-end">
          <TicketControl />
        </div>
      </div>
    </header>
  );
}
